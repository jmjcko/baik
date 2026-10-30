import type { Translations } from '@/lib/i18n/translations';
import { PARAMS, TAXONOMY, paramsOf } from '@/types/gearTaxonomy';
import { GEAR_OPTIONS, type ChoiceParamId, type GearAnswers, type GearCategoryId, type GearParamId } from '@/types/gearTypes';

/** The body of the rider as far as the prompt may carry it. */
export interface LukeRider {
  heightCm: number;
  riderWeightKg: number;
  inseamMm: number;
  acromionWidthMm: number;
}

/** The parameters of the active garage bike as far as the prompt may carry them. */
export interface LukeBike {
  discipline: 'road' | 'gravel' | 'mtb';
  crankLengthMm: number;
  barWidthMm: number | null;
  speeds: (typeof GEAR_OPTIONS.speeds)[number];
  tubeless: boolean;
  trainer: boolean;
}

export interface LukeInput {
  category: GearCategoryId;
  answers: GearAnswers;
  rider: LukeRider;
  bike: LukeBike;
  /** What the rider allows the text to carry. */
  include: { rider: boolean; bike: boolean };
}

const section = (title: string, lines: string[]): string => [`## ${title}`, ...lines].join('\n');

function riderLines(t: Translations, rider: LukeRider): string[] {
  const l = t.gearKb.prompt.labels;
  return [
    `- ${l.height}: ${rider.heightCm} cm`,
    `- ${l.weight}: ${rider.riderWeightKg} kg`,
    `- ${l.inseam}: ${rider.inseamMm} mm`,
    `- ${l.acromion}: ${rider.acromionWidthMm} mm`,
  ];
}

function bikeLines(t: Translations, bike: LukeBike): string[] {
  const l = t.gearKb.prompt.labels;
  const yesNo = (value: boolean) => (value ? l.yes : l.no);
  return [
    `- ${l.discipline}: ${t.gear.options.discipline[bike.discipline]}`,
    `- ${l.crank}: ${bike.crankLengthMm} mm`,
    ...(bike.barWidthMm === null ? [] : [`- ${l.barWidth}: ${bike.barWidthMm} mm`]),
    `- ${l.speeds}: ${t.gear.options.speeds[bike.speeds]}`,
    `- ${l.system}: ${t.gear.options.system[bike.tubeless ? 'tubeless' : 'tube']}`,
    `- ${l.trainer}: ${yesNo(bike.trainer)}`,
  ];
}

/** One answer as "question: answer", with its unit, the currency of the budget or the label of the chosen card. */
export function describeAnswer(t: Translations, id: GearParamId, value: string | number, answers: GearAnswers): string {
  const param = PARAMS[id];
  const label = t.gear.params[id].label;
  if (param.kind === 'choice') return `${label}: ${t.gear.options[id as ChoiceParamId][value as never]}`;
  if (id === 'budget') {
    const currency = answers.currency?.value;
    return `${label}: ${value}${currency ? ` ${t.gear.options.currency[currency as 'czk']}` : ''}`;
  }
  return `${label}: ${value}${param.unit ? ` ${param.unit}` : ''}`;
}

/** The questions the rider answered, in the order they were asked; what came unchanged from the garage is left out when the bike data is not shared. */
function answerLines(t: Translations, input: LukeInput): string[] {
  return paramsOf(input.category).flatMap((id) => {
    const answer = input.answers[id];
    if (!answer || id === 'currency') return [];
    if (answer.fromGarage && !input.include.bike) return [];
    return [`- ${describeAnswer(t, id, answer.value, input.answers)}`];
  });
}

function knowledgeLines(t: Translations, category: GearCategoryId): string[] {
  const rules = TAXONOMY[category].insights.map((id, index) => `${index + 1}. ${t.gearKb.insights[id].title}: ${t.gearKb.insights[id].body} (${t.gearKb.insights[id].source})`);
  return rules.length > 0 ? rules : [t.gearKb.prompt.noKnowledge];
}

/**
 * Luke, the cycling expert of bAIkgear: a pure function that writes the master prompt for the rider's own AI chatbot.
 * It calls no model and sends nothing; the rider copies the text. The rules come from the bAIk knowledge bases.
 */
export function buildMasterPrompt(t: Translations, input: LukeInput): string {
  const p = t.gearKb.prompt;
  const h = p.headings;
  const answers = answerLines(t, input);
  const parts = [
    `# ${t.gear.title}`,
    section(h.role, [p.role]),
    section(h.mission, [p.mission]),
    section(h.category, [t.gear.categories[input.category]]),
    section(h.rider, input.include.rider ? riderLines(t, input.rider) : [p.riderHidden]),
    section(h.bike, input.include.bike ? bikeLines(t, input.bike) : [p.bikeHidden]),
    section(h.answers, answers.length > 0 ? answers : [t.gear.prompt.noAnswers]),
    section(h.knowledge, knowledgeLines(t, input.category)),
    section(h.guardrails, p.guardrails.map((rule, index) => `${index + 1}. ${rule}`)),
    section(h.task, p.task.map((line) => `- ${line}`)),
    section(h.format, p.format.map((line) => `- ${line}`)),
  ];
  return parts.join('\n\n');
}
