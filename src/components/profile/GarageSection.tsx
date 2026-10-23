'use client';

import React, { useState } from 'react';
import type { Locale, Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { cx } from '@/lib/classNames';
import { MAX_BIKE_NAME_LENGTH, MAX_GARAGE_BIKES } from '@/lib/passport/garage';
import type { BikeProfile } from '@/lib/passport/types';
import { Block, Card, PILL_OUTLINE } from './ProfileParts';
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
  onSwitch: () => void;
  onAudit: () => void;
}

const BikeCard: React.FC<BikeCardProps> = ({ g, locale, bike, title, onSwitch, onAudit }) => (
  <Card className={cx('flex flex-col gap-3', bike.isActive && 'border-tone-info-line')}>
    <div className="flex items-start justify-between gap-3" data-testid="garage-bike">
      <h3 className="text-base font-bold text-ink">{title}</h3>
      {bike.isActive && <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border border-tone-success-line bg-tone-success-bg text-tone-success-ink">{g.active}</span>}
    </div>
    <Facts g={g} bike={bike} locale={locale} />
    <div className="flex flex-wrap gap-2 pt-1">
      {!bike.isActive && <button type="button" onClick={onSwitch} aria-label={`${g.makeActive}: ${title}`} className={PILL_OUTLINE}>{g.makeActive}</button>}
      <button type="button" onClick={onAudit} aria-label={`${g.audit}: ${title}`} className={PILL_OUTLINE}>{g.audit}</button>
    </div>
  </Card>
);

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
export const GarageSection: React.FC<GarageSectionProps> = ({ t, locale, garage, onSwitch, onAudit, onAdd }) => {
  const g = t.profile.garage;
  const [failed, setFailed] = useState(false);
  if (!garage) return null;
  return (
    <Block id="profile-garage" title={g.title} intro={g.intro}>
      <div className="grid gap-4 md:grid-cols-2">
        {garage.bikes.map((bike) => (
          <BikeCard key={bike.id} g={g} locale={locale} bike={bike} title={bikeTitle(g, bike)} onSwitch={() => setFailed(!onSwitch(bike.id))} onAudit={() => onAudit(bike.id)} />
        ))}
      </div>
      {failed && <p role="alert" className="text-sm text-tone-danger-ink">{g.failed}</p>}
      <AddBike g={g} full={garage.bikes.length >= MAX_GARAGE_BIKES} onAdd={onAdd} />
    </Block>
  );
};
