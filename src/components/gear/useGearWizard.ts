'use client';

import { useCallback, useReducer } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { gearReducer, initialState } from '@/lib/gear/gearState';
import { loadParameters } from '@/lib/gear/loadParameters';
import type { ProfileValues } from '@/lib/profile/values';
import type { CurrencyId, GearAnswer, GearCategoryId } from '@/types/gearTypes';

/** The state of the wizard and what the rider can do in it; the questions are researched when the rider asks for them. */
export function useGearWizard(t: Translations, locale: 'en' | 'cs', values: ProfileValues) {
  const [state, dispatch] = useReducer(gearReducer, locale, initialState);
  const find = useCallback(async (picked?: GearCategoryId) => {
    const query = picked ? t.gear.categories[picked] : state.query.trim();
    dispatch({ type: 'loading' });
    dispatch({ type: 'loaded', loaded: await loadParameters({ t, locale, values, query, picked }) });
  }, [t, locale, values, state.query]);
  const add = (name: string) => dispatch({ type: 'add', parameter: { id: `custom_${Date.now()}`, source: 'custom', kind: 'text', importance: 'recommended', label: name.trim().slice(0, 60), hint: '' } });
  return {
    state,
    find,
    add,
    setQuery: (query: string) => dispatch({ type: 'query', query }),
    goTo: (step: number) => dispatch({ type: 'step', step }),
    toggle: (id: string) => dispatch({ type: 'toggle', id }),
    remove: (id: string) => dispatch({ type: 'remove', id }),
    reset: () => dispatch({ type: 'reset' }),
    answer: (id: string, answer: GearAnswer | null) => dispatch({ type: 'answer', id, answer }),
    setBudget: (budget: string) => dispatch({ type: 'budget', budget }),
    setCurrency: (currency: CurrencyId) => dispatch({ type: 'currency', currency }),
    setNotes: (notes: string) => dispatch({ type: 'notes', notes }),
  };
}
