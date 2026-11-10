'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { Toast } from '@/components/primitives/Toast';
import { useAutoLoad } from '@/lib/hooks/useAutoLoad';
import type { BikeBook } from '@/types/service';

interface AutoLoadProps {
  t: Translations;
  bikeId: string;
  book: BikeBook;
  update: (change: (book: BikeBook) => BikeBook) => void;
  today: string;
  riderId: string;
}

/** Loads the rides of the paired services when the garage opens and says how many new rides came (nothing is shown when none did). */
export const AutoLoad: React.FC<AutoLoadProps> = ({ t, bikeId, book, update, today, riderId }) => {
  const loaded = useAutoLoad(bikeId, book, update, today, riderId);
  const [seen, setSeen] = useState(false);
  const total = loaded.reduce((sum, one) => sum + one.n, 0);
  if (seen || total === 0) return null;
  const source = loaded.map((one) => (one.source === 'strava' ? 'Strava' : 'Intervals.icu')).join(', ');
  return <Toast tone="success" title={fill(t.service.logbook.intervals.server.autoLoaded, { n: total, source })} dismissLabel={t.auth.redirect.dismiss} onDismiss={() => setSeen(true)} />;
};
