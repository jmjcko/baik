import { describe, it, expect } from 'vitest';
import { loadKnowledgeBase } from '@/lib/kbLoader';
import { translations } from '@/lib/i18n/translations';
import { RIDER_PAIN_TYPES } from '@/types/baikfit';
import { KB_RULES } from '../kbRules';
import { DIAGNOSIS_IDS, diagnoseSymptoms } from '../diagnostics';

const range = (r: { min: number; max: number }) => `${r.min}–${r.max} mm`;

describe('diagnoseSymptoms (KB 6 decision tree)', () => {
  it('should return nothing without symptoms', () => {
    expect(diagnoseSymptoms([])).toEqual([]);
  });

  it('should map hand numbness to both the ulnar and the median nerve rows', () => {
    expect(diagnoseSymptoms(['numb_hands'])).toEqual(['ulnar', 'median']);
  });

  it.each([
    ['front_knee', ['anteriorKnee']],
    ['back_knee', ['posteriorKnee']],
    ['lower_back', ['lowerBack']],
    ['neck_pain', ['neck']],
    ['saddle_sores', ['saddlePressure']],
  ] as const)('should map %s to %j', (pain, expected) => {
    expect(diagnoseSymptoms([pain])).toEqual(expected);
  });

  it('should keep a stable order independent of the selection order and ignore duplicates', () => {
    const a = diagnoseSymptoms(['neck_pain', 'front_knee', 'front_knee', 'numb_hands']);
    const b = diagnoseSymptoms(['numb_hands', 'front_knee', 'neck_pain']);
    expect(a).toEqual(b);
    expect(a).toEqual(['ulnar', 'median', 'anteriorKnee', 'neck']);
  });

  it('should cover every rider pain type', () => {
    const covered = RIDER_PAIN_TYPES.flatMap((pain) => diagnoseSymptoms([pain]));
    expect(new Set(covered)).toEqual(new Set(DIAGNOSIS_IDS));
  });
});

describe('diagnosis texts quote the knowledge base', () => {
  const kb = loadKnowledgeBase('baikfit');

  it.each(['en', 'cs'] as const)('should provide root cause and fixes for every diagnosis (%s)', (locale) => {
    const items = translations[locale].diagnosis.items;
    for (const id of DIAGNOSIS_IDS) {
      expect(items[id].title.length, id).toBeGreaterThan(3);
      expect(items[id].rootCause.length, id).toBeGreaterThan(10);
      expect(items[id].fixes.length, id).toBeGreaterThan(0);
    }
  });

  it.each(['en', 'cs'] as const)('should use the KB numbers in the fix texts (%s)', (locale) => {
    const items = translations[locale].diagnosis.items;
    const text = (id: (typeof DIAGNOSIS_IDS)[number]) => items[id].fixes.join(' ');
    expect(text('anteriorKnee')).toContain(range(KB_RULES.saddleRaiseStepMm));
    expect(text('posteriorKnee')).toContain(range(KB_RULES.saddleLowerStepMm));
    expect(text('neck')).toContain(range(KB_RULES.stemShortenMm));
    expect(text('saddlePressure')).toContain(`${KB_RULES.saddleMaxWidthMm} mm`);
  });

  it('should be grounded in the KB decision tree rows', () => {
    for (const phrase of ['Ulnar Nerve', 'Median Nerve', 'Anterior Knee Pain', 'Posterior Knee Pain', 'Lower Back Strain', 'Neck & Trapezius Pain']) {
      expect(kb).toContain(phrase);
    }
  });
});
