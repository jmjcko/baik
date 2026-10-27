import { describe, it, expect, vi } from 'vitest';
import type { PrePurchaseAnalysisRequest, RiderProfile } from '@/types/baikfit';
import { applyBiomechanicalRules } from '../biomechanicalRules';
import { generateDeterministicAnalysis } from '../deterministicAnalysis';
import { buildSystemInstruction, buildUserPrompt, mergeWithGuardrails, requestGeminiAnalysis } from '../geminiClient';
import { flatBarAlert, flatBarTarget, isMtbAudit } from '../mtbPrePurchase';
import { CANYON_GEOMETRY } from './profiles';

const rider = (over: Partial<RiderProfile> = {}): RiderProfile => ({
  inseamMm: 840, heightCm: 178, torsoLengthMm: 620, armLengthMm: 620, acromionWidthMm: 420, riderWeightKg: 75, flexibilityScore: 'moderate', ridingStyle: 'balanced', currentPains: [], ...over,
});
const request = (over: Partial<RiderProfile> = {}): PrePurchaseAnalysisRequest => ({ bikeModelName: 'Trek Fuel EX 8', riderProfile: rider(over), locale: 'en', geometry: NO_BAR_GEOMETRY });
const mtb = { bikeKind: 'xc_mtb' as const };
/** A table that does not state the factory handlebar (the case of most mountain bikes): no rule is raised about it. */
const NO_BAR_GEOMETRY = { ...CANYON_GEOMETRY, sizes: CANYON_GEOMETRY.sizes.map((row) => ({ size: row.size, spec: { ...row.spec, stockHandlebarMm: null } })) };

describe('the flat bar target of the audit (KB 11.2)', () => {
  it('should be the acromion plus 320 mm for XC and plus 360 mm for Trail, inside the range of the style', () => {
    expect(flatBarTarget(rider({ ...mtb }))).toMatchObject({ targetMm: 740, offsetMm: 320, min: 720, max: 760 });
    expect(flatBarTarget(rider({ ...mtb, mtbStyle: 'trail' }))).toMatchObject({ targetMm: 780, offsetMm: 360, min: 760, max: 800 });
    expect(flatBarTarget(rider({ ...mtb, acromionWidthMm: 380 })).targetMm).toBe(720);
  });

  it('should recognise a mountain bike audit only for the MTB kind', () => {
    expect(isMtbAudit(rider(mtb))).toBe(true);
    expect([undefined, 'road', 'gravel'].map((bikeKind) => isMtbAudit(rider({ bikeKind: bikeKind as RiderProfile['bikeKind'] })))).toEqual([false, false, false]);
  });
});

describe('the handlebar alert of a mountain bike', () => {
  it('should not call a 760 mm flat bar too wide, which the drop bar rule of a 420 mm shoulder would do', () => {
    expect(applyBiomechanicalRules(rider(), 760).map((alert) => alert.component)).toContain('handlebar');
    expect(applyBiomechanicalRules(rider(mtb), 760).map((alert) => alert.component)).not.toContain('handlebar');
  });

  it('should flag a bar more than 20 mm wider or narrower than the target, with the stem tip, and a bar above 800 mm', () => {
    const wide = flatBarAlert(rider(mtb), 800)!;
    expect(wide.recommendedSpec).toBe('740mm Flat Bar');
    expect(wide.reasoningEn).toContain('35–50mm');
    expect(wide.reasoningEn).toContain('10mm shorter for every 20mm');
    expect(wide.reasoningCs).toContain('35–50 mm');
    expect(flatBarAlert(rider(mtb), 700)?.reasoningEn).toContain('narrower');
    expect(flatBarAlert(rider({ ...mtb, mtbStyle: 'trail' }), 810)?.reasoningEn).toContain('wider');
    expect(flatBarAlert(rider(mtb), 750)).toBeNull();
  });

  it('should give no handlebar alert when the stock bar is unknown', () => {
    expect(flatBarAlert(rider(mtb), null)).toBeNull();
    expect(applyBiomechanicalRules(rider(mtb), null).map((alert) => alert.component)).not.toContain('handlebar');
  });
});

describe('the deterministic audit of a mountain bike', () => {
  const road = generateDeterministicAnalysis(request());
  const flat = generateDeterministicAnalysis(request(mtb));

  it('should keep the drop bar trap and checklist for a road bike', () => {
    expect(road.factoryComponentTrapsEn[0].component).toBe('Handlebar / Cockpit Width');
    expect(road.dealerChecklistEn[0].action).toContain('Handlebar Width Swap');
  });

  it('should list the flat bar target and the stem range instead, in English and Czech, and no road bar alert', () => {
    expect(flat.factoryComponentTrapsEn[0]).toMatchObject({ component: 'Flat Bar / Cockpit Width', recommendedSpec: '740mm flat bar, 35–50mm stem' });
    expect(flat.factoryComponentTrapsCs[0].recommendedSpec).toContain('740 mm');
    expect(flat.dealerChecklistEn[0].detail).toContain('740mm flat bar');
    expect(flat.dealerChecklistCs[0].detail).toContain('35–50 mm');
    expect(flat.componentMismatchAlerts.map((alert) => alert.component)).not.toContain('handlebar');
    expect(JSON.stringify(flat.factoryComponentTrapsEn)).not.toContain('acromion shoulder width (420mm)');
  });
});

describe('the prompt of a mountain bike', () => {
  it('should name the kind of bike in the rider lines', () => {
    expect(buildUserPrompt(request(mtb))).toContain('Kind of bike: mountain bike (XC), flat handlebar');
    expect(buildUserPrompt(request({ ...mtb, mtbStyle: 'trail' }))).toContain('Trail');
    expect(buildUserPrompt(request())).toContain('Kind of bike: road bike, drop handlebar');
    expect(buildUserPrompt(request({ bikeKind: 'gravel' }))).toContain('gravel bike, drop handlebar');
  });

  it('should tell the AI the flat bar rules and not to use the drop bar rules, for a mountain bike only', () => {
    const flat = buildSystemInstruction('en', rider(mtb));
    expect(flat).toContain('FLAT handlebar');
    expect(flat).toContain('acromion width + 320 mm = 740 mm');
    expect(flat).toContain('35–50 mm');
    expect(flat).toContain('Do NOT apply the drop bar rules');
    expect(buildSystemInstruction('en', rider())).not.toContain('FLAT handlebar');
    expect(buildSystemInstruction('cs')).not.toContain('FLAT handlebar');
  });

  it('should send the rules in the request to Gemini and never add a factory bar of its own to a mountain bike answer', async () => {
    const fetchMock = vi.fn(async (_url: unknown, init?: RequestInit) => ({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify({ componentMismatchAlerts: [] }) }] } }] }), init }) as unknown as Response);
    vi.stubGlobal('fetch', fetchMock);
    const result = await requestGeminiAnalysis('key', request(mtb));
    vi.unstubAllGlobals();
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body)).system_instruction.parts[0].text).toContain('FLAT handlebar');
    expect(result?.componentMismatchAlerts.map((alert) => alert.component)).not.toContain('handlebar');
  });

  it('should keep the guard of the cranks for a road bike and a mountain bike alike when the AI answer has no alert', () => {
    for (const kind of [{}, mtb]) {
      const merged = mergeWithGuardrails({ componentMismatchAlerts: [] } as never, request({ ...kind, riderWeightKg: 110 }));
      expect(merged.componentMismatchAlerts.map((alert) => alert.component)).toEqual(['crank']);
    }
  });
});
