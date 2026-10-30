import { describe, it, expect } from 'vitest';
import { translations, type Locale } from '@/lib/i18n/translations';
import { DEFAULT_PROFILE } from '@/lib/profile/values';
import { DEFAULT_CARE } from '@/types/maintain';
import { GEAR_CATEGORIES, GEAR_GROUPS, GEAR_PARAMS, GEAR_INSIGHTS, type GearAnswers } from '@/types/gearTypes';
import { PARAMS, TAXONOMY, categoriesOf, isDeep, paramsOf } from '@/types/gearTaxonomy';
import { buildMasterPrompt, type LukeInput } from '../lukeCykloAgent';
import { lukeContext, prefillAnswers } from '../gearPrefill';

const EMOJI = /\p{Extended_Pictographic}/u;

describe('the taxonomy of bAIkgear', () => {
  it('should hold thirty categories in five groups, none of them an e-bike or a city bike', () => {
    expect(GEAR_GROUPS).toHaveLength(5);
    expect(GEAR_CATEGORIES).toHaveLength(30);
    expect(GEAR_GROUPS.flatMap((group) => categoriesOf(group))).toHaveLength(30);
    expect(GEAR_CATEGORIES.join(' ')).not.toMatch(/ebike|e-bike|city|urban/i);
    expect(categoriesOf('bikes').map((one) => one.id)).toEqual(['roadBike', 'gravelBike', 'mtbHardtail', 'mtbFull']);
  });

  it('should cover the eight areas of the knowledge bases in depth, and give the other categories the general form', () => {
    const deep = GEAR_CATEGORIES.filter(isDeep);
    expect(deep).toEqual(['cassette', 'chain', 'cranks', 'brakeRotors', 'brakePads', 'tyres', 'handlebars', 'saddles', 'shoes', 'radar']);
    expect(paramsOf('barTape')).toEqual(['discipline', 'terrain', 'usage', 'budget', 'currency', 'brands', 'constraints']);
  });

  it('should ask the questions of a category first and then the general form, without repeating one', () => {
    expect(paramsOf('tyres')).toEqual(['rimWidth', 'tyreWidth', 'system', 'priority', 'discipline', 'terrain', 'usage', 'budget', 'currency', 'brands', 'constraints']);
    expect(paramsOf('shoes')).toEqual(['footWidth', 'shoeSize', 'cleat', 'usage', 'budget', 'currency', 'brands', 'constraints']);
    for (const id of GEAR_CATEGORIES) expect(new Set(paramsOf(id)).size).toBe(paramsOf(id).length);
  });

  it('should define every question and every rule that a category uses', () => {
    for (const id of GEAR_PARAMS) expect(PARAMS[id]).toBeDefined();
    for (const id of GEAR_CATEGORIES) for (const insight of TAXONOMY[id].insights) expect(GEAR_INSIGHTS).toContain(insight);
  });
});

describe('what the garage fills in', () => {
  it('should take the discipline, the tyre system, the speeds, the cranks, the bar and the chain wear from the bike', () => {
    const values = { ...DEFAULT_PROFILE, discipline: 'xc_mtb' as const, crankLengthMm: 175, currentBarWidthMm: 760, care: { ...DEFAULT_CARE, tubeless: true, drivetrain: '8-10' as const, chainWearPct: 0.6 } };
    const answers = prefillAnswers(values);
    expect(answers.discipline).toEqual({ value: 'mtb', fromGarage: true });
    expect(answers.system).toEqual({ value: 'tubeless', fromGarage: true });
    expect(answers.speeds).toEqual({ value: '8-10', fromGarage: true });
    expect(answers.crankLength).toEqual({ value: 175, fromGarage: true });
    expect(answers.barWidth).toEqual({ value: 760, fromGarage: true });
    expect(answers.chainWear).toEqual({ value: 0.6, fromGarage: true });
  });

  it('should leave out what the bike does not know', () => {
    const answers = prefillAnswers(DEFAULT_PROFILE);
    expect(answers).not.toHaveProperty('barWidth');
    expect(answers).not.toHaveProperty('chainWear');
    expect(answers.system?.value).toBe('tube');
  });
});

describe.each(['en', 'cs'] as Locale[])('Luke, the master prompt (%s)', (locale) => {
  const t = translations[locale];
  const p = t.gearKb.prompt;
  const { rider, bike } = lukeContext({ ...DEFAULT_PROFILE, care: { ...DEFAULT_CARE, tubeless: true } });
  const answers: GearAnswers = {
    rimWidth: { value: 21, fromGarage: false },
    system: { value: 'tubeless', fromGarage: true },
    budget: { value: 3000, fromGarage: false },
    currency: { value: 'czk', fromGarage: false },
  };
  const input = (over: Partial<LukeInput> = {}): LukeInput => ({ category: 'tyres', answers, rider, bike, include: { rider: true, bike: true }, ...over });

  it('should carry the role, the mission, the category, every safety limit and the task', () => {
    const text = buildMasterPrompt(t, input());
    for (const line of [p.role, p.mission, t.gear.categories.tyres, ...p.guardrails, ...p.task, ...p.format]) expect(text).toContain(line);
    for (const heading of Object.values(p.headings)) expect(text).toContain(`## ${heading}`);
  });

  it('should carry the rules of the knowledge base for the category with their sources', () => {
    const text = buildMasterPrompt(t, input());
    for (const id of ['roiTyres', 'pressure', 'tubeless'] as const) {
      expect(text).toContain(t.gearKb.insights[id].title);
      expect(text).toContain(t.gearKb.insights[id].source);
    }
    expect(text).toContain('42 %');
  });

  it('should write the answers with their units and the budget with its currency', () => {
    const text = buildMasterPrompt(t, input());
    expect(text).toContain(`${t.gear.params.rimWidth.label}: 21 mm`);
    expect(text).toContain(`${t.gear.params.budget.label}: 3000 ${t.gear.options.currency.czk}`);
    expect(text).toContain(`${t.gear.params.system.label}: ${t.gear.options.system.tubeless}`);
    expect(text).not.toContain(`${t.gear.params.currency.label}:`);
  });

  it('should carry the body and the bike only when the rider allows it', () => {
    const full = buildMasterPrompt(t, input());
    expect(full).toContain(`${p.labels.weight}: ${rider.riderWeightKg} kg`);
    expect(full).toContain(`${p.labels.crank}: ${bike.crankLengthMm} mm`);
    const noRider = buildMasterPrompt(t, input({ include: { rider: false, bike: true } }));
    expect(noRider).toContain(p.riderHidden);
    expect(noRider).not.toContain(`${rider.heightCm} cm`);
    const noBike = buildMasterPrompt(t, input({ include: { rider: true, bike: false } }));
    expect(noBike).toContain(p.bikeHidden);
    expect(noBike).not.toContain(`${p.labels.crank}:`);
  });

  it('should leave out an answer that came unchanged from the garage when the bike data is not shared, and keep what the rider typed', () => {
    const noBike = buildMasterPrompt(t, input({ include: { rider: true, bike: false } }));
    expect(noBike).not.toContain(`${t.gear.params.system.label}:`);
    expect(noBike).toContain(`${t.gear.params.rimWidth.label}: 21 mm`);
  });

  it('should say that nothing was answered, and that the knowledge base has no rule when it has none', () => {
    const text = buildMasterPrompt(t, input({ category: 'barTape', answers: {} }));
    expect(text).toContain(t.gear.prompt.noAnswers);
    expect(text).toContain(p.noKnowledge);
  });

  it('should forbid e-bikes and the mixing of brake fluids, and have no emoji', () => {
    const text = buildMasterPrompt(t, input({ category: 'brakePads' }));
    expect(p.guardrails.join(' ')).toMatch(/e-kola|e-bikes/);
    expect(p.guardrails.join(' ')).toMatch(/DOT/);
    expect(text).not.toMatch(EMOJI);
    expect(JSON.stringify(t.gear) + JSON.stringify(t.gearKb)).not.toMatch(EMOJI);
  });
});
