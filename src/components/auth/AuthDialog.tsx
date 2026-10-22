'use client';

import React, { useEffect } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';
import { authErrorText, useAuthForm, type AuthMode } from './useAuthForm';

type Texts = Translations['auth'];

const FIELD = 'w-full h-12 rounded-xl border border-line bg-surface px-4 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-tone-info-line';
const PILL = 'h-12 w-full rounded-full text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const SECONDARY = `${PILL} border border-line bg-surface text-ink hover:bg-sunken`;

const Tabs: React.FC<{ texts: Texts; mode: AuthMode; onChange: (mode: AuthMode) => void }> = ({ texts, mode, onChange }) => (
  <div role="tablist" className="flex rounded-full border border-line bg-sunken p-0.5">
    {(['signIn', 'signUp'] as const).map((value) => (
      <button
        key={value}
        type="button"
        role="tab"
        aria-selected={mode === value}
        onClick={() => onChange(value)}
        className={cx('flex-1 h-10 rounded-full text-sm font-semibold transition-colors', mode === value ? 'bg-blue-600 text-slate-50 shadow-sm' : 'text-ink-2 hover:text-ink')}
      >
        {value === 'signIn' ? texts.tabSignIn : texts.tabSignUp}
      </button>
    ))}
  </div>
);

interface FieldsProps {
  texts: Texts;
  mode: AuthMode;
  email: string;
  password: string;
  onEmail: (value: string) => void;
  onPassword: (value: string) => void;
}

const Fields: React.FC<FieldsProps> = ({ texts, mode, email, password, onEmail, onPassword }) => (
  <div className="space-y-3">
    <label className="block space-y-1">
      <span className="text-xs font-semibold text-ink-2">{texts.emailLabel}</span>
      <input type="email" autoComplete="email" autoFocus required value={email} onChange={(e) => onEmail(e.target.value)} className={FIELD} />
    </label>
    <label className="block space-y-1">
      <span className="text-xs font-semibold text-ink-2">
        {texts.passwordLabel} <span className="font-normal text-ink-3">({texts.passwordHint})</span>
      </span>
      <input
        type="password"
        autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
        required
        value={password}
        onChange={(e) => onPassword(e.target.value)}
        className={FIELD}
      />
    </label>
  </div>
);

/** Closes the dialog with Escape while it is open. */
function useEscape(open: boolean, onClose: () => void): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
}

type Form = ReturnType<typeof useAuthForm>;

const Messages: React.FC<{ texts: Texts; form: Form }> = ({ texts, form }) => (
  <>
    {form.error && <p role="alert" className="text-sm text-tone-danger-ink">{authErrorText(texts.errors, form.error)}</p>}
    {form.checkEmail && <p role="status" className="text-sm text-tone-success-ink">{texts.noticeCheckEmail}</p>}
  </>
);

const Actions: React.FC<{ texts: Texts; form: Form }> = ({ texts, form }) => (
  <>
    <button type="submit" disabled={form.busy} className={`${PILL} bg-blue-600 hover:bg-blue-700 text-slate-50 shadow-sm`}>
      {form.busy ? texts.working : form.mode === 'signIn' ? texts.submitSignIn : texts.submitSignUp}
    </button>
    <p className="text-center text-xs text-ink-3">{texts.orDivider}</p>
    <button type="button" disabled={form.busy} onClick={() => void form.sendLink()} className={SECONDARY}>{texts.magicLink}</button>
    <button type="button" disabled={form.busy} onClick={() => void form.google()} className={SECONDARY}>{texts.google}</button>
  </>
);

const Consent: React.FC<{ texts: Texts; checked: boolean; onChange: (checked: boolean) => void }> = ({ texts, checked, onChange }) => (
  <label className="flex items-start gap-3 text-xs text-ink-2 leading-relaxed">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0" />
    <span>{texts.consent}</span>
  </label>
);

/** The form; it exists only while the dialog is open, so the fields (and the password) are gone when it closes. */
const AuthForm: React.FC<{ texts: Texts; onClose: () => void }> = ({ texts, onClose }) => {
  const form = useAuthForm(onClose);
  return (
    <form onSubmit={(e) => { e.preventDefault(); void form.submit(); }} className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-xl space-y-4">
      <span className="font-mono text-xs uppercase tracking-wider text-accent-ink">{texts.badge}</span>
      <h2 id="auth-title" className="text-lg font-bold text-ink tracking-tight">{texts.title}</h2>
      <Tabs texts={texts} mode={form.mode} onChange={form.setMode} />
      <Fields texts={texts} mode={form.mode} email={form.email} password={form.password} onEmail={form.setEmail} onPassword={form.setPassword} />
      <Consent texts={texts} checked={form.consent} onChange={form.setConsent} />
      <Messages texts={texts} form={form} />
      <Actions texts={texts} form={form} />
      <p className="text-xs text-ink-3 leading-relaxed">{texts.privacyNote}</p>
      <button type="button" onClick={onClose} className="w-full text-xs font-semibold text-ink-3 hover:text-ink">{texts.close}</button>
    </form>
  );
};

interface AuthDialogProps {
  t: Translations;
  open: boolean;
  onClose: () => void;
}

/** Sign in and registration dialog: e-mail with password, e-mail link or Google. Account creation needs the consent. */
export const AuthDialog: React.FC<AuthDialogProps> = ({ t, open, onClose }) => {
  useEscape(open, onClose);
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <AuthForm texts={t.auth} onClose={onClose} />
    </div>
  );
};
