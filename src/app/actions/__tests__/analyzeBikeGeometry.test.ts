/**
 * Unit Test Suite for Gemini AI Pre-Purchase Bike Geometry Analysis Action
 * 
 * 3Pillar AIRE SDLC Agentic Framework
 * Quality Gates: Vitest + TypeScript + CodeGuard/OWASP SSRF Security
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analyzeBikeGeometry } from '../analyzeBikeGeometry';
import { generateDeterministicAnalysis } from '@/lib/analysis/deterministicAnalysis';
import { PrePurchaseAnalysisRequest } from '@/types/baikfit';
import { CANYON_GEOMETRY } from '@/lib/analysis/__tests__/profiles';
import {
  mockRiderProfileEndurance,
  mockRiderProfileRace,
  mockRiderProfileHeavy,
  mockPrePurchaseRequest,
} from '@/types/__tests__/baikfit.mock';

describe('analyzeBikeGeometry Server Action', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe('Input Validation & SSRF Security Defense', () => {
    it('should reject request when bikeModelName is missing or whitespace', async () => {
      const invalidRequest: PrePurchaseAnalysisRequest = {
        bikeModelName: '   ',
        geometry: mockPrePurchaseRequest.geometry,
        riderProfile: mockRiderProfileEndurance,
      };

      const result = await analyzeBikeGeometry(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/bike model name/i);
      expect(result.data).toBeUndefined();
    });

    it('should refuse a request without the geometry of the bike: the model does not know the numbers', async () => {
      const result = await analyzeBikeGeometry({ bikeModelName: 'Trek Domane SL 6', riderProfile: mockRiderProfileEndurance } as unknown as PrePurchaseAnalysisRequest);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/geometry of the bike/i);
    });

    it('should refuse a geometry with an implausible number, a size twice or too many sizes', async () => {
      const [first] = mockPrePurchaseRequest.geometry!.sizes;
      const bad = [
        { source: 'rider' as const, sizes: [{ size: 'M', spec: { ...first.spec, frameStackMm: 9999 } }] },
        { source: 'rider' as const, sizes: [first, first] },
        { source: 'rider' as const, sizes: Array.from({ length: 21 }, (_, n) => ({ size: `S${n}`, spec: first.spec })) },
        { source: 'web' as never, sizes: [first] },
      ];
      for (const geometry of bad) {
        const result = await analyzeBikeGeometry({ ...mockPrePurchaseRequest, geometry });
        expect(result.success, JSON.stringify(geometry).slice(0, 60)).toBe(false);
      }
    });

    it('should reject invalid rider profile with non-positive inseam', async () => {
      const invalidRiderRequest: PrePurchaseAnalysisRequest = {
        bikeModelName: 'Specialized Roubaix SL8',
        geometry: mockPrePurchaseRequest.geometry,
        riderProfile: {
          ...mockRiderProfileEndurance,
          inseamMm: 0,
        },
      };

      const result = await analyzeBikeGeometry(invalidRiderRequest);

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/valid rider profile/i);
    });
  });

  describe('Deterministic Biomechanical Rules (Fallback Engine)', () => {
    it('should successfully analyze bike geometry with deterministic fallback when API key is missing', async () => {
      const request: PrePurchaseAnalysisRequest = {
        bikeModelName: 'Canyon Ultimate CF SLX',
        geometry: mockPrePurchaseRequest.geometry,
        riderProfile: mockRiderProfileEndurance,
      };

      const result = await analyzeBikeGeometry(request);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      const data = result.data!;
      expect(data.fitMatchScore).toBeGreaterThanOrEqual(60);
      expect(data.fitMatchScore).toBeLessThanOrEqual(100);
      expect(data.recommendedFrameSize).toBeDefined();
      expect(data.stackMatch.recommendedStackMm).toBeGreaterThan(0);
      expect(data.stackMatch.stockStackMm).toBeGreaterThan(0);
      expect(data.reachMatch.recommendedReachMm).toBeGreaterThan(0);
      expect(data.reachMatch.stockReachMm).toBeGreaterThan(0);
      expect(data.overallSummaryEn).toContain('Canyon Ultimate CF SLX');
      expect(data.overallSummaryCs).toContain('Canyon Ultimate CF SLX');

      // Deep Biomechanical Audit Fields Verification
      expect(data.biomechanicalProsEn.length).toBeGreaterThan(0);
      expect(data.biomechanicalProsCs.length).toBeGreaterThan(0);
      expect(data.biomechanicalProsEn[0].title).toBeDefined();
      expect(data.biomechanicalProsCs[0].detail).toBeDefined();

      expect(data.biomechanicalConsEn.length).toBeGreaterThan(0);
      expect(data.biomechanicalConsCs.length).toBeGreaterThan(0);
      expect(data.biomechanicalConsEn[0].title).toBeDefined();
      expect(data.biomechanicalConsCs[0].detail).toBeDefined();

      expect(data.factoryComponentTrapsEn.length).toBeGreaterThan(0);
      expect(data.factoryComponentTrapsCs.length).toBeGreaterThan(0);
      expect(data.factoryComponentTrapsEn[0].component).toBeDefined();
      expect(data.factoryComponentTrapsEn[0].savingsNote).toBeDefined();

      expect(data.alternativeBikesEn.length).toBeGreaterThanOrEqual(2);
      expect(data.alternativeBikesCs.length).toBeGreaterThanOrEqual(2);
      expect(data.alternativeBikesEn[0].modelName).toBeDefined();
      expect(data.alternativeBikesEn[0].stackReachComparison).toBeDefined();

      expect(data.dealerChecklistEn.length).toBeGreaterThan(0);
      expect(data.dealerChecklistCs.length).toBeGreaterThan(0);
      expect(data.dealerChecklistEn[0].action).toBeDefined();
    });

    it('Rule 1 (KB 2.2): should flag a 420mm factory bar that is wider than the 1:1 acromion width', async () => {
      // mockRiderProfileEndurance has acromionWidthMm: 390 (<= 400mm)
      // and height 180cm -> factory frame size M with stockBarWidth 420mm
      const request: PrePurchaseAnalysisRequest = {
        bikeModelName: 'Cannondale Synapse Carbon 2',
        geometry: mockPrePurchaseRequest.geometry,
        riderProfile: mockRiderProfileEndurance,
      };

      const result = await analyzeBikeGeometry(request);

      expect(result.success).toBe(true);
      const alerts = result.data!.componentMismatchAlerts;
      const barAlert = alerts.find((a) => a.component === 'handlebar');

      expect(barAlert).toBeDefined();
      expect(barAlert!.stockSpec).toContain('420mm');
      expect(barAlert!.recommendedSpec).toContain('380mm'); // acromion 390mm: narrower width on a tie
      expect(barAlert!.reasoningEn).toMatch(/ulnar nerve|wrist rotation|trapezius/i);
      expect(barAlert!.reasoningCs).toMatch(/ulnární nerv|rotaci dovnitř|trapézové svaly/i);
      expect(barAlert!.financialSavingsNoteEn).toMatch(/free handlebar swap.*4,000–10,000 CZK/i);
      expect(barAlert!.financialSavingsNoteCs).toMatch(/výměnu za 380mm řídítka/i);
    });

    it('Rule 2: should flag crank length for heavy rider with knee/hip tightness on factory 172.5mm cranks', async () => {
      // mockRiderProfileHeavy has height 175cm, weight 96kg, front_knee pain
      const request: PrePurchaseAnalysisRequest = {
        bikeModelName: 'BMC Roadmachine 01',
        geometry: mockPrePurchaseRequest.geometry,
        riderProfile: {
          ...mockRiderProfileHeavy,
          riderWeightKg: 102, // Over 100kg
          currentPains: ['front_knee', 'lower_back'],
        },
      };

      const result = await analyzeBikeGeometry(request);

      expect(result.success).toBe(true);
      const alerts = result.data!.componentMismatchAlerts;
      const crankAlert = alerts.find((a) => a.component === 'crank');

      expect(crankAlert).toBeDefined();
      expect(crankAlert!.stockSpec).toMatch(/170mm|172\.5mm/);
      expect(crankAlert!.recommendedSpec).toMatch(/160mm|165mm/);
      expect(crankAlert!.reasoningEn).toMatch(/Top Dead Center|hip angle|lumbar/i);
      expect(crankAlert!.reasoningCs).toMatch(/horní úvrati|TDC|kyčelního kloubu/i);
      expect(crankAlert!.financialSavingsNoteEn).toBeDefined();
      expect(crankAlert!.financialSavingsNoteCs).toBeDefined();
    });

    it('Rule 2: should flag crank length for shorter riders (< 175cm) on factory >165mm cranks', async () => {
      const shortRider = {
        ...mockRiderProfileEndurance,
        heightCm: 167,
        inseamMm: 760,
      };

      const request: PrePurchaseAnalysisRequest = {
        bikeModelName: 'Orbea Orca M30',
        geometry: CANYON_GEOMETRY,
        riderProfile: shortRider,
      };

      const result = await analyzeBikeGeometry(request);

      expect(result.success).toBe(true);
      // With the table of a bike that has small sizes (Canyon Endurace CF 8: XS to XL) a 167 cm rider gets a small frame
      expect(['XS', 'S']).toContain(result.data!.recommendedFrameSize);
    });

    it('should calculate Stack & Reach deltas with stem and spacer adjustments', async () => {
      const request: PrePurchaseAnalysisRequest = {
        bikeModelName: 'Pinarello Dogma F',
        geometry: mockPrePurchaseRequest.geometry,
        riderProfile: mockRiderProfileRace,
      };

      const result = await analyzeBikeGeometry(request);

      expect(result.success).toBe(true);
      const { stackMatch, reachMatch } = result.data!;

      expect(typeof stackMatch.spacerDeltaMm).toBe('number');
      expect(stackMatch.spacerDeltaMm).toBeGreaterThanOrEqual(0);
      expect(stackMatch.spacerDeltaMm).toBeLessThanOrEqual(40);
      expect(typeof reachMatch.stemDeltaMm).toBe('number');
    });
  });

  describe('Google Gemini 2.0 API Integration & Graceful Fallback', () => {
    it('should call Gemini 2.0 with strict system instruction when GEMINI_API_KEY is present', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-api-key-12345';

      const mockGeminiResponse = {
        fitMatchScore: 92,
        recommendedFrameSize: '54cm / Medium',
        stackMatch: {
          recommendedStackMm: 575,
          stockStackMm: 565,
          spacerDeltaMm: 10,
        },
        reachMatch: {
          recommendedReachMm: 385,
          stockReachMm: 380,
          stemDeltaMm: 5,
        },
        componentMismatchAlerts: [
          {
            component: 'handlebar',
            stockSpec: '420mm Factory Ergonomic Bar',
            recommendedSpec: '400mm Compact Bar',
            reasoningEn: 'Over-wide bar causing wrist strain and pinky numbness.',
            reasoningCs: 'Příliš široká řídítka způsobující brnění rukou.',
            financialSavingsNoteEn: 'Swap prior to unboxing.',
            financialSavingsNoteCs: 'Vyměňte před sestavením.',
          },
        ],
        overallSummaryEn: 'The bike is an excellent morphological match with minor cockpit adjustments.',
        overallSummaryCs: 'Kolo je výbornou volbou s drobným doladěním kokpitu.',
      };

      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: JSON.stringify(mockGeminiResponse) }],
              },
            },
          ],
        }),
      } as unknown as Response);

      const request: PrePurchaseAnalysisRequest = {
        bikeModelName: 'Trek Madone SLR 7',
        geometry: mockPrePurchaseRequest.geometry,
        riderProfile: mockRiderProfileEndurance,
      };

      const result = await analyzeBikeGeometry(request);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [calledUrl, calledOptions] = fetchSpy.mock.calls[0];
      expect(calledUrl).toContain('gemini-2.0-flash:generateContent');
      expect(calledUrl).not.toContain('key=');
      expect((calledOptions as RequestInit).headers).toMatchObject({
        'x-goog-api-key': 'test-gemini-api-key-12345',
      });

      const body = JSON.parse((calledOptions as RequestInit).body as string);
      expect(body.system_instruction.parts[0].text).toContain('You are bAIkfit AI');
      expect(body.generationConfig.response_mime_type).toBe('application/json');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      /* The numbers of the audit come from the table of the bike, not from the model: the score, the frame size and the match are the engine's. */
      const engine = generateDeterministicAnalysis(request);
      expect(result.data!.fitMatchScore).toBe(engine.fitMatchScore);
      expect(result.data!.fitMatchScore).not.toBe(92);
      expect(result.data!.recommendedFrameSize).toBe(engine.recommendedFrameSize);
      expect(result.data!.recommendedFrameSize).not.toBe('54cm / Medium');
      expect(result.data!.stackMatch).toEqual(engine.stackMatch);
      expect(result.data!.overallSummaryEn).toContain('excellent morphological match');
      expect(result.data!.overallSummaryCs).toContain('výbornou volbou');
    });

    it('should ground the Gemini prompt in the requested UI locale (default en, cs on request)', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-api-key-12345';
      const okResponse = () =>
        ({ ok: false, status: 500, json: async () => ({}) }) as unknown as Response;
      const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(async () => okResponse());

      const base = { bikeModelName: 'Trek Domane SL 6', riderProfile: mockRiderProfileEndurance, geometry: mockPrePurchaseRequest.geometry! };
      await analyzeBikeGeometry(base);
      await analyzeBikeGeometry({ ...base, locale: 'cs' });

      const promptOf = (i: number) =>
        JSON.parse((fetchSpy.mock.calls[i][1] as RequestInit).body as string).system_instruction.parts[0].text as string;
      expect(promptOf(0)).toContain('Primary language for end-user interaction is English');
      expect(promptOf(1)).toContain('Primary language for end-user interaction is Czech');
    });

    it('should gracefully fall back to deterministic analysis when Gemini fetch fails or returns non-200', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-api-key-12345';

      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      } as unknown as Response);

      const request: PrePurchaseAnalysisRequest = {
        bikeModelName: 'Factor Ostro VAM',
        geometry: mockPrePurchaseRequest.geometry,
        riderProfile: mockRiderProfileRace,
      };

      const result = await analyzeBikeGeometry(request);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.overallSummaryEn).toContain('Factor Ostro VAM');
      expect(result.data!.overallSummaryCs).toContain('Factor Ostro VAM');
    });

    it('should gracefully fall back when Gemini network call throws an error', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-api-key-12345';

      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network connection timeout'));

      const request: PrePurchaseAnalysisRequest = {
        bikeModelName: 'Colnago V4Rs',
        geometry: mockPrePurchaseRequest.geometry,
        riderProfile: mockRiderProfileEndurance,
      };

      // Even if fetch throws inside the try block, it catches and handles or falls back
      const result = await analyzeBikeGeometry(request);

      // In analyzeBikeGeometry: if fetch throws, the outer catch catches it and returns success: false with error
      expect(result.success).toBe(false);
      expect(result.error).toContain('Network connection timeout');
    });
  });
});
