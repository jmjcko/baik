import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { mockPrePurchaseResponse } from '@/types/__tests__/baikfit.mock';
import { PrePurchaseAuditView } from '../PrePurchaseAuditView';

const analyzeMock = vi.fn();
const readMock = vi.fn();
vi.mock('@/app/actions/analyzeBikeGeometry', () => ({ analyzeBikeGeometry: (...args: unknown[]) => analyzeMock(...args) }));
vi.mock('@/app/actions/findBikes', () => ({ recommendBikes: vi.fn(), readGeometryTable: (input: unknown) => readMock(input) }));
vi.mock('@/lib/bikes/prepareImage', async (original) => ({ ...(await original<object>()), prepareGeometryImage: async () => ({ imageBase64: 'A'.repeat(200), mimeType: 'image/jpeg' }) }));

const sizeOf = (size: string, stack: number, reach: number) => ({ size, spec: { frameStackMm: stack, frameReachMm: reach, seatTubeAngleDeg: 73.5, stockStemMm: 100, stockHandlebarMm: 460, stockCrankMm: 172.5, stockSeatpostOffsetMm: null, stockSpacersMm: null } });
const table = { sizes: [sizeOf('S', 540, 372), sizeOf('M', 575, 385), sizeOf('L', 610, 400)], skipped: 0 };

function renderStep2(locale: Locale) {
  render(
    <PrePurchaseAuditView
      t={translations[locale]} locale={locale} inseamMm={840} acromionWidthMm={390} heightCm={178}
      torsoLengthMm={600} armLengthMm={640} riderWeightKg={82} ridingStyle="endurance" currentPains={[]} onBackToEntry={vi.fn()}
    />
  );
  fireEvent.click(screen.getByText(translations[locale].prePurchaseAudit.nextStepButton));
}

describe.each(['en', 'cs'] as const)('Path B step 2: the geometry of the bike (%s)', (locale) => {
  const t = translations[locale];
  const a = t.prePurchaseAudit;
  const typeBike = (name: string) => fireEvent.change(screen.getByLabelText(a.bikeModelLabel), { target: { value: name } });
  const run = () => screen.getByRole('button', { name: new RegExp(`${a.runAuditButton}|${a.runningAuditButton}`) });

  beforeEach(() => {
    analyzeMock.mockReset();
    readMock.mockReset();
    analyzeMock.mockResolvedValue({ success: true, data: mockPrePurchaseResponse });
  });

  it('should have no address box: a link is not read', () => {
    renderStep2(locale);
    expect(screen.queryByRole('textbox', { name: /URL|odkaz/i })).not.toBeInTheDocument();
    expect(document.querySelector('input[type=url]')).toBeNull();
  });

  it('should start with an empty name box and no bike chosen for the rider, and block the audit', () => {
    renderStep2(locale);
    expect(screen.getByLabelText(a.bikeModelLabel)).toHaveValue('');
    expect(screen.getByText(t.geometry.startTyping)).toBeInTheDocument();
    expect(run()).toBeDisabled();
  });

  it('should say where the geometry of a bike of the catalog comes from, and let the audit run', () => {
    renderStep2(locale);
    typeBike('Canyon Endurace CF 8 2024');
    const found = screen.getByTestId('geometry-found');
    expect(found).toHaveAttribute('data-source', 'catalog');
    expect(found).toHaveTextContent('Canyon Endurace CF 8 2024');
    expect(run()).toBeEnabled();
  });

  it('should ask for the pictures of the table and block the audit for a bike that is not in the catalog', () => {
    renderStep2(locale);
    typeBike('Acme Flyer X 2025');
    expect(screen.getByTestId('geometry-needed')).toHaveTextContent(a.geometryNeeded);
    expect(screen.getByTestId('geometry-intake')).toBeInTheDocument();
    expect(run()).toBeDisabled();
    expect(analyzeMock).not.toHaveBeenCalled();
  });

  it('should offer the catalog: choose a brand and a model and the name goes into the box, with the geometry of the catalog', () => {
    renderStep2(locale);
    typeBike('Acme Flyer X 2025');
    const picker = screen.getByTestId('catalog-picker');
    const [brand, model] = within(picker).getAllByRole('combobox');
    fireEvent.change(brand, { target: { value: 'Canyon' } });
    fireEvent.change(model, { target: { value: 'canyon-endurace-cf-8-di2-2024' } });
    expect(screen.getByLabelText(a.bikeModelLabel)).toHaveValue('Canyon Endurace CF 8 2024');
    expect(screen.getByTestId('geometry-found')).toHaveAttribute('data-source', 'catalog');
  });

  it('should suggest bikes of the catalog as the rider types (full text), and fill the name with the chosen one', () => {
    renderStep2(locale);
    const box = screen.getByLabelText(a.bikeModelLabel);
    fireEvent.focus(box);
    typeBike('endur');
    const list = screen.getByTestId('bike-suggestions');
    expect(within(list).getAllByRole('option').map((o) => o.textContent)).toContain('Canyon Endurace CF 8 2024');
    fireEvent.mouseDown(within(list).getByText('Canyon Endurace CF 8 2024'));
    expect(box).toHaveValue('Canyon Endurace CF 8 2024');
    expect(screen.queryByTestId('bike-suggestions')).not.toBeInTheDocument();
    expect(screen.getByTestId('geometry-found')).toHaveAttribute('data-source', 'catalog');
  });

  it('should suggest the bike of the catalog also when a build word is missing from the typed name, and move with the arrow keys', () => {
    renderStep2(locale);
    const box = screen.getByLabelText(a.bikeModelLabel);
    fireEvent.focus(box);
    typeBike('Superior X-Road Team Elite');
    expect(within(screen.getByTestId('bike-suggestions')).getAllByRole('option').map((o) => o.textContent).join(' ')).toContain('X-Road Team Elite Di2');
    fireEvent.keyDown(box, { key: 'ArrowDown' });
    fireEvent.keyDown(box, { key: 'Enter' });
    expect((box as HTMLInputElement).value).toContain('X-Road Team Elite Di2');
  });

  it('should close the suggestions with Escape and offer none for a bike that the catalog does not know', () => {
    renderStep2(locale);
    const box = screen.getByLabelText(a.bikeModelLabel);
    fireEvent.focus(box);
    typeBike('canyon');
    expect(screen.getByTestId('bike-suggestions')).toBeInTheDocument();
    fireEvent.keyDown(box, { key: 'Escape' });
    expect(screen.queryByTestId('bike-suggestions')).not.toBeInTheDocument();
    typeBike('Zzyzx Qwerty');
    expect(screen.queryByTestId('bike-suggestions')).not.toBeInTheDocument();
  });

  it('should ask for the name first when the box is empty', () => {
    renderStep2(locale);
    typeBike('');
    expect(screen.getByText(t.geometry.startTyping)).toBeInTheDocument();
    expect(run()).toBeDisabled();
  });

  it('should use the table that the rider supplied, run the audit with its sizes, and forget it when the name changes', async () => {
    readMock.mockResolvedValue({ success: true, table });
    renderStep2(locale);
    typeBike('Acme Flyer X 2025');
    fireEvent.change(screen.getByLabelText(t.admin.upload.dropChoose, { selector: 'input' }), { target: { files: [new File(['x'], 'table.png', { type: 'image/png' })] } });
    await screen.findByTestId('upload-review');
    fireEvent.click(screen.getByRole('button', { name: t.geometry.use }));
    const found = await screen.findByTestId('geometry-found');
    expect(found).toHaveAttribute('data-source', 'rider');
    expect(found).toHaveTextContent('S, M, L');
    expect(run()).toBeEnabled();
    typeBike('Acme Flyer Y 2025');
    expect(screen.queryByTestId('geometry-found')).not.toBeInTheDocument();
    expect(run()).toBeDisabled();
    typeBike('Acme Flyer X 2025');
    fireEvent.click(within(screen.getByTestId('geometry-found')).getByRole('button', { name: a.geometryChange }));
    expect(screen.getByTestId('geometry-needed')).toBeInTheDocument();
  });

  it('should send the supplied sizes to the audit and mark them as the rider\'s own', async () => {
    readMock.mockResolvedValue({ success: true, table });
    renderStep2(locale);
    typeBike('Acme Flyer X 2025');
    fireEvent.change(screen.getByLabelText(t.admin.upload.dropChoose, { selector: 'input' }), { target: { files: [new File(['x'], 'table.png', { type: 'image/png' })] } });
    await screen.findByTestId('upload-review');
    fireEvent.click(screen.getByRole('button', { name: t.geometry.use }));
    await screen.findByTestId('geometry-found');
    fireEvent.click(run());
    await waitFor(() => expect(analyzeMock).toHaveBeenCalledTimes(1));
    const request = analyzeMock.mock.calls[0][0];
    expect(request).toMatchObject({ bikeModelName: 'Acme Flyer X 2025', geometry: { source: 'rider' } });
    expect(request.geometry.sizes.map((row: { size: string }) => row.size)).toEqual(['S', 'M', 'L']);
  });
});
