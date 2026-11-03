import { describe, it, expect } from 'vitest';
import { initialState, type GearState } from '../gearState';
import { MAX_PURCHASES, canSave, mergePurchases, newPurchaseId, parsePurchase, parsePurchases, purchaseFromState, stateFromPurchase, withPurchase, withoutPurchase, type SavedPurchase } from '../savedPurchases';

const state = (over: Partial<GearState> = {}): GearState => ({
  ...initialState('cs'), step: 2, query: 'radar', status: 'ready', title: 'Radar', category: null,
  base: [{ id: 'a', source: 'ai', kind: 'choice', importance: 'recommended', label: 'Battery', hint: 'h', options: [{ value: '8 h', label: '8 h' }], multi: true }],
  parameters: [{ id: 'a', source: 'ai', kind: 'choice', importance: 'recommended', label: 'Battery', hint: 'h', options: [{ value: '8 h', label: '8 h' }], multi: true }],
  selected: ['a'], baseSelected: ['a'], answers: { a: { value: '8 h', fromGarage: false } }, budget: '4000', notes: 'reliability', ...over,
});
const at = (day: number) => `2026-11-${String(day).padStart(2, '0')}T10:00:00.000Z`;
const purchase = (id: string, day: number, over: Partial<SavedPurchase> = {}): SavedPurchase => ({ ...purchaseFromState(id, state(), at(day)), ...over });

describe('the saved purchases', () => {
  it('should go from the wizard state to a purchase and back without losing the questions, the answers, the budget, the notes or the step', () => {
    const saved = purchaseFromState('p1', state(), at(3));
    expect(saved).toMatchObject({ id: 'p1', status: 'open', step: 2, budget: '4000', notes: 'reliability', updatedAt: at(3) });
    expect(stateFromPurchase(saved)).toEqual(state());
  });

  it('should keep only what the rider wrote and chose: no body and no bike data in a purchase', () => {
    const keys = Object.keys(purchaseFromState('p1', state(), at(3))).sort();
    expect(keys).toEqual(['answers', 'base', 'baseSelected', 'budget', 'category', 'currency', 'id', 'notes', 'parameters', 'query', 'selected', 'status', 'step', 'title', 'updatedAt']);
  });

  it('should read a good purchase and refuse a damaged one, a foreign one and one with a wrong step, currency or status', () => {
    const good = purchase('p1', 3);
    expect(parsePurchase(JSON.parse(JSON.stringify(good)))).toEqual(good);
    for (const bad of [null, 'x', [], {}, { ...good, step: 9 }, { ...good, step: 1.5 }, { ...good, currency: 'gbp' }, { ...good, status: 'archived' }, { ...good, updatedAt: 'yesterday' }, { ...good, answers: { a: { value: { x: 1 }, fromGarage: false } } }, { ...good, id: '' }]) expect(parsePurchase(bad)).toBeNull();
  });

  it('should read a stored list newest first, leave out what cannot be read and cut it to ten', () => {
    const many = Array.from({ length: 12 }, (_, i) => purchase(`p${i}`, i + 1));
    const list = parsePurchases([...many, { broken: true }]);
    expect(list).toHaveLength(MAX_PURCHASES);
    expect(list[0].id).toBe('p11');
    expect(parsePurchases('nope')).toEqual([]);
  });

  it('should add or replace a purchase and refuse an eleventh new one, while a purchase that is already there can still be changed', () => {
    let list: SavedPurchase[] = [];
    for (let i = 0; i < MAX_PURCHASES; i++) list = withPurchase(list, purchase(`p${i}`, i + 1));
    expect(list).toHaveLength(10);
    expect(canSave(list, 'new')).toBe(false);
    expect(withPurchase(list, purchase('new', 20))).toBe(list);
    expect(canSave(list, 'p3')).toBe(true);
    const changed = withPurchase(list, purchase('p3', 25, { notes: 'later' }));
    expect(changed).toHaveLength(10);
    expect(changed[0]).toMatchObject({ id: 'p3', notes: 'later' });
    expect(withoutPurchase(list, 'p3')).toHaveLength(9);
  });

  it('should merge the device and the account by the later update of each purchase, and keep the newest ten', () => {
    const device = [purchase('a', 5, { notes: 'device' }), purchase('b', 2)];
    const account = [purchase('a', 4, { notes: 'account' }), purchase('c', 3)];
    const merged = mergePurchases(device, account);
    expect(merged.map((one) => one.id)).toEqual(['a', 'c', 'b']);
    expect(merged[0].notes).toBe('device');
    expect(mergePurchases([purchase('a', 4, { notes: 'device' })], [purchase('a', 6, { notes: 'account' })])[0].notes).toBe('account');
    const big = mergePurchases(Array.from({ length: 8 }, (_, i) => purchase(`d${i}`, i + 1)), Array.from({ length: 8 }, (_, i) => purchase(`r${i}`, i + 10)));
    expect(big).toHaveLength(10);
    expect(big[0].id).toBe('r7');
  });

  it('should make ids that differ', () => {
    expect(newPurchaseId(1)).not.toBe(newPurchaseId(1));
  });
});
