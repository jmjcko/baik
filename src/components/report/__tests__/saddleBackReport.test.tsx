import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { buildActionPlan } from '../buildActionPlan';
import type { FindingInput } from '../reportFindings';
import { DiagnosisPanel } from '../ReportParts';

const custom = { saddleSetbackMm: 180, stemLengthMm: 110, spacerStackMm: 10, saddleToBarDropMm: 90 };
const BASE: FindingInput = { inseamMm: 840, acromionWidthMm: 390, crankLengthMm: 165, saddleHeightMm: 742, currentBarWidthMm: 380, currentSaddleHeightMm: 730, setupMode: 'custom', custom, setbackTargetMm: 195 };

describe.each(['en', 'cs'] as Locale[])('the saddle back with the joints first (%s)', (locale) => {
  const t = translations[locale];
  const p = t.customSetup.plan;
  const plan = (input: Partial<FindingInput> = {}) => buildActionPlan(t, { ...BASE, ...input });
  const step = (steps: ReturnType<typeof plan>, id: string) => steps.find((s) => s.id === id);

  it('should say after every move back that the saddle rises by a third of it and the height is to be checked', () => {
    expect(step(plan(), 'setback')?.body).toContain(p.heightCheck);
    expect(step(plan({ custom: { ...custom, saddleSetbackMm: 210 } }), 'setback')?.body).not.toContain(p.heightCheck);
  });

  it('should cut a bigger move back to 15 mm and send the rider to a bike fitter', () => {
    const body = step(plan({ custom: { ...custom, saddleSetbackMm: 150 } }), 'setback')?.body ?? '';
    expect(body).toContain('15');
    expect(body).toMatch(/fitter/i);
    expect(body).toContain(p.heightCheck);
  });

  it('should advise no move back for a rider with pain at the back of the knee, and keep the other steps', () => {
    const steps = plan({ currentPains: ['back_knee'] });
    expect(steps.map((s) => s.id)).not.toContain('setback');
    expect(steps.map((s) => s.id)).toContain('saddle');
  });

  it('should explain the fall forward in the release test with the knee first for a rider with pain at the back of the knee', () => {
    const r = t.diagnosticReport.reasons;
    const text = (pains: FindingInput['currentPains']) => JSON.stringify(buildActionPlan(t, { ...BASE, setupMode: 'stock', releaseTest: 'slumping', currentPains: pains }));
    expect(text(['back_knee', 'numb_hands'])).toContain(t.diagnosticReport.actionPlan.dropSlumpKnee);
    expect(text(['back_knee', 'numb_hands'])).toContain(r.dropSlumpKnee);
    expect(text(['numb_hands'])).not.toContain(r.dropSlumpKnee);
    expect(text(['numb_hands'])).toContain(r.dropSlump);
  });

  describe('the card of the numb hands', () => {
    const ulnar = t.diagnosis.items.ulnar;
    const balance = (ids: Array<'ulnar' | 'median' | 'posteriorKnee'>) => {
      render(<DiagnosisPanel t={t} ids={ids} onLearnMore={() => undefined} expanded />);
      return within(screen.getByTestId('diagnosis-ulnar')).queryByText(ulnar.balanceTest as string);
    };

    it('should show the Balance Test under the numb hands', () => {
      expect(balance(['ulnar'])).toBeInTheDocument();
    });

    it('should leave the Balance Test out when the rider also reports pain at the back of the knee', () => {
      expect(balance(['ulnar', 'posteriorKnee'])).toBeNull();
      expect(screen.getByTestId('diagnosis-posteriorKnee')).toBeInTheDocument();
    });
  });
});
