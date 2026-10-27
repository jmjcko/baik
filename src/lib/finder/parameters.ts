import type { RidingDiscipline } from '@/types/baikfit';

/** The three kinds of bike the finder knows; mountain bikes (full suspension and hardtail) are one kind. */
export const FINDER_CATEGORIES = ['road', 'gravel', 'mtb'] as const;
export type FinderCategory = (typeof FINDER_CATEGORIES)[number];

export const categoryOf = (discipline: RidingDiscipline | undefined): FinderCategory =>
  discipline === 'gravel' ? 'gravel' : discipline === 'xc_mtb' ? 'mtb' : 'road';

/** What a question asks: one option, several options, or a short free text. */
export type ParameterKind = 'single' | 'multi' | 'text';

/**
 * The options of every question (the keys; the words are in the dictionaries). A question the rider profile already answers
 * (height, inseam, shoulders, discipline, riding style, pains) is not here.
 */
export const PARAMETER_OPTIONS = {
  road_type: ['endurance', 'allround', 'race', 'aero'],
  gravel_use: ['fast', 'adventure', 'mixed'],
  mtb_type: ['xc_race', 'marathon', 'trail'],
  suspension: ['hardtail', 'full', 'either'],
  wheel_size: ['w29', 'w275', 'mullet', 'any'],
  shifting: ['mechanical', 'electronic', 'any'],
  groupset_brand: ['shimano', 'sram', 'any'],
  drivetrain: ['one_by', 'two_by', 'any'],
  brakes: ['hydraulic_disc', 'mechanical_disc', 'any'],
  material: ['carbon', 'aluminium', 'steel_titanium', 'any'],
  wheels: ['alloy', 'carbon_mid', 'carbon_deep', 'any'],
  tyres_road: ['up_to_28', 'c30_32', 'c35_plus'],
  tyres_gravel: ['c40', 'c45', 'c50_plus'],
  mounts: ['bags', 'fenders', 'rack', 'none'],
  dropper: ['yes', 'no', 'any'],
  budget: ['entry', 'mid', 'high', 'top', 'open'],
  colour: [],
  brands_preferred: [],
  brands_excluded: [],
} as const;

export type FinderParameterId = keyof typeof PARAMETER_OPTIONS;

const KIND_OF: Partial<Record<FinderParameterId, ParameterKind>> = {
  mounts: 'multi',
  colour: 'text',
  brands_preferred: 'text',
  brands_excluded: 'text',
};

export const kindOf = (id: FinderParameterId): ParameterKind => KIND_OF[id] ?? 'single';

/** The questions of each kind of bike, in the order they are asked (what the bike is for first, the brands last). */
export const CATEGORY_PARAMETERS: Record<FinderCategory, readonly FinderParameterId[]> = {
  road: ['road_type', 'shifting', 'groupset_brand', 'brakes', 'material', 'wheels', 'tyres_road', 'mounts', 'budget', 'colour', 'brands_preferred', 'brands_excluded'],
  gravel: ['gravel_use', 'shifting', 'groupset_brand', 'drivetrain', 'brakes', 'material', 'tyres_gravel', 'mounts', 'budget', 'colour', 'brands_preferred', 'brands_excluded'],
  mtb: ['mtb_type', 'suspension', 'wheel_size', 'shifting', 'groupset_brand', 'material', 'dropper', 'budget', 'colour', 'brands_preferred', 'brands_excluded'],
};

/** The answers: the chosen option keys, or the one free text of a text question. A question that is not there is not answered. */
export type FinderAnswers = Partial<Record<FinderParameterId, string[]>>;

export const MAX_TEXT_ANSWER = 120;

/** A free text as plain data: control characters out, one line, bounded. */
export const cleanText = (value: unknown, max: number = MAX_TEXT_ANSWER): string =>
  typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f<>`]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '';

/** The answers that belong to the kind of bike and are valid (a known option, or a clean text); anything else is dropped. */
export function sanitizeAnswers(category: FinderCategory, raw: unknown): FinderAnswers {
  const source = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  const answers: FinderAnswers = {};
  for (const id of CATEGORY_PARAMETERS[category]) {
    const value = source[id];
    if (!Array.isArray(value)) continue;
    const kind = kindOf(id);
    const allowed: readonly string[] = PARAMETER_OPTIONS[id];
    const picked = kind === 'text' ? [cleanText(value[0])].filter(Boolean) : [...new Set(value.filter((v): v is string => typeof v === 'string' && allowed.includes(v)))];
    if (picked.length > 0) answers[id] = kind === 'single' ? picked.slice(0, 1) : picked;
  }
  return answers;
}
