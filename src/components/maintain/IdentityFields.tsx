'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { BOOK_LIMITS, type BikeIdentity } from '@/types/service';
import { PhotoField } from './PhotoField';
import { FIELD } from '@/components/primitives/fieldStyles';

const INPUT = FIELD;

const Text: React.FC<{ label: string; hint?: string; value: string; testId: string; onChange: (value: string) => void }> = ({ label, hint, value, testId, onChange }) => (
  <label className="block space-y-1">
    <span className="text-xs font-semibold text-ink-2">{label}</span>
    <input type="text" value={value} maxLength={BOOK_LIMITS.text} onChange={(e) => onChange(e.target.value)} data-testid={testId} className={INPUT} />
    {hint && <span className="block text-xs text-ink-3">{hint}</span>}
  </label>
);

/** The year is a number in a sensible range; anything else leaves it empty. */
const yearOf = (text: string): number | null => {
  const year = Number(text);
  return Number.isInteger(year) && year >= BOOK_LIMITS.year.min && year <= BOOK_LIMITS.year.max ? year : null;
};

/** The year, typed freely: the stored year is the typed number when it is a sensible one, and the field follows the stored year when another bike is chosen. */
const YearField: React.FC<{ label: string; year: number | null; onChange: (year: number | null) => void }> = ({ label, year, onChange }) => {
  const [text, setText] = useState(year === null ? '' : String(year));
  const [seen, setSeen] = useState(year);
  if (year !== seen) {
    setSeen(year);
    if (yearOf(text) !== year) setText(year === null ? '' : String(year));
  }
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold text-ink-2">{label}</span>
      <input type="text" inputMode="numeric" maxLength={4} value={text} onChange={(e) => { setText(e.target.value); onChange(yearOf(e.target.value)); }} data-testid="identity-year" className={INPUT} />
    </label>
  );
};

/** The fields of the identity of a bike: make, model, year, frame and insurance number, and the photo. Used by the passport card and by the "Edit bike" dialog. */
export const IdentityFields: React.FC<{ t: Translations; identity: BikeIdentity; onChange: (patch: Partial<BikeIdentity>) => void }> = ({ t, identity, onChange }) => {
  const p = t.service.passport;
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Text label={p.make} value={identity.make} testId="identity-make" onChange={(make) => onChange({ make })} />
        <Text label={p.model} value={identity.model} testId="identity-model" onChange={(model) => onChange({ model })} />
        <YearField label={p.year} year={identity.year} onChange={(year) => onChange({ year })} />
        <Text label={p.serial} hint={p.serialHint} value={identity.serial} testId="identity-serial" onChange={(serial) => onChange({ serial })} />
        <Text label={p.insurance} hint={p.insuranceHint} value={identity.insurance} testId="identity-insurance" onChange={(insurance) => onChange({ insurance })} />
      </div>
      <PhotoField t={t} photo={identity.photo} onChange={(photo) => onChange({ photo })} />
    </>
  );
};
