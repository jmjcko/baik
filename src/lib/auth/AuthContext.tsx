'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import { getBrowserClient } from '@/lib/supabase/client';
import { readSupabaseConfig } from '@/lib/supabase/config';
import { isValidEmail, isValidPassword, mapAuthError, type AuthErrorCode } from './errors';

export type AuthStatus = 'anonymous' | 'authenticated' | 'loading';

export type AuthResult = { ok: true } | { ok: false; error: AuthErrorCode };

/** The session of the app: a guest until the rider signs in. */
export interface UserSession {
  status: AuthStatus;
  user: User | null;
  /** False when Supabase is not set up: the app then works as a guest only. */
  configured: boolean;
  signInWithEmail: (email: string, password: string) => Promise<AuthResult>;
  signUpWithEmail: (email: string, password: string) => Promise<AuthResult>;
  signInWithMagicLink: (email: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
}

/** The part of the Supabase client that the provider uses (a small fake is enough in tests). */
export type AuthClient = { auth: Pick<SupabaseClient['auth'], 'getSession' | 'onAuthStateChange' | 'signInWithPassword' | 'signUp' | 'signInWithOtp' | 'signInWithOAuth' | 'signOut'> };

const NOT_CONFIGURED: AuthResult = { ok: false, error: 'not_configured' };
const INVALID_INPUT: AuthResult = { ok: false, error: 'invalid_input' };
const resolve = async () => NOT_CONFIGURED;

/** Value without a provider (tests, or Supabase not set up): the rider is a guest and every sign in reports `not_configured`. */
export const GUEST_SESSION: UserSession = {
  status: 'anonymous',
  user: null,
  configured: false,
  signInWithEmail: resolve,
  signUpWithEmail: resolve,
  signInWithMagicLink: resolve,
  signInWithGoogle: resolve,
  signOut: resolve,
};

const AuthContext = createContext<UserSession>(GUEST_SESSION);

/** The session of the rider and the sign in actions (see AuthProvider). */
export function useAuth(): UserSession {
  return useContext(AuthContext);
}

const callbackUrl = () => `${window.location.origin}/auth/callback`;

async function run(call: () => PromiseLike<{ error: { code?: string; status?: number; name?: string } | null }>): Promise<AuthResult> {
  try {
    const { error } = await call();
    return error ? { ok: false, error: mapAuthError(error) } : { ok: true };
  } catch (error) {
    return { ok: false, error: mapAuthError(error as { name?: string }) };
  }
}

type Actions = Pick<UserSession, 'signInWithEmail' | 'signUpWithEmail' | 'signInWithMagicLink' | 'signInWithGoogle' | 'signOut'>;

/** The sign in actions; the client is looked up when an action runs (never during server rendering). */
function buildActions(getClient: () => AuthClient | null): Actions {
  const call = (valid: boolean, action: (auth: AuthClient['auth']) => PromiseLike<{ error: { code?: string; status?: number; name?: string } | null }>): Promise<AuthResult> => {
    const client = getClient();
    if (!client) return Promise.resolve(NOT_CONFIGURED);
    return valid ? run(() => action(client.auth)) : Promise.resolve(INVALID_INPUT);
  };
  return {
    signInWithEmail: (email, password) => call(isValidEmail(email) && isValidPassword(password), (auth) => auth.signInWithPassword({ email, password })),
    signUpWithEmail: (email, password) =>
      call(isValidEmail(email) && isValidPassword(password), (auth) => auth.signUp({ email, password, options: { emailRedirectTo: callbackUrl() } })),
    signInWithMagicLink: (email) => call(isValidEmail(email), (auth) => auth.signInWithOtp({ email, options: { emailRedirectTo: callbackUrl() } })),
    signInWithGoogle: () => call(true, (auth) => auth.signInWithOAuth({ provider: 'google', options: { redirectTo: callbackUrl() } })),
    signOut: () => call(true, (auth) => auth.signOut()),
  };
}

interface AuthProviderProps {
  children: React.ReactNode;
  /** The Supabase client; by default the one of the browser. Pass null to force the guest mode. */
  client?: AuthClient | null;
}

/** Keeps the session of the rider: a guest, loading, or authenticated; reacts to sign in, sign out and token refresh. */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children, client }) => {
  const configured = client === undefined ? readSupabaseConfig() !== null : client !== null;
  const [session, setSession] = useState<Session | null>(null);
  const [loaded, setLoaded] = useState(!configured);

  useEffect(() => {
    const active = client === undefined ? getBrowserClient() : client;
    if (!active) return;
    const { data } = active.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoaded(true);
    });
    return () => data.subscription.unsubscribe();
  }, [client]);

  const value = useMemo<UserSession>(() => {
    const user = session?.user ?? null;
    const status: AuthStatus = !loaded ? 'loading' : user ? 'authenticated' : 'anonymous';
    return { status, user, configured, ...buildActions(() => (client === undefined ? getBrowserClient() : client)) };
  }, [client, configured, loaded, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
