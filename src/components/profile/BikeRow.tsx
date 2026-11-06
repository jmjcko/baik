'use client';

import React, { useState } from 'react';
import type { Locale, Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { cx } from '@/lib/classNames';
import { MAX_BIKE_NAME_LENGTH } from '@/lib/passport/garage';
import type { BikeProfile } from '@/lib/passport/types';
import { shortKind } from '@/components/garage/bikeLabels';
import { BikeDrawing } from '@/components/studio/wireframe/BikeDrawing';
import { ActionMenu, type MenuItem } from './ActionMenu';
import { CardLabel, PILL_DANGER, PILL_SECONDARY, PILL_SOLID } from './ProfileParts';
import { formatDay } from './format';
import { FIELD } from '@/components/primitives/fieldStyles';

type Texts = Translations['profile']['garage'];

/** The name of a bike: the rider's own, else the factory bike it was chosen from, else a plain "bike without a name". */
export const bikeTitle = (g: Texts, bike: BikeProfile): string => bike.name ?? bike.factoryName ?? g.unnamed;



function deltaText(g: Texts, saddle: number | null, spacers: number | null): string[] {
  const lines: string[] = [];
  if (saddle !== null) lines.push(saddle === 0 ? g.saddleKeep : fill(saddle > 0 ? g.saddleBack : g.saddleForward, { delta: Math.abs(saddle) }));
  if (spacers !== null) lines.push(spacers === 0 ? g.spacerKeep : fill(spacers > 0 ? g.spacerAdd : g.spacerRemove, { delta: Math.abs(spacers) }));
  return lines;
}

export interface BikeRowProps {
  t: Translations;
  locale: Locale;
  bike: BikeProfile;
  /** How many bikes the garage holds (the only bike cannot be deleted). */
  count: number;
  /** The riders this bike can be given to (every rider but its own). */
  others: Array<{ id: string; label: string }>;
  onSwitch: () => void;
  onAudit: () => void;
  onRename: (name: string) => boolean;
  onRemove: () => boolean;
  onGive: (riderId: string) => void;
  /** The numbers of the bike on one line (saddle, handlebar, crank); known only for the active bike. */
  setup?: string;
  /** Opens the setup guide at the step of the bike (given for the active bike, whose numbers the guide holds). */
  onEditSetup?: () => void;
}

/** The name of the bike as a small form while it is changed; the draft is kept until it is saved or cancelled. */
const RenameBike: React.FC<{ g: Texts; title: string; draft: string; setDraft: (draft: string | null) => void; onRename: (name: string) => boolean }> = ({ g, title, draft, setDraft, onRename }) => {
  const [failed, setFailed] = useState(false);
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
        <button type="submit" className={PILL_SOLID}>{g.save}</button>
        <button type="button" onClick={() => { setDraft(null); setFailed(false); }} className={PILL_SECONDARY}>{g.cancel}</button>
      </div>
    </form>
  );
};

/** The picture of the bike on a light ground in both themes, so the dark tyres of the drawing stay visible. */
const BikePicture: React.FC<{ bike: BikeProfile }> = ({ bike }) => (
  <div className="rounded-xl border border-line bg-cad-picture p-1.5 text-ink-2">
    <BikeDrawing kind={bike.discipline === 'xc_mtb' ? 'mtb' : 'road'} className="block w-full h-auto" />
  </div>
);

/** What the bike is: kind, setup, year and size on one line. */
const BikeFacts: React.FC<{ t: Translations; bike: BikeProfile }> = ({ t, bike }) => {
  const g = t.profile.garage;
  const parts = [shortKind(t, bike.discipline), bike.isStock ? g.factory : g.ownSetup];
  if (bike.year !== null && bike.size !== null) parts.push(fill(g.yearSize, { year: bike.year, size: bike.size }));
  return <p className="text-sm text-ink-2">{parts.join(' · ')}</p>;
};

/** The last diagnosis with what it asked to change. */
const BikeDiagnosis: React.FC<{ g: Texts; bike: BikeProfile; locale: Locale }> = ({ g, bike, locale }) => {
  const { diagnosis } = bike;
  const lines = diagnosis ? deltaText(g, diagnosis.saddleDeltaMm, diagnosis.spacerDeltaMm) : [];
  return (
    <div className="space-y-0.5 text-sm">
      <CardLabel>{g.lastDiagnosis}</CardLabel>
      <p className="font-semibold text-ink">{diagnosis ? formatDay(diagnosis.at, locale) : g.never}</p>
      {lines.length > 0 && <p className="text-xs text-ink-2" data-testid="garage-deltas">{lines.join(', ')}</p>}
    </div>
  );
};

/** The items of the "More" menu of a bike: rename, give to each other rider, delete (not the active bike and not the only one). */
function bikeMenuItems(props: BikeRowProps, startRename: () => void, startRemove: () => void): MenuItem[] {
  const { t, bike, count, others, onGive, onAudit, onEditSetup } = props;
  const g = t.profile.garage;
  const blocked = bike.isActive ? (count > 1 ? g.removeActiveHint : g.removeOnlyHint) : undefined;
  return [
    { id: 'rename', label: g.rename, onSelect: startRename },
    ...(onEditSetup ? [{ id: 'setup', label: g.editSetup, onSelect: onEditSetup }] : []),
    ...(bike.isActive ? [] : [{ id: 'audit', label: g.audit, onSelect: onAudit }]),
    ...others.map((rider) => ({ id: `give-${rider.id}`, label: fill(t.riders.giveToRider, { rider: rider.label }), onSelect: () => onGive(rider.id) })),
    { id: 'remove', label: g.remove, onSelect: startRemove, danger: true, unavailable: blocked },
  ];
}

/** Delete with a second step: the bike and its service book are gone for good. */
const ConfirmRemove: React.FC<{ g: Texts; onConfirm: () => boolean; onCancel: () => void }> = ({ g, onConfirm, onCancel }) => {
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex flex-wrap gap-2 sm:col-span-full" data-testid="garage-remove">
      <button type="button" onClick={() => setFailed(!onConfirm())} className={PILL_DANGER}>{g.confirmRemove}</button>
      <button type="button" onClick={onCancel} className={PILL_SECONDARY}>{g.cancel}</button>
      {failed && <p role="alert" className="w-full text-sm text-tone-danger-ink">{g.failed}</p>}
    </div>
  );
};

/** One bike of the selected rider: the picture, the name with its state, the facts, the last diagnosis, one main button and the "More" menu. */
export const BikeRow: React.FC<BikeRowProps> = (props) => {
  const { t, locale, bike, onSwitch, onAudit, onRename, onRemove, setup } = props;
  const g = t.profile.garage;
  const title = bikeTitle(g, bike);
  const [draft, setDraft] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  return (
    <li className={cx('grid gap-x-4 gap-y-3 px-4 py-4 sm:px-5 grid-cols-[5.5rem_minmax(0,1fr)] sm:grid-cols-[6rem_minmax(0,1.4fr)_minmax(0,1fr)_auto] items-center border-t border-line first:border-t-0')} data-testid="garage-bike">
      <BikePicture bike={bike} />
      <div className="min-w-0 space-y-1">
        {draft === null ? (
          <div className="flex flex-wrap items-center gap-2"><h4 className="text-base font-extrabold text-ink tracking-tight break-words">{title}</h4>{bike.isActive && <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-tone-success-line bg-tone-success-bg text-tone-success-ink">{g.active}</span>}</div>
        ) : <RenameBike g={g} title={title} draft={draft} setDraft={setDraft} onRename={onRename} />}
        <BikeFacts t={t} bike={bike} />
        {setup && <p className="text-xs font-mono font-semibold text-ink-2" data-testid="bike-setup">{setup}</p>}
      </div>
      <div className="col-span-2 sm:col-span-1"><BikeDiagnosis g={g} bike={bike} locale={locale} /></div>
      <div className="col-span-2 sm:col-span-1 flex flex-wrap items-center gap-2 sm:justify-end">
        <button type="button" onClick={bike.isActive ? onAudit : onSwitch} aria-label={`${bike.isActive ? g.audit : g.makeActive}: ${title}`} className={PILL_SOLID}>{bike.isActive ? g.audit : g.makeActive}</button>
        <ActionMenu label={t.riders.moreActions} subject={title} items={bikeMenuItems(props, () => setDraft(bike.name ?? bike.factoryName ?? ''), () => setRemoving(true))} />
      </div>
      {removing && <ConfirmRemove g={g} onConfirm={onRemove} onCancel={() => setRemoving(false)} />}
    </li>
  );
};
