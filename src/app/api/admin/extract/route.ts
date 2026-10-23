import { NextResponse } from 'next/server';
import { adminLimiter, validateAdminTables } from '@/lib/bikes/adminExtraction';
import { requestBikeTable, type TableFile } from '@/lib/bikes/tableExtraction';
import { adminUserId } from '@/lib/supabase/adminSession';

type Code = 'forbidden' | 'not_configured' | 'rate_limited' | 'invalid_input' | 'unavailable' | 'unreadable';

const fail = (error: Code, status: number) => NextResponse.json({ success: false, error }, { status });

/** The files and the bike name of the form, or null when they are not acceptable. */
async function readForm(request: Request): Promise<{ files: File[]; name: string } | null> {
  const form = await request.formData().catch(() => null);
  const files = (form?.getAll('files') ?? []).filter((item): item is File => item instanceof File);
  const name = String(form?.get('name') ?? '');
  return validateAdminTables({ files: files.map((file) => ({ type: file.type, bytes: file.size })), name }) ? { files, name } : null;
}

const toBase64 = async (file: File): Promise<TableFile> => ({ data: Buffer.from(await file.arrayBuffer()).toString('base64'), mimeType: file.type });

/**
 * The owner's upload of the tables of one bike (pictures or PDFs): Gemini reads every frame size at once, for the catalog page.
 * Only a signed in admin may call it; the files are used once, not stored, not logged. The answer is a proposal that the owner checks.
 */
export async function POST(request: Request) {
  const admin = await adminUserId();
  if (admin === 'not_configured') return fail('not_configured', 503);
  if (!admin) return fail('forbidden', 403);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fail('not_configured', 503);
  const upload = await readForm(request);
  if (!upload) return fail('invalid_input', 400);
  if (!adminLimiter.allow(admin)) return fail('rate_limited', 429);
  const outcome = await requestBikeTable(apiKey, { files: await Promise.all(upload.files.map(toBase64)), name: upload.name });
  if (outcome.status === 'ok') return NextResponse.json({ success: true, table: outcome.table });
  return fail(outcome.status, outcome.status === 'unavailable' ? 502 : 422);
}
