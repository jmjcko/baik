/**
 * Bilingual Translation Dictionary for bAIk Platform (public entry).
 * 100% parity between English ('en', primary) and Czech ('cs', secondary) is enforced by the
 * `Translations` type; dictionaries are split per domain under ./en and ./cs.
 */

import { en } from './en';
import { cs } from './cs';
import type { Locale, Translations } from './types';

export type { Locale, Translations };

export const translations: Record<Locale, Translations> = { en, cs };
