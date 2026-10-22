import { describe, it, expect } from 'vitest';
import { translations } from '../translations';
import fixture from './translations.fixture.json';

type Dictionary = { [key: string]: Dictionary | string | string[] };

function collectKeys(node: unknown, prefix = ''): string[] {
  if (typeof node === 'string') return [prefix];
  if (Array.isArray(node)) return node.map((_, i) => `${prefix}[${i}]`);
  const entries = Object.entries(node as Dictionary);
  return entries.flatMap(([key, value]) => collectKeys(value, prefix ? `${prefix}.${key}` : key));
}

function collectEmpty(node: unknown, prefix = ''): string[] {
  if (typeof node === 'string') return node.trim() === '' ? [prefix] : [];
  if (Array.isArray(node)) return node.flatMap((v, i) => collectEmpty(v, `${prefix}[${i}]`));
  return Object.entries(node as Dictionary).flatMap(([key, value]) =>
    collectEmpty(value, prefix ? `${prefix}.${key}` : key)
  );
}

describe('translations dictionaries', () => {
  it('should keep the assembled EN and CZ dictionaries identical to the stored reference', () => {
    expect(translations.en).toEqual(fixture.en);
    expect(translations.cs).toEqual(fixture.cs);
  });

  it('should have exactly the same keys in EN and CZ', () => {
    expect(collectKeys(translations.cs).sort()).toEqual(collectKeys(translations.en).sort());
  });

  it('should not contain empty strings in either locale', () => {
    expect(collectEmpty(translations.en)).toEqual([]);
    expect(collectEmpty(translations.cs)).toEqual([]);
  });
});
