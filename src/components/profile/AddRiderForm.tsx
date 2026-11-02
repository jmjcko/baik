'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { MAX_BIKE_NAME_LENGTH } from '@/lib/passport/garage';
import { MAX_RIDER_NAME_LENGTH } from '@/lib/passport/riders';
import type { RidingDiscipline } from '@/types/baikfit';
import { KindPicker } from '@/components/garage/AddBikeForm';
import { PILL, PILL_OUTLINE } from './ProfileParts';

const FIELD = 'w-full h-12 rounded-xl border border-line bg-surface px-4 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-tone-info-line';

interface AddRiderFormProps {
  t: Translations;
  /** Adds a rider with their first bike, which becomes the active bike; false when it could not be done. */
  onAdd: (name: string, bikeName: string, discipline: RidingDiscipline) => boolean;
  onCancel: () => void;
}

const valid = (text: string, max: number): boolean => text.trim() !== '' && text.trim().length <= max;

const NameField: React.FC<{ label: string; value: string; max: number; placeholder: string; testId: string; onChange: (value: string) => void }> = ({ label, value, max, placeholder, testId, onChange }) => (
  <label className="block space-y-1">
    <span className="text-xs font-semibold text-ink-2">{label}</span>
    <input type="text" maxLength={max} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={FIELD} data-testid={testId} />
  </label>
);

/** A name for the rider, a name and a kind for their first bike; the note says that the body data of another person is kept here. */
export const AddRiderForm: React.FC<AddRiderFormProps> = ({ t, onAdd, onCancel }) => {
  const r = t.riders;
  const [name, setName] = useState('');
  const [bikeName, setBikeName] = useState('');
  const [discipline, setDiscipline] = useState<RidingDiscipline>('road');
  const [error, setError] = useState<'name' | 'failed' | null>(null);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = valid(name, MAX_RIDER_NAME_LENGTH) && valid(bikeName, MAX_BIKE_NAME_LENGTH);
    setError(!ok ? 'name' : onAdd(name, bikeName, discipline) ? null : 'failed');
  };
  return (
    <form onSubmit={submit} className="space-y-3 max-w-md" data-testid="rider-add">
      <NameField label={r.nameLabel} value={name} max={MAX_RIDER_NAME_LENGTH} placeholder={r.namePlaceholder} testId="rider-add-name" onChange={setName} />
      <NameField label={r.bikeNameLabel} value={bikeName} max={MAX_BIKE_NAME_LENGTH} placeholder={r.bikeNamePlaceholder} testId="rider-add-bike" onChange={setBikeName} />
      <KindPicker t={t} value={discipline} onChange={setDiscipline} />
      <p className="text-xs text-ink-2 leading-relaxed" data-testid="rider-consent">{r.consent}</p>
      <p className="text-xs text-ink-3">{r.addHint}</p>
      {error && <p role="alert" className="text-sm text-tone-danger-ink">{error === 'name' ? r.nameInvalid : r.failed}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" className={`${PILL} border border-blue-600 bg-blue-600 text-slate-50 hover:bg-blue-700`}>{r.create}</button>
        <button type="button" onClick={onCancel} className={PILL_OUTLINE}>{r.cancel}</button>
      </div>
    </form>
  );
};
