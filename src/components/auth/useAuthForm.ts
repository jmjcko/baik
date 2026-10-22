'use client';

import { useState } from 'react';
import { useAuth, type AuthResult } from '@/lib/auth/AuthContext';
import type { AuthErrorCode } from '@/lib/auth/errors';
import type { AuthTexts } from '@/lib/i18n/types/auth';

export type AuthMode = 'signIn' | 'signUp';

type FormError = AuthErrorCode | 'consent';

/** The fixed text of a failure. Wrong credentials and an unconfirmed e-mail share one text, so nobody can learn whether an account exists. */
export function authErrorText(texts: AuthTexts['errors'], error: FormError): string {
  const byCode: Record<FormError, string> = {
    invalid_credentials: texts.credentials,
    email_not_confirmed: texts.credentials,
    consent: texts.consent,
    weak_password: texts.weakPassword,
    rate_limited: texts.rateLimited,
    network: texts.network,
    not_configured: texts.notConfigured,
    invalid_input: texts.invalidInput,
    unknown: texts.unknown,
  };
  return byCode[error];
}

/** Fields of the form and the mode, with the outcome of the last request. */
function useFormState() {
  const [mode, setMode] = useState<AuthMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<FormError | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);
  const changeMode = (next: AuthMode) => {
    setMode(next);
    setError(null);
    setCheckEmail(false);
  };
  return { mode, changeMode, email, setEmail, password, setPassword, consent, setConsent, busy, setBusy, error, setError, checkEmail, setCheckEmail };
}

/** Form state of the sign in dialog: fields, mode, the running request and its outcome. */
export function useAuthForm(onSignedIn: () => void) {
  const auth = useAuth();
  const f = useFormState();

  /** Runs one sign in action; actions that can create an account need the consent first. */
  const run = async (needsConsent: boolean, action: () => Promise<AuthResult>, done: 'close' | 'notice' | 'redirect') => {
    f.setError(null);
    f.setCheckEmail(false);
    if (needsConsent && !f.consent) return f.setError('consent');
    f.setBusy(true);
    const result = await action();
    f.setBusy(false);
    if (!result.ok) return f.setError(result.error);
    if (done === 'close') onSignedIn();
    if (done === 'notice') f.setCheckEmail(true);
  };

  const submit = () =>
    f.mode === 'signIn' ? run(false, () => auth.signInWithEmail(f.email, f.password), 'close') : run(true, () => auth.signUpWithEmail(f.email, f.password), 'notice');

  return {
    mode: f.mode, setMode: f.changeMode, email: f.email, setEmail: f.setEmail, password: f.password, setPassword: f.setPassword,
    consent: f.consent, setConsent: f.setConsent, busy: f.busy, error: f.error, checkEmail: f.checkEmail,
    submit,
    sendLink: () => run(true, () => auth.signInWithMagicLink(f.email), 'notice'),
    google: () => run(true, auth.signInWithGoogle, 'redirect'),
  };
}
