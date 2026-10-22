import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { mockPrePurchaseResponse } from '@/types/__tests__/baikfit.mock';
import { PrePurchaseAuditView } from '../PrePurchaseAuditView';

const analyzeMock = vi.fn();
vi.mock('@/app/actions/analyzeBikeGeometry', () => ({
  analyzeBikeGeometry: (...args: unknown[]) => analyzeMock(...args),
}));

const LOCALES: Locale[] = ['en', 'cs'];

function renderView(locale: Locale, onProfileChange = vi.fn(), onBackToEntry = vi.fn()) {
  const utils = render(
    <PrePurchaseAuditView
      t={translations[locale]} locale={locale} inseamMm={840} acromionWidthMm={390} heightCm={178}
      torsoLengthMm={600} armLengthMm={640} riderWeightKg={82} ridingStyle="endurance"
      currentPains={['numb_hands']} onBackToEntry={onBackToEntry} onProfileChange={onProfileChange}
      crankLengthMm={172.5} currentSaddleHeightMm={742} currentBarWidthMm={420}
    />
  );
  return { ...utils, onProfileChange, onBackToEntry };
}

async function runAudit(locale: Locale) {
  const t = translations[locale];
  fireEvent.click(screen.getByText(t.prePurchaseAudit.nextStepButton));
  fireEvent.click(screen.getByText(t.prePurchaseAudit.runAuditButton));
  await waitFor(() => expect(screen.getByText(mockPrePurchaseResponse.recommendedFrameSize)).toBeInTheDocument());
}

describe.each(LOCALES)('PrePurchaseAuditView (%s)', (locale) => {
  const t = translations[locale];

  beforeEach(() => {
    analyzeMock.mockReset();
    analyzeMock.mockResolvedValue({ success: true, data: mockPrePurchaseResponse });
  });

  it('should render step 1 (rider dimensions)', () => {
    expect(renderView(locale).asFragment()).toMatchSnapshot();
  });

  it('should render step 2 (bike search) with the rider summary', () => {
    const { asFragment } = renderView(locale);
    fireEvent.click(screen.getByText(t.prePurchaseAudit.nextStepButton));
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render step 3 (report) after a successful audit', async () => {
    const { asFragment } = renderView(locale);
    await runAudit(locale);
    expect(asFragment()).toMatchSnapshot();
  });

  it('should send weight, flexibility, locale and URL to the server action', async () => {
    renderView(locale);
    fireEvent.click(screen.getByText(t.prePurchaseAudit.flexibilityLow));
    fireEvent.click(screen.getByText(t.prePurchaseAudit.nextStepButton));
    fireEvent.change(screen.getByLabelText(t.prePurchaseAudit.bikeUrlLabel), { target: { value: 'https://example.com/bike' } });
    fireEvent.click(screen.getByText(t.prePurchaseAudit.runAuditButton));
    await waitFor(() => expect(analyzeMock).toHaveBeenCalledTimes(1));
    const request = analyzeMock.mock.calls[0][0];
    expect(request.riderProfile).toMatchObject({ riderWeightKg: 82, flexibilityScore: 'inflexible', ridingStyle: 'endurance', torsoLengthMm: 600 });
    expect(request).toMatchObject({ locale, shopUrl: 'https://example.com/bike', bikeModelName: 'Canyon Ultimate CF SL 8' });
  });

  it('should send the current bike setup with the request and show it in the rider summary', async () => {
    renderView(locale);
    fireEvent.click(screen.getByText(t.prePurchaseAudit.nextStepButton));
    expect(screen.getByTestId('summary-current-setup')).toHaveTextContent('172.5');
    expect(screen.getByTestId('summary-current-setup')).toHaveTextContent('742');
    expect(screen.getByTestId('summary-current-setup')).toHaveTextContent('420');
    fireEvent.click(screen.getByText(t.prePurchaseAudit.runAuditButton));
    await waitFor(() => expect(analyzeMock).toHaveBeenCalledTimes(1));
    expect(analyzeMock.mock.calls[0][0].riderProfile).toMatchObject({
      currentCrankLengthMm: 172.5, currentSaddleHeightMm: 742, currentBarWidthMm: 420,
    });
  });

  it('should show the localized generic error when the action fails without a message', async () => {
    analyzeMock.mockResolvedValue({ success: false });
    renderView(locale);
    fireEvent.click(screen.getByText(t.prePurchaseAudit.nextStepButton));
    fireEvent.click(screen.getByText(t.prePurchaseAudit.runAuditButton));
    expect(await screen.findByText(t.prePurchaseAudit.errorGeneric)).toBeInTheDocument();
  });

  it('should show the localized network error when the action throws', async () => {
    analyzeMock.mockRejectedValue(new Error('boom'));
    renderView(locale);
    fireEvent.click(screen.getByText(t.prePurchaseAudit.nextStepButton));
    fireEvent.click(screen.getByText(t.prePurchaseAudit.runAuditButton));
    expect(await screen.findByText(t.prePurchaseAudit.errorNetwork)).toBeInTheDocument();
  });

  it('should report edited measurements through onProfileChange', () => {
    const { onProfileChange } = renderView(locale);
    fireEvent.change(screen.getByLabelText(t.prePurchaseAudit.weightLabel), { target: { value: '90' } });
    expect(onProfileChange).toHaveBeenLastCalledWith(expect.objectContaining({ riderWeightKg: 90 }));
  });

  it('should auto-calibrate torso and arm when the height changes', () => {
    const { onProfileChange } = renderView(locale);
    fireEvent.change(screen.getByLabelText(t.prePurchaseAudit.heightLabel), { target: { value: '190' } });
    expect(onProfileChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ heightCm: 190, torsoLengthMm: 646, armLengthMm: 722 })
    );
  });

  it('should open the four guide modals from step 1 and return to the hub', () => {
    const { onBackToEntry } = renderView(locale);
    for (const guide of ['inseam', 'torso', 'arm', 'acromion']) {
      fireEvent.click(screen.getByTestId(`prepurchasing-${guide}-modal-trigger`));
      expect(screen.getByTestId(`${guide}-cad-vector`)).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('modal-close-btn'));
    }
    fireEvent.click(screen.getAllByText(t.prePurchaseAudit.backToModeSelect)[0]);
    expect(onBackToEntry).toHaveBeenCalledTimes(1);
  });

  it('should navigate back from the report to the search and the dimensions', async () => {
    renderView(locale);
    await runAudit(locale);
    fireEvent.click(screen.getAllByText(t.prePurchaseAudit.editSearchButton)[0]);
    expect(screen.getByText(t.prePurchaseAudit.runAuditButton)).toBeInTheDocument();
    fireEvent.click(screen.getByText(t.prePurchaseAudit.editMorphologyButton));
    expect(screen.getByText(t.prePurchaseAudit.nextStepButton)).toBeInTheDocument();
  });
});
