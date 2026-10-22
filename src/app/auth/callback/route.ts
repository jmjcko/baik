import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { safeNextPath } from '@/lib/auth/safeRedirect';

/** Addresses the e-mail templates of Supabase may use for the token hash flow. */
const OTP_TYPES: readonly EmailOtpType[] = ['signup', 'magiclink', 'email', 'recovery', 'invite', 'email_change'];

const isOtpType = (value: string | null): value is EmailOtpType => OTP_TYPES.includes(value as EmailOtpType);

/** Sends the rider back to the app; the sign in result is only a fixed flag in the address, never a message. */
function backToApp(request: NextRequest, path: string, result: 'ok' | 'error'): NextResponse {
  const url = new URL(path, request.nextUrl.origin);
  url.searchParams.set('auth', result);
  return NextResponse.redirect(url);
}

/**
 * Landing address of the sign in links and of the Google sign in (`/auth/callback`): exchanges the one-time code
 * (PKCE) or verifies the token hash of an e-mail link, which sets the session cookies, then returns to the app.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const next = safeNextPath(searchParams.get('next'));
  const client = await createSupabaseServerClient();
  if (!client) return backToApp(request, next, 'error');

  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  try {
    const { error } = code
      ? await client.auth.exchangeCodeForSession(code)
      : tokenHash && isOtpType(type)
        ? await client.auth.verifyOtp({ type, token_hash: tokenHash })
        : { error: new Error('missing code') };
    return backToApp(request, next, error ? 'error' : 'ok');
  } catch {
    return backToApp(request, next, 'error');
  }
}
