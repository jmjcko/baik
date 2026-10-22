/**
 * E2E guard test for the scenario in docs/knowledge/testovaci-scenar-petr-canyon.md:
 * rider Petr and the stock bike Canyon Endurace CF 7 (road, endurance posture, ulnar numbness and anterior knee pain).
 * Layer 1 pins the engine numbers, layer 2 walks the real app (wizard to report) with the same inputs in EN and CZ.
 */
import { createElement } from 'react';
import { readFileSync } from 'fs';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import HomePage from '@/app/page';
import { translations, type Locale } from '@/lib/i18n/translations';
import type { RiderPainType } from '@/types/baikfit';
import { assessBar, assessCrank, crankNeedsChange, linkSymptoms } from '../advice';
import { RIDER_PROFILE_STORAGE_KEY, calculateSaddleHeight, computeBikeFitCoordinates } from '../coordinates';
import { KB_RULES, recommendedBarWidthMm, saddleAdjustment } from '../kbRules';

/** Inputs of the scenario. The scenario names the symptoms ulnar_numbness and anterior_knee_pain; the app names them numb_hands and front_knee. */
const PETR = {
  discipline: 'road' as const,
  inseamMm: 850,
  heightMm: 1810,
  acromionWidthMm: 380,
  torsoLengthMm: 610,
  armLengthMm: 660,
  ridingStyle: 'endurance' as const,
  pains: ['numb_hands', 'front_knee'] as RiderPainType[],
  stock: { saddleHeightMm: 720, crankMm: 172.5, barWidthMm: 420 },
};

describe('Petr and Canyon Endurace CF 7: engine numbers', () => {
  const coordinates = computeBikeFitCoordinates({ inseamMm: PETR.inseamMm, ridingDiscipline: PETR.discipline });
  const saddle = saddleAdjustment(PETR.stock.saddleHeightMm, coordinates.saddle.heightAlongTubeMm);
  const bar = assessBar(PETR.stock.barWidthMm, PETR.acromionWidthMm);

  it('should target a saddle height of 751 mm (850 x 0.883 = 750.55) and find the stock saddle 31 mm too low', () => {
    expect(calculateSaddleHeight(PETR.inseamMm)).toBe(751);
    expect(coordinates.saddle.heightAlongTubeMm).toBe(751);
    expect(PETR.stock.saddleHeightMm - coordinates.saddle.heightAlongTubeMm).toBe(-31);
    expect(saddle).toEqual({ deltaMm: 31, direction: 'raise' });
    expect(31).toBeGreaterThan(KB_RULES.saddleToleranceMm);
  });

  it('should target a handlebar width of 380 mm and find the stock 420 mm bar 40 mm too wide', () => {
    expect(recommendedBarWidthMm(PETR.acromionWidthMm)).toBe(380);
    expect(bar).toEqual({ stockMm: 420, recommendedMm: 380, tooWide: true, excessMm: 40, entered: true });
  });

  it('should recommend a crank length of 165 mm and a knee that is 7.5 mm higher at top dead center with the stock crank', () => {
    expect(assessCrank(PETR.stock.crankMm)).toEqual({ currentMm: 172.5, recommendedMm: 165, kneeHigherMm: 7.5 });
  });

  it('should link anterior knee pain to the low saddle (31 mm) and ulnar numbness to the wide bar (40 mm)', () => {
    expect(linkSymptoms(PETR.pains, { saddle, bar })).toEqual([
      { pain: 'numb_hands', diagnosis: 'ulnar', cause: 'barWide', deltaMm: 40 },
      { pain: 'front_knee', diagnosis: 'anteriorKnee', cause: 'saddleLow', deltaMm: 31 },
    ]);
  });

  it('should keep the scenario document and this guard test in agreement on the key numbers', () => {
    const doc = readFileSync('docs/knowledge/testovaci-scenar-petr-canyon.md', 'utf8');
    for (const fact of ['750.55', '751', '−31', '380', '+40', '165', '+7.5']) expect(doc, fact).toContain(fact);
  });

  it('should ask for a crank change for Petr although he is neither heavy, tall nor inflexible (product owner rule)', () => {
    expect(crankNeedsChange(PETR.stock.crankMm)).toBe(true);
  });
});

function seedPetr(): void {
  localStorage.setItem(
    RIDER_PROFILE_STORAGE_KEY,
    JSON.stringify({
      inseamMm: PETR.inseamMm,
      heightCm: PETR.heightMm / 10,
      torsoLengthMm: PETR.torsoLengthMm,
      armLengthMm: PETR.armLengthMm,
      acromionWidthMm: PETR.acromionWidthMm,
      crankLengthMm: PETR.stock.crankMm,
      currentSaddleHeightMm: PETR.stock.saddleHeightMm,
      currentBarWidthMm: PETR.stock.barWidthMm,
      discipline: PETR.discipline,
      ridingStyle: PETR.ridingStyle,
      currentPains: PETR.pains,
    })
  );
}

function openPetrReport(locale: Locale): void {
  const t = translations[locale];
  render(createElement(HomePage));
  if (locale === 'cs') fireEvent.click(screen.getByRole('button', { name: 'CS' }));
  fireEvent.click(screen.getByText(t.entryRouter.pathAButton));
  fireEvent.click(screen.getByText(t.wizard.continueToBody));
  fireEvent.click(screen.getByText(t.wizard.continueToPosture));
  fireEvent.click(screen.getByText(t.wizard.continueToBike));
  fireEvent.click(screen.getByText(t.wizard.toReportButton));
}

describe.each(['en', 'cs'] as Locale[])('Petr and Canyon Endurace CF 7: the report in the app (%s)', (locale) => {
  const t = translations[locale];
  const r = t.diagnosticReport;

  beforeEach(() => {
    localStorage.clear();
    seedPetr();
    openPetrReport(locale);
  });

  it('should keep Petr inputs through the wizard and show the 751 mm target', () => {
    expect(screen.getByRole('heading', { level: 1, name: r.title })).toBeInTheDocument();
    expect(screen.getByText(r.targetsTitle)).toBeInTheDocument();
    expect(screen.getByText(r.saddleTitle.replace('{height}', '751').replace('{inseam}', '850').replace('{factor}', '0.883'))).toBeInTheDocument();
  });

  it('should show the target numbers with the explained saddle formula (inseam 850 x 0.883 = 750.55, rounded to 751)', () => {
    expect(within(screen.getByTestId('target-saddle')).getByText('751 mm')).toBeInTheDocument();
    expect(within(screen.getByTestId('target-handlebar')).getByText('380 mm')).toBeInTheDocument();
    expect(within(screen.getByTestId('target-crank')).getByText('165 mm')).toBeInTheDocument();
    const panel = screen.getByRole('region', { name: t.studio.saddleY });
    for (const part of ['850', '0.883', '750.55', '751']) expect(panel).toHaveTextContent(part);
  });

  it('should list the plan as saddle, handlebar, crank and saddle pitch with cleats, with the exact numbers', () => {
    const steps = screen.getAllByTestId(/^action-step-/);
    expect(steps.map((el) => el.getAttribute('data-testid'))).toEqual([
      'action-step-saddle', 'action-step-handlebar', 'action-step-crank', 'action-step-pitchCleat',
    ]);
    expect(within(steps[0]).getByText(/31/)).toBeInTheDocument();
    expect(steps[0]).toHaveTextContent('3–5');
    expect(steps[1]).toHaveTextContent('420');
    expect(steps[1]).toHaveTextContent('380');
    expect(steps[2]).toHaveTextContent('172.5');
    expect(steps[2]).toHaveTextContent('165');
    expect(steps[3]).toHaveTextContent(/10.*17/);
    expect(steps[3]).toHaveTextContent('2°');
  });

  it('should draw the crank schematic with the real 7.5 mm knee height difference', () => {
    const schematic = screen.getByTestId('crank-schematic');
    expect(schematic).toHaveTextContent('172.5 mm');
    expect(schematic).toHaveTextContent('165 mm');
    expect(schematic).toHaveTextContent('7.5 mm');
  });

  it('should draw the saddle schematic with 720 mm current, 751 mm target and the +31 mm arrow', () => {
    const schematic = screen.getByTestId('saddle-schematic');
    expect(schematic).toHaveTextContent(`${t.diagnosticReport.schematics.currentLabel} 720 mm`);
    expect(schematic).toHaveTextContent(`${t.diagnosticReport.schematics.targetLabel} 751 mm`);
    expect(schematic).toHaveTextContent('+31 mm');
  });

  it('should draw the handlebar schematic with the stock 420 mm bar (+40 mm) against the recommended 380 mm', () => {
    const schematic = screen.getByTestId('bar-schematic');
    expect(schematic).toHaveTextContent(`${t.diagnosticReport.schematics.barLabel} 420 mm (+40 mm)`);
    expect(schematic).toHaveTextContent(`${t.diagnosticReport.schematics.recommendedLabel} 380 mm`);
  });

  it('should link anterior knee pain to the saddle being 31 mm too low and numb hands to the bar being 40 mm too wide', () => {
    expect(screen.getByTestId('symptom-link-front_knee')).toHaveTextContent(r.linkage.saddleLow.replace('{delta}', '31'));
    expect(screen.getByTestId('symptom-link-numb_hands')).toHaveTextContent(
      r.linkage.barWide.replace('{bar}', '420').replace('{excess}', '40').replace('{recommended}', '380')
    );
    expect(screen.getByText(r.summarySymptoms.replace('{n}', '2'))).toBeInTheDocument();
  });
});
