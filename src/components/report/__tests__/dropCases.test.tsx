import { describe, it, expect } from 'vitest';
import { translations, type Locale } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { DEFAULT_PROFILE, deriveCoordinates, type ProfileValues } from '@/lib/profile/values';
import { STOCK_BIKE_SPECS } from '@/lib/bikes';
import type { StockSelection } from '@/lib/bikes/types';
import type { RiderPainType, RidingStyle } from '@/types/baikfit';
import { buildActionPlan } from '../buildActionPlan';
import { buildFindings, type FindingInput } from '../reportFindings';
import { buildStockAudit } from '../stock/buildStockAudit';

/** The rider of the test cases of docs/knowledge/saddle-to-bar-drop-rules.md: inseam 840, torso 620, arm 620, acromion 380, endurance. */
const rider = (pains: RiderPainType[], ridingStyle: RidingStyle = 'endurance'): ProfileValues => ({
  ...DEFAULT_PROFILE, inseamMm: 840, torsoLengthMm: 620, armLengthMm: 620, acromionWidthMm: 380, ridingStyle, currentPains: pains,
});
const inputOf = (values: ProfileValues): FindingInput => ({
  inseamMm: values.inseamMm, acromionWidthMm: values.acromionWidthMm, crankLengthMm: values.crankLengthMm, currentBarWidthMm: null, currentSaddleHeightMm: null,
  saddleHeightMm: deriveCoordinates(values).saddle.heightAlongTubeMm, currentPains: values.currentPains, ridingStyle: values.ridingStyle,
});
const canyonM: StockSelection = { source: 'seed', bikeId: 'canyon-endurace-cf-8-di2-2024', size: 'M' };
const trek58: StockSelection = { source: 'seed', bikeId: 'trek-domane-sl-6-gen-4-2024', size: '58' };
const everySeedSize = STOCK_BIKE_SPECS.flatMap((bike) => Object.keys(bike.sizes).map((size): StockSelection => ({ source: 'seed', bikeId: bike.id, size })));

describe.each(['en', 'cs'] as Locale[])('saddle-to-bar drop cases (%s)', (locale) => {
  const t = translations[locale];
  const p = t.diagnosticReport.actionPlan;
  const a = t.stockBike.audit;
  const audit = (values: ProfileValues, selection: StockSelection) => buildStockAudit(t, locale, selection, values)!;
  const ids = (values: ProfileValues) => buildActionPlan(t, inputOf(values)).map((step) => step.id);
  const step = (values: ProfileValues, id: string) => buildActionPlan(t, inputOf(values)).find((candidate) => candidate.id === id)!;

  describe('Case A: numb hands (ulnar), endurance', () => {
    const values = rider(['numb_hands']);

    it('should check in the order tilt, handlebar width, reach, drop, and only then the saddle height', () => {
      expect(ids(values).slice(0, 5)).toEqual(['pitch', 'handlebar', 'reach', 'drop', 'saddle']);
      expect(buildFindings(t, inputOf(values))[0].id).toBe('pitch');
    });

    it('should explain the tilt check with the symptom and word the checks as checks', () => {
      expect(step(values, 'pitch').reason).toBe(t.diagnosticReport.reasons.pitchHands);
      expect(buildFindings(t, inputOf(values))[0].reason).toBe(t.diagnosticReport.reasons.pitchHands);
      expect(step(values, 'handlebar').body).toMatch(/380/);
      expect(step(values, 'reach').body).toBe(fill(p.reach, { min: 10, max: 20 }));
    });

    it('should raise the handlebars and move the saddle slightly back only as a check of the drop, and say what is never advised', () => {
      const drop = step(values, 'drop');
      expect(drop.body).toBe(`${fill(p.dropHands, { min: 10, max: 15, backMin: 5, backMax: 10 })} ${p.guardHands}`);
      expect(drop.hasDetail).toBe(false);
    });

    it('should keep the spacers and never lower the handlebars on any bike and size, and never lengthen the stem', () => {
      for (const selection of everySeedSize) {
        const view = audit(values, selection);
        expect(view.spacers.goalMm).toBeGreaterThanOrEqual(view.spacers.nowMm);
        expect(view.reachText).not.toBe(fill(a.reachLonger, { delta: Number(/\d+/.exec(view.reachText)?.[0]) }));
      }
      expect(audit(rider(['numb_hands'], 'balanced'), canyonM).spacers.text).toBe(a.spacerHoldSymptom);
      expect(audit(values, canyonM).spacers.text).toBe(fill(a.spacerAdd, { delta: 5 }));
    });

    it('should never move the saddle forward, on any bike and size', () => {
      for (const selection of everySeedSize) expect(audit(values, selection).saddle.deltaMm).toBeGreaterThanOrEqual(0);
      expect(audit(values, trek58).saddle.text).toBe(a.saddleHoldForward);
      expect(audit(rider([], 'balanced'), trek58).saddle.text).toBe(fill(a.saddleForward, { delta: 7 }));
    });

    it('should keep the cleats 10 to 17 mm behind the 1st metatarsal joint as a check, with the reason of the foot', () => {
      expect(step(values, 'cleat').body).toMatch(/10.*17/);
      expect(step(values, 'cleat').reason).toBe(t.diagnosticReport.reasons.cleat);
    });

    it('should align the handlebar to 380 mm with the numbers of the rider in the reason', () => {
      const wide = { ...inputOf(values), currentBarWidthMm: 420 };
      const handlebar = buildActionPlan(t, wide).find((candidate) => candidate.id === 'handlebar')!;
      expect(handlebar.body).toMatch(/380/);
      expect(handlebar.reason).toBe(fill(t.diagnosticReport.reasons.handlebarWide, { excess: 40, stock: 420, acromion: 380 }));
      expect(handlebar.reason).toMatch(/40/);
    });
  });

  describe('Case B: the same rider without symptoms', () => {
    const values = rider([]);

    it('should not remove spacers on the assumption of a factory default, and ask to verify tilt and width', () => {
      const view = audit(values, canyonM);
      expect(view.spacers).toMatchObject({ text: a.spacerVerify, nowMm: 20, goalMm: 20 });
      expect(a.spacerVerify).toMatch(locale === 'en' ? /tilt.*width/ : /sklon.*šířku/);
    });

    it('should show no position checks of the symptoms, and keep the usual order', () => {
      expect(ids(values)).not.toContain('reach');
      expect(ids(values)).not.toContain('drop');
      expect(ids(values).slice(0, 2)).toEqual(['saddle', 'pitch']);
      expect(buildFindings(t, inputOf(values)).map((finding) => finding.id).slice(0, 2)).toEqual(['saddle', 'pitch']);
      expect(buildFindings(t, inputOf(values))[1].reason).toBe(t.diagnosticReport.reasons.pitch);
    });

    it('should keep an endurance rider from being told to lower the handlebars even with a published spacer height', () => {
      const published: StockSelection = { source: 'community', brand: 'Test', model: 'Bike', year: 2024, size: 'M', spec: { ...STOCK_BIKE_SPECS[0].sizes.M, stockSpacersMm: 40 }, origin: 'owner', confirmations: 0 };
      const view = audit(values, published);
      expect(view.spacers.text).toBe(a.spacerHoldStyle);
      expect(view.spacers.goalMm).toBe(view.spacers.nowMm);
    });

    it('should offer lowering only as an option to try for a balanced rider with a published spacer height', () => {
      const published: StockSelection = { source: 'community', brand: 'Test', model: 'Bike', year: 2024, size: 'M', spec: { ...STOCK_BIKE_SPECS[0].sizes.M, stockSpacersMm: 40 }, origin: 'owner', confirmations: 0 };
      const view = audit(rider([], 'balanced'), published);
      expect(view.spacers.text).toMatch(/\d+ mm/);
      expect(view.spacers.text).not.toBe(a.spacerHoldStyle);
      expect(view.spacers.goalMm).toBeLessThan(view.spacers.nowMm);
      expect(view.spacers.text.startsWith(fill(a.spacerRemove, { delta: 1 }).slice(0, 8))).toBe(false);
    });
  });

  describe('Case C: neck and trapezius pain', () => {
    const values = rider(['neck_pain']);

    it('should shorten the reach, raise the handlebars and verify the width, without the guard of the hands', () => {
      expect(ids(values)).toEqual(expect.arrayContaining(['handlebar', 'reach', 'drop']));
      expect(step(values, 'reach').body).toBe(fill(p.reach, { min: 10, max: 20 }));
      expect(step(values, 'drop').body).toBe(`${fill(p.dropNeck, { min: 10, max: 20 })} ${p.guardLower}`);
      expect(step(values, 'handlebar').body).toMatch(/380/);
      expect(ids(values)[0]).toBe('saddle');
    });

    it('should never lower the handlebars or lengthen the stem on any bike and size', () => {
      for (const selection of everySeedSize) {
        const view = audit(values, selection);
        expect(view.spacers.goalMm).toBeGreaterThanOrEqual(view.spacers.nowMm);
        expect(view.reachText).not.toBe(fill(a.reachLonger, { delta: Number(/\d+/.exec(view.reachText)?.[0]) }));
      }
      expect(audit(rider(['neck_pain'], 'balanced'), canyonM).spacers.text).toBe(a.spacerHoldSymptom);
    });

    it('should still allow the saddle to move forward (only numb hands forbids it)', () => {
      expect(audit(values, trek58).saddle.text).toBe(fill(a.saddleForward, { delta: 7 }));
    });
  });

  describe('lower back strain and several symptoms', () => {
    it('should shorten the reach and raise the handlebars for lower back strain, without a stem rule', () => {
      const values = rider(['lower_back']);
      expect(step(values, 'drop').body).toBe(`${fill(p.dropBack, { min: 10, max: 15 })} ${p.guardLower}`);
      expect(ids(values)).not.toContain('reach');
      expect(audit(rider(['lower_back'], 'balanced'), canyonM).spacers.text).toBe(a.spacerHoldSymptom);
    });

    it('should combine the sentences of several symptoms and use the guard of the hands when they are numb', () => {
      const body = step(rider(['numb_hands', 'neck_pain', 'lower_back']), 'drop').body;
      expect(body).toContain(fill(p.dropNeck, { min: 10, max: 20 }));
      expect(body).toContain(fill(p.dropBack, { min: 10, max: 15 }));
      expect(body.endsWith(p.guardHands)).toBe(true);
    });

    it('should give a knee symptom the reason for the cleat check', () => {
      const finding = buildFindings(t, inputOf(rider(['front_knee']))).find((candidate) => candidate.id === 'cleat')!;
      expect(finding.reason).toBe(t.diagnosticReport.reasons.cleatKnee);
    });
  });
});

const PAIN_SETS: RiderPainType[][] = [[], ['numb_hands'], ['neck_pain'], ['lower_back'], ['front_knee'], ['numb_hands', 'neck_pain', 'lower_back', 'back_knee']];

describe.each(['en', 'cs'] as Locale[])('every recommendation carries a reason (%s)', (locale) => {
  const t = translations[locale];

  it('should give every step of the plan and every finding a non-empty reason, for every set of symptoms and style', () => {
    for (const pains of PAIN_SETS) {
      for (const style of ['endurance', 'balanced', 'race'] as const) {
        const input = inputOf(rider(pains, style));
        for (const item of [...buildActionPlan(t, input), ...buildFindings(t, input)]) {
          expect(item.reason.trim().length).toBeGreaterThan(20);
          expect(item.reason).not.toMatch(/\{\w+\}/);
        }
      }
    }
  });

  it('should give every instruction of the stock bike audit a reason, on every bike and size, for every set of symptoms', () => {
    for (const pains of PAIN_SETS) {
      for (const selection of everySeedSize) {
        const view = buildStockAudit(t, locale, selection, rider(pains, 'balanced'))!;
        for (const reason of [view.saddle.reason, view.spacers.reason, view.reachReason]) {
          expect(reason.trim().length).toBeGreaterThan(20);
          expect(reason).not.toMatch(/\{\w+\}/);
        }
      }
    }
  });

  it('should write a reason that names the rider (numbers or the reported symptom) where the explanation depends on it', () => {
    const wide = { ...inputOf(rider(['numb_hands'])), currentBarWidthMm: 420 };
    expect(buildActionPlan(t, wide).find((step) => step.id === 'handlebar')!.reason).toContain('40');
    expect(buildFindings(t, wide).find((finding) => finding.id === 'handlebar')!.reason).toContain('420');
    expect(buildActionPlan(t, inputOf(rider(['numb_hands', 'neck_pain']))).find((step) => step.id === 'drop')!.reason).toContain(t.diagnosticReport.reasons.dropNeck);
    expect(buildStockAudit(t, locale, canyonM, rider(['numb_hands'], 'balanced'))!.spacers.reason).toBe(t.stockBike.audit.reasons.spacerHoldSymptom);
  });

  it('should give a reason that differs for a different recommendation of the same kind', () => {
    const a = t.stockBike.audit.reasons;
    expect(buildStockAudit(t, locale, trek58, rider([], 'balanced'))!.saddle.reason).toBe(a.saddleForward);
    expect(buildStockAudit(t, locale, trek58, rider(['numb_hands']))!.saddle.reason).toBe(a.saddleHoldForward);
    expect(buildStockAudit(t, locale, canyonM, rider([], 'balanced'))!.spacers.reason).toBe(a.spacerVerify);
  });
});
