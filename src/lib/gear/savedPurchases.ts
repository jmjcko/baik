import { CURRENCIES, type CurrencyId, type GearAnswerMap, type GearCategoryId, type GearParameter } from '@/types/gearTypes';
import { STEP_COUNT, type GearState } from './gearState';

/** The most unfinished and finished purchases one rider keeps. */
export const MAX_PURCHASES = 10;

/**
 * One purchase of the rider: what the wizard holds (the product, the questions as they were prepared and chosen, the answers, the budget and the notes) and where the rider stopped.
 * Never the body or the bike: those come from the garage when the prompt is written.
 */
export interface SavedPurchase {
  id: string;
  title: string;
  query: string;
  category: GearCategoryId | null;
  step: number;
  base: GearParameter[];
  parameters: GearParameter[];
  selected: string[];
  baseSelected: string[];
  answers: GearAnswerMap;
  budget: string;
  currency: CurrencyId;
  notes: string;
  /** `open` is a purchase in progress, `done` one the rider finished. */
  status: 'open' | 'done';
  updatedAt: string;
}

/** The purchase of a wizard state; the same `id` overwrites the earlier save of it. */
export function purchaseFromState(id: string, state: GearState, now: string, status: SavedPurchase['status'] = 'open'): SavedPurchase {
  const { step, query, title, category, base, parameters, selected, baseSelected, answers, budget, currency, notes } = state;
  return { id, title, query, category, step, base, parameters, selected, baseSelected, answers, budget, currency, notes, status, updatedAt: now };
}

/** The wizard state a saved purchase goes back to (the questions are ready, no research is needed again). */
export function stateFromPurchase(purchase: SavedPurchase): GearState {
  const { step, query, title, category, base, parameters, selected, baseSelected, answers, budget, currency, notes } = purchase;
  return { step, query, title, category, base, parameters, selected, baseSelected, answers, budget, currency, notes, status: 'ready', fallback: null };
}

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const isText = (value: unknown, max = 400): value is string => typeof value === 'string' && value.length <= max;
const isTexts = (value: unknown): value is string[] => Array.isArray(value) && value.length <= 80 && value.every((one) => isText(one, 120));
const isParameters = (value: unknown): value is GearParameter[] => Array.isArray(value) && value.length <= 60 && value.every((one) => isObject(one) && isText(one.id, 120) && isText(one.label, 200) && isText(one.hint, 600));

function isAnswers(value: unknown): value is GearAnswerMap {
  return isObject(value) && Object.keys(value).length <= 80 && Object.values(value).every((one) => isObject(one) && (isText(one.value, 400) || typeof one.value === 'number') && typeof one.fromGarage === 'boolean');
}

const CURRENCY_IDS = new Set<string>(Object.values(CURRENCIES).flat());

/** A stored purchase checked field by field; anything that does not fit is dropped, so a damaged or foreign document never reaches the wizard. */
export function parsePurchase(raw: unknown): SavedPurchase | null {
  if (!isObject(raw)) return null;
  const ok = isText(raw.id, 80) && raw.id !== '' && isText(raw.title, 200) && isText(raw.query, 200) && (raw.category === null || isText(raw.category, 60))
    && Number.isInteger(raw.step) && (raw.step as number) >= 0 && (raw.step as number) < STEP_COUNT
    && isParameters(raw.base) && isParameters(raw.parameters) && isTexts(raw.selected) && isTexts(raw.baseSelected) && isAnswers(raw.answers)
    && isText(raw.budget, 20) && isText(raw.currency, 10) && CURRENCY_IDS.has(raw.currency as string) && isText(raw.notes, 400)
    && (raw.status === 'open' || raw.status === 'done') && isText(raw.updatedAt, 40) && !Number.isNaN(Date.parse(raw.updatedAt as string));
  return ok ? (raw as unknown as SavedPurchase) : null;
}

/** The purchases of a stored list, newest first; entries that cannot be read are left out and the rest is cut to the limit. */
export function parsePurchases(raw: unknown): SavedPurchase[] {
  if (!Array.isArray(raw)) return [];
  return sortNewest(raw.map(parsePurchase).filter((one): one is SavedPurchase => one !== null)).slice(0, MAX_PURCHASES);
}

export const sortNewest = (list: SavedPurchase[]): SavedPurchase[] => [...list].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));

/** Whether a save of this id fits: it replaces one of the list, or the list has room. */
export const canSave = (list: SavedPurchase[], id: string): boolean => list.some((one) => one.id === id) || list.length < MAX_PURCHASES;

/** The list with the purchase added or replaced (newest first); the same list when it does not fit. */
export function withPurchase(list: SavedPurchase[], purchase: SavedPurchase): SavedPurchase[] {
  return canSave(list, purchase.id) ? sortNewest([...list.filter((one) => one.id !== purchase.id), purchase]) : list;
}

export const withoutPurchase = (list: SavedPurchase[], id: string): SavedPurchase[] => list.filter((one) => one.id !== id);

/** The device and the account together: the same id keeps the later update, the list is cut to the newest ten. */
export function mergePurchases(device: SavedPurchase[], account: SavedPurchase[]): SavedPurchase[] {
  const byId = new Map<string, SavedPurchase>();
  for (const one of [...device, ...account]) {
    const known = byId.get(one.id);
    if (!known || Date.parse(one.updatedAt) > Date.parse(known.updatedAt)) byId.set(one.id, one);
  }
  return sortNewest([...byId.values()]).slice(0, MAX_PURCHASES);
}

/** A new id for a purchase. */
export const newPurchaseId = (now: number = Date.now()): string => `p${now.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
