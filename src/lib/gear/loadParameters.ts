import type { Translations } from '@/lib/i18n/translations';
import { researchGearParameters, type ResearchResponse } from '@/app/actions/researchGearParameters';
import { prefillAnswers } from '@/lib/agents/gearPrefill';
import type { ProfileValues } from '@/lib/profile/values';
import { TAXONOMY } from '@/types/gearTaxonomy';
import type { GearCategoryId } from '@/types/gearTypes';
import type { Loaded } from './gearState';
import { buildParameters, defaultSelection, initialAnswers } from './parameters';

interface LoadInput {
  t: Translations;
  locale: 'en' | 'cs';
  values: ProfileValues;
  /** What the rider typed, or the name of the category that was picked from the lists. */
  query: string;
  /** A category the rider picked: its rules of the knowledge bases apply whatever the research says. */
  picked?: GearCategoryId;
}

/** The research, or a failure that has the same shape when the call itself cannot be made. */
async function ask(request: { query: string; locale: 'en' | 'cs'; discipline: 'road' | 'gravel' | 'mtb'; known: string[] }): Promise<ResearchResponse> {
  try {
    return await researchGearParameters(request);
  } catch {
    return { success: false, error: 'unavailable' };
  }
}

/**
 * The questions of the product: Gemini researches them (only the text of the product, the language and the discipline are sent); when that
 * is not possible the fixed questions of the category, or the general form, take its place and the reason is kept.
 */
export async function loadParameters({ t, locale, values, query, picked }: LoadInput): Promise<Loaded> {
  const discipline = values.discipline === 'xc_mtb' ? 'mtb' : values.discipline;
  const known = picked ? TAXONOMY[picked].params.map((id) => t.gear.params[id].label) : [];
  const response = await ask({ query, locale, discipline, known });
  const research = response.success && response.result ? response.result : null;
  const category = picked ?? research?.category ?? null;
  const parameters = buildParameters(t, category, research);
  return { title: research?.productTitle ?? query, category, parameters, selected: defaultSelection(parameters), answers: initialAnswers(parameters, prefillAnswers(values)), fallback: research ? null : response.error ?? 'unavailable' };
}
