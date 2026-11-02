'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { cx } from '@/lib/classNames';
import { MAX_BIKE_NAME_LENGTH } from '@/lib/passport/garage';
import { MAX_RIDER_NAME_LENGTH, type NewBikeOfRider } from '@/lib/passport/riders';
import type { RidingDiscipline } from '@/types/baikfit';
import { KindPicker } from '@/components/garage/AddBikeForm';
import { PILL_SECONDARY, PILL_SOLID } from './ProfileParts';

const FIELD = 'w-full h-12 rounded-xl border border-line bg-surface px-4 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-tone-info-line';

/** A garage bike that can go to the new rider, with the rider it has now and how many bikes that rider has. */
export interface BikeChoice {
  id: string;
  title: string;
  riderName: string;
  riderBikeCount: number;
}

interface AddRiderFormProps {
  t: Translations;
  bikes: BikeChoice[];
  /** Adds a rider with a bike of the garage or a new one, which becomes the active bike; false when it could not be done. */
  onAdd: (name: string, bike: NewBikeOfRider) => boolean;
  onCancel: () => void;
}

type Mode = 'existing' | 'new';

const valid = (text: string, max: number): boolean => text.trim() !== '' && text.trim().length <= max;

const NameField: React.FC<{ label: string; value: string; max: number; placeholder: string; testId: string; onChange: (value: string) => void }> = ({ label, value, max, placeholder, testId, onChange }) => (
  <label className="block space-y-1">
    <span className="text-xs font-semibold text-ink-2">{label}</span>
    <input type="text" maxLength={max} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={FIELD} data-testid={testId} />
  </label>
);

/** Two pills: a bike the rider's account already has, or a new one. */
const ModePicker: React.FC<{ t: Translations; mode: Mode; onChange: (mode: Mode) => void }> = ({ t, mode, onChange }) => (
  <fieldset className="space-y-1">
    <legend className="text-xs font-semibold text-ink-2">{t.riders.bikeModeLabel}</legend>
    <div className="flex flex-wrap gap-2">
      {(['existing', 'new'] as const).map((option) => (
        <button key={option} type="button" aria-pressed={mode === option} onClick={() => onChange(option)} data-testid={`rider-bike-mode-${option}`} className={cx('h-10 px-4 rounded-full text-xs font-semibold border transition-colors', mode === option ? 'border-blue-600 bg-blue-600 text-slate-50' : 'border-line bg-surface text-ink-2 hover:bg-sunken')}>
          {option === 'existing' ? t.riders.bikeModeExisting : t.riders.bikeModeNew}
        </button>
      ))}
    </div>
  </fieldset>
);

/** The choice of a bike of the garage, and the word of warning when its rider would be left without a bike. */
const ExistingBike: React.FC<{ t: Translations; bikes: BikeChoice[]; value: string; onChange: (id: string) => void }> = ({ t, bikes, value, onChange }) => {
  const chosen = bikes.find((bike) => bike.id === value);
  return (
    <div className="space-y-2">
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={t.riders.bikeModeExisting} className={FIELD} data-testid="rider-existing-bike">
        <option value="">{t.riders.chooseBikePlaceholder}</option>
        {bikes.map((bike) => <option key={bike.id} value={bike.id}>{fill(t.riders.bikeNow, { bike: bike.title, rider: bike.riderName })}</option>)}
      </select>
      {chosen && chosen.riderBikeCount === 1 && <p role="status" className="text-xs text-tone-warning-ink font-semibold" data-testid="rider-leaves-without">{fill(t.riders.leavesWithout, { name: chosen.riderName })}</p>}
    </div>
  );
};

/** What the form holds and what pressing "Add the rider" does with it. */
function useAddRider(bikes: BikeChoice[], onAdd: AddRiderFormProps['onAdd']) {
  const [name, setName] = useState('');
  const [mode, setMode] = useState<Mode>(bikes.length > 0 ? 'existing' : 'new');
  const [existingId, setExistingId] = useState('');
  const [bikeName, setBikeName] = useState('');
  const [discipline, setDiscipline] = useState<RidingDiscipline>('road');
  const [error, setError] = useState<'name' | 'bike' | 'failed' | null>(null);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const bike: NewBikeOfRider = mode === 'existing' ? { existingBikeId: existingId } : { bikeName, discipline };
    const problem = !valid(name, MAX_RIDER_NAME_LENGTH) || (mode === 'new' && !valid(bikeName, MAX_BIKE_NAME_LENGTH)) ? 'name' : mode === 'existing' && existingId === '' ? 'bike' : null;
    setError(problem ?? (onAdd(name, bike) ? null : 'failed'));
  };
  return { name, setName, mode, setMode, existingId, setExistingId, bikeName, setBikeName, discipline, setDiscipline, error, submit };
}

/** The bike of the new rider: a bike of the garage, or the name and kind of a new one. */
const BikePart: React.FC<{ t: Translations; bikes: BikeChoice[]; form: ReturnType<typeof useAddRider> }> = ({ t, bikes, form }) => (
  <>
    {bikes.length > 0 && <ModePicker t={t} mode={form.mode} onChange={form.setMode} />}
    {form.mode === 'existing' ? <ExistingBike t={t} bikes={bikes} value={form.existingId} onChange={form.setExistingId} /> : (
      <>
        <NameField label={t.riders.bikeNameLabel} value={form.bikeName} max={MAX_BIKE_NAME_LENGTH} placeholder={t.riders.bikeNamePlaceholder} testId="rider-add-bike" onChange={form.setBikeName} />
        <KindPicker t={t} value={form.discipline} onChange={form.setDiscipline} />
      </>
    )}
  </>
);

/** A name for the rider and their bike: one the account already has (it changes hands with its service book) or a new one; the note says that the body data of another person is kept here. */
export const AddRiderForm: React.FC<AddRiderFormProps> = ({ t, bikes, onAdd, onCancel }) => {
  const r = t.riders;
  const form = useAddRider(bikes, onAdd);
  return (
    <form onSubmit={form.submit} className="space-y-4 max-w-md rounded-2xl border border-line bg-surface p-5" data-testid="rider-add">
      <NameField label={r.nameLabel} value={form.name} max={MAX_RIDER_NAME_LENGTH} placeholder={r.namePlaceholder} testId="rider-add-name" onChange={form.setName} />
      <BikePart t={t} bikes={bikes} form={form} />
      <p className="text-xs text-ink-2 leading-relaxed" data-testid="rider-consent">{r.consent}</p>
      <p className="text-xs text-ink-3">{r.addHint}</p>
      {form.error && <p role="alert" className="text-sm text-tone-danger-ink">{form.error === 'name' ? r.nameInvalid : form.error === 'bike' ? r.chooseBike : r.failed}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" className={PILL_SOLID}>{r.create}</button>
        <button type="button" onClick={onCancel} className={PILL_SECONDARY}>{r.cancel}</button>
      </div>
    </form>
  );
};
