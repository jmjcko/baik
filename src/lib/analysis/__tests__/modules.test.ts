import { describe, it, expect, vi, afterEach } from 'vitest';
import { applyBiomechanicalRules } from '../biomechanicalRules';
import { validateAnalysisRequest } from '../requestValidation';
import { computeFitTargets, estimateStockFrame } from '../stockFrame';
import { buildSystemInstruction, buildUserPrompt, mergeWithGuardrails, requestGeminiAnalysis } from '../geminiClient';
import { generateDeterministicAnalysis } from '../deterministicAnalysis';
import { PROFILE_MATRIX, requestFor } from './profiles';

const baseline = PROFILE_MATRIX.baseline;

describe('applyBiomechanicalRules (KB 2.2, 5 and 7)', () => {
  it('should flag a 420mm bar for a 400mm acromion and recommend 400mm', () => {
    const alerts = applyBiomechanicalRules({ ...baseline, acromionWidthMm: 400 }, 420, 165);
    expect(alerts.map((a) => a.component)).toEqual(['handlebar']);
    expect(alerts[0].recommendedSpec).toContain('400mm');
  });

  it('should recommend the nearest commercial width, narrower on a tie', () => {
    const at = (acromionWidthMm: number) =>
      applyBiomechanicalRules({ ...baseline, acromionWidthMm }, 460, 165)[0].recommendedSpec;
    expect(at(380)).toContain('380mm');
    expect(at(390)).toContain('380mm');
    expect(at(399)).toContain('400mm');
    expect(at(430)).toContain('420mm');
  });

  it('should not flag a bar that is equal to or narrower than the recommendation', () => {
    expect(applyBiomechanicalRules({ ...baseline, acromionWidthMm: 420 }, 420, 165)).toEqual([]);
    expect(applyBiomechanicalRules({ ...baseline, acromionWidthMm: 390 }, 380, 165)).toEqual([]);
  });

  it('should flag 172.5mm cranks only for limited flexibility or high body mass', () => {
    const heavy = applyBiomechanicalRules({ ...baseline, riderWeightKg: 100 }, 400, 172.5);
    const stiff = applyBiomechanicalRules({ ...baseline, flexibilityScore: 'inflexible' }, 400, 172.5);
    expect(heavy.map((a) => a.component)).toEqual(['crank']);
    expect(stiff.map((a) => a.component)).toEqual(['crank']);
    expect(applyBiomechanicalRules(baseline, 400, 172.5)).toEqual([]);
    expect(applyBiomechanicalRules({ ...baseline, riderWeightKg: 100 }, 400, 165)).toEqual([]);
  });

  it('should recommend the KB crank range 160-165mm regardless of rider height', () => {
    for (const heightCm of [160, 178, 195]) {
      const alerts = applyBiomechanicalRules({ ...baseline, heightCm, riderWeightKg: 110 }, 400, 172.5);
      expect(alerts[0].recommendedSpec).toContain('160–165mm');
    }
  });
});

describe('validateAnalysisRequest', () => {
  it('should accept a complete request', () => {
    expect(validateAnalysisRequest(requestFor('baseline'))).toBeNull();
  });

  it('should reject blank bike names, forbidden URLs and non-positive inseam', () => {
    expect(validateAnalysisRequest({ ...requestFor('baseline'), bikeModelName: '  ' })).toMatch(/bike model/i);
    expect(validateAnalysisRequest({ ...requestFor('baseline'), shopUrl: 'http://localhost/x' })).toMatch(/forbidden url/i);
    expect(
      validateAnalysisRequest({ ...requestFor('baseline'), riderProfile: { ...baseline, inseamMm: 0 } })
    ).toMatch(/rider profile/i);
  });
});

describe('stock frame and fit targets', () => {
  it.each([[160, 'XS'], [170, 'S'], [180, 'M'], [190, 'L']])('should pick the frame for %icm', (height, prefix) => {
    expect(estimateStockFrame(height).size.startsWith(prefix)).toBe(true);
  });

  it('should clamp spacers to 0-40mm and the score to 60-98', () => {
    const frame = estimateStockFrame(178);
    const high = computeFitTargets({ ...baseline, inseamMm: 1000 }, frame);
    const low = computeFitTargets({ ...baseline, inseamMm: 500 }, frame);
    expect(high.spacerDeltaMm).toBe(40);
    expect(low.spacerDeltaMm).toBe(0);
    expect(high.fitMatchScore).toBeLessThanOrEqual(98);
    expect(low.fitMatchScore).toBeGreaterThanOrEqual(60);
  });
});

describe('gemini client helpers', () => {
  afterEach(() => vi.restoreAllMocks());

  it('should ground the system instruction in the requested locale', () => {
    expect(buildSystemInstruction('cs')).toContain('Czech');
    expect(buildSystemInstruction('en')).toContain('Output STRICT JSON');
  });

  it('should include the shop URL and the rider data in the user prompt', () => {
    const prompt = buildUserPrompt({ ...requestFor('narrow'), shopUrl: 'https://example.com/bike' });
    expect(prompt).toContain('https://example.com/bike');
    expect(prompt).toContain('numb_hands');
  });

  it('should fall back to deterministic lists when the model omits them', () => {
    const input = requestFor('narrow');
    const parsed = { ...generateDeterministicAnalysis(input), dealerChecklistEn: [] };
    expect(mergeWithGuardrails(parsed, input).dealerChecklistEn.length).toBe(4);
  });

  it('should add the crank guardrail when the model reported only a handlebar mismatch', () => {
    const input = requestFor('heavy');
    const handlebarOnly = applyBiomechanicalRules(input.riderProfile, 420, 165);
    const parsed = { ...generateDeterministicAnalysis(input), componentMismatchAlerts: handlebarOnly };
    const components = mergeWithGuardrails(parsed, input).componentMismatchAlerts.map((a) => a.component);
    expect(components).toEqual(['handlebar', 'crank']);
  });

  it('should list the current setup in the user prompt only when it was entered', () => {
    const base = requestFor('baseline');
    expect(buildUserPrompt(base)).not.toContain('Current setup');
    const withSetup = {
      ...base,
      riderProfile: { ...base.riderProfile, currentCrankLengthMm: 172.5, currentSaddleHeightMm: 742, currentBarWidthMm: 420 },
    };
    const prompt = buildUserPrompt(withSetup);
    expect(prompt).toContain('Current crank length: 172.5 mm');
    expect(prompt).toContain('Current saddle height: 742 mm');
    expect(prompt).toContain('Current handlebar width: 420 mm');
  });

  it('should return null when Gemini answers without usable content', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({ ok: true, json: async () => ({ candidates: [] }) } as Response);
    expect(await requestGeminiAnalysis('key', requestFor('baseline'))).toBeNull();
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({ ok: false } as Response);
    expect(await requestGeminiAnalysis('key', requestFor('baseline'))).toBeNull();
  });
});
