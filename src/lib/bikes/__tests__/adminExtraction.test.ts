import { describe, it, expect } from 'vitest';
import { ADMIN_LIMIT, ADMIN_MAX_BYTES, ADMIN_MAX_FILES, adminLimiter, validateAdminTables, type AdminTables } from '../adminExtraction';
import { resolveStockBike } from '../resolve';
import { STOCK_BIKE_SPECS } from '../stockBikeSpecs';

const file = (over = {}) => ({ type: 'application/pdf', bytes: 5000, ...over });
const upload = (over: Partial<AdminTables> = {}): AdminTables => ({ files: [file()], name: 'Cube Attain 2027', ...over });

describe('validateAdminTables', () => {
  it('should accept one to four images or PDFs, together up to 10 MB, with a plain name', () => {
    for (const type of ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']) expect(validateAdminTables(upload({ files: [file({ type })] }))).toBe(true);
    expect(validateAdminTables(upload({ files: [file(), file({ type: 'image/png' })] }))).toBe(true);
    expect(validateAdminTables(upload({ files: Array.from({ length: ADMIN_MAX_FILES }, () => file()) }))).toBe(true);
    expect(validateAdminTables(upload({ files: [file({ bytes: ADMIN_MAX_BYTES })] }))).toBe(true);
    expect(validateAdminTables(upload({ name: 'Škoda Rapid (2024) +/-' }))).toBe(true);
  });

  it.each([
    ['no file', { files: [] }],
    ['five files', { files: Array.from({ length: ADMIN_MAX_FILES + 1 }, () => file()) }],
    ['an SVG', { files: [file({ type: 'image/svg+xml' })] }],
    ['a script', { files: [file(), file({ type: 'text/html' })] }],
    ['an empty file', { files: [file({ bytes: 0 })] }],
    ['files that are too big together', { files: [file({ bytes: ADMIN_MAX_BYTES }), file({ bytes: 1 })] }],
    ['no name', { name: ' ' }],
    ['a name with markup', { name: '<script>alert(1)</script>' }],
    ['a name that is too long', { name: 'x'.repeat(81) }],
  ])('should refuse %s', (_name, over) => {
    expect(validateAdminTables(upload(over))).toBe(false);
  });

  it('should allow the owner far more readings per hour than a rider', () => {
    expect(ADMIN_LIMIT).toEqual({ max: 60, windowMs: 3_600_000 });
    adminLimiter.reset();
    for (let call = 0; call < 60; call++) expect(adminLimiter.allow('admin-1')).toBe(true);
    expect(adminLimiter.allow('admin-1')).toBe(false);
    expect(adminLimiter.allow('admin-2')).toBe(true);
    adminLimiter.reset();
  });
});

describe('resolving a catalog bike', () => {
  const selection = { source: 'community' as const, brand: 'Cube', model: 'Attain', year: 2024, size: '54', spec: STOCK_BIKE_SPECS[0].sizes.M, origin: 'community' as const, confirmations: 3 };

  it('should stand in for the bike with one size and say who stands behind it', () => {
    const resolved = resolveStockBike(selection, 'road')!;
    expect(resolved).toMatchObject({ origin: 'community', size: '54', community: { origin: 'community', confirmations: 3 } });
    expect(resolved.bike.id).toBe('community-cube-attain-2024');
    expect(resolved.bike.sizeOrder).toEqual(['54']);
    expect(resolved.spec).toEqual(selection.spec);
  });

  it('should keep the owner origin', () => {
    expect(resolveStockBike({ ...selection, origin: 'owner', confirmations: 0 }, 'road')?.community).toEqual({ origin: 'owner', confirmations: 0 });
  });
});
