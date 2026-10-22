import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
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
    expect(screen.getAllByText(/30°–35°/).length).toBeGreaterThan(0);
  });

  it('should show the crank finding for every crank longer than 165 mm, whatever the rider weight or height', () => {
    const long = renderReport(locale, { crankLengthMm: 172.5 });
    expect(screen.getByText(t.diagnosticReport.crankBadge)).toBeInTheDocument();
    expect(screen.getByTestId('crank-schematic')).toBeInTheDocument();
    long.unmount();
    renderReport(locale, { crankLengthMm: 165 });
    expect(screen.queryByText(t.diagnosticReport.crankBadge)).not.toBeInTheDocument();
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
    expect(screen.getAllByText(t.diagnosticReport.estimateChip).filter((el) => !el.closest('[data-testid="print-sheet"]'))).toHaveLength(2);
    expect(screen.getAllByTitle(t.studio.estimateNote)).toHaveLength(2);
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
    expect(screen.getAllByText(/30°–35°/).length).toBeGreaterThan(0);
  });

  it('should not show text of the other language in the finding cards', () => {
    renderReport(locale, { currentPains: ['front_knee'] });
    const other = locale === 'cs' ? translations.en : translations.cs;
    expect(screen.queryByText(other.diagnosticReport.saddleBadge)).not.toBeInTheDocument();
  });

  describe('report order A: plan, reasons, details, numbers', () => {
    const position = (a: HTMLElement, b: HTMLElement) => a.compareDocumentPosition(b);

    it('should place the plan first, then the reasons, the details and the target numbers as a reference', () => {
      renderReport(locale, { currentPains: ['front_knee'], currentSaddleHeightMm: 726 });
      const plan = screen.getByTestId('action-plan');
      const reasons = screen.getByTestId('symptom-linkage');
      const details = document.getElementById('report-details') as HTMLElement;
      const numbers = document.getElementById('report-numbers') as HTMLElement;
      const diagnosis = screen.getByTestId('diagnosis-anteriorKnee');
      for (const [before, after] of [[plan, reasons], [reasons, details], [details, numbers], [numbers, diagnosis]]) {
        expect(position(before, after) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      }
    });

    it('should jump from the header links to the sections and hide the reasons link without linked symptoms', () => {
      const scroll = vi.fn();
      Element.prototype.scrollIntoView = scroll;
      renderReport(locale);
      expect(screen.queryByRole('button', { name: t.diagnosticReport.jump.reasons })).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: t.diagnosticReport.jump.numbers }));
      expect(scroll).toHaveBeenCalledTimes(1);
      expect(scroll.mock.contexts[0]).toBe(document.getElementById('report-numbers'));
      fireEvent.click(screen.getByRole('button', { name: t.diagnosticReport.jump.details }));
      expect(scroll.mock.contexts[1]).toBe(document.getElementById('report-details'));
    });

    it('should show the reasons link when a symptom is linked and jump to the reasons', () => {
      const scroll = vi.fn();
      Element.prototype.scrollIntoView = scroll;
      renderReport(locale, { currentPains: ['front_knee'], currentSaddleHeightMm: 726 });
      fireEvent.click(screen.getByRole('button', { name: t.diagnosticReport.jump.reasons }));
      expect(scroll.mock.contexts[0]).toBe(document.getElementById('report-reasons'));
    });

    it('should scroll to the detail card of a plan step and highlight it briefly', () => {
      vi.useFakeTimers();
      const scroll = vi.fn();
      Element.prototype.scrollIntoView = scroll;
      renderReport(locale);
      const step = screen.getByTestId('action-step-saddle');
      fireEvent.click(within(step).getByRole('button', { name: t.diagnosticReport.actionPlan.showDetail }));
      const card = document.getElementById('finding-saddle') as HTMLElement;
      expect(scroll.mock.contexts[0]).toBe(card);
      expect(card).toHaveClass('ring-2');
      act(() => vi.advanceTimersByTime(1700));
      expect(card).not.toHaveClass('ring-2');
      vi.useRealTimers();
    });

    it('should give every plan step a detail card to jump to', () => {
      renderReport(locale, { crankLengthMm: 172.5, currentBarWidthMm: 440 });
      for (const step of screen.getAllByTestId(/^action-step-/)) {
        const id = step.getAttribute('data-testid')!.replace('action-step-', '');
        expect(document.getElementById(`finding-${id}`), id).not.toBeNull();
      }
    });
  });

  describe('Epic 11: how-to guides and the separate saddle pitch and cleat cards', () => {
    it('should show the pitch card (step 2) and the cleat card (step 5) as separate cards with their own schematic, without a learn-more button', () => {
      renderReport(locale, { crankLengthMm: 172.5, currentBarWidthMm: 440 });
      expect(screen.getByText(t.diagnosticReport.pitchBadge)).toBeInTheDocument();
      expect(screen.getByText(t.diagnosticReport.cleatBadge)).toBeInTheDocument();
      expect(screen.getByTestId('pitch-schematic')).toBeInTheDocument();
      expect(screen.getByTestId('cleat-schematic')).toBeInTheDocument();
      expect(screen.getAllByText(t.diagnosticReport.actionPlan.stepLabel.replace('{n}', '5')).length).toBeGreaterThan(0);
      expect(screen.getAllByText(t.diagnosticReport.learnMoreButton)).toHaveLength(3);
    });

    it('should put a collapsed how-to accordion under every card with tools, measuring point, steps and the safety line', () => {
      renderReport(locale, { crankLengthMm: 172.5, currentBarWidthMm: 440 });
      for (const id of ['saddle', 'pitch', 'handlebar', 'crank', 'cleat']) {
        const guide = screen.getByTestId(`howto-${id}`);
        expect(guide.tagName).toBe('DETAILS');
        expect(guide).not.toHaveAttribute('open');
        expect(guide).toHaveTextContent(t.diagnosticReport.howTo.title);
        expect(guide).toHaveTextContent(t.diagnosticReport.howTo.toolsLabel);
        expect(guide).toHaveTextContent(t.diagnosticReport.howTo.referenceLabel);
        expect(guide).toHaveTextContent(t.diagnosticReport.howTo.stepsLabel);
        expect(guide).toHaveTextContent(t.diagnosticReport.howTo.safety);
      }
      expect(screen.getByTestId('howto-handlebar')).toHaveTextContent(t.diagnosticReport.howTo.handlebar.tip);
    });

    it('should open a guide on click and show the saddle measuring point from the bottom bracket', () => {
      renderReport(locale, { currentSaddleHeightMm: 726 });
      const guide = screen.getByTestId('howto-saddle');
      fireEvent.click(within(guide).getByText(t.diagnosticReport.howTo.title));
      expect(guide).toHaveTextContent('(0,0)');
      expect(guide).toHaveTextContent('3–5 mm');
    });
  });

  describe('PDF export of the summary', () => {
    it('should print from the export button and render the one-page summary only for the print', () => {
      const print = vi.spyOn(window, 'print').mockImplementation(() => undefined);
      renderReport(locale, { currentSaddleHeightMm: 726, currentBarWidthMm: 440, crankLengthMm: 172.5 });
      const sheet = screen.getByTestId('print-sheet');
      expect(sheet).toHaveClass('print-sheet');
      expect(sheet).toHaveAttribute('aria-hidden', 'true');
      expect(sheet).toHaveTextContent(t.diagnosticReport.summary.setupTitle);
      expect(sheet).toHaveTextContent('726 mm');
      expect(sheet).toHaveTextContent('742 mm');
      expect(sheet).toHaveTextContent(t.diagnosticReport.actionPlan.saddleTitle);
      fireEvent.click(screen.getByRole('button', { name: t.diagnosticReport.exportPdfButton }));
      expect(print).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('print-sheet')).toHaveTextContent(new RegExp(String(new Date().getFullYear())));
      print.mockRestore();
    });

    it('should hide the screen report when printing and keep the sheet free of icons and emoji', () => {
      const { container } = renderReport(locale);
      expect(container.querySelector('div.print\\:hidden')).not.toBeNull();
      expect(screen.getByTestId('print-sheet').textContent).not.toMatch(/\p{Extended_Pictographic}/u);
    });
  });

  describe('UX polish of the result page', () => {
    it('should show a friendly header with the summary chips and pill buttons', () => {
      renderReport(locale, { currentPains: ['front_knee'], currentSaddleHeightMm: 726 });
      expect(screen.getByRole('heading', { level: 1, name: t.diagnosticReport.title })).toBeInTheDocument();
      expect(screen.getByText(t.diagnosticReport.summarySteps.replace('{n}', '5'))).toBeInTheDocument();
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
      renderReport(locale, { currentBarWidthMm: 440, crankLengthMm: 172.5 });
      const badges = screen.getAllByText(/^(Step|Krok) \d$/).map((el) => el.textContent);
      expect(badges).toEqual(['saddle', 'pitch', 'handlebar', 'crank', 'cleat'].map((_, i) => t.diagnosticReport.actionPlan.stepLabel.replace('{n}', String(i + 1))));
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
        'action-step-saddle', 'action-step-pitch', 'action-step-handlebar', 'action-step-crank', 'action-step-cleat',
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
