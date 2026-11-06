import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CHIP_OFF, FIELD, FIELD_AREA, FIELD_FIT, FIELD_LG, FIELD_SM } from '../primitives/fieldStyles';

const ROOT = 'src/components';
const files = (dir: string): string[] => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  if (statSync(path).isDirectory()) return name === '__tests__' ? [] : files(path);
  return path.endsWith('.tsx') ? [path] : [];
});
const sources = files(ROOT).map((path) => ({ path, text: readFileSync(path, 'utf8') }));

/** Fields with their own shape (a round search, a number with a unit, a table cell); they still use the field tokens. */
const OWN_SHAPE = ['edu/EduView.tsx', 'wizard/custom/NumberField.tsx', 'admin/SizesTable.tsx'];
const NOT_TEXT = /type="?(checkbox|radio|file|range|hidden)/;

describe('the field tokens (story 53.2)', () => {
  it('should give every field the visible edge and the dark ground of the tokens', () => {
    for (const style of [FIELD, FIELD_SM, FIELD_LG, FIELD_FIT, FIELD_AREA]) {
      expect(style).toContain('border-field-line');
      expect(style).toContain('bg-field');
      expect(style).toContain('focus:border-field-focus');
    }
    expect(CHIP_OFF).toContain('bg-field');
  });

  it('should have no text field with the surface of the card or the faint line of the card in a class constant or an attribute', () => {
    const old = /(h-10|h-12|h-14)[^'"`\n]*\b(rounded-xl|rounded-lg)\b[^'"`\n]*\bbg-surface\b|\bbg-surface\b[^'"`\n]*\b(h-10|h-12|h-14)\b[^'"`\n]*\b(rounded-xl|rounded-lg)\b/;
    const bad = sources.flatMap(({ path, text }) => text.split('\n').filter((line) => old.test(line) && !/<button|rounded-full|<a /.test(line)).map((line) => `${path}: ${line.trim().slice(0, 90)}`));
    expect(bad).toEqual([]);
  });

  it('should have no input, text area or select that sets bg-surface or border-line on itself', () => {
    const tag = /<(input|textarea|select)\b((?:[^<>]|=>)*?)\/?>/gs;
    const bad = sources.flatMap(({ path, text }) => [...text.matchAll(tag)]
      .filter((match) => !NOT_TEXT.test(match[2]) && /className="[^"]*(\bbg-surface\b|\bborder-line\b)/.test(match[2]))
      .map((match) => `${path}: <${match[1]}>`));
    expect(bad).toEqual([]);
  });

  it('should keep the field look in one place: fieldStyles.ts and the three fields of their own shape', () => {
    const users = sources.filter(({ text }) => /\bbg-field\b/.test(text)).map(({ path }) => path.replace(`${ROOT}/`, ''));
    expect(users.sort()).toEqual([...OWN_SHAPE].sort());
    expect(readFileSync('src/components/primitives/fieldStyles.ts', 'utf8')).toContain('bg-field');
  });

  it('should use the shared styles in every place that had its own copy', () => {
    for (const path of ['auth/AuthDialog', 'wizard/stock/StockBikeSourceForm', 'wizard/stock/StockBikePicker', 'admin/AdminParts', 'maintain/QuickEntryDialog', 'maintain/RideLogForm', 'maintain/BikePassportCard', 'maintain/ChainTracker', 'profile/RiderParts', 'profile/AddRiderForm', 'profile/BikeRow', 'prepurchasing/BikeNameField', 'prepurchasing/CatalogPicker', 'bikes/ReviewBoxes', 'garage/AddBikeForm', 'finder/FinderQuestions', 'wizard/stock/SaveBikeDialog']) {
      expect(readFileSync(`${ROOT}/${path}.tsx`, 'utf8'), path).toContain('primitives/fieldStyles');
    }
  });
});
