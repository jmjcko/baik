import { timingSafeEqual } from 'node:crypto';

/** Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`; the comparison takes the same time whatever is wrong. */
export function isCronRequest(request: Request, secret: string): boolean {
  const given = Buffer.from(request.headers.get('authorization') ?? '');
  const wanted = Buffer.from(`Bearer ${secret}`);
  return given.length === wanted.length && timingSafeEqual(given, wanted);
}
