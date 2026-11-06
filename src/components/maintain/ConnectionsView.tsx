import React from 'react';
import { fill } from '@/lib/i18n/format';
import type { Translations } from '@/lib/i18n/translations';
import type { BikeBook } from '@/types/service';
import { IntervalsConnectCard } from './IntervalsConnectCard';
import { StravaConnectCard } from './StravaConnectCard';

const SERVICES = 2;

interface ConnectionsProps {
  t: Translations;
  bikeId: string;
  book: BikeBook;
  update: (change: (book: BikeBook) => BikeBook) => void;
  today: string;
  /** Whose Intervals.icu it is (see the card). */
  riderId?: string;
  riderBikeIds?: string[];
  riderName?: string;
}

/** The "Connections" tab of the garage: how many services bring rides to this bike, and the card of each service with its state. */
export const ConnectionsView: React.FC<ConnectionsProps> = ({ t, bikeId, book, update, today, riderId, riderBikeIds, riderName }) => {
  const c = t.connections;
  const feeding = [book.strava, book.intervals].filter(Boolean).length;
  return (
    <div className="space-y-6" data-testid="connections">
      <div className="space-y-1">
        <h2 className="text-base font-bold text-ink">{c.title}</h2>
        <p className="text-sm text-ink max-w-3xl">{c.intro}</p>
        <p className="text-sm font-bold text-ink" data-testid="connections-summary">{feeding === 0 ? c.summaryNone : fill(c.summary, { n: feeding, total: SERVICES })}</p>
      </div>
      <IntervalsConnectCard t={t} bikeId={bikeId} book={book} update={update} today={today} riderId={riderId} riderBikeIds={riderBikeIds} riderName={riderName} />
      <StravaConnectCard t={t} bikeId={bikeId} book={book} update={update} today={today} />
    </div>
  );
};
