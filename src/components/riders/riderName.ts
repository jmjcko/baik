import type { Translations } from '@/lib/i18n/translations';

/** The name of a rider on the screen: the rider's own, or "Me" / "Ja" for the first rider, who has none (the language of the page decides). */
export const riderName = (t: Translations, name: string | null): string => name ?? t.riders.me;
