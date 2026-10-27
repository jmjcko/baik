import { describe, it, expect } from 'vitest';
import { translations } from '@/lib/i18n/translations';
import { CATEGORY_PARAMETERS, FINDER_CATEGORIES, PARAMETER_OPTIONS, categoryOf, cleanText, kindOf, sanitizeAnswers } from '../parameters';

describe('the questions of the finder', () => {
  it.each(FINDER_CATEGORIES)('should ask between 8 and 12 questions for %s, each one once, ending with the brands', (category) => {
    const ids = CATEGORY_PARAMETERS[category];
    expect(ids.length).toBeGreaterThanOrEqual(8);
    expect(ids.length).toBeLessThanOrEqual(12);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.slice(-2)).toEqual(['brands_preferred', 'brands_excluded']);
  });

  it('should never ask what the rider profile already holds', () => {
    const all = FINDER_CATEGORIES.flatMap((category) => CATEGORY_PARAMETERS[category]);
    for (const banned of ['height', 'inseam', 'shoulders', 'discipline', 'riding_style', 'pains']) expect(all).not.toContain(banned);
  });

  it.each(['en', 'cs'] as const)('should have a name, a reason and a word for every option in %s', (locale) => {
    const texts = translations[locale].finder.parameters;
    for (const [id, options] of Object.entries(PARAMETER_OPTIONS)) {
      const entry = texts[id as keyof typeof texts];
      expect(entry.name.length, id).toBeGreaterThan(2);
      expect(entry.why.length, id).toBeGreaterThan(10);
      expect(Object.keys(entry.options).sort(), id).toEqual([...options].sort());
      for (const word of Object.values(entry.options)) expect(word, id).not.toBe('');
    }
  });

  it('should write no emoji in the questions', () => {
    const emoji = /\p{Extended_Pictographic}/u;
    expect(emoji.test(JSON.stringify(translations.en.finder))).toBe(false);
    expect(emoji.test(JSON.stringify(translations.cs.finder))).toBe(false);
  });

  it('should know the kind of a question and map a discipline to a kind', () => {
    expect([kindOf('shifting'), kindOf('mounts'), kindOf('colour')]).toEqual(['single', 'multi', 'text']);
    expect([categoryOf('road'), categoryOf('gravel'), categoryOf('xc_mtb'), categoryOf(undefined)]).toEqual(['road', 'gravel', 'mtb', 'road']);
  });
});

describe('sanitizeAnswers', () => {
  it('should keep known options, one for a single question and several for a multiple one', () => {
    expect(sanitizeAnswers('road', { shifting: ['electronic', 'mechanical'], mounts: ['bags', 'rack', 'bags'] })).toEqual({ shifting: ['electronic'], mounts: ['bags', 'rack'] });
  });

  it('should drop an unknown option, a question of another kind of bike and a value of the wrong type', () => {
    expect(sanitizeAnswers('road', { shifting: ['telepathic'], suspension: ['full'], budget: 'mid', brakes: [3] })).toEqual({});
  });

  it('should clean a free text: one line, no markup characters, bounded', () => {
    const answers = sanitizeAnswers('mtb', { colour: ['  blue\n<script>alert(1)</script>`x` '], brands_excluded: ['a'.repeat(500)] });
    expect(answers.colour?.[0]).not.toMatch(/[<>`\n]/);
    expect(answers.brands_excluded?.[0]).toHaveLength(120);
  });

  it('should accept anything as the input without throwing', () => {
    for (const raw of [null, undefined, 5, 'x', [], { shifting: null }]) expect(sanitizeAnswers('gravel', raw)).toEqual({});
    expect(cleanText(42)).toBe('');
  });
});
