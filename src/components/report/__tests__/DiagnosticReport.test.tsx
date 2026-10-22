import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { computeBikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import type { RiderPainType } from '@/types/baikfit';
import { DiagnosticReport } from '../DiagnosticReport';

const LOCALES: Locale[] = ['en', 'cs'];

function renderReport(locale: Locale, overrides: Partial<{ acromionWidthMm: number; crankLengthMm: number; riderWeightKg: number; heightCm: number; currentPains: RiderPainType[]; currentSaddleHeightMm: number | null; currentBarWidthMm: number | null }> = {}) {
  const handlers = { onOpenCadStudio: vi.fn(), onEditMeasurements: vi.fn() };
  const props = {
    t: translations[locale], inseamMm: 840, acromionWidthMm: 390, crankLengthMm: 170, riderWeightKg: 75,
    currentPains: [] as RiderPainType[], currentSaddleHeightMm: null, currentBarWidthMm: null, coordinates: computeBikeFitCoordinates({ inseamMm: 840 }), ...handlers, ...overrides,
  };
  return { ...render(<DiagnosticReport {...props} />), ...handlers };
}

describe.each(LOCALES)('DiagnosticReport (%s)', (locale) => {
  const t = translations[locale];

  it('should recommend the commercial bar width from the KB 1:1 rule (acromion 390 gives 380 mm)', () => {
    renderReport(locale);
    expect(screen.getByText(t.diagnosticReport.handlebarAction.replace('{recommended}', '380'))).toBeInTheDocument();
  });

  it('should not warn about the handlebar when the acromion already fits a 420 mm bar', () => {
    renderReport(locale, { acromionWidthMm: 420 });
    expect(screen.queryByText(t.diagnosticReport.handlebarBadge)).not.toBeInTheDocument();
  });

  it('should show the saddle height with the LeMond factor and the knee check from the KB', () => {
    renderReport(locale);
    expect(screen.getByText(/742 mm/)).toBeInTheDocument();
    expect(screen.getByText(/30°–35°/)).toBeInTheDocument();
  });

  it('should flag an oversized crank only for a heavy rider', () => {
    const light = renderReport(locale, { crankLengthMm: 172.5 });
    expect(screen.queryByText(t.diagnosticReport.crankBadge)).not.toBeInTheDocument();
    light.unmount();
    renderReport(locale, { crankLengthMm: 172.5, riderWeightKg: 105 });
    expect(screen.getByText(t.diagnosticReport.crankBadge)).toBeInTheDocument();
  });

  it('should flag an oversized crank for a tall rider above 188 cm', () => {
    renderReport(locale, { crankLengthMm: 172.5, heightCm: 190 });
    expect(screen.getByText(t.diagnosticReport.crankBadge)).toBeInTheDocument();
  });

  it('should list the diagnosis rows of the reported symptoms with causes and fixes', () => {
    renderReport(locale, { currentPains: ['numb_hands', 'neck_pain'] });
    for (const id of ['ulnar', 'median', 'neck'] as const) {
      expect(screen.getByTestId(`diagnosis-${id}`)).toHaveTextContent(t.diagnosis.items[id].rootCause);
    }
    expect(screen.queryByTestId('diagnosis-anteriorKnee')).not.toBeInTheDocument();
  });

  it('should show the all-clear text without symptoms and open the nerve flossing guide', () => {
    const { unmount } = renderReport(locale);
    expect(screen.getByText(t.diagnosis.noSymptoms)).toBeInTheDocument();
    unmount();
    renderReport(locale, { currentPains: ['numb_hands'] });
    fireEvent.click(screen.getAllByText(t.diagnosis.learnMore)[0]);
    expect(screen.getByText(t.diagnosticReport.modals.nerveFlossingTitle)).toBeInTheDocument();
  });

  it('should show the estimate note and route the buttons', () => {
    const { onOpenCadStudio, onEditMeasurements } = renderReport(locale);
    expect(screen.getByText(t.studio.estimateNote)).toBeInTheDocument();
    fireEvent.click(screen.getByText(t.diagnosticReport.editInputsButton));
    fireEvent.click(screen.getAllByText(t.diagnosticReport.openCadButton)[0]);
    expect(onEditMeasurements).toHaveBeenCalledTimes(1);
    expect(onOpenCadStudio).toHaveBeenCalledTimes(1);
  });

  it('should judge the entered handlebar instead of the 420 mm factory assumption', () => {
    const fits = renderReport(locale, { acromionWidthMm: 380, currentBarWidthMm: 380 });
    expect(screen.queryByText(t.diagnosticReport.handlebarBadge)).not.toBeInTheDocument();
    fits.unmount();
    renderReport(locale, { acromionWidthMm: 380, currentBarWidthMm: 440 });
    expect(screen.getByText(t.diagnosticReport.handlebarBadge)).toBeInTheDocument();
    expect(screen.getByText(/440/)).toBeInTheDocument();
  });

  it('should compare the entered saddle height with the LeMond target and state the direction', () => {
    const high = renderReport(locale, { currentSaddleHeightMm: 760 });
    expect(screen.getByText(t.diagnosticReport.saddleBodyLower.replace('{current}', '760').replace('{target}', '742').replace('{delta}', '18').replace('{lower}', '5–10 mm'))).toBeInTheDocument();
    high.unmount();
    const low = renderReport(locale, { currentSaddleHeightMm: 720 });
    expect(screen.getByText(/720/)).toBeInTheDocument();
    low.unmount();
    renderReport(locale, { currentSaddleHeightMm: 743 });
    expect(screen.getByText(t.diagnosticReport.saddleBodyOnTarget.replace('{current}', '743').replace('{target}', '742'))).toBeInTheDocument();
  });

  it('should keep the old saddle text when no height was entered', () => {
    renderReport(locale);
    expect(screen.getByText(/30°–35°/)).toBeInTheDocument();
  });

  it('should not show text of the other language in the finding cards', () => {
    renderReport(locale, { currentPains: ['front_knee'] });
    const other = locale === 'cs' ? translations.en : translations.cs;
    expect(screen.queryByText(other.diagnosticReport.saddleBadge)).not.toBeInTheDocument();
  });
});
