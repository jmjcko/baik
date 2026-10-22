import React, { useEffect } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import type { Session } from '@supabase/supabase-js';
import { AuthProvider, GUEST_SESSION, useAuth, type AuthClient, type UserSession } from '../AuthContext';

type Listener = (event: string, session: Session | null) => void;

function fakeClient() {
  let listener: Listener = () => undefined;
  const unsubscribe = vi.fn();
  const auth = {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn((callback: Listener) => {
      listener = callback;
      return { data: { subscription: { id: 'x', callback, unsubscribe } } };
    }),
    signInWithPassword: vi.fn(async () => ({ data: {}, error: null })),
    signUp: vi.fn(async () => ({ data: {}, error: null })),
    signInWithOtp: vi.fn(async () => ({ data: {}, error: null })),
    signInWithOAuth: vi.fn(async () => ({ data: {}, error: null })),
    signOut: vi.fn(async () => ({ error: null })),
  };
  return { client: { auth } as unknown as AuthClient, auth, unsubscribe, emit: (event: string, session: Session | null) => listener(event, session) };
}

const session = { user: { id: 'u1', email: 'rider@example.com' } } as unknown as Session;

let current: UserSession = GUEST_SESSION;
const remember = (session: UserSession) => {
  current = session;
};

/** Shows the session on the page and hands it to the test. */
const Probe: React.FC = () => {
  const session = useAuth();
  useEffect(() => remember(session));
  return <p data-testid="status">{`${session.status}|${session.user?.email ?? '-'}|${session.configured}`}</p>;
};

const renderWith = (client: AuthClient | null | undefined) =>
  render(
    <AuthProvider client={client}>
      <Probe />
    </AuthProvider>
  );

describe('useAuth without a provider or without Supabase', () => {
  it('should be a guest with every sign in reporting not_configured', async () => {
    render(<Probe />);
    expect(screen.getByTestId('status')).toHaveTextContent('anonymous|-|false');
    for (const result of await Promise.all([current.signInWithEmail('a@b.cz', 'password1'), current.signUpWithEmail('a@b.cz', 'password1'), current.signInWithMagicLink('a@b.cz'), current.signInWithGoogle(), current.signOut()])) {
      expect(result).toEqual({ ok: false, error: 'not_configured' });
    }
  });

  it('should be a guest and not configured when the client is forced to null', async () => {
    renderWith(null);
    expect(screen.getByTestId('status')).toHaveTextContent('anonymous|-|false');
    expect(await current.signInWithGoogle()).toEqual({ ok: false, error: 'not_configured' });
  });

  it('should be a guest when no client was given and the environment is not configured', () => {
    renderWith(undefined);
    expect(screen.getByTestId('status')).toHaveTextContent('anonymous|-|false');
  });
});

describe('AuthProvider with a Supabase client', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('should be loading until the first session event, then follow sign in and sign out', () => {
    const fake = fakeClient();
    renderWith(fake.client);
    expect(screen.getByTestId('status')).toHaveTextContent('loading|-|true');
    act(() => fake.emit('INITIAL_SESSION', null));
    expect(screen.getByTestId('status')).toHaveTextContent('anonymous|-|true');
    act(() => fake.emit('SIGNED_IN', session));
    expect(screen.getByTestId('status')).toHaveTextContent('authenticated|rider@example.com|true');
    act(() => fake.emit('SIGNED_OUT', null));
    expect(screen.getByTestId('status')).toHaveTextContent('anonymous|-|true');
  });

  it('should unsubscribe when it is removed', () => {
    const fake = fakeClient();
    renderWith(fake.client).unmount();
    expect(fake.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('should sign in with the email and the password and report success', async () => {
    const fake = fakeClient();
    renderWith(fake.client);
    expect(await current.signInWithEmail('rider@example.com', 'correct horse')).toEqual({ ok: true });
    expect(fake.auth.signInWithPassword).toHaveBeenCalledWith({ email: 'rider@example.com', password: 'correct horse' });
  });

  it('should sign up and send the magic link with the callback address of the app', async () => {
    const fake = fakeClient();
    renderWith(fake.client);
    await current.signUpWithEmail('rider@example.com', 'correct horse');
    await current.signInWithMagicLink('rider@example.com');
    const redirect = `${window.location.origin}/auth/callback`;
    expect(fake.auth.signUp).toHaveBeenCalledWith({ email: 'rider@example.com', password: 'correct horse', options: { emailRedirectTo: redirect } });
    expect(fake.auth.signInWithOtp).toHaveBeenCalledWith({ email: 'rider@example.com', options: { emailRedirectTo: redirect } });
  });

  it('should start the Google sign in with the callback address and sign out', async () => {
    const fake = fakeClient();
    renderWith(fake.client);
    await current.signInWithGoogle();
    expect(fake.auth.signInWithOAuth).toHaveBeenCalledWith({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } });
    expect(await current.signOut()).toEqual({ ok: true });
    expect(fake.auth.signOut).toHaveBeenCalledTimes(1);
  });

  it('should refuse invalid input without calling the service', async () => {
    const fake = fakeClient();
    renderWith(fake.client);
    expect(await current.signInWithEmail('not an email', 'correct horse')).toEqual({ ok: false, error: 'invalid_input' });
    expect(await current.signInWithEmail('rider@example.com', 'short')).toEqual({ ok: false, error: 'invalid_input' });
    expect(await current.signUpWithEmail('rider@example.com', 'short')).toEqual({ ok: false, error: 'invalid_input' });
    expect(await current.signInWithMagicLink('nope')).toEqual({ ok: false, error: 'invalid_input' });
    expect(fake.auth.signInWithPassword).not.toHaveBeenCalled();
    expect(fake.auth.signUp).not.toHaveBeenCalled();
    expect(fake.auth.signInWithOtp).not.toHaveBeenCalled();
  });

  it('should map a service error to a fixed code and never pass on its message', async () => {
    const fake = fakeClient();
    fake.auth.signInWithPassword.mockResolvedValueOnce({ data: {}, error: { code: 'invalid_credentials', status: 400, message: 'Invalid login credentials for rider@example.com' } } as never);
    renderWith(fake.client);
    const result = await current.signInWithEmail('rider@example.com', 'wrong password');
    expect(result).toEqual({ ok: false, error: 'invalid_credentials' });
    expect(JSON.stringify(result)).not.toContain('rider@example.com');
  });

  it('should report a network failure when the call throws', async () => {
    const fake = fakeClient();
    fake.auth.signOut.mockRejectedValueOnce(Object.assign(new Error('fetch failed'), { name: 'AuthRetryableFetchError' }));
    renderWith(fake.client);
    await waitFor(() => expect(current.configured).toBe(true));
    expect(await current.signOut()).toEqual({ ok: false, error: 'network' });
  });
});
