import type { Translations } from '@/lib/i18n/translations';
import { PARAMS, TAXONOMY, paramsOf } from '@/types/gearTaxonomy';
import { GEAR_OPTIONS, type ChoiceParamId, type GearAnswerMap, type GearAnswers, type GearCategoryId, type GearParameter, type GearParamId } from '@/types/gearTypes';
import type { PromptParameter } from '@/lib/agents/lukeCykloAgent';
import type { ResearchResult } from './research';

/** At most this many questions are chosen at the start; the rider can add the others. */
export const DEFAULT_CHOSEN = 8;

/** A question of the knowledge bases with its texts in the language of the rider; `kb` when it belongs to the category, `general` when every category can ask it. */
export function kbParameter(t: Translations, id: GearParamId, source: 'kb' | 'general' = 'general'): GearParameter {
  const def = PARAMS[id];
  const options = def.kind === 'choice' ? GEAR_OPTIONS[id as ChoiceParamId].map((value) => ({ value, label: (t.gear.options[id as ChoiceParamId] as Record<string, string>)[value] })) : undefined;
  return { id, source, kind: def.kind, importance: source === 'kb' ? 'mandatory' : 'recommended', label: t.gear.params[id].label, hint: t.gear.params[id].hint, options, unit: def.unit };
}

const FALLBACK: GearParamId[] = ['usage', 'terrain', 'brands'];
const ORDER = { mandatory: 0, recommended: 1, optional: 2 } as const;
const BRAND = /brand|znač|výrob/i;

const normal = (text: string): string => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

/** Whether a name says what one of the taken names already says (the same words, or one inside the other). */
function repeats(name: string, taken: string[]): boolean {
  const a = normal(name);
  return taken.some((one) => {
    const b = normal(one);
    return a === b || (b.length >= 5 && a.includes(b)) || (a.length >= 5 && b.includes(a));
  });
}

/** What the research found, as questions: the brand question last, the rest by importance, without what the knowledge base already asks. */
function researchParameters(research: ResearchResult, taken: string[]): GearParameter[] {
  const list = research.parameters
    .filter((item) => BRAND.test(item.name) || !repeats(item.name, taken))
    .map<GearParameter>((item) => {
      const brands = BRAND.test(item.name);
      const choice = !brands && item.suggestedValues.length >= 2;
      return {
        id: item.id,
        source: 'ai',
        kind: brands ? 'brands' : choice ? 'choice' : 'text',
        importance: item.importance,
        multi: item.multi,
        label: item.name,
        hint: item.rationale,
        options: choice ? item.suggestedValues.map((value) => ({ value, label: value })) : undefined,
      };
    });
  const brand = list.filter((item) => item.kind === 'brands');
  return [...list.filter((item) => item.kind !== 'brands').sort((a, b) => ORDER[a.importance] - ORDER[b.importance]), ...brand];
}

/**
 * The questions of the product, in order: those of the knowledge bases for its category first (pinned), then the ones the research found
 * (without repeating a pinned one). Without a research (no key, a failure) the fixed questions of the category or a short general form are used.
 */
export function buildParameters(t: Translations, category: GearCategoryId | null, research: ResearchResult | null): GearParameter[] {
  const own = category ? TAXONOMY[category].params : [];
  if (!research) return (category ? paramsOf(category) : FALLBACK).map((id) => kbParameter(t, id, own.includes(id) ? 'kb' : 'general'));
  const pinned = own.map((id) => kbParameter(t, id, 'kb'));
  return [...pinned, ...researchParameters(research, pinned.map((one) => one.label))];
}

/** The questions chosen at the start: the pinned ones and then the important ones, eight at most; the optional ones wait under "more criteria". */
export function defaultSelection(parameters: GearParameter[]): string[] {
  const chosen = parameters.filter((one) => one.source === 'kb').map((one) => one.id);
  for (const one of parameters) {
    if (chosen.length >= DEFAULT_CHOSEN) break;
    if (one.source !== 'kb' && one.importance !== 'optional') chosen.push(one.id);
  }
  return parameters.map((one) => one.id).filter((id) => chosen.includes(id));
}

/** The first answers: what the garage bike knows, for the questions that are in the list. */
export function initialAnswers(parameters: GearParameter[], prefill: GearAnswers): GearAnswerMap {
  const answers: GearAnswerMap = {};
  for (const parameter of parameters) {
    const known = parameter.source === 'kb' || parameter.source === 'general' ? prefill[parameter.id as GearParamId] : undefined;
    if (known) answers[parameter.id] = known;
  }
  return answers;
}

function valueOf(parameter: GearParameter, answer: GearAnswerMap[string]): string {
  if (parameter.kind === 'choice') return parameter.options?.find((option) => option.value === answer.value)?.label ?? String(answer.value);
  return `${answer.value}${parameter.unit ? ` ${parameter.unit}` : ''}`;
}

/** The chosen questions with their answers for the prompt; a chosen question without an answer stays in as "help me decide". */
export function promptParameters(parameters: GearParameter[], selected: ReadonlySet<string>, answers: GearAnswerMap): PromptParameter[] {
  return parameters
    .filter((parameter) => selected.has(parameter.id))
    .map((parameter) => {
      const answer = answers[parameter.id];
      return { label: parameter.label, value: answer ? valueOf(parameter, answer) : null, fromGarage: answer?.fromGarage ?? false };
    });
}
