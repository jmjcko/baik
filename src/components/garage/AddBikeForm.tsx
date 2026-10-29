'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';
import { MAX_BIKE_NAME_LENGTH } from '@/lib/passport/garage';
import { RIDING_DISCIPLINES, type RidingDiscipline } from '@/types/baikfit';
import { shortKind } from './bikeLabels';

const PILL = 'h-12 px-6 rounded-full text-sm font-semibold transition-colors disabled:opacity-50';
const FIELD = 'w-full h-12 rounded-xl border border-line bg-surface px-4 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-tone-info-line';

/** The kind of the new bike: road, gravel or MTB. */
const KindPicker: React.FC<{ t: Translations; value: RidingDiscipline; onChange: (discipline: RidingDiscipline) => void }> = ({ t, value, onChange }) => (
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

interface AddBikeFormProps {
  t: Translations;
  /** Adds an empty bike that becomes the active one; false when it could not be done. */
  onAdd: (name: string, discipline: RidingDiscipline) => boolean;
  /** Called when the bike was added (the dialog closes). */
  onAdded?: () => void;
  onCancel?: () => void;
}

/** A name and a kind: adds a bike to the garage and makes it the active one. Used on the profile page and in the "which bike" dialog. */
export const AddBikeForm: React.FC<AddBikeFormProps> = ({ t, onAdd, onAdded, onCancel }) => {
  const g = t.profile.garage;
  const [name, setName] = useState('');
  const [discipline, setDiscipline] = useState<RidingDiscipline>('road');
  const [error, setError] = useState<'name' | 'failed' | null>(null);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = name.trim() !== '' && name.trim().length <= MAX_BIKE_NAME_LENGTH;
    const added = valid && onAdd(name, discipline);
    setError(!valid ? 'name' : added ? null : 'failed');
    if (added) onAdded?.();
  };
  return (
    <form onSubmit={submit} className="space-y-3 max-w-md" data-testid="garage-add">
      <label className="block space-y-1">
        <span className="text-xs font-semibold text-ink-2">{g.nameLabel}</span>
        <input type="text" maxLength={MAX_BIKE_NAME_LENGTH} value={name} placeholder={g.namePlaceholder} onChange={(e) => setName(e.target.value)} className={FIELD} />
      </label>
      <KindPicker t={t} value={discipline} onChange={setDiscipline} />
      {error && <p role="alert" className="text-sm text-tone-danger-ink">{error === 'name' ? g.nameInvalid : g.failed}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" className={`${PILL} border border-blue-600 bg-blue-600 text-slate-50 hover:bg-blue-700`}>{g.create}</button>
        {onCancel && <button type="button" onClick={onCancel} className={`${PILL} border border-line bg-surface text-ink hover:bg-sunken`}>{g.cancel}</button>}
      </div>
    </form>
  );
};
