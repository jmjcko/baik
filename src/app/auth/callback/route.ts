import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType, SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { safeNextPath } from '@/lib/auth/safeRedirect';
import { logCallbackFailure } from '@/lib/auth/callbackLog';

/** Addresses the e-mail templates of Supabase may use for the token hash flow. */
const OTP_TYPES: readonly EmailOtpType[] = ['signup', 'magiclink', 'email', 'recovery', 'invite', 'email_change'];

const isOtpType = (value: string | null): value is EmailOtpType => OTP_TYPES.includes(value as EmailOtpType);

/** Sends the rider back to the app; the sign in result is only a fixed flag in the address, never a message. */
function backToApp(request: NextRequest, path: string, result: 'ok' | 'error'): NextResponse {
  const url = new URL(path, request.nextUrl.origin);
  url.searchParams.set('auth', result);
  return NextResponse.redirect(url);
}

/** What the return carries: the Google or Supabase error code when the provider refused, the one-time code or the token hash of a link. */
async function settle(client: SupabaseClient, params: URLSearchParams): Promise<boolean> {
  const code = params.get('code');
  const tokenHash = params.get('token_hash');
  const type = params.get('type');
  if (!code && !(tokenHash && isOtpType(type))) {
    logCallbackFailure(params.get('error_code') || params.get('error') ? 'provider_error' : 'no_code', null, params.get('error_code') ?? params.get('error'));
    return false;
  }
  const { error } = code ? await client.auth.exchangeCodeForSession(code) : await client.auth.verifyOtp({ type: type as EmailOtpType, token_hash: tokenHash as string });
  if (error) logCallbackFailure(code ? 'exchange_failed' : 'verify_failed', error);
  return !error;
}

/**
 * Landing address of the sign in links and of the Google sign in (`/auth/callback`): exchanges the one-time code
 * (PKCE) or verifies the token hash of an e-mail link, which sets the session cookies, then returns to the app.
 * The rider gets only the fixed flag; the reason goes to the server log as a stage and an error code.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const next = safeNextPath(searchParams.get('next'));
  const client = await createSupabaseServerClient();
  if (!client) {
    logCallbackFailure('no_config');
    return backToApp(request, next, 'error');
  }
  try {
    return backToApp(request, next, (await settle(client, searchParams)) ? 'ok' : 'error');
  } catch (error) {
    logCallbackFailure('exception', error as { name?: string });
    return backToApp(request, next, 'error');
  }
}
