import { describe, it, expect } from 'vitest';
import { translations, type Locale } from '@/lib/i18n/translations';
import { DEFAULT_PROFILE } from '@/lib/profile/values';
import { DEFAULT_CARE } from '@/types/maintain';
import { GEAR_CATEGORIES, GEAR_GROUPS, GEAR_PARAMS, GEAR_INSIGHTS } from '@/types/gearTypes';
import { PARAMS, POPULAR_CATEGORIES, TAXONOMY, categoriesOf, isDeep, paramsOf } from '@/types/gearTaxonomy';
import { buildMasterPrompt, type LukeInput } from '../lukeCykloAgent';
import { lukeContext, prefillAnswers } from '../gearPrefill';

const EMOJI = /\p{Extended_Pictographic}/u;

describe('the taxonomy of bAIkgear', () => {
  it('should hold what the bike shops sell for road, gravel and mountain bikes in seven groups, with no e-bike, kids or city bike', () => {
    expect(GEAR_GROUPS).toHaveLength(7);
    expect(GEAR_CATEGORIES).toHaveLength(66);
    expect(new Set(GEAR_CATEGORIES).size).toBe(66);
    expect(GEAR_GROUPS.flatMap((group) => categoriesOf(group))).toHaveLength(66);
    expect(GEAR_CATEGORIES.join(' ')).not.toMatch(/ebike|e-bike|city|urban|kids|bmx|trailer/i);
    expect(categoriesOf('bikes').map((one) => one.id)).toEqual(['roadBike', 'gravelBike', 'mtbHardtail', 'mtbFull']);
  });

  it('should cover what the shops list: shifting, cockpit, suspension, bags, locks, carriers, apparel, nutrition and maintenance', () => {
    for (const id of ['derailleurs', 'shifters', 'stem', 'seatpost', 'suspension', 'bags', 'locks', 'carCarriers', 'jerseys', 'socks', 'lubricants', 'workstand', 'nutrition', 'drinks'] as const) expect(GEAR_CATEGORIES).toContain(id);
    expect(POPULAR_CATEGORIES.every((id) => GEAR_CATEGORIES.includes(id))).toBe(true);
  });

  it('should cover the areas of the knowledge bases in depth, and give the other categories the general form', () => {
    expect(GEAR_CATEGORIES.filter(isDeep)).toEqual(['cassette', 'chain', 'cranks', 'brakeRotors', 'brakePads', 'tyres', 'handlebars', 'saddles', 'shoes', 'radar']);
    expect(paramsOf('barTape')).toEqual(['discipline', 'terrain', 'usage', 'brands']);
  });

  it('should ask the questions of a category first and then the general form, without repeating one', () => {
    expect(paramsOf('tyres')).toEqual(['rimWidth', 'tyreWidth', 'system', 'priority', 'discipline', 'terrain', 'usage', 'brands']);
    expect(paramsOf('shoes')).toEqual(['footWidth', 'shoeSize', 'cleat', 'usage', 'brands']);
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

describe.each(['en', 'cs'] as Locale[])('the master prompt (%s)', (locale) => {
  const t = translations[locale];
  const p = t.gearKb.prompt;
  const { rider, bike } = lukeContext({ ...DEFAULT_PROFILE, care: { ...DEFAULT_CARE, tubeless: true } });
  const parameters = [
    { label: 'Thickness', value: '3 mm', fromGarage: false },
    { label: 'Tyre system', value: 'Tubeless', fromGarage: true },
    { label: 'Material', value: null, fromGarage: false },
  ];
  const input = (over: Partial<LukeInput> = {}): LukeInput => ({ productTitle: 'Road bar tape', category: 'barTape', parameters, notes: '', rider, bike, include: { rider: true, bike: true }, ...over });

  it('should carry the role, the mission, the product, every safety limit and the task', () => {
    const text = buildMasterPrompt(t, input());
    for (const line of [p.role, p.mission, '# Road bar tape', ...p.guardrails, ...p.task, ...p.format]) expect(text).toContain(line);
    for (const [key, heading] of Object.entries(p.headings)) if (key !== 'notes') expect(text).toContain(`## ${heading}`);
  });

  it('should not name its author anywhere in the text', () => {
    expect(buildMasterPrompt(t, input())).not.toMatch(/luke/i);
    expect(JSON.stringify(t.gearKb)).not.toMatch(/luke/i);
  });

  it('should carry the rules of the knowledge base for the category with their sources, and none without one', () => {
    const text = buildMasterPrompt(t, input({ productTitle: 'Tyres', category: 'tyres' }));
    for (const id of ['roiTyres', 'pressure', 'tubeless'] as const) {
      expect(text).toContain(t.gearKb.insights[id].title);
      expect(text).toContain(t.gearKb.insights[id].source);
    }
    expect(text).toContain('42 %');
    expect(buildMasterPrompt(t, input({ category: null }))).toContain(p.noKnowledge);
  });

  it('should write the chosen parameters with their answers, and ask the chatbot to help with the ones that are not decided', () => {
    const text = buildMasterPrompt(t, input());
    expect(text).toContain('- Thickness: 3 mm');
    expect(text).toContain(`- Material: ${p.undecided}`);
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
    expect(noBike).not.toContain('- Tyre system:');
    expect(noBike).toContain('- Thickness: 3 mm');
  });

  it('should carry the notes of the rider as typed in their own section, and have no section when there are none', () => {
    const withNotes = buildMasterPrompt(t, input({ notes: ' A warranty of two years is a must. ' }));
    expect(withNotes).toContain(`## ${p.headings.notes}\nA warranty of two years is a must.`);
    expect(buildMasterPrompt(t, input())).not.toContain(`## ${p.headings.notes}`);
  });

  it('should say that nothing was chosen, and forbid e-bikes and the mixing of brake fluids, with no emoji', () => {
    const empty = buildMasterPrompt(t, input({ parameters: [] }));
    expect(empty).toContain(t.gear.prompt.noAnswers);
    expect(p.guardrails.join(' ')).toMatch(/e-kola|e-bikes/);
    expect(p.guardrails.join(' ')).toMatch(/DOT/);
    expect(empty).not.toMatch(EMOJI);
    expect(JSON.stringify(t.gear) + JSON.stringify(t.gearKb)).not.toMatch(EMOJI);
  });
});
