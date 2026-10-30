import { CURRENCIES, type CurrencyId, type GearAnswer, type GearAnswerMap, type GearCategoryId, type GearParameter } from '@/types/gearTypes';
import type { ResearchErrorCode } from '@/app/actions/researchGearParameters';

export const STEP_COUNT = 5;

export interface GearState {
  step: number;
  query: string;
  status: 'idle' | 'loading' | 'ready';
  /** Why the standard questions are shown instead of the research; null when the research worked. */
  fallback: ResearchErrorCode | null;
  title: string;
  category: GearCategoryId | null;
  /** The list as it was prepared, so that the rider can reset it. */
  base: GearParameter[];
  parameters: GearParameter[];
  selected: string[];
  /** The questions chosen at the start, for the reset. */
  baseSelected: string[];
  answers: GearAnswerMap;
  /** The budget as typed (a number or empty), its currency and the notes for the AI; none of them is a question of the list. */
  budget: string;
  currency: CurrencyId;
  notes: string;
}

/** The first state; the currency starts as the first of the language (the crown in Czech, the euro in English). */
export const initialState = (locale: 'en' | 'cs'): GearState => ({ step: 0, query: '', status: 'idle', fallback: null, title: '', category: null, base: [], parameters: [], selected: [], baseSelected: [], answers: {}, budget: '', currency: CURRENCIES[locale][0], notes: '' });

export interface Loaded {
  title: string;
  category: GearCategoryId | null;
  parameters: GearParameter[];
  selected: string[];
  answers: GearAnswerMap;
  fallback: ResearchErrorCode | null;
}

export type GearAction =
  | { type: 'query'; query: string }
  | { type: 'loading' }
  | { type: 'loaded'; loaded: Loaded }
  | { type: 'step'; step: number }
  | { type: 'toggle'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'add'; parameter: GearParameter }
  | { type: 'reset' }
  | { type: 'answer'; id: string; answer: GearAnswer | null }
  | { type: 'budget'; budget: string }
  | { type: 'currency'; currency: CurrencyId }
  | { type: 'notes'; notes: string };

type Handlers = { [K in GearAction['type']]: (state: GearState, action: Extract<GearAction, { type: K }>) => GearState };

const without = <T,>(list: T[], item: T): T[] => list.filter((one) => one !== item);

function withAnswer(answers: GearAnswerMap, id: string, answer: GearAnswer | null): GearAnswerMap {
  const next = { ...answers };
  if (answer) next[id] = answer;
  else delete next[id];
  return next;
}

const HANDLERS: Handlers = {
  query: (state, { query }) => ({ ...state, query }),
  loading: (state) => ({ ...state, status: 'loading', step: 1 }),
  loaded: (state, { loaded }) => ({ ...state, ...loaded, status: 'ready', base: loaded.parameters, baseSelected: loaded.selected }),
  step: (state, { step }) => ({ ...state, step }),
  toggle: (state, { id }) => ({ ...state, selected: state.selected.includes(id) ? without(state.selected, id) : [...state.selected, id] }),
  remove: (state, { id }) => ({ ...state, parameters: state.parameters.filter((one) => one.id !== id), selected: without(state.selected, id), answers: withAnswer(state.answers, id, null) }),
  add: (state, { parameter }) => ({ ...state, parameters: [...state.parameters, parameter], selected: [...state.selected, parameter.id] }),
  reset: (state) => ({ ...state, parameters: state.base, selected: state.baseSelected }),
  answer: (state, { id, answer }) => ({ ...state, answers: withAnswer(state.answers, id, answer) }),
  budget: (state, { budget }) => ({ ...state, budget }),
  currency: (state, { currency }) => ({ ...state, currency }),
  notes: (state, { notes }) => ({ ...state, notes }),
};

export function gearReducer(state: GearState, action: GearAction): GearState {
  return (HANDLERS[action.type] as (s: GearState, a: GearAction) => GearState)(state, action);
}
