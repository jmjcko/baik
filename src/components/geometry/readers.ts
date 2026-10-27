import { MAX_IMAGE_BASE64_LENGTH } from '@/lib/bikes/extraction';
import { canUseFile, prepareGeometryImage } from '@/lib/bikes/prepareImage';
import type { BikeTable } from '@/lib/bikes/tableExtraction';
import { readGeometryTable } from '@/app/actions/findBikes';

export type ReadError = 'forbidden' | 'invalid_input' | 'not_configured' | 'rate_limited' | 'unavailable' | 'unreadable';

/** Where the reading of the tables of a bike stands: nothing yet, running, a fixed error code, or a table that waits for the check. */
export type Reading = { status: 'idle' | 'working' } | { status: 'error'; error: ReadError } | { status: 'review'; table: BikeTable };

/** Reads the tables in the given files (the files are sent once, never kept) and says what came out. */
export type TableReader = (files: File[], name: string) => Promise<Reading>;

const CODES: ReadError[] = ['forbidden', 'invalid_input', 'not_configured', 'rate_limited', 'unavailable', 'unreadable'];

/** The owner's reading: pictures and PDFs go to the admin route, which only a signed in admin may call. */
export const adminReader: TableReader = async (files, name) => {
  const form = new FormData();
  for (const file of files) form.append('files', file);
  form.append('name', name);
  try {
    const answer = (await (await fetch('/api/admin/extract', { method: 'POST', body: form })).json()) as { success?: boolean; table?: BikeTable; error?: string };
    if (answer.success && answer.table) return { status: 'review', table: answer.table };
    return { status: 'error', error: CODES.includes(answer.error as ReadError) ? (answer.error as ReadError) : 'unavailable' };
  } catch {
    return { status: 'error', error: 'unavailable' };
  }
};

/** The rider's reading: every picture is shrunk and drawn again in the browser (no hidden data, no PDF), then read by the server action. */
export const riderReader: TableReader = async (files, name) => {
  if (files.length === 0 || !files.every(canUseFile)) return { status: 'error', error: 'invalid_input' };
  const prepared = await Promise.all(files.map((file) => prepareGeometryImage(file, MAX_IMAGE_BASE64_LENGTH)));
  if (prepared.some((image) => image === null)) return { status: 'error', error: 'invalid_input' };
  const result = await readGeometryTable({ images: prepared, name });
  if (result.success && result.table) return { status: 'review', table: result.table };
  return { status: 'error', error: result.error === 'invalid_input' || result.error === undefined ? 'invalid_input' : result.error };
};
