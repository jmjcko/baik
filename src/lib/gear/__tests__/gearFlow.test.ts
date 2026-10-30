import { describe, it, expect, vi, beforeEach } from 'vitest';
import { translations } from '@/lib/i18n/translations';
import { DEFAULT_PROFILE } from '@/lib/profile/values';
import { DEFAULT_CARE } from '@/types/maintain';
import type { ResearchResult } from '../research';
import { gearReducer, initialState, type GearState, type Loaded } from '../gearState';
import { loadParameters } from '../loadParameters';
import { DEFAULT_CHOSEN, buildParameters, defaultSelection, initialAnswers, kbParameter, promptParameters } from '../parameters';

const research = vi.fn();
vi.mock('@/app/actions/researchGearParameters', () => ({ researchGearParameters: (...args: unknown[]) => research(...args) }));

const t = translations.en;
const ai = (id: string, name: string, over: Record<string, unknown> = {}) => ({ id, name, importance: 'recommended', rationale: `${name} matters.`, suggestedValues: [] as string[], multi: false, ...over });
const found: ResearchResult = {
  productTitle: 'Road bar tape',
  category: 'barTape',
  parameters: [
    ai('ai_thickness_0', 'Thickness', { importance: 'mandatory', suggestedValues: ['2 mm', '3 mm', '4 mm'], multi: true }),
    ai('ai_material_1', 'Material'),
    ai('ai_extra_2', 'Extra', { importance: 'optional' }),
    ai('brands', 'Brands and manufacturers'),
  ] as ResearchResult['parameters'],
};

describe('the parameters of a product', () => {
  it('should put the questions of the knowledge base first, then the research by importance, the brands last', () => {
    const list = buildParameters(t, 'tyres', { ...found, category: 'tyres' });
    expect(list.map((one) => one.id)).toEqual(['rimWidth', 'tyreWidth', 'system', 'priority', 'ai_thickness_0', 'ai_material_1', 'ai_extra_2', 'brands']);
    expect(list.slice(0, 4).every((one) => one.source === 'kb' && one.importance === 'mandatory')).toBe(true);
    expect(list.find((one) => one.id === 'ai_thickness_0')).toMatchObject({ source: 'ai', kind: 'choice', label: 'Thickness', hint: 'Thickness matters.', multi: true, importance: 'mandatory' });
    expect(list.find((one) => one.id === 'ai_material_1')).toMatchObject({ kind: 'text' });
    expect(list.at(-1)).toMatchObject({ id: 'brands', kind: 'brands' });
  });

  it('should not repeat a question of the knowledge base that the research found again, whatever the case or the accents', () => {
    const duplicate: ResearchResult = { ...found, parameters: [ai('ai_cleat_0', 'Cleat System'), ai('ai_foot_1', 'Foot  Width (EU)'), ai('ai_closure_2', 'Closure type'), ai('brands', 'Brands')] as ResearchResult['parameters'] };
    const list = buildParameters(t, 'shoes', duplicate);
    expect(list.map((one) => one.id)).toEqual(['footWidth', 'shoeSize', 'cleat', 'ai_closure_2', 'brands']);
  });

  it('should have the budget and the limits in no list: they are not questions to take off', () => {
    for (const list of [buildParameters(t, 'tyres', found), buildParameters(t, null, null), buildParameters(t, 'tyres', null)]) {
      expect(list.map((one) => one.id)).not.toContain('budget');
      expect(list.map((one) => one.id)).not.toContain('currency');
      expect(list.map((one) => one.id)).not.toContain('constraints');
    }
  });

  it('should fall back to the fixed questions of the category, or to a short general form, without research', () => {
    expect(buildParameters(t, 'tyres', null).map((one) => one.id)).toEqual(['rimWidth', 'tyreWidth', 'system', 'priority', 'discipline', 'terrain', 'usage', 'brands']);
    expect(buildParameters(t, null, null).map((one) => one.id)).toEqual(['usage', 'terrain', 'brands']);
    expect(buildParameters(t, 'tyres', null).find((one) => one.id === 'brands')).toMatchObject({ source: 'general', kind: 'brands' });
  });

  it('should choose the pinned and the important questions at the start, eight at most, and leave the optional ones out', () => {
    const list = buildParameters(t, 'tyres', found);
    expect(defaultSelection(list)).toEqual(['rimWidth', 'tyreWidth', 'system', 'priority', 'ai_thickness_0', 'ai_material_1', 'brands']);
    const many: ResearchResult = { ...found, parameters: Array.from({ length: 11 }, (_, i) => ai(`ai_p${i}_${i}`, `Criterion number ${i}`)) as ResearchResult['parameters'] };
    const chosen = defaultSelection(buildParameters(t, 'tyres', many));
    expect(chosen).toHaveLength(DEFAULT_CHOSEN);
    expect(chosen.slice(0, 4)).toEqual(['rimWidth', 'tyreWidth', 'system', 'priority']);
  });

  it('should fill in from the garage only the questions that are in the list', () => {
    const prefill = { system: { value: 'tubeless', fromGarage: true }, barWidth: { value: 420, fromGarage: true } };
    expect(initialAnswers(buildParameters(t, 'tyres', null), prefill)).toEqual({ system: prefill.system });
  });

  it('should write the chosen questions with the labels of the answers, and leave out what is not chosen', () => {
    const list = buildParameters(t, 'tyres', found);
    const answers = { system: { value: 'tubeless', fromGarage: true }, rimWidth: { value: 21, fromGarage: false }, ai_thickness_0: { value: '2 mm, 3 mm', fromGarage: false } };
    const chosen = new Set(['system', 'rimWidth', 'ai_thickness_0', 'ai_material_1']);
    expect(promptParameters(list, chosen, answers)).toEqual([
      { label: t.gear.params.rimWidth.label, value: '21 mm', fromGarage: false },
      { label: t.gear.params.system.label, value: 'Tubeless', fromGarage: true },
      { label: 'Thickness', value: '2 mm, 3 mm', fromGarage: false },
      { label: 'Material', value: null, fromGarage: false },
    ]);
    expect(kbParameter(t, 'speeds').options?.map((option) => option.label)).toEqual(['8 to 10 speed', '11 to 12 speed']);
  });
});

describe('loadParameters', () => {
  beforeEach(() => research.mockReset());
  const input = { t, locale: 'en' as const, values: { ...DEFAULT_PROFILE, care: { ...DEFAULT_CARE, tubeless: true } }, query: 'bar tape' };

  it('should send only the text, the language, the discipline and the names of the pinned questions, and take the title and the category of the research', async () => {
    research.mockResolvedValue({ success: true, result: found });
    const loaded = await loadParameters(input);
    expect(research).toHaveBeenCalledWith({ query: 'bar tape', locale: 'en', discipline: 'road', known: [] });
    expect(loaded).toMatchObject({ title: 'Road bar tape', category: 'barTape', fallback: null });
    expect(loaded.selected).toEqual(defaultSelection(loaded.parameters));
  });

  it('should send "mtb" for a mountain bike, keep the category the rider picked and tell the research what is asked anyway', async () => {
    research.mockResolvedValue({ success: true, result: { ...found, category: 'tyres' } });
    const loaded = await loadParameters({ ...input, values: { ...input.values, discipline: 'xc_mtb' }, picked: 'chain' });
    expect(research).toHaveBeenCalledWith({ query: 'bar tape', locale: 'en', discipline: 'mtb', known: [t.gear.params.speeds.label, t.gear.params.groupset.label, t.gear.params.chainWear.label] });
    expect(loaded.category).toBe('chain');
  });

  it.each(['not_configured', 'rate_limited', 'out_of_scope', 'unavailable', 'unreadable'])('should show the standard questions and keep the reason when the research says %s', async (error) => {
    research.mockResolvedValue({ success: false, error });
    const loaded = await loadParameters(input);
    expect(loaded.fallback).toBe(error);
    expect(loaded.title).toBe('bar tape');
    expect(loaded.parameters.every((one) => one.source === 'kb' || one.source === 'general')).toBe(true);
  });
});

describe('the state of the wizard', () => {
  const list = buildParameters(t, null, found);
  const loaded: Loaded = { title: 'Road bar tape', category: 'barTape', parameters: list, selected: defaultSelection(list), answers: {}, fallback: null };
  const ready = (): GearState => gearReducer(gearReducer(initialState('en'), { type: 'loading' }), { type: 'loaded', loaded });

  it('should start with the first currency of the language: the euro in English, the crown in Czech', () => {
    expect(initialState('en').currency).toBe('eur');
    expect(initialState('cs').currency).toBe('czk');
  });

  it('should go to step two while loading and choose the important questions when they are loaded', () => {
    expect(gearReducer(initialState('en'), { type: 'loading' })).toMatchObject({ status: 'loading', step: 1 });
    expect(ready()).toMatchObject({ status: 'ready', selected: loaded.selected, baseSelected: loaded.selected, base: list });
  });

  it('should toggle, remove with its answer, add a criterion of its own, and reset the list and the choice', () => {
    let state = gearReducer(ready(), { type: 'answer', id: 'ai_thickness_0', answer: { value: '3 mm', fromGarage: false } });
    state = gearReducer(state, { type: 'toggle', id: 'ai_extra_2' });
    expect(state.selected).toContain('ai_extra_2');
    state = gearReducer(state, { type: 'toggle', id: 'ai_material_1' });
    expect(state.selected).not.toContain('ai_material_1');
    state = gearReducer(state, { type: 'remove', id: 'ai_thickness_0' });
    expect(state.parameters.map((one) => one.id)).not.toContain('ai_thickness_0');
    expect(state.answers).toEqual({});
    state = gearReducer(state, { type: 'add', parameter: { id: 'custom_1', source: 'custom', kind: 'text', importance: 'recommended', label: 'Width', hint: '' } });
    expect(state.selected).toContain('custom_1');
    expect(gearReducer(state, { type: 'reset' })).toMatchObject({ parameters: list, selected: loaded.selected });
  });

  it('should keep the budget, the currency and the notes apart from the questions, and take an answer back when it is cleared', () => {
    let state = gearReducer(ready(), { type: 'budget', budget: '150' });
    state = gearReducer(state, { type: 'currency', currency: 'usd' });
    state = gearReducer(state, { type: 'notes', notes: 'Two year warranty' });
    expect(state).toMatchObject({ budget: '150', currency: 'usd', notes: 'Two year warranty' });
    expect(gearReducer(state, { type: 'reset' })).toMatchObject({ budget: '150', notes: 'Two year warranty' });
    const answered = gearReducer(ready(), { type: 'answer', id: 'x', answer: { value: 1, fromGarage: false } });
    expect(gearReducer(answered, { type: 'answer', id: 'x', answer: null }).answers).toEqual({});
    expect(gearReducer(initialState('en'), { type: 'query', query: 'x' }).query).toBe('x');
    expect(gearReducer(initialState('en'), { type: 'step', step: 3 }).step).toBe(3);
  });
});
