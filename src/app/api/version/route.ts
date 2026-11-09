import { NextResponse } from 'next/server';
import { APP_VERSION } from '@/lib/version';

/** What is deployed, as JSON: the version, the commit and the day of the build. Nothing else, no secrets. */
export function GET(): NextResponse {
  return NextResponse.json(APP_VERSION, { headers: { 'Cache-Control': 'no-store' } });
}
