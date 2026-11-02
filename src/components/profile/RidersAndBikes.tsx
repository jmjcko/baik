'use client';

import React, { useState } from 'react';
import type { Locale, Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { cx } from '@/lib/classNames';
import { MAX_GARAGE_BIKES } from '@/lib/passport/garage';
import { MAX_RIDERS, type NewBikeOfRider } from '@/lib/passport/riders';
import type { BikeProfile, RiderSummary } from '@/lib/passport/types';
import type { RidingDiscipline } from '@/types/baikfit';
import type { JourneyStep } from '@/lib/hooks/useJourney';
import type { ProfileValues } from '@/lib/profile/values';
import { AddBikeForm } from '@/components/garage/AddBikeForm';
import { riderName } from '@/components/riders/riderName';
import { SurfaceCard } from '@/components/primitives/SurfaceCard';
import { ActionMenu, type MenuItem } from './ActionMenu';
import { AddRiderForm, type BikeChoice } from './AddRiderForm';
import { BikeRow, bikeTitle } from './BikeRow';
import { BodyGroup, PostureGroup, setupLine } from './EnteredSection';
import { Block, CardLabel, PILL_SOLID } from './ProfileParts';
import { RenameRider, RemoveRider } from './RiderParts';
import { RiderFigure } from './RiderFigure';

export { bikeTitle };

export interface GarageState {
  bikes: BikeProfile[];
  activeBikeId: string;
}

export interface RidersState {
  riders: RiderSummary[];
  activeRiderId: string;
}

/** What the page does with the bikes of the garage. */
export interface GarageProps {
  garage: GarageState | null;
  /** Make a bike active; false when it could not be done. */
  onSwitch: (bikeId: string) => boolean;
  /** Make a bike active and start its bike audit (wizard step 4). */
  onAudit: (bikeId: string) => void;
  /** Add an empty bike of a rider that becomes the active one; false when it could not be done. The wizard then opens at step 4. */
  onAdd: (name: string, discipline: RidingDiscipline, trainer: boolean, riderId?: string) => boolean;
  /** Give a bike another name; false when the name cannot be used. */
  onRename: (bikeId: string, name: string) => boolean;
  /** Delete a bike; false when it may not be deleted (the active bike, the only bike). */
  onRemove: (bikeId: string) => boolean;
}

/** What the page does with the riders of the account. */
export interface RiderProps {
  riders: RidersState | null;
  onSwitch: (riderId: string) => boolean;
  /** Adds a rider with a bike of the garage or a new one; the bike becomes active and the wizard then opens for the measurements. */
  onAdd: (name: string, bike: NewBikeOfRider) => boolean;
  onRename: (riderId: string, name: string) => boolean;
  /** Removes a rider; the bikes go to the other rider. */
  onRemove: (riderId: string, takeoverId: string) => boolean;
  /** Gives a bike to a rider. */
  onGiveBike: (bikeId: string, riderId: string) => boolean;
}

/** What the rider entered, for the "Body and tests" tab and the setup line of the active bike. */
export interface EnteredProps {
  values: ProfileValues;
  /** Optional measurements of the stored passport that the wizard does not collect yet. */
  anatomy: Parameters<typeof BodyGroup>[0]['anatomy'];
  onChange: (step: JourneyStep) => void;
}

export interface RidersAndBikesProps {
  t: Translations;
  locale: Locale;
  garage: GarageProps;
  riders: RiderProps;
  entered: EnteredProps;
}

/** A rider as a card with the line drawing, the name, the state and the number of bikes; choosing it shows the bikes below. */
const Portrait: React.FC<{ t: Translations; rider: RiderSummary; selected: boolean; onSelect: () => void }> = ({ t, rider, selected, onSelect }) => {
  const badge = rider.isActive ? t.riders.active : rider.bikeIds.length === 0 ? t.riders.noBikeStatus : undefined;
  return (
    <button type="button" aria-pressed={selected} onClick={onSelect} data-testid="rider-portrait" className={cx('flex flex-col items-start gap-2 rounded-2xl border bg-surface p-4 text-left shadow-sm transition-colors hover:bg-sunken focus-visible:ring-2 focus-visible:ring-blue-500', selected ? 'border-blue-600 ring-2 ring-blue-600' : 'border-line')}>
      <RiderFigure className="h-16 w-16 rounded-full bg-sunken p-2 text-ink-2" />
      <span className="flex flex-wrap items-center gap-2 text-base font-extrabold text-ink tracking-tight">
        {riderName(t, rider.name)}
        {badge && <span className={cx('text-[11px] font-mono uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full border', rider.isActive ? 'border-tone-success-line bg-tone-success-bg text-tone-success-ink' : 'border-line bg-sunken text-ink-3')}>{badge}</span>}
      </span>
      <span className="text-xs text-ink-3">{t.riders.bikesLabel}: {rider.bikeIds.length}</span>
    </button>
  );
};

/** The items of the "Add a bike" menu: a new bike, or a bike another rider has now. */
function addBikeItems(t: Translations, rider: RiderSummary, others: RiderSummary[], names: Record<string, string>, full: boolean, onNew: () => void, onGive: RiderProps['onGiveBike']): MenuItem[] {
  const lendable = others.flatMap((other) => other.bikeIds.map((id) => ({ id: `take-${id}`, label: fill(t.riders.bikeNow, { bike: names[id] ?? id, rider: riderName(t, other.name) }), onSelect: () => onGive(id, rider.id) })));
  return [{ id: 'new', label: t.riders.newBike, onSelect: onNew, unavailable: full ? t.profile.garage.full : undefined }, ...lendable];
}

interface PanelProps extends RidersAndBikesProps {
  rider: RiderSummary;
  others: RiderSummary[];
  names: Record<string, string>;
}

/** The header of the panel of a rider: the name (or the form that renames it), then "Make active", "Add a bike" and "More". */
const PanelHead: React.FC<PanelProps & { onNewBike: () => void; tab: PanelTab }> = ({ t, rider, others, names, garage, riders, onNewBike, tab }) => {
  const [mode, setMode] = useState<'rename' | 'remove' | null>(null);
  const name = riderName(t, rider.name);
  const full = (garage.garage?.bikes.length ?? 0) >= MAX_GARAGE_BIKES;
  const more: MenuItem[] = [
    { id: 'rename', label: t.riders.rename, onSelect: () => setMode('rename') },
    { id: 'remove', label: t.riders.remove, onSelect: () => setMode('remove'), danger: true, unavailable: others.length === 0 ? t.riders.lastRider : undefined },
  ];
  return (
    <div className="space-y-3 border-b border-line px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-center gap-3">
        {mode === 'rename' ? <RenameRider t={t} rider={rider} onRename={riders.onRename} onDone={() => setMode(null)} /> : <div className="min-w-0 flex-1"><CardLabel>{tab === 'bikes' ? t.profile.body.bikesTab : t.profile.body.bodyTab}</CardLabel><h3 className="text-xl font-extrabold text-ink tracking-tight break-words">{name}</h3></div>}
        {mode !== 'rename' && (
          <div className="flex flex-wrap items-center gap-2">
            {!rider.isActive && rider.bikeIds.length > 0 && <button type="button" onClick={() => riders.onSwitch(rider.id)} aria-label={`${t.riders.makeActive}: ${name}`} className={PILL_SOLID}>{t.riders.makeActive}</button>}
            <ActionMenu label={t.riders.addBikeAction} subject={name} items={addBikeItems(t, rider, others, names, full, onNewBike, riders.onGiveBike)} testId="rider-add-bike-action" />
            <ActionMenu label={t.riders.moreActions} subject={name} items={more} testId="rider-more" />
          </div>
        )}
      </div>
      {mode === 'remove' && <RemoveRider t={t} rider={rider} others={others} onRemove={riders.onRemove} onCancel={() => setMode(null)} />}
    </div>
  );
};

type PanelTab = 'bikes' | 'body';

/** The two parts of a rider's panel: the bikes and the body with the tests. */
const PanelTabs: React.FC<{ t: Translations; tab: PanelTab; onChange: (tab: PanelTab) => void }> = ({ t, tab, onChange }) => (
  <div role="tablist" aria-label={t.riders.title} className="flex gap-5 border-b border-line px-4 sm:px-5">
    {(['bikes', 'body'] as const).map((id) => (
      <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => onChange(id)} className={cx('-mb-px border-b-[3px] py-3 text-sm font-bold transition-colors', tab === id ? 'border-blue-600 text-ink' : 'border-transparent text-ink-3 hover:text-ink')}>
        {id === 'bikes' ? t.profile.body.bikesTab : t.profile.body.bodyTab}
      </button>
    ))}
  </div>
);

/** The body and the posture of the rider; the numbers belong to the active rider, so another rider is first made active. */
const BodyPanel: React.FC<PanelProps> = ({ t, rider, riders, entered }) => {
  if (!rider.isActive) {
    return (
      <div className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-5">
        <p className="text-sm text-ink-2">{fill(t.profile.body.notActive, { name: riderName(t, rider.name) })}</p>
        {rider.bikeIds.length > 0 && <button type="button" onClick={() => riders.onSwitch(rider.id)} aria-label={`${t.riders.makeActive}: ${riderName(t, rider.name)}`} className={PILL_SOLID}>{t.riders.makeActive}</button>}
      </div>
    );
  }
  return (
    <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-2" data-testid="rider-body">
      <BodyGroup t={t} values={entered.values} anatomy={entered.anatomy} onChange={entered.onChange} />
      <PostureGroup t={t} values={entered.values} onChange={entered.onChange} />
    </div>
  );
};

/** The bikes of the chosen rider, one row each. */
const PanelBikes: React.FC<PanelProps & { onFailed: () => void }> = ({ t, locale, rider, others, garage, riders, entered, onFailed }) => {
  const bikes = rider.bikeIds.map((id) => garage.garage?.bikes.find((bike) => bike.id === id)).filter((bike): bike is BikeProfile => bike !== undefined);
  const count = garage.garage?.bikes.length ?? 0;
  const choices = others.map((other) => ({ id: other.id, label: riderName(t, other.name) }));
  if (bikes.length === 0) return <p className="px-4 py-4 text-sm text-ink-2 sm:px-5">{t.riders.noBikes}. {t.riders.noBikeHint}</p>;
  return (
    <ul>
      {bikes.map((bike) => (
        <BikeRow key={bike.id} t={t} locale={locale} bike={bike} count={count} others={choices} onSwitch={() => !garage.onSwitch(bike.id) && onFailed()} onAudit={() => garage.onAudit(bike.id)} onRename={(name) => garage.onRename(bike.id, name)} onRemove={() => garage.onRemove(bike.id)} onGive={(riderId) => riders.onGiveBike(bike.id, riderId)} setup={bike.isActive ? setupLine(t, entered.values) : undefined} onEditSetup={bike.isActive ? () => entered.onChange('bike') : undefined} />
      ))}
    </ul>
  );
};

/** The panel of the chosen rider: the header and the bikes, with the form of a new bike when asked for. */
const RiderPanel: React.FC<PanelProps> = (props) => {
  const { t, rider, garage } = props;
  const [adding, setAdding] = useState(false);
  const [failed, setFailed] = useState(false);
  const [tab, setTab] = useState<PanelTab>('bikes');
  return (
    <SurfaceCard padding="none" testId="rider-panel">
      <PanelHead {...props} onNewBike={() => { setTab('bikes'); setAdding(true); }} tab={tab} />
      <PanelTabs t={t} tab={tab} onChange={setTab} />
      {adding && <div className="border-b border-line px-4 py-4 sm:px-5"><AddBikeForm t={t} onAdd={(name, discipline, trainer) => garage.onAdd(name, discipline, trainer, rider.id)} onAdded={() => setAdding(false)} onCancel={() => setAdding(false)} /></div>}
      {tab === 'bikes' ? <PanelBikes {...props} onFailed={() => setFailed(true)} /> : <BodyPanel {...props} />}
      {failed && <p role="alert" className="px-4 pb-4 text-sm text-tone-danger-ink sm:px-5">{t.profile.garage.failed}</p>}
    </SurfaceCard>
  );
};

/** The garage bikes for the form of a new rider, each with its rider now and how many bikes that rider has. */
function bikeChoices(t: Translations, riders: RiderSummary[], names: Record<string, string>): BikeChoice[] {
  return riders.flatMap((rider) => rider.bikeIds.map((id) => ({ id, title: names[id] ?? id, riderName: riderName(t, rider.name), riderBikeCount: rider.bikeIds.length })));
}

/** "Riders and bikes": a card for each person of the account, and below it the bikes of the chosen rider with the ways to switch, audit, rename, give or delete a bike. */
export const RidersAndBikes: React.FC<RidersAndBikesProps> = (props) => {
  const { t, riders, garage } = props;
  const [selected, setSelected] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  if (!riders.riders || !garage.garage) return null;
  const list = riders.riders.riders;
  const rider = list.find((r) => r.id === (selected ?? riders.riders?.activeRiderId)) ?? list[0];
  const names = Object.fromEntries(garage.garage.bikes.map((bike) => [bike.id, bikeTitle(t.profile.garage, bike)]));
  const full = list.length >= MAX_RIDERS;
  return (
    <Block id="profile-riders" title={t.riders.title} intro={t.riders.intro}>
      <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(11.5rem,1fr))]">
        {list.map((r) => <Portrait key={r.id} t={t} rider={r} selected={r.id === rider.id} onSelect={() => setSelected(r.id)} />)}
        {!full && !adding && <button type="button" onClick={() => setAdding(true)} data-testid="rider-add-open" className="min-h-24 rounded-2xl border border-dashed border-line bg-surface text-sm font-semibold text-ink-2 transition-colors hover:bg-sunken hover:text-ink">{t.riders.add}</button>}
      </div>
      {full && <p className="text-sm text-ink-2">{t.riders.full}</p>}
      {adding && <AddRiderForm t={t} bikes={bikeChoices(t, list, names)} onAdd={riders.onAdd} onCancel={() => setAdding(false)} />}
      <RiderPanel key={rider.id} {...props} rider={rider} others={list.filter((r) => r.id !== rider.id)} names={names} />
    </Block>
  );
};
