import type { Translations } from '@/lib/i18n/translations';
import type { RidingDiscipline } from '@/types/baikfit';

/** The kind of bike in one or two words ("Road", "Gravel", "XC / Trail"), from the names of the disciplines of the studio. */
export const shortKind = (t: Translations, discipline: RidingDiscipline): string => t.studio.disciplines[discipline].split(' ')[0];
