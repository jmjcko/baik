'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { useAuth } from '@/lib/auth/AuthContext';
import { AuthDialog } from './AuthDialog';

export const OFFER_DISMISSED_KEY = 'baik_sign_in_offer_dismissed';

function readDismissed(): boolean {
  try {
    return window.sessionStorage.getItem(OFFER_DISMISSED_KEY) === '1';
  } catch {
    return false;
  }
}

function writeDismissed(): void {
  try {
    window.sessionStorage.setItem(OFFER_DISMISSED_KEY, '1');
  } catch {
    /* storage unavailable: the offer then returns on the next screen */
  }
}

const OfferActions: React.FC<{ texts: Translations['auth']['offer']; onSignIn: () => void; onDismiss: () => void }> = ({ texts, onSignIn, onDismiss }) => (
  <div className="flex gap-3 shrink-0">
    <button type="button" onClick={onSignIn} className="h-12 px-6 rounded-full bg-blue-600 hover:bg-blue-700 text-slate-50 text-sm font-semibold shadow-sm">{texts.signIn}</button>
    <button type="button" onClick={onDismiss} className="h-12 px-5 rounded-full border border-line bg-surface text-ink text-sm font-semibold hover:bg-sunken">{texts.notNow}</button>
  </div>
);

interface SignInOfferProps {
  t: Translations;
  /** Where the offer is shown: after the report or at the start of the bike audit (path B, which stays open for guests). */
  variant: 'report' | 'pathB';
}

/** A quiet offer to sign in for a guest (only when Supabase is set up); the rider can always carry on without an account. */
export const SignInOffer: React.FC<SignInOfferProps> = ({ t, variant }) => {
  const auth = useAuth();
  const [dismissed, setDismissed] = useState(readDismissedSafely);
  const [open, setOpen] = useState(false);
  if (!auth.configured || auth.status !== 'anonymous' || dismissed) return null;
  const offer = t.auth.offer;
  return (
    <section data-testid="sign-in-offer" className="p-5 rounded-2xl border border-tone-info-line bg-tone-info-bg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="max-w-2xl">
        <h2 className="text-sm font-bold text-ink">{variant === 'report' ? offer.reportTitle : offer.pathBTitle}</h2>
        <p className="text-sm text-ink-2 mt-1">{variant === 'report' ? offer.reportBody : offer.pathBBody}</p>
      </div>
      <OfferActions texts={offer} onSignIn={() => setOpen(true)} onDismiss={() => { writeDismissed(); setDismissed(true); }} />
      <AuthDialog t={t} open={open} onClose={() => setOpen(false)} />
    </section>
  );
};

function readDismissedSafely(): boolean {
  return typeof window !== 'undefined' && readDismissed();
}
