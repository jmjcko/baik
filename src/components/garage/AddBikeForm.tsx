'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';
import { MAX_BIKE_NAME_LENGTH } from '@/lib/passport/garage';
import { MAX_RIDER_NAME_LENGTH } from '@/lib/passport/riders';
import { RIDING_DISCIPLINES, type RidingDiscipline } from '@/types/baikfit';
import { shortKind } from './bikeLabels';
import { CHIP_OFF, FIELD } from '@/components/primitives/fieldStyles';

/** A rider to choose from for a bike. */
export interface RiderChoice {
  id: string;
  label: string;
}

const PILL = 'h-12 px-6 rounded-full text-sm font-semibold transition-colors disabled:opacity-50';


/** The kind of the new bike: road, gravel or MTB. */
export const KindPicker: React.FC<{ t: Translations; value: RidingDiscipline; onChange: (discipline: RidingDiscipline) => void }> = ({ t, value, onChange }) => (
  <fieldset className="space-y-1">
    <legend className="text-xs font-semibold text-ink-2">{t.profile.garage.kindLabel}</legend>
    <div className="flex flex-wrap gap-2">
      {RIDING_DISCIPLINES.map((option) => (
        <button key={option} type="button" aria-pressed={value === option} onClick={() => onChange(option)} className={cx('h-10 px-4 rounded-full text-xs font-semibold border transition-colors', value === option ? 'bg-blue-600 border-blue-600 text-slate-50' : 'border-line bg-surface text-ink-2 hover:bg-sunken')}>
          {shortKind(t, option)}
        </button>
      ))}
    </div>
  </fieldset>
);

/** The bike is ridden on an indoor trainer: bAIkcare then watches the age of the handlebar tape. */
export const TrainerField: React.FC<{ t: Translations; checked: boolean; onChange: (checked: boolean) => void }> = ({ t, checked, onChange }) => (
  <label className="flex items-start gap-3 text-sm text-ink">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4 accent-blue-600" />
    <span>{t.profile.garage.trainerLabel}<span className="block text-xs text-ink-3">{t.profile.garage.trainerHint}</span></span>
  </label>
);

export const NameField: React.FC<{ label: string; value: string; placeholder: string; onChange: (value: string) => void }> = ({ label, value, placeholder, onChange }) => (
  <label className="block space-y-1">
    <span className="text-xs font-semibold text-ink-2">{label}</span>
    <input type="text" maxLength={MAX_BIKE_NAME_LENGTH} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={FIELD} />
  </label>
);

const NEW_RIDER = '__new__';

/** Whose bike it is: a rider of the account, or a new rider (when the form can add one). */
const RiderSelect: React.FC<{ t: Translations; choices: RiderChoice[]; value: string | undefined; canAdd: boolean; onChange: (riderId: string) => void }> = ({ t, choices, value, canAdd, onChange }) => (
  <label className="block space-y-1" data-testid="add-bike-rider">
    <span className="text-xs font-semibold text-ink-2">{t.riders.riderOfBike}</span>
    <select value={value} onChange={(e) => onChange(e.target.value)} className={FIELD}>
      {choices.map((choice) => <option key={choice.id} value={choice.id}>{choice.label}</option>)}
      {canAdd && <option value={NEW_RIDER}>{t.riders.newRiderOption}</option>}
    </select>
  </label>
);

/** The name of a new rider, with the note that the body data of another person needs their agreement. */
const NewRiderName: React.FC<{ t: Translations; value: string; onChange: (value: string) => void }> = ({ t, value, onChange }) => (
  <div className="space-y-1" data-testid="add-bike-new-rider">
    <label className="block space-y-1">
      <span className="text-xs font-semibold text-ink-2">{t.riders.nameLabel}</span>
      <input type="text" maxLength={MAX_RIDER_NAME_LENGTH} value={value} placeholder={t.riders.namePlaceholder} onChange={(e) => onChange(e.target.value)} className={FIELD} data-testid="new-rider-name" />
    </label>
    <p className="text-xs text-ink-2">{t.riders.addHint}</p>
  </div>
);

/** What the form gives for a new rider: the name of the rider and the first bike of that rider. */
export type AddRiderAction = (name: string, bike: { bikeName: string; discipline: RidingDiscipline; trainer: boolean }) => boolean;

interface AddBikeFormProps {
  t: Translations;
  /** Adds an empty bike that becomes the active one; false when it could not be done. */
  onAdd: (name: string, discipline: RidingDiscipline, trainer: boolean, riderId?: string) => boolean;
  /** Adds a new rider with this bike; given, the form offers "New rider" in the choice of the rider. */
  onAddRider?: AddRiderAction;
  /** The riders to choose from (shown when there are two or more, or when a new rider can be added; the active rider is the default) and the active rider. */
  riders?: RiderChoice[];
  activeRiderId?: string;
  /** Called when the bike was added (the dialog closes). */
  onAdded?: () => void;
  onCancel?: () => void;
}

interface Form {
  riderId: string | undefined;
  riderName: string;
  name: string;
  discipline: RidingDiscipline;
  trainer: boolean;
}

const validName = (text: string, max: number): boolean => text.trim() !== '' && text.trim().length <= max;

/** Adds the bike (and the rider, when "New rider" is chosen); which part was wrong, or null when it worked. */
function submitForm(props: AddBikeFormProps, form: Form): 'name' | 'rider' | 'failed' | null {
  const { onAdd, onAddRider, riders } = props;
  if (!validName(form.name, MAX_BIKE_NAME_LENGTH)) return 'name';
  if (form.riderId === NEW_RIDER && onAddRider) {
    if (!validName(form.riderName, MAX_RIDER_NAME_LENGTH)) return 'rider';
    return onAddRider(form.riderName.trim(), { bikeName: form.name, discipline: form.discipline, trainer: form.trainer }) ? null : 'rider';
  }
  const own = riders && riders.length > 1 && form.riderId && form.riderId !== NEW_RIDER ? [form.riderId] : [];
  return onAdd(form.name, form.discipline, form.trainer, ...own) ? null : 'failed';
}

/** A name and a kind: adds a bike to the garage and makes it the active one. Used on the profile page and in the "which bike" dialog. */
export const AddBikeForm: React.FC<AddBikeFormProps> = (props) => {
  const { t, onAdded, onCancel, riders, activeRiderId, onAddRider } = props;
  const g = t.profile.garage;
  const [form, setForm] = useState<Form>({ riderId: activeRiderId ?? riders?.[0]?.id, riderName: '', name: '', discipline: 'road', trainer: false });
  const [error, setError] = useState<'name' | 'rider' | 'failed' | null>(null);
  const set = (patch: Partial<Form>) => setForm({ ...form, ...patch });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = submitForm(props, form);
    setError(result);
    if (!result) onAdded?.();
  };
  return (
    <form onSubmit={submit} className="space-y-3 max-w-md" data-testid="garage-add">
      <NameField label={g.nameLabel} value={form.name} placeholder={g.namePlaceholder} onChange={(name) => set({ name })} />
      <KindPicker t={t} value={form.discipline} onChange={(discipline) => set({ discipline })} />
      {riders && (riders.length > 1 || onAddRider) && <RiderSelect t={t} choices={riders} value={form.riderId} canAdd={Boolean(onAddRider)} onChange={(riderId) => set({ riderId })} />}
      {form.riderId === NEW_RIDER && onAddRider && <NewRiderName t={t} value={form.riderName} onChange={(riderName) => set({ riderName })} />}
      <TrainerField t={t} checked={form.trainer} onChange={(trainer) => set({ trainer })} />
      {error && <p role="alert" className="text-sm text-tone-danger-ink">{error === 'name' ? g.nameInvalid : error === 'rider' ? t.riders.nameInvalid : g.failed}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" className={`${PILL} border border-blue-600 bg-blue-600 text-slate-50 hover:bg-blue-700`}>{g.create}</button>
        {onCancel && <button type="button" onClick={onCancel} className={`${PILL} ${CHIP_OFF} text-ink`}>{g.cancel}</button>}
      </div>
    </form>
  );
};
