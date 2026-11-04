import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { translations, type Locale } from '@/lib/i18n/translations';

const kb = readFileSync('docs/knowledge/baikfit_kb_v1.5.0.md', 'utf8');
const old = readFileSync('docs/knowledge/baikfit_kb_v1.4.0.md', 'utf8');
const headings = (text: string) => [...text.matchAll(/^## (\d+)\./gm)].map((m) => Number(m[1]));

describe('the bAIkfit knowledge base v1.5.0', () => {
  it('should keep every section of v1.4.0 (1 to 11) and add the twelfth, the levers and the pitch', () => {
    expect(headings(old)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(headings(kb)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    for (const part of ['2.1 Inseam Height', '2.4 Current Bike Setup', '11.3 Dropper post', '8.3 Direction of the correction', 'Reasoning in the Report']) expect(kb).toContain(part);
  });

  it('should call KOPS a myth and describe the Balance Test with its steps, its limit and its checks', () => {
    expect(kb).toMatch(/KOPS is a myth/);
    expect(kb).toMatch(/Balance Test/);
    expect(kb).toMatch(/6 to 7 out of 10/);
    expect(kb).toMatch(/5 mm steps/);
    expect(kb).toMatch(/at most \*\*15 mm/);
    expect(kb).toMatch(/one third of the shift/);
  });

  it('should keep the guards: never forward for numb hands, never rearward with posterior knee pain, the joints first', () => {
    expect(kb).toMatch(/never moved forward for a rider who reports numb hands/);
    expect(kb).toMatch(/never moved rearward\*\* for a rider who reports \*\*posterior knee pain/);
    expect(kb).toMatch(/8\.5 Priority of the rules: the joints first/);
    expect(kb).toMatch(/Posterior knee pain\*\* \(back of the knee, hamstring\) beats numb hands/);
  });

  it('should state the crank compensation with its reference crank, the levers, the pitch and the LLD as a referral without numbers for the app', () => {
    expect(kb).toMatch(/raised by the same X mm/);
    expect(kb).toMatch(/7\.5 mm/);
    expect(kb).toMatch(/The app applies it \(stage \(c\), 2026-11-04\)/);
    expect(kb).toMatch(/\*\*172\.5 mm\*\*/);
    expect(kb).toMatch(/\[owner baseline\]/);
    expect(kb).toMatch(/symmetric \[owner, 2026-11-04\]/);
    expect(kb).toMatch(/inward by 8° to 15°/);
    expect(kb).toMatch(/shorter by up to 20 mm/);
    expect(kb).toMatch(/sends the rider to a physiotherapist/);
    expect(kb).toMatch(/gives no number, no calculation/);
  });

  it('should mark the numbers of the owner as unchecked and keep the draft in the archive', () => {
    expect(kb).toMatch(/\*\*\[owner\]\*\*/);
    expect(existsSync('docs/knowledge/archive/baikfit_kb_v1.5.0_draft.md')).toBe(true);
  });

  it('should be the file the app loads, with its version, now that the rules of the stages (b) to (d) are in the code', () => {
    const loader = readFileSync('src/lib/kbLoader.ts', 'utf8');
    expect(loader).toContain('baikfit_kb_v1.5.0.md');
    expect(loader).not.toContain('baikfit_kb_v1.4.0.md');
    expect(readFileSync('src/lib/engines/baikfit/kbRules.ts', 'utf8')).toContain("KB_VERSION = '1.5.0'");
  });
});

describe.each(['en', 'cs'] as Locale[])('the texts of the Balance Test and the levers (%s)', (locale) => {
  const items = translations[locale].diagnosis.items;
  const ulnar = `${items.ulnar.fixes.join(' ')} ${items.ulnar.balanceTest}`;

  it('should give the numb hands the levers and the Balance Test with 5 mm steps and the 15 mm limit, the Balance Test apart so that it can be left out for the back of the knee', () => {
    expect(ulnar).toMatch(/8°/);
    expect(ulnar).toMatch(/15°/);
    expect(ulnar).toMatch(/20 mm/);
    expect(ulnar).toMatch(/6 (to|až) 7/);
    expect(ulnar).toMatch(/5 mm/);
    expect(ulnar).toMatch(/15 mm/);
    expect(items.ulnar.fixes.join(' ')).not.toMatch(/Balance|rovnováh/);
    expect(ulnar).toMatch(locale === 'en' ? /bike fitter/ : /fitter/);
  });

  it('should never tell a rider with numb hands to move the saddle forward', () => {
    expect(ulnar).not.toMatch(locale === 'en' ? /forward\./i : /dopředu\./i);
    expect(items.median.fixes.join(' ')).not.toMatch(/Balance|rovnováh/);
  });

  it('should give the neck pain the levers too', () => {
    expect(items.neck.fixes.join(' ')).toMatch(/8°/);
  });
});
