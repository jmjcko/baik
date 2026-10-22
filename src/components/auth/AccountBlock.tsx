'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { useAuth } from '@/lib/auth/AuthContext';
import { AuthDialog } from './AuthDialog';

const BLOCK = 'rounded-2xl bg-[#282a3c] border border-slate-700/60 p-3 flex items-center justify-between gap-3';
const BUTTON = 'h-10 px-4 shrink-0 whitespace-nowrap rounded-full border text-xs font-semibold';

const Waiting: React.FC<{ t: Translations }> = ({ t }) => (
  <div className={BLOCK}>
    <span className="text-xs font-bold text-white tracking-wide">{t.navigation.guestLabel}</span>
    <button type="button" disabled className={`${BUTTON} border-slate-600 text-slate-400 cursor-not-allowed`}>
      {t.navigation.signInSoon}
    </button>
  </div>
);

const SignedIn: React.FC<{ t: Translations; email: string | undefined; onSignOut: () => void }> = ({ t, email, onSignOut }) => (
  <div className={BLOCK} data-testid="account-block">
    <div className="min-w-0">
      <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">{t.auth.signedIn}</span>
      <span className="block truncate text-xs font-bold text-white" title={email}>{email}</span>
    </div>
    <button type="button" onClick={onSignOut} className={`${BUTTON} border-slate-500 text-slate-100 hover:bg-slate-700/60`}>{t.auth.signOut}</button>
  </div>
);

const Guest: React.FC<{ t: Translations }> = ({ t }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={BLOCK} data-testid="account-block">
      <span className="text-xs font-bold text-white tracking-wide">{t.navigation.guestLabel}</span>
      <button type="button" onClick={() => setOpen(true)} className={`${BUTTON} border-blue-400 bg-blue-600 text-white hover:bg-blue-500`}>{t.auth.signIn}</button>
      <AuthDialog t={t} open={open} onClose={() => setOpen(false)} />
    </div>
  );
};

/**
 * Account block at the bottom of the sidebar: the guest with a sign in button, or the signed in rider with a sign out button.
 * Without Supabase settings the button stays disabled "Sign in (Soon)".
 */
export const AccountBlock: React.FC<{ t: Translations }> = ({ t }) => {
  const auth = useAuth();
  if (!auth.configured || auth.status === 'loading') return <Waiting t={t} />;
  if (auth.status === 'authenticated') return <SignedIn t={t} email={auth.user?.email ?? undefined} onSignOut={() => void auth.signOut()} />;
  return <Guest t={t} />;
};
