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
    expect(screen.getByText(t.diagnosticReport.saddleTitle.replace('{height}', '742').replace('{inseam}', '840').replace('{factor}', '0.883'))).toBeInTheDocument();
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
    expect(screen.getAllByText(t.diagnosticReport.estimateChip)).toHaveLength(3);
    expect(screen.getAllByTitle(t.studio.estimateNote)).toHaveLength(3);
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
    expect(screen.getAllByText(/440/).length).toBeGreaterThan(0);
  });

  it('should compare the entered saddle height with the LeMond target and state the direction', () => {
    const high = renderReport(locale, { currentSaddleHeightMm: 760 });
    expect(screen.getByText(t.diagnosticReport.saddleBodyLower.replace('{current}', '760').replace('{target}', '742').replace('{delta}', '18').replace('{lower}', '5–10 mm'))).toBeInTheDocument();
    high.unmount();
    const low = renderReport(locale, { currentSaddleHeightMm: 720 });
    expect(screen.getAllByText(/720/).length).toBeGreaterThan(0);
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

  describe('UX polish of the result page', () => {
    it('should show a friendly header with the summary chips and pill buttons', () => {
      renderReport(locale, { currentPains: ['front_knee'], currentSaddleHeightMm: 726 });
      expect(screen.getByRole('heading', { level: 1, name: t.diagnosticReport.title })).toBeInTheDocument();
      expect(screen.getByText(t.diagnosticReport.summarySteps.replace('{n}', '3'))).toBeInTheDocument();
      expect(screen.getByText(t.diagnosticReport.summarySymptoms.replace('{n}', '1'))).toBeInTheDocument();
      for (const button of screen.getAllByText(t.diagnosticReport.openCadButton)) {
        expect(button).toHaveClass('rounded-full', 'h-12');
      }
      expect(screen.getByText(t.diagnosticReport.editInputsButton)).toHaveClass('rounded-full', 'h-12');
    });

    it('should not claim explained symptoms when none are linked', () => {
      renderReport(locale);
      expect(screen.queryByText(/Symptoms explained|Vysvětlené potíže/)).not.toBeInTheDocument();
    });

    it('should number the finding cards like the action plan and list the saddle first', () => {
      renderReport(locale, { currentBarWidthMm: 440, crankLengthMm: 172.5, riderWeightKg: 95 });
      const badges = screen.getAllByText(/^(Step|Krok) \d$/).map((el) => el.textContent);
      expect(badges).toEqual(['saddle', 'handlebar', 'crank'].map((_, i) => t.diagnosticReport.actionPlan.stepLabel.replace('{n}', String(i + 1))));
      const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent ?? '');
      expect(titles.findIndex((x) => /742/.test(x))).toBeLessThan(titles.findIndex((x) => /440/.test(x)));
    });

    it('should show the target numbers with the saddle height highlighted and a friendly empty diagnosis', () => {
      renderReport(locale);
      expect(screen.getByRole('heading', { name: t.diagnosticReport.targetsTitle })).toBeInTheDocument();
      expect(screen.getByText(t.diagnosis.noSymptoms)).toBeInTheDocument();
    });

    it('should collapse the general diagnosis cards but keep their content readable', () => {
      renderReport(locale, { currentPains: ['numb_hands'] });
      const card = screen.getByTestId('diagnosis-ulnar');
      expect(card.tagName).toBe('DETAILS');
      expect(card).not.toHaveAttribute('open');
      expect(card).toHaveTextContent(t.diagnosis.rootCauseLabel);
    });
  });

  describe('Epic 9: schematics, action plan and symptom linkage', () => {
    it('should draw a schematic inside each finding card and show the numbered action plan', () => {
      renderReport(locale, { currentBarWidthMm: 440, currentSaddleHeightMm: 726, crankLengthMm: 172.5, riderWeightKg: 95 });
      expect(screen.getByTestId('saddle-schematic')).toBeInTheDocument();
      expect(screen.getByTestId('bar-schematic')).toBeInTheDocument();
      expect(screen.getByTestId('crank-schematic')).toBeInTheDocument();
      const plan = screen.getByTestId('action-plan');
      expect(plan).toHaveTextContent(t.diagnosticReport.actionPlan.title);
      expect(screen.getAllByTestId(/^action-step-/).map((el) => el.getAttribute('data-testid'))).toEqual([
        'action-step-saddle', 'action-step-handlebar', 'action-step-crank', 'action-step-pitchCleat',
      ]);
    });

    it('should link anterior knee pain to a saddle that is 16 mm too low', () => {
      renderReport(locale, { currentPains: ['front_knee'], currentSaddleHeightMm: 726 });
      const box = screen.getByTestId('symptom-linkage');
      expect(box).toHaveTextContent(t.diagnosticReport.linkage.title);
      expect(screen.getByTestId('symptom-link-front_knee')).toHaveTextContent(t.diagnosticReport.linkage.saddleLow.replace('{delta}', '16'));
      expect(screen.getByTestId('diagnosis-anteriorKnee')).toBeInTheDocument();
    });

    it('should link numb hands to a bar that is too wide and keep the general diagnosis', () => {
      renderReport(locale, { currentPains: ['numb_hands'], currentBarWidthMm: 440 });
      expect(screen.getByTestId('symptom-link-numb_hands')).toHaveTextContent('60');
      expect(screen.getByTestId('diagnosis-ulnar')).toBeInTheDocument();
    });

    it('should hide the linkage box without data or within tolerance and keep the general diagnosis', () => {
      renderReport(locale, { currentPains: ['front_knee'] });
      expect(screen.queryByTestId('symptom-linkage')).not.toBeInTheDocument();
      expect(screen.getByTestId('diagnosis-anteriorKnee')).toBeInTheDocument();
    });
  });
});
