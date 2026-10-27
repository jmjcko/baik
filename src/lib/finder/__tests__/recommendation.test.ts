import { describe, it, expect, vi } from 'vitest';
import { excludedBrands } from '../candidates';
import { parseRecommendation, requestRecommendation } from '../recommendation';
import type { RecommendRequest } from '../types';

const bike = (over: Record<string, unknown> = {}) => ({ brand: 'Canyon', model: 'Endurace CF 8', year: 2025, reason: 'Comfortable and electronic shifting.', ...over });
const answer = (...bikes: unknown[]) => JSON.stringify({ bikes });
const body = (text: string) => ({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }) }) as unknown as Response;
const request: RecommendRequest = {
  category: 'road', locale: 'en', answers: { brands_excluded: ['Giant'] },
  rider: { heightCm: 178, inseamMm: 840, torsoLengthMm: 620, armLengthMm: 640, acromionWidthMm: 400, riderWeightKg: 75, ridingStyle: 'balanced', flexibilityScore: 'moderate', currentPains: [] },
};
const noPause = async () => {};

describe('parseRecommendation', () => {
  it('should read the bikes of a plain answer, also in a fence or in a sentence', () => {
    expect(parseRecommendation(answer(bike()), {})).toEqual([bike()]);
    expect(parseRecommendation(`\`\`\`json\n${answer(bike())}\n\`\`\``, {})).toHaveLength(1);
    expect(parseRecommendation(`Here you are: ${answer(bike())} Enjoy.`, {})).toHaveLength(1);
  });

  it('should keep at most three bikes', () => {
    const many = [1, 2, 3, 4, 5].map((n) => bike({ model: `Model ${n}` }));
    expect(parseRecommendation(answer(...many), {})?.map((b) => b.model)).toEqual(['Model 1', 'Model 2', 'Model 3']);
  });

  it('should drop a bike with a motor, named in the model or in the reason', () => {
    const kept = parseRecommendation(answer(bike({ model: 'Endurace:ON' , reason: 'An e-bike with a Bosch motor.' }), bike({ brand: 'Trek', model: 'Domane SL 6' }), bike({ brand: 'Specialized', model: 'Turbo Creo 2' })), {});
    expect(kept?.map((b) => b.brand)).toEqual(['Trek']);
  });

  it('should drop an excluded brand (also inside a longer name), a model twice and an entry without a brand, model or reason', () => {
    expect(excludedBrands({ brands_excluded: ['Giant, Liv; x'] })).toEqual(['giant', 'liv']);
    const kept = parseRecommendation(answer(bike({ brand: 'Giant Bicycles' }), bike(), bike(), bike({ brand: '' }), bike({ model: 'Other', reason: '' }), 'text', null), { brands_excluded: ['Giant'] });
    expect(kept).toHaveLength(1);
  });

  it('should keep the year as null when it is not a plausible year, and clean the text', () => {
    const [candidate] = parseRecommendation(answer(bike({ year: 'new', reason: '<b>Great</b>\nfit `now`' })), {}) ?? [];
    expect(candidate.year).toBeNull();
    expect(candidate.reason).not.toMatch(/[<>`\n]/);
  });

  it.each([['no JSON', 'sorry'], ['no bikes field', '{"error": "x"}'], ['an empty list', answer()], ['bikes that are all unusable', answer({}, 3)]])('should return null for %s', (_name, text) => {
    expect(parseRecommendation(text, {})).toBeNull();
  });
});

describe('requestRecommendation', () => {
  it('should send the system prompt and the answers and return the candidates', async () => {
    const send = vi.fn().mockResolvedValue(body(answer(bike())));
    const outcome = await requestRecommendation('key', request, send as unknown as typeof fetch, noPause);
    expect(outcome).toEqual({ status: 'ok', candidates: [bike()] });
    const [, options] = send.mock.calls[0];
    expect(options.headers['x-goog-api-key']).toBe('key');
    expect(JSON.parse(options.body).system_instruction.parts[0].text).toContain('DOMAIN KNOWLEDGE BASE');
    expect(JSON.parse(options.body).tools).toBeUndefined();
  });

  it('should say "unavailable" when the service is down and "unreadable" when the answer cannot be used', async () => {
    const down = vi.fn().mockResolvedValue({ ok: false, status: 400, json: async () => ({}) });
    expect(await requestRecommendation('key', request, down as unknown as typeof fetch, noPause)).toEqual({ status: 'unavailable' });
    const odd = vi.fn().mockResolvedValue(body('I cannot help.'));
    expect(await requestRecommendation('key', request, odd as unknown as typeof fetch, noPause)).toEqual({ status: 'unreadable' });
  });

  it('should try again while the service is busy', async () => {
    const send = vi.fn().mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({}) }).mockResolvedValueOnce(body(answer(bike())));
    expect((await requestRecommendation('key', request, send as unknown as typeof fetch, noPause)).status).toBe('ok');
    expect(send).toHaveBeenCalledTimes(2);
  });
});
