'use client';

import React, { useEffect, useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { addDays } from '@/lib/notifications/dates';
import { useStrava, type StravaNotice } from '@/lib/hooks/useStrava';
import { clearStravaReturn, peekStravaReturn, type StravaReturn } from '@/lib/strava/returnFlag';
import type { BikeBook } from '@/types/service';
import { FIELD, PILL_OUTLINE, PILL_PRIMARY } from '@/components/admin/AdminParts';
import { ServiceState, type ServiceTone } from './ServiceState';

type Texts = Translations['service']['logbook']['strava'];
type Strava = ReturnType<typeof useStrava>;

/** Where the official image of Strava is kept: the owner drops "Connect with Strava" from the brand guidelines of Strava here; until then a plain button in the Strava colour is shown. */
export const CONNECT_IMAGE = '/strava/btn_strava_connectwith_orange.svg';

const ConnectButton: React.FC<{ texts: Texts }> = ({ texts }) => {
  const [plain, setPlain] = useState(false);
  return (
    <a href="/api/strava/auth" aria-label={texts.connect} className="inline-flex items-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600" data-testid="strava-connect">
      {plain ? <span className="h-11 px-5 inline-flex items-center rounded-lg text-sm font-bold" style={{ background: '#FC4C02', color: '#ffffff' }}>{texts.connect}</span> : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={CONNECT_IMAGE} alt="" height={48} className="h-12 w-auto" onError={() => setPlain(true)} />
      )}
    </a>
  );
};

const noticeText = (texts: Texts, notice: StravaNotice): string => {
  if (notice.kind === 'synced') return fill(texts.notices.synced, { n: notice.n });
  return notice.kind === 'error' ? texts.errors[notice.code] : texts.notices[notice.kind];
};

/** The bikes of the Strava account to choose from, and the day the rides are counted from. */
const PairForm: React.FC<{ texts: Texts; strava: Strava; today: string }> = ({ texts, strava, today }) => {
  const [since, setSince] = useState(addDays(today, -90));
  const [gearId, setGearId] = useState('');
  const chosen = strava.bikes?.find((bike) => bike.id === gearId);
  return (
    <div className="space-y-3" data-testid="strava-pair">
      <h3 className="text-sm font-bold text-ink">{texts.pair.title}</h3>
      <p className="text-xs text-ink-2">{texts.pair.hint}</p>
      {strava.bikes === null && <button type="button" disabled={strava.busy} onClick={() => void strava.loadBikes()} className={PILL_OUTLINE}>{texts.pair.load}</button>}
      {strava.bikes?.length === 0 && <p className="text-sm text-ink-2">{texts.pair.none}</p>}
      {strava.bikes && strava.bikes.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1"><span className="text-xs font-semibold text-ink-3">{texts.pair.choose}</span>
            <select className={FIELD} value={gearId} onChange={(e) => setGearId(e.target.value)}>
              <option value="" />
              {strava.bikes.map((bike) => <option key={bike.id} value={bike.id}>{bike.name} ({bike.km} km)</option>)}
            </select>
          </label>
          <label className="block space-y-1"><span className="text-xs font-semibold text-ink-3">{texts.pair.since}</span><input type="date" className={FIELD} value={since} onChange={(e) => setSince(e.target.value)} /></label>
          <button type="button" disabled={!chosen || strava.busy} onClick={() => chosen && void strava.pair(chosen, since)} className={`${PILL_PRIMARY} sm:col-span-2`}>{texts.pair.button}</button>
        </div>
      )}
    </div>
  );
};

const Paired: React.FC<{ texts: Texts; strava: Strava; book: BikeBook }> = ({ texts, strava, book }) => {
  const pairing = book.strava;
  if (!pairing) return null;
  return (
    <div className="space-y-3" data-testid="strava-paired">
      <p className="text-sm font-semibold text-ink">{fill(texts.paired, { name: pairing.gearName })}</p>
      <p className="text-xs text-ink-3">{pairing.syncedAt ? fill(texts.lastSync, { date: pairing.syncedAt }) : texts.neverSynced} · {texts.rainNote}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={strava.busy} onClick={() => void strava.sync(pairing.gearId, pairing.since)} className={PILL_PRIMARY}>{strava.busy ? texts.syncing : texts.sync}</button>
        <button type="button" onClick={strava.unpair} className={PILL_OUTLINE}>{texts.unpair}</button>
      </div>
    </div>
  );
};

/** The message of the return from Strava, shown once. */
function useReturn(): StravaReturn | null {
  const [result] = useState(() => peekStravaReturn());
  useEffect(() => clearStravaReturn(), []);
  return result;
}

interface CardProps {
  t: Translations;
  bikeId: string;
  book: BikeBook;
  update: (change: (book: BikeBook) => BikeBook) => void;
  today: string;
}

/** The state of the connection as the chip shows it: the words come from the Connections texts. */
function stateOf(t: Translations, strava: Strava, book: BikeBook): { label: string; tone: ServiceTone } {
  const s = t.connections.states;
  if (strava.status === 'connected') return book.strava ? { label: s.paired, tone: 'success' } : { label: s.connected, tone: 'info' };
  const map = { checking: { label: s.checking, tone: 'neutral' }, guest: { label: s.guest, tone: 'warning' }, unavailable: { label: s.unavailable, tone: 'neutral' }, disconnected: { label: s.disconnected, tone: 'neutral' } } as const;
  return map[strava.status];
}

/** Connects the rider's Strava account to the logbook: connect, pair the bike, update the rides, disconnect. Strava is only a source of rides. */
export const StravaConnectCard: React.FC<CardProps> = ({ t, bikeId, book, update, today }) => {
  const texts = t.service.logbook.strava;
  const strava = useStrava(bikeId, update, today);
  const returned = useReturn();
  return (
    <section className="space-y-4 rounded-2xl border border-line bg-surface p-5 shadow-sm" data-testid="strava-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold text-ink">{texts.title}</h2>
        <ServiceState {...stateOf(t, strava, book)} testId="strava-state" />
      </div>
      <p className="text-sm text-ink-2 max-w-3xl">{texts.intro}</p>
      {returned && <p role="status" data-testid="strava-return" className="text-sm font-semibold text-ink">{texts.results[returned]}</p>}
      {strava.notice && <p role={strava.notice.kind === 'error' ? 'alert' : 'status'} data-testid="strava-notice" className={strava.notice.kind === 'error' || strava.notice.kind === 'taken' ? 'text-sm text-tone-danger-ink' : 'text-sm text-ink-2'}>{noticeText(texts, strava.notice)}</p>}
      {strava.status === 'checking' && <p role="status" className="text-sm text-ink-2">{texts.checking}</p>}
      {strava.status === 'guest' && <p className="text-sm text-ink-2" data-testid="strava-guest">{texts.guest}</p>}
      {strava.status === 'unavailable' && <p className="text-sm text-ink-2">{texts.unavailable}</p>}
      {strava.status === 'disconnected' && <ConnectButton texts={texts} />}
      {strava.status === 'connected' && (
        <div className="space-y-4">
          {book.strava ? <Paired texts={texts} strava={strava} book={book} /> : <PairForm texts={texts} strava={strava} today={today} />}
          <div className="space-y-2 border-t border-line pt-3">
            <button type="button" disabled={strava.busy} onClick={() => void strava.disconnect()} className={PILL_OUTLINE}>{texts.disconnect}</button>
            <p className="text-xs text-ink-3">{texts.disconnectHint}</p>
          </div>
          <p className="text-xs font-semibold text-ink-3">{texts.attribution}</p>
        </div>
      )}
    </section>
  );
};
