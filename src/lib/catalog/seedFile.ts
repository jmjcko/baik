import { promises as fs } from 'node:fs';
import path from 'node:path';
import { loadSeedBikes } from '@/lib/bikes/seedLoader';
import { mergeSeedEntry, toSeedFileText } from './seedExport';

/** The only file the API ever writes; the path is fixed and never comes from a request. */
export const SEED_FILE = path.join(process.cwd(), 'src', 'lib', 'data', 'bikes', 'seedBikes.json');

export type SeedWrite = { ok: true } | { ok: false; reason: 'invalid' | 'unreadable' };

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Adds (or replaces) one bike in the seed file. The entry and the whole merged file must pass the seed loader, otherwise nothing is
 * written; the file is replaced in one step (temporary file, then rename) so a failure never leaves half a file.
 */
export async function writeSeedEntry(entry: unknown, file: string = SEED_FILE): Promise<SeedWrite> {
  if (!isObject(entry) || loadSeedBikes([entry]).errors.length > 0) return { ok: false, reason: 'invalid' };
  let current: unknown;
  try {
    current = JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return { ok: false, reason: 'unreadable' };
  }
  if (!Array.isArray(current)) return { ok: false, reason: 'unreadable' };
  const merged = mergeSeedEntry(current, entry);
  if (loadSeedBikes(merged).errors.length > 0) return { ok: false, reason: 'invalid' };
  const temporary = `${file}.tmp`;
  try {
    await fs.writeFile(temporary, toSeedFileText(merged), 'utf8');
    await fs.rename(temporary, file);
  } catch {
    return { ok: false, reason: 'unreadable' };
  }
  return { ok: true };
}
