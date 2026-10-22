import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import HomePage from '../page';
import { translations } from '@/lib/i18n/translations';
import { STOCK_BIKE_SPECS } from '@/lib/bikes';
import type { AiStockSelection } from '@/lib/bikes/types';
import { storedPassport } from '@/test/storedPassport';

const mockExtract = vi.fn();
vi.mock('@/app/actions/extractStockBikeSpec', () => ({ extractStockBikeSpec: (input: unknown) => mockExtract(input) }));

const en = translations.en;

function openStep4(t = en) {
  fireEvent.click(screen.getByText(t.entryRouter.pathAButton));
  fireEvent.click(screen.getByText(t.wizard.continueToBody));
  fireEvent.click(screen.getByText(t.wizard.continueToPosture));
  fireEvent.click(screen.getByText(t.wizard.continueToBike));
}

function chooseCanyonM(t = en) {
  const p = t.stockBike.picker;
  fireEvent.click(screen.getByRole('switch'));
  fireEvent.change(screen.getByLabelText(p.brandLabel), { target: { value: 'Canyon' } });
  fireEvent.change(screen.getByLabelText(p.modelLabel), { target: { value: 'Endurace CF 8' } });
  fireEvent.change(screen.getByLabelText(p.sizeLabel), { target: { value: 'M' } });
}

describe('Stock bike: from the wizard to the report', () => {
  beforeEach(() => {
    localStorage.clear();
    mockExtract.mockReset();
  });

  it('should show no audit and keep the handlebar and crank findings when the bike has no factory setup', () => {
    render(<HomePage />);
    openStep4();
    fireEvent.change(screen.getByLabelText(en.wizard.currentBarLabel), { target: { value: '440' } });
    fireEvent.click(screen.getByText(en.wizard.toReportButton));
    expect(screen.queryByTestId('stock-audit')).not.toBeInTheDocument();
    expect(document.getElementById('finding-handlebar')).not.toBeNull();
    expect(document.getElementById('finding-crank')).not.toBeNull();
  });

  it('should prefill the stock handlebar and cranks, store the bike in the passport and show the audit in the report', () => {
    render(<HomePage />);
    openStep4();
    chooseCanyonM();
    expect(screen.getByLabelText(en.wizard.currentBarLabel)).toHaveValue('410');
    expect(storedPassport()?.bikes[0].stock).toEqual({ source: 'seed', bikeId: 'canyon-endurace-cf-8-di2-2024', size: 'M' });
    fireEvent.click(screen.getByText(en.wizard.toReportButton));
    const audit = screen.getByTestId('stock-audit');
    expect(within(audit).getByRole('heading', { level: 2, name: en.stockBike.audit.title })).toBeInTheDocument();
    expect(within(audit).getByText(/Canyon Endurace CF 8 2024, size M/)).toBeInTheDocument();
    expect(within(audit).getByTestId('saddle-rail-schematic')).toBeInTheDocument();
    expect(within(audit).getByTestId('spacer-schematic')).toBeInTheDocument();
  });

  it('should judge the handlebar and the crank only in the audit, not twice', () => {
    render(<HomePage />);
    openStep4();
    fireEvent.change(screen.getByLabelText(en.wizard.currentBarLabel), { target: { value: '440' } });
    chooseCanyonM();
    fireEvent.click(screen.getByText(en.wizard.toReportButton));
    expect(document.getElementById('finding-handlebar')).toBeNull();
    expect(document.getElementById('finding-crank')).toBeNull();
    expect(document.getElementById('finding-saddle')).not.toBeNull();
    const traps = within(screen.getByTestId('stock-audit')).getAllByTestId('stock-trap');
    expect(traps.map((trap) => trap.querySelector('h4')?.textContent)).toEqual(['Crankarm Length']);
  });

  it('should lock the handlebar and the cranks that the factory setup gives, with a note, and unlock them when the switch is off', () => {
    render(<HomePage />);
    openStep4();
    chooseCanyonM();
    expect(screen.getByLabelText(en.wizard.currentBarLabel)).toBeDisabled();
    expect(screen.getByText('175mm')).toBeDisabled();
    expect(screen.getByRole('note')).toHaveTextContent(en.stockBike.picker.locked);
    expect(screen.queryByText(en.wizard.clearValue)).not.toBeInTheDocument();
    expect(screen.getByLabelText(en.wizard.currentSaddleLabel)).toBeEnabled();
    fireEvent.click(screen.getByRole('switch'));
    expect(screen.getByLabelText(en.wizard.currentBarLabel)).toBeEnabled();
    expect(screen.getByText('175mm')).toBeEnabled();
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
    expect(screen.getByLabelText(en.wizard.currentBarLabel)).toHaveValue('410');
  });

  it('should keep the fields editable when the maker publishes neither handlebar nor cranks (Trek)', () => {
    render(<HomePage />);
    openStep4();
    const p = en.stockBike.picker;
    fireEvent.click(screen.getByRole('switch'));
    fireEvent.change(screen.getByLabelText(p.brandLabel), { target: { value: 'Trek' } });
    fireEvent.change(screen.getByLabelText(p.modelLabel), { target: { value: 'Domane SL 6 Gen 4' } });
    fireEvent.change(screen.getByLabelText(p.sizeLabel), { target: { value: '56' } });
    expect(screen.getByLabelText(en.wizard.currentBarLabel)).toBeEnabled();
    expect(screen.getByText('175mm')).toBeEnabled();
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });

  it('should lock the fields of a bike that the AI read and the rider confirmed', async () => {
    mockExtract.mockResolvedValue({ success: true, bike: { source: 'ai', brand: 'Cube', model: 'Attain', year: 2024, size: '54', spec: { ...STOCK_BIKE_SPECS[0].sizes.M, stockHandlebarMm: 420, stockCrankMm: null } } });
    render(<HomePage />);
    openStep4();
    const p = en.stockBike.picker;
    fireEvent.click(screen.getByRole('switch'));
    fireEvent.click(screen.getByText(p.notListed));
    fireEvent.change(screen.getByLabelText(p.urlLabel), { target: { value: 'https://www.cube.eu/attain' } });
    fireEvent.change(screen.getByLabelText(p.urlSizeLabel), { target: { value: '54' } });
    fireEvent.click(screen.getByRole('button', { name: p.urlButton }));
    fireEvent.click(await screen.findByRole('button', { name: p.review.confirm }));
    expect(screen.getByLabelText(en.wizard.currentBarLabel)).toBeDisabled();
    expect(screen.getByText('175mm')).toBeEnabled();
  });

  it('should restore the chosen bike after a reload and take it away with the switch', () => {
    const first = render(<HomePage />);
    openStep4();
    chooseCanyonM();
    first.unmount();
    render(<HomePage />);
    openStep4();
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByLabelText(en.stockBike.picker.sizeLabel)).toHaveValue('M');
    fireEvent.click(screen.getByRole('switch'));
    expect(storedPassport()?.bikes[0]).not.toHaveProperty('stock');
    fireEvent.click(screen.getByText(en.wizard.toReportButton));
    expect(screen.queryByTestId('stock-audit')).not.toBeInTheDocument();
  });

  it('should show the audit and the warnings in Czech', () => {
    render(<HomePage />);
    fireEvent.click(screen.getByRole('button', { name: 'CS' }));
    const cs = translations.cs;
    openStep4(cs);
    chooseCanyonM(cs);
    fireEvent.click(screen.getByText(cs.wizard.toReportButton));
    const audit = screen.getByTestId('stock-audit');
    expect(within(audit).getByRole('heading', { level: 2, name: cs.stockBike.audit.title })).toBeInTheDocument();
    expect(within(audit).getAllByTestId('stock-trap')[0].querySelector('h4')?.textContent).toBe('Délka klik');
  });

  it('should use a bike that the AI read only after the rider confirmed it, and mark it in the report', async () => {
    const ai: AiStockSelection = { source: 'ai', brand: 'Cube', model: 'Attain GTC', year: 2024, size: '54', spec: { ...STOCK_BIKE_SPECS[0].sizes.M, stockHandlebarMm: 420, stockCrankMm: 170 } };
    mockExtract.mockResolvedValue({ success: true, bike: ai });
    render(<HomePage />);
    openStep4();
    const p = en.stockBike.picker;
    fireEvent.click(screen.getByRole('switch'));
    fireEvent.click(screen.getByText(p.notListed));
    fireEvent.change(screen.getByLabelText(p.urlLabel), { target: { value: 'https://www.cube.eu/attain' } });
    fireEvent.change(screen.getByLabelText(p.urlSizeLabel), { target: { value: '54' } });
    fireEvent.click(screen.getByRole('button', { name: p.urlButton }));
    await screen.findByTestId('stock-review');
    expect(storedPassport()?.bikes[0]).not.toHaveProperty('stock');
    fireEvent.click(screen.getByRole('button', { name: p.review.confirm }));
    expect(storedPassport()?.bikes[0].stock).toMatchObject({ source: 'ai', brand: 'Cube', size: '54' });
    expect(JSON.stringify(storedPassport())).not.toContain('cube.eu');
    fireEvent.click(screen.getByText(en.wizard.toReportButton));
    await waitFor(() => expect(screen.getByTestId('stock-origin')).toHaveTextContent(en.stockBike.audit.badgeAi));
  });
});
