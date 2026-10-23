import { NextResponse } from 'next/server';
import { adminLimiter } from '@/lib/bikes/adminExtraction';
import { writeSeedEntry } from '@/lib/catalog/seedFile';
import { adminUserId } from '@/lib/supabase/adminSession';

type Code = 'disabled' | 'forbidden' | 'not_configured' | 'rate_limited' | 'invalid_input' | 'unavailable';

const MAX_BODY_BYTES = 200_000;
const fail = (error: Code, status: number) => NextResponse.json({ success: false, error }, { status });

/**
 * Development only: writes one checked bike into src/lib/data/bikes/seedBikes.json on the disk of the dev server (OWASP A01, CodeGuard
 * file-write rules). It is off in production, needs a signed in admin, writes one fixed file and refuses anything the seed loader refuses.
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') return fail('disabled', 403);
  const admin = await adminUserId();
  if (admin === 'not_configured') return fail('not_configured', 503);
  if (!admin) return fail('forbidden', 403);
  if (!adminLimiter.allow(admin)) return fail('rate_limited', 429);
  const text = await request.text().catch(() => '');
  if (text.length === 0 || text.length > MAX_BODY_BYTES) return fail('invalid_input', 413);
  let body: { entry?: unknown } | null = null;
  try {
    body = JSON.parse(text) as { entry?: unknown };
  } catch {
    return fail('invalid_input', 400);
  }
  const result = await writeSeedEntry(body?.entry);
  if (result.ok) return NextResponse.json({ success: true });
  return result.reason === 'invalid' ? fail('invalid_input', 400) : fail('unavailable', 500);
}
