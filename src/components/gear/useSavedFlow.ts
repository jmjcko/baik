'use client';

import { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import type { GearState } from '@/lib/gear/gearState';
import { newPurchaseId, purchaseFromState, stateFromPurchase, type SavedPurchase } from '@/lib/gear/savedPurchases';
import { useGearPurchases } from '@/lib/hooks/useGearPurchases';

interface Wizard {
  state: GearState;
  restore: (state: GearState) => void;
  startOver: () => void;
}

/** What the rider sees after pressing "Save and close": that it was saved, or that ten purchases are already kept. */
export type SavedNotice = { kind: 'saved' | 'full'; text: string } | null;

/** Saving the purchase and coming back to it: "Save and close" goes to the start with the purchase kept, a saved one is opened where the rider stopped, finished or deleted. */
export function useSavedFlow(t: Translations, wizard: Wizard) {
  const { purchases, save, remove } = useGearPurchases();
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [notice, setNotice] = useState<SavedNotice>(null);
  const s = t.gear.saved;
  const keep = (status: SavedPurchase['status']): boolean => {
    const id = currentId ?? newPurchaseId();
    const purchase = purchaseFromState(id, wizard.state, new Date().toISOString(), status);
    const title = purchase.title || s.untitled;
    if (!save(purchase)) { setNotice({ kind: 'full', text: s.full }); return false; }
    setNotice({ kind: 'saved', text: fill(s.savedNotice, { title }) });
    return true;
  };
  const leave = () => { setCurrentId(null); wizard.startOver(); };
  return {
    purchases,
    notice,
    saveAndClose: () => { if (keep('open')) leave(); },
    open: (purchase: SavedPurchase) => { setNotice(null); setCurrentId(purchase.id); wizard.restore(stateFromPurchase(purchase)); },
    remove: (id: string) => { setNotice(null); remove(id); },
    markDone: (purchase: SavedPurchase) => save({ ...purchase, status: 'done', updatedAt: new Date().toISOString() }),
  };
}
