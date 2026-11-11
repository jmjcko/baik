'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { addDays } from '@/lib/notifications/dates';
import { useIntervals, type IntervalsNotice } from '@/lib/hooks/useIntervals';
import type { RideTerrain } from '@/lib/engines/baikcare/wearIntervals';
import type { BikeBook } from '@/types/service';
import { FIELD, PILL_OUTLINE, PILL_PRIMARY } from '@/components/admin/AdminParts';
import { ServiceState } from './ServiceState';
import { IntervalsGuide } from './IntervalsGuide';
import { ConsentGate } from '@/components/consent/ConsentGate';
import { ConsentPrompt } from '@/components/consent/ConsentPrompt';
import { useConsent } from '@/lib/consent/useConsent';
import { DEFAULT_RIDER } from '@/lib/intervals/keyStore';

type Texts = Translations['service']['logbook']['intervals'];
type Intervals = ReturnType<typeof useIntervals>;

const TYPES: RideTerrain[] = ['road', 'gravel', 'mtb', 'trainer'];

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <label className="block space-y-1">
    <span className="text-xs font-semibold text-ink-3">{label}</span>
    {children}
    {hint && <span className="block text-xs text-ink-3">{hint}</span>}
  </label>
);

/** The key and the id of the athlete; the key is saved in this browser only when Intervals.icu accepts it. */
const KeyForm: React.FC<{ texts: Texts; intervals: Intervals; since: string }> = ({ texts, intervals, since }) => {
  const [athleteId, setAthleteId] = useState('0');
  const [key, setKey] = useState('');
  return (
    <form onSubmit={(event) => { event.preventDefault(); void intervals.connect({ athleteId: athleteId.trim(), key: key.trim() }, since); }} className="grid gap-3 sm:grid-cols-2" data-testid="intervals-key-form">
      <Field label={texts.form.athlete} hint={texts.form.athleteHint}><input className={FIELD} value={athleteId} onChange={(e) => setAthleteId(e.target.value)} autoComplete="off" /></Field>
      <Field label={texts.form.key}><input className={FIELD} type="password" value={key} onChange={(e) => setKey(e.target.value)} autoComplete="off" /></Field>
      <button type="submit" disabled={intervals.busy || key.trim() === ''} className={`${PILL_PRIMARY} sm:col-span-2`}>{intervals.busy ? texts.form.loading : texts.form.load}</button>
    </form>
  );
};

const toggle = (types: RideTerrain[], type: RideTerrain): RideTerrain[] => (types.includes(type) ? types.filter((t) => t !== type) : [...types, type]);

/** Which rides of Intervals.icu count for this bike: its bike there (when the data has one), the types of ride, and the day to count from. */
const RuleForm: React.FC<{ t: Translations; intervals: Intervals; since: string }> = ({ t, intervals, since }) => {
  const texts = t.service.logbook.intervals;
  const [types, setTypes] = useState<RideTerrain[]>(TYPES);
  const [gearId, setGearId] = useState('');
  const [from, setFrom] = useState(since);
  const gear = intervals.gears?.find((g) => g.id === gearId) ?? null;
  return (
    <div className="space-y-3" data-testid="intervals-rule">
      <h3 className="text-sm font-bold text-ink">{texts.pair.title}</h3>
      <p className="text-xs text-ink-2">{texts.pair.hint}</p>
      {intervals.gears && intervals.gears.length > 0 && (
        <Field label={texts.pair.gear}>
          <select className={FIELD} value={gearId} onChange={(e) => setGearId(e.target.value)}>
            <option value="">{texts.pair.anyGear}</option>
            {intervals.gears.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </Field>
      )}
      {intervals.gears === null && intervals.connected && <button type="button" disabled={intervals.busy} onClick={() => void intervals.loadGears(since)} className={PILL_OUTLINE}>{texts.pair.loadGears}</button>}
      {intervals.gears?.length === 0 && <p className="text-xs text-ink-2">{texts.pair.noGear}</p>}
      <fieldset className="space-y-2"><legend className="text-xs font-semibold text-ink-3">{texts.pair.types}</legend>
        <div className="flex flex-wrap gap-4">
          {TYPES.map((type) => <label key={type} className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={types.includes(type)} onChange={() => setTypes(toggle(types, type))} />{t.service.logbook.rides.terrains[type]}</label>)}
        </div>
      </fieldset>
      <Field label={texts.pair.since}><input type="date" className={FIELD} value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
      <button type="button" disabled={intervals.busy} onClick={() => void intervals.pair({ gearId: gear?.id ?? null, gearName: gear?.name ?? null, types }, from)} className={PILL_PRIMARY}>{texts.pair.button}</button>
    </div>
  );
};

const noticeText = (texts: Texts, notice: IntervalsNotice): string => (notice.kind === 'synced' ? fill(texts.notices.synced, { n: notice.n }) : notice.kind === 'error' ? texts.errors[notice.code] : texts.notices[notice.kind]);

const Paired: React.FC<{ t: Translations; intervals: Intervals; book: BikeBook }> = ({ t, intervals, book }) => {
  const texts = t.service.logbook.intervals;
  const pairing = book.intervals;
  if (!pairing) return null;
  const types = pairing.types.length === 0 ? '*' : pairing.types.map((type) => t.service.logbook.rides.terrains[type]).join(', ');
  return (
    <div className="space-y-3" data-testid="intervals-paired">
      <p className="text-sm font-semibold text-ink">{pairing.gearName ? fill(texts.pairedGear, { types, gear: pairing.gearName }) : fill(texts.paired, { types })}</p>
      {pairing.gearId === null && <p className="text-xs text-ink-2" data-testid="intervals-no-gear">{texts.noGearNote}</p>}
      <p className="text-xs text-ink-3">{pairing.syncedAt ? fill(texts.lastSync, { date: pairing.syncedAt }) : texts.neverSynced} · {texts.rainNote}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={intervals.busy} onClick={() => void intervals.sync(pairing.since)} className={PILL_PRIMARY}>{intervals.busy ? texts.syncing : texts.sync}</button>
        <button type="button" onClick={intervals.unpair} className={PILL_OUTLINE}>{texts.change}</button>
      </div>
    </div>
  );
};

/** A key that is still in this browser can be moved to the account: it goes to the server once, after the consent that the card asks for. */
const MoveKey: React.FC<{ texts: Texts; intervals: Intervals; since: string }> = ({ texts, intervals, since }) => (
  <div className="space-y-2" data-testid="intervals-move">
    <p className="text-xs text-ink-2 max-w-3xl">{texts.server.moveHint}</p>
    <button type="button" disabled={intervals.busy || !intervals.creds} onClick={() => intervals.creds && void intervals.connect(intervals.creds, since)} className={PILL_OUTLINE}>{texts.server.move}</button>
  </div>
);

/** A rider who connected before the text changed (version 3: the daily load while the app is closed) is asked again; until then the daily load leaves the rider alone. */
const Reconsent: React.FC<{ t: Translations }> = ({ t }) => {
  const consent = useConsent('intervals');
  if (consent.state === 'granted') return null;
  return <ConsentPrompt t={t} purpose="intervals" note={consent.state === 'declined' ? t.consent.prompt.needed : undefined} onAllow={consent.grant} onDecline={consent.decline} />;
};

interface CardProps {
  t: Translations;
  bikeId: string;
  book: BikeBook;
  update: (change: (book: BikeBook) => BikeBook) => void;
  today: string;
  /** Whose Intervals.icu it is: the rider of the bike, the bikes of that rider and the name to show when the account has several riders. */
  riderId?: string;
  riderBikeIds?: string[];
  riderName?: string;
}

/** Loads the rides from Intervals.icu (which gets them from Garmin, Wahoo and others) with the rider's own key, which stays in this browser. */
export const IntervalsConnectCard: React.FC<CardProps> = ({ t, bikeId, book, update, today, riderId, riderBikeIds, riderName }) => {
  const texts = t.service.logbook.intervals;
  const intervals = useIntervals(bikeId, update, today, { riderId: riderId ?? DEFAULT_RIDER, bikeIds: riderBikeIds, adopt: book.intervals !== null });
  const since = addDays(today, -90);
  return (
    <section className="space-y-4 rounded-2xl border border-line bg-surface p-5 shadow-sm" data-testid="intervals-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold text-ink">{texts.title}</h2>
        {!intervals.connected ? <ServiceState label={t.connections.states.disconnected} tone="neutral" testId="intervals-state" /> : book.intervals ? <ServiceState label={t.connections.states.paired} tone="success" testId="intervals-state" /> : <ServiceState label={t.connections.states.keySaved} tone="info" testId="intervals-state" />}
      </div>
      {riderName && <p className="text-sm font-semibold text-ink" data-testid="intervals-rider">{fill(texts.riderNote, { rider: riderName })}</p>}
      <p className="text-sm text-ink-2 max-w-3xl">{texts.intro}</p>
      {intervals.notice && <p role={intervals.notice.kind === 'synced' ? 'status' : 'alert'} data-testid="intervals-notice" className={intervals.notice.kind === 'synced' ? 'text-sm text-ink-2' : 'text-sm text-tone-danger-ink'}>{noticeText(texts, intervals.notice)}</p>}
      {!intervals.connected && <ConsentGate t={t} purpose="intervals"><KeyForm texts={texts} intervals={intervals} since={since} /><IntervalsGuide texts={texts.guide} /></ConsentGate>}
      {intervals.connected && <Reconsent t={t} />}
      {intervals.viaServer && <p className="text-xs text-ink-2 max-w-3xl" data-testid="intervals-in-account">{texts.server.stored}</p>}
      {intervals.canMove && <MoveKey texts={texts} intervals={intervals} since={since} />}
      {intervals.connected && !book.intervals && <RuleForm t={t} intervals={intervals} since={since} />}
      {intervals.connected && book.intervals && <Paired t={t} intervals={intervals} book={book} />}
      {intervals.connected && (
        <div className="space-y-2 border-t border-line pt-3">
          <button type="button" onClick={intervals.forget} className={PILL_OUTLINE}>{texts.forget}</button>
          <p className="text-xs text-ink-3">{intervals.viaServer ? texts.server.forgetHint : texts.forgetHint}</p>
        </div>
      )}
    </section>
  );
};
