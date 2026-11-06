import type { Translations } from '@/lib/i18n/translations';
import { TAXONOMY } from '@/types/gearTaxonomy';
import { GEAR_OPTIONS, type GearCategoryId } from '@/types/gearTypes';
import { rangeText } from '@/lib/engines/baikgear/format';
import type { UpgradeItem } from '@/lib/engines/baikgear/types';

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

/** One question the rider wants weighed: its label, the answer (null when the rider has not decided) and whether the answer came unchanged from the garage. */
export interface PromptParameter {
  label: string;
  value: string | null;
  fromGarage: boolean;
}

export interface LukeInput {
  /** What the rider wants to buy, as the research titled it or as the category is called. */
  productTitle: string;
  /** The category of the taxonomy whose rules of the knowledge bases apply, or null. */
  category: GearCategoryId | null;
  parameters: PromptParameter[];
  /** What the rider wrote for the AI, as typed. */
  notes: string;
  /** The Upgrade Matrix of the bike; it reveals the body and the bike, so the prompt carries it only when the rider shares both. */
  upgrades?: UpgradeItem[];
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

/** The chosen questions; an answer that came unchanged from the garage is left out when the bike data is not shared. */
function parameterLines(t: Translations, input: LukeInput): string[] {
  return input.parameters
    .filter((parameter) => !(parameter.fromGarage && !input.include.bike))
    .map((parameter) => `- ${parameter.label}: ${parameter.value ?? t.gearKb.prompt.undecided}`);
}

function knowledgeLines(t: Translations, category: GearCategoryId | null): string[] {
  const ids = category ? TAXONOMY[category].insights : [];
  const rules = ids.map((id, index) => `${index + 1}. ${t.gearKb.insights[id].title}: ${t.gearKb.insights[id].body} (${t.gearKb.insights[id].source})`);
  return rules.length > 0 ? rules : [t.gearKb.prompt.noKnowledge];
}

/** The Upgrade Matrix as parameters (no products); it is derived from the body and from the bike, so it needs both to be shared. */
function upgradeLines(t: Translations, input: LukeInput): string[] {
  const u = t.upgrade;
  if (!input.upgrades || input.upgrades.length === 0) return [];
  if (!input.include.rider || !input.include.bike) return [u.prompt.hidden];
  const rules = input.upgrades.map((item, index) => `${index + 1}. [${u.tiers[item.tier]}] ${u.items[item.id].title}: ${u.items[item.id].body}${item.range ? ` (${rangeText(item.range)})` : ''}`);
  return [u.prompt.intro, ...rules];
}

/**
 * The master prompt for the rider's own AI chatbot: a pure function that calls no model and sends nothing; the rider copies the text.
 * The rules come from the bAIk knowledge bases. The text does not name its author.
 */
export function buildMasterPrompt(t: Translations, input: LukeInput): string {
  const p = t.gearKb.prompt;
  const h = p.headings;
  const lines = parameterLines(t, input);
  const upgrades = upgradeLines(t, input);
  const parts = [
    `# ${input.productTitle}`,
    section(h.role, [p.role]),
    section(h.mission, [p.mission]),
    section(h.category, [input.productTitle]),
    section(h.rider, input.include.rider ? riderLines(t, input.rider) : [p.riderHidden]),
    section(h.bike, input.include.bike ? bikeLines(t, input.bike) : [p.bikeHidden]),
    section(h.answers, lines.length > 0 ? lines : [t.gear.prompt.noAnswers]),
    ...(input.notes.trim() ? [section(h.notes, [input.notes.trim()])] : []),
    section(h.knowledge, knowledgeLines(t, input.category)),
    ...(upgrades.length > 0 ? [section(t.upgrade.prompt.heading, upgrades)] : []),
    section(h.guardrails, p.guardrails.map((rule, index) => `${index + 1}. ${rule}`)),
    section(h.task, p.task.map((line) => `- ${line}`)),
    section(h.format, p.format.map((line) => `- ${line}`)),
  ];
  return parts.join('\n\n');
}
