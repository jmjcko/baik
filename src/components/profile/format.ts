import type { User } from '@supabase/supabase-js';
import type { Locale } from '@/lib/i18n/translations';

const LOCALE_TAGS: Record<Locale, string> = { en: 'en-GB', cs: 'cs-CZ' };

/** A stored timestamp as a short date and time in the language of the app; empty when there is none. */
export function formatStamp(iso: string | null | undefined, locale: Locale): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(LOCALE_TAGS[locale], { dateStyle: 'medium', timeStyle: 'short' });
}

export type SignInMethod = 'google' | 'email' | 'other';

/** How the rider signed in, from the provider that Supabase keeps on the user. */
export function signInMethod(user: Pick<User, 'app_metadata'> | null): SignInMethod {
  const provider = user?.app_metadata?.provider;
  if (provider === 'google' || provider === 'email') return provider;
  return 'other';
}
