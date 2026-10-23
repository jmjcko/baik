'use client';

import React, { useState } from 'react';
import type { Locale, Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { cx } from '@/lib/classNames';
import { MAX_BIKE_NAME_LENGTH, MAX_GARAGE_BIKES } from '@/lib/passport/garage';
import type { BikeProfile } from '@/lib/passport/types';
import { Block, Card, PILL_DANGER, PILL_OUTLINE } from './ProfileParts';
import { formatDay } from './format';

type Texts = Translations['profile']['garage'];

export interface GarageState {
  bikes: BikeProfile[];
  activeBikeId: string;
}

export interface GarageSectionProps {
  t: Translations;
  locale: Locale;
  garage: GarageState | null;
  /** Make a bike active; false when it could not be done. */
  onSwitch: (bikeId: string) => boolean;
  /** Make a bike active and start its bike audit (wizard step 4). */
  onAudit: (bikeId: string) => void;
  /** Add an empty bike that becomes the active one; false when it could not be done. The wizard then opens at step 4. */
  onAdd: (name: string) => boolean;
  /** Give a bike another name; false when the name cannot be used. */
  onRename: (bikeId: string, name: string) => boolean;
  /** Delete a bike; false when it may not be deleted (the active bike, the only bike). */
  onRemove: (bikeId: string) => boolean;
}

const PILL_PRIMARY = 'h-12 px-6 rounded-full text-sm font-semibold transition-colors border border-blue-600 bg-blue-600 text-slate-50 hover:bg-blue-700 disabled:opacity-50';
const FIELD = 'w-full h-12 rounded-xl border border-line bg-surface px-4 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-tone-info-line';

/** The name of a bike: the rider's own, else the factory bike it was chosen from, else a plain "bike without a name". */
export const bikeTitle = (g: Texts, bike: BikeProfile): string => bike.name ?? bike.factoryName ?? g.unnamed;

function deltaText(g: Texts, saddle: number | null, spacers: number | null): string[] {
  const lines: string[] = [];
  if (saddle !== null) lines.push(saddle === 0 ? g.saddleKeep : fill(saddle > 0 ? g.saddleBack : g.saddleForward, { delta: Math.abs(saddle) }));
  if (spacers !== null) lines.push(spacers === 0 ? g.spacerKeep : fill(spacers > 0 ? g.spacerAdd : g.spacerRemove, { delta: Math.abs(spacers) }));
  return lines;
}

const Facts: React.FC<{ g: Texts; bike: BikeProfile; locale: Locale }> = ({ g, bike, locale }) => {
  const { diagnosis } = bike;
  const lines = diagnosis ? deltaText(g, diagnosis.saddleDeltaMm, diagnosis.spacerDeltaMm) : [];
  return (
    <div className="space-y-1 text-sm">
      <p className="font-semibold text-ink">{bike.isStock ? g.factory : g.ownSetup}</p>
      {bike.year !== null && bike.size !== null && <p className="text-ink-2">{fill(g.yearSize, { year: bike.year, size: bike.size })}</p>}
      <p className="text-ink-3">
        {g.lastDiagnosis}: <span className="font-semibold text-ink">{diagnosis ? formatDay(diagnosis.at, locale) : g.never}</span>
      </p>
      {lines.length > 0 && <p className="text-xs text-ink-2" data-testid="garage-deltas">{lines.join(', ')}</p>}
    </div>
  );
};

interface BikeCardProps {
  g: Texts;
  locale: Locale;
  bike: BikeProfile;
  title: string;
  /** How many bikes the garage holds (the only bike cannot be deleted). */
  count: number;
  onSwitch: () => void;
  onAudit: () => void;
  onRename: (name: string) => boolean;
  onRemove: () => boolean;
}

/** The title of a card; while a draft name exists it is a small form that keeps the name typed until it is saved or cancelled. */
const CardTitle: React.FC<{ g: Texts; title: string; draft: string | null; setDraft: (draft: string | null) => void; onRename: (name: string) => boolean }> = ({ g, title, draft, setDraft, onRename }) => {
  const [failed, setFailed] = useState(false);
  if (draft === null) return <h3 className="text-base font-bold text-ink">{title}</h3>;
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const done = onRename(draft);
    setFailed(!done);
    if (done) setDraft(null);
  };
  return (
    <form onSubmit={submit} className="space-y-2 w-full" data-testid="garage-rename">
      <input type="text" aria-label={`${g.nameLabel}: ${title}`} maxLength={MAX_BIKE_NAME_LENGTH} value={draft} onChange={(e) => setDraft(e.target.value)} className={FIELD} />
      {failed && <p role="alert" className="text-sm text-tone-danger-ink">{g.nameInvalid}</p>}
      <div className="flex gap-2">
        <button type="submit" className={PILL_PRIMARY}>{g.save}</button>
        <button type="button" onClick={() => { setDraft(null); setFailed(false); }} className={PILL_OUTLINE}>{g.cancel}</button>
      </div>
    </form>
  );
};

/** Delete with a second click; the active bike and the only bike of the garage cannot be deleted (the card says why). */
const RemoveBike: React.FC<{ g: Texts; bike: BikeProfile; title: string; count: number; onRemove: () => boolean }> = ({ g, bike, title, count, onRemove }) => {
  const [asking, setAsking] = useState(false);
  const [failed, setFailed] = useState(false);
  if (bike.isActive) return <p className="text-xs text-ink-3">{count > 1 ? g.removeActiveHint : g.removeOnlyHint}</p>;
  if (!asking) return <button type="button" onClick={() => setAsking(true)} aria-label={`${g.remove}: ${title}`} className={PILL_OUTLINE}>{g.remove}</button>;
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => setFailed(!onRemove())} className={PILL_DANGER}>{g.confirmRemove}</button>
      <button type="button" onClick={() => setAsking(false)} className={PILL_OUTLINE}>{g.cancel}</button>
      {failed && <p role="alert" className="w-full text-sm text-tone-danger-ink">{g.failed}</p>}
    </div>
  );
};

const ActiveBadge: React.FC<{ g: Texts }> = ({ g }) => (
  <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border border-tone-success-line bg-tone-success-bg text-tone-success-ink">{g.active}</span>
);

const BikeCard: React.FC<BikeCardProps> = ({ g, locale, bike, title, count, onSwitch, onAudit, onRename, onRemove }) => {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <Card className={cx('flex flex-col gap-3', bike.isActive && 'border-tone-info-line')}>
      <div className="flex items-start justify-between gap-3" data-testid="garage-bike">
        <CardTitle g={g} title={title} draft={draft} setDraft={setDraft} onRename={onRename} />
        {bike.isActive && <ActiveBadge g={g} />}
      </div>
      <Facts g={g} bike={bike} locale={locale} />
      <div className="flex flex-wrap gap-2 pt-1">
        {!bike.isActive && <button type="button" onClick={onSwitch} aria-label={`${g.makeActive}: ${title}`} className={PILL_OUTLINE}>{g.makeActive}</button>}
        <button type="button" onClick={onAudit} aria-label={`${g.audit}: ${title}`} className={PILL_OUTLINE}>{g.audit}</button>
        <button type="button" onClick={() => setDraft(bike.name ?? bike.factoryName ?? '')} aria-label={`${g.rename}: ${title}`} className={PILL_OUTLINE}>{g.rename}</button>
      </div>
      <RemoveBike g={g} bike={bike} title={title} count={count} onRemove={onRemove} />
    </Card>
  );
};

/** "Add another bike": asks for a name, adds the bike and opens its setup. */
const AddBike: React.FC<{ g: Texts; full: boolean; onAdd: (name: string) => boolean }> = ({ g, full, onAdd }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<'name' | 'failed' | null>(null);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = name.trim() !== '' && name.trim().length <= MAX_BIKE_NAME_LENGTH;
    setError(!valid ? 'name' : onAdd(name) ? null : 'failed');
  };
  if (full) return <p className="text-sm text-ink-2">{g.full}</p>;
  if (!open) return <div><button type="button" onClick={() => setOpen(true)} className={PILL_OUTLINE}>{g.add}</button></div>;
  return (
    <form onSubmit={submit} className="space-y-3 max-w-md" data-testid="garage-add">
      <label className="block space-y-1">
        <span className="text-xs font-semibold text-ink-2">{g.nameLabel}</span>
        <input type="text" maxLength={MAX_BIKE_NAME_LENGTH} value={name} placeholder={g.namePlaceholder} onChange={(e) => setName(e.target.value)} className={FIELD} />
      </label>
      {error && <p role="alert" className="text-sm text-tone-danger-ink">{error === 'name' ? g.nameInvalid : g.failed}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" className={PILL_PRIMARY}>{g.create}</button>
        <button type="button" onClick={() => { setOpen(false); setName(''); setError(null); }} className={PILL_OUTLINE}>{g.cancel}</button>
      </div>
    </form>
  );
};

/** "My Bike Garage": a card for every bike of the rider with the active one marked, and the ways to switch, audit or add a bike. */
export const GarageSection: React.FC<GarageSectionProps> = ({ t, locale, garage, onSwitch, onAudit, onAdd, onRename, onRemove }) => {
  const g = t.profile.garage;
  const [failed, setFailed] = useState(false);
  if (!garage) return null;
  return (
    <Block id="profile-garage" title={g.title} intro={g.intro}>
      <div className="grid gap-4 md:grid-cols-2">
        {garage.bikes.map((bike) => (
          <BikeCard key={bike.id} g={g} locale={locale} bike={bike} title={bikeTitle(g, bike)} count={garage.bikes.length} onSwitch={() => setFailed(!onSwitch(bike.id))} onAudit={() => onAudit(bike.id)} onRename={(name) => onRename(bike.id, name)} onRemove={() => onRemove(bike.id)} />
        ))}
      </div>
      {failed && <p role="alert" className="text-sm text-tone-danger-ink">{g.failed}</p>}
      <AddBike g={g} full={garage.bikes.length >= MAX_GARAGE_BIKES} onAdd={onAdd} />
    </Block>
  );
};
