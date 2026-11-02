'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { cx } from '@/lib/classNames';
import { MAX_RIDERS, MAX_RIDER_NAME_LENGTH } from '@/lib/passport/riders';
import type { RiderSummary } from '@/lib/passport/types';
import type { RidingDiscipline } from '@/types/baikfit';
import { riderName } from '@/components/riders/riderName';
import { AddRiderForm } from './AddRiderForm';
import { Block, Card, PILL_DANGER, PILL_OUTLINE, PILL } from './ProfileParts';

const FIELD = 'w-full h-12 rounded-xl border border-line bg-surface px-4 text-sm text-ink focus:outline-none focus:border-tone-info-line';
const PILL_PRIMARY = `${PILL} border border-blue-600 bg-blue-600 text-slate-50 hover:bg-blue-700`;

export interface RidersState {
  riders: RiderSummary[];
  activeRiderId: string;
}

export interface RidersSectionProps {
  t: Translations;
  riders: RidersState | null;
  /** The name of every garage bike by its id. */
  bikeNames: Record<string, string>;
  onSwitch: (riderId: string) => boolean;
  /** Adds a rider with the first bike, which becomes active; the wizard then opens for the measurements. */
  onAdd: (name: string, bikeName: string, discipline: RidingDiscipline) => boolean;
  onRename: (riderId: string, name: string) => boolean;
  /** Removes a rider; the bikes go to the other rider. */
  onRemove: (riderId: string, takeoverId: string) => boolean;
}

interface CardProps extends Pick<RidersSectionProps, 't' | 'bikeNames' | 'onRename' | 'onRemove' | 'onSwitch'> {
  rider: RiderSummary;
  others: RiderSummary[];
}

/** The name of the rider as a small form while it is changed. */
const RenameForm: React.FC<{ t: Translations; rider: RiderSummary; onRename: CardProps['onRename']; onDone: () => void }> = ({ t, rider, onRename, onDone }) => {
  const [draft, setDraft] = useState(rider.name ?? '');
  const [failed, setFailed] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const done = onRename(rider.id, draft);
    setFailed(!done);
    if (done) onDone();
  };
  return (
    <form onSubmit={submit} className="space-y-2 w-full" data-testid="rider-rename">
      <input type="text" aria-label={`${t.riders.nameLabel}: ${riderName(t, rider.name)}`} maxLength={MAX_RIDER_NAME_LENGTH} value={draft} onChange={(e) => setDraft(e.target.value)} className={FIELD} />
      {failed && <p role="alert" className="text-sm text-tone-danger-ink">{t.riders.nameInvalid}</p>}
      <div className="flex gap-2">
        <button type="submit" className={PILL_PRIMARY}>{t.riders.save}</button>
        <button type="button" onClick={onDone} className={PILL_OUTLINE}>{t.riders.cancel}</button>
      </div>
    </form>
  );
};

/** Removing: a second click, with the choice of the rider who takes the bikes when this rider has any. */
const RemoveRider: React.FC<{ t: Translations; rider: RiderSummary; others: RiderSummary[]; onRemove: CardProps['onRemove'] }> = ({ t, rider, others, onRemove }) => {
  const [asking, setAsking] = useState(false);
  const [takeover, setTakeover] = useState(others[0]?.id ?? '');
  const [failed, setFailed] = useState(false);
  const name = riderName(t, rider.name);
  if (others.length === 0) return <p className="text-xs text-ink-3">{t.riders.lastRider}</p>;
  if (!asking) return <button type="button" onClick={() => setAsking(true)} aria-label={`${t.riders.remove}: ${name}`} className={PILL_OUTLINE}>{t.riders.remove}</button>;
  return (
    <div className="space-y-2" data-testid="rider-remove">
      {rider.bikeIds.length > 0 && (
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-ink-2">{t.riders.takeoverLabel}</span>
          <select value={takeover} onChange={(e) => setTakeover(e.target.value)} className={FIELD} data-testid="rider-takeover">
            {others.map((other) => <option key={other.id} value={other.id}>{riderName(t, other.name)}</option>)}
          </select>
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setFailed(!onRemove(rider.id, takeover))} className={PILL_DANGER}>{t.riders.confirmRemove}</button>
        <button type="button" onClick={() => setAsking(false)} className={PILL_OUTLINE}>{t.riders.cancel}</button>
      </div>
      {failed && <p role="alert" className="text-sm text-tone-danger-ink">{t.riders.failed}</p>}
    </div>
  );
};

const RiderCard: React.FC<CardProps> = ({ t, rider, others, bikeNames, onRename, onRemove, onSwitch }) => {
  const [renaming, setRenaming] = useState(false);
  const name = riderName(t, rider.name);
  const bikes = rider.bikeIds.map((id) => bikeNames[id] ?? id);
  return (
    <Card className={cx('flex flex-col gap-3', rider.isActive && 'border-tone-info-line')}>
      <div className="flex items-start justify-between gap-3" data-testid="rider-card">
        {renaming ? <RenameForm t={t} rider={rider} onRename={onRename} onDone={() => setRenaming(false)} /> : <h3 className="text-base font-bold text-ink">{name}</h3>}
        {rider.isActive && <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border border-tone-success-line bg-tone-success-bg text-tone-success-ink">{t.riders.active}</span>}
      </div>
      <p className="text-sm text-ink-2">{bikes.length > 0 ? fill(t.riders.bikesOf, { list: bikes.join(', ') }) : t.riders.noBikes}</p>
      {bikes.length === 0 && <p className="text-xs text-ink-3">{t.riders.noBikeHint}</p>}
      <div className="flex flex-wrap gap-2 pt-1">
        {!rider.isActive && bikes.length > 0 && <button type="button" onClick={() => onSwitch(rider.id)} aria-label={`${t.riders.makeActive}: ${name}`} className={PILL_OUTLINE}>{t.riders.makeActive}</button>}
        <button type="button" onClick={() => setRenaming(true)} aria-label={`${t.riders.rename}: ${name}`} className={PILL_OUTLINE}>{t.riders.rename}</button>
      </div>
      <RemoveRider t={t} rider={rider} others={others} onRemove={onRemove} />
    </Card>
  );
};

/** "Riders": a card for each person of the account with the bikes, and the ways to switch, rename, remove or add a rider. */
export const RidersSection: React.FC<RidersSectionProps> = ({ t, riders, bikeNames, onSwitch, onAdd, onRename, onRemove }) => {
  const [adding, setAdding] = useState(false);
  if (!riders) return null;
  const full = riders.riders.length >= MAX_RIDERS;
  return (
    <Block id="profile-riders" title={t.riders.title} intro={t.riders.intro}>
      <div className="grid gap-4 md:grid-cols-2">
        {riders.riders.map((rider) => (
          <RiderCard key={rider.id} t={t} rider={rider} others={riders.riders.filter((other) => other.id !== rider.id)} bikeNames={bikeNames} onRename={onRename} onRemove={onRemove} onSwitch={onSwitch} />
        ))}
      </div>
      {full && <p className="text-sm text-ink-2">{t.riders.full}</p>}
      {!full && !adding && <div><button type="button" onClick={() => setAdding(true)} className={PILL_OUTLINE} data-testid="rider-add-open">{t.riders.add}</button></div>}
      {!full && adding && <AddRiderForm t={t} onAdd={onAdd} onCancel={() => setAdding(false)} />}
    </Block>
  );
};
