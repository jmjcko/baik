// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import seed from '@/lib/data/bikes/seedBikes.json';
import { writeSeedEntry, SEED_FILE } from '../seedFile';

const size = (label: string, stack: number, reach: number) => ({ size: label, stack_mm: stack, reach_mm: reach, seat_tube_angle_deg: 73.5, stock_seatpost_offset_mm: null, factory_spacers_mm: null });
const entry = (over: Record<string, unknown> = {}) => ({
  id: 'cube-attain-2025', brand: 'Cube', model: 'Attain', build: 'Frame', year: 2025, category: 'road_endurance', match_phrases: ['cube attain'],
  source: { name: 'Cube geometry table', url: 'https://www.cube.eu/attain', verified_on: '2026-10-23' }, sizes: [size('S', 540, 375), size('M', 570, 382)], ...over,
});

describe('writing one bike into the seed file', () => {
  let dir: string;
  let file: string;
  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'seed-'));
    file = path.join(dir, 'seedBikes.json');
    await writeFile(file, JSON.stringify(seed), 'utf8');
  });
  afterEach(() => rm(dir, { recursive: true, force: true }));

  it('should point at the one fixed seed file of the app', () => {
    expect(SEED_FILE.endsWith(path.join('src', 'lib', 'data', 'bikes', 'seedBikes.json'))).toBe(true);
  });

  it('should add the bike, keep the others and leave no temporary file', async () => {
    expect(await writeSeedEntry(entry(), file)).toEqual({ ok: true });
    const written = JSON.parse(await readFile(file, 'utf8')) as Array<{ id: string }>;
    expect(written).toHaveLength(seed.length + 1);
    expect(written.at(-1)?.id).toBe('cube-attain-2025');
    expect(await readdir(dir)).toEqual(['seedBikes.json']);
  });

  it('should replace a bike with the same id instead of adding a second one', async () => {
    await writeSeedEntry(entry(), file);
    await writeSeedEntry(entry({ sizes: [size('S', 541, 376)] }), file);
    const written = JSON.parse(await readFile(file, 'utf8')) as unknown[];
    expect(written).toHaveLength(seed.length + 1);
  });

  it.each([
    ['not an object', 'x'],
    ['no https address', entry({ source: { name: 'Cube geometry table', url: 'http://cube.eu', verified_on: '2026-10-23' } })],
    ['spacers that are not null', entry({ sizes: [{ ...size('S', 540, 375), factory_spacers_mm: 20 }] })],
    ['an id that would break the path rules', entry({ id: '../evil' })],
  ])('should refuse %s and leave the file as it was', async (_name, bad) => {
    expect(await writeSeedEntry(bad, file)).toEqual({ ok: false, reason: 'invalid' });
    expect(JSON.parse(await readFile(file, 'utf8'))).toEqual(seed);
  });

  it('should report an unreadable seed file instead of writing', async () => {
    await writeFile(file, 'not json', 'utf8');
    expect(await writeSeedEntry(entry(), file)).toEqual({ ok: false, reason: 'unreadable' });
  });
});
