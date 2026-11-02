'use client';

import { useCallback, useState } from 'react';
import { isNewInBook } from '@/lib/service/quickLog';
import type { ServiceEntry, WorkshopOffer } from '@/types/service';

/** The entry that the workshop offers to the service book: one at a time, and only when the book does not have it yet. */
export function useWorkshopOffer(log: ServiceEntry[]): { offer: WorkshopOffer | null; offerEntry: (offer: WorkshopOffer) => void; clear: () => void } {
  const [offer, setOffer] = useState<WorkshopOffer | null>(null);
  const offerEntry = useCallback((next: WorkshopOffer) => setOffer((current) => (current === null && isNewInBook(log, next) ? next : current)), [log]);
  const clear = useCallback(() => setOffer(null), []);
  return { offer, offerEntry, clear };
}
