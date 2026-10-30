'use client';

import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { SurfaceCard } from '@/components/primitives/SurfaceCard';
import { setupRows } from '@/lib/service/describe';
import { BOOK_LIMITS, type BikeIdentity, type FitSummary } from '@/types/service';
import type { BikeCare } from '@/types/maintain';
import { PhotoField } from './PhotoField';

interface PassportProps {
  t: Translations;
  identity: BikeIdentity;
  fit: FitSummary;
  care: BikeCare;
  onChange: (patch: Partial<BikeIdentity>) => void;
}

const INPUT = 'h-12 w-full rounded-xl border border-line bg-surface px-4 text-sm text-ink';

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

const SetupBlock: React.FC<Pick<PassportProps, 't' | 'fit' | 'care'>> = ({ t, fit, care }) => {
  const s = t.service.passport.setup;
  return (
    <div className="rounded-xl border border-line bg-sunken p-4 space-y-3" data-testid="passport-setup">
      <div>
        <h3 className="text-sm font-bold text-ink">{s.title}</h3>
        <p className="text-xs text-ink-2 mt-1">{s.intro}</p>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {setupRows(t.service, fit, care).map((row) => (
          <div key={row.key} data-testid={`setup-${row.key}`}>
            <dt className="text-xs text-ink-3">{row.label}</dt>
            <dd className="font-semibold text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

/** The identity card of the bike: make, model, year, frame and insurance number, a photo, and the setup read from the fit and the care. */
export const BikePassportCard: React.FC<PassportProps> = ({ t, identity, fit, care, onChange }) => {
  const p = t.service.passport;
  return (
    <SurfaceCard as="section" className="space-y-5" padding="lg" testId="bike-passport">
      <div>
        <h2 className="text-lg font-bold text-ink tracking-tight">{p.title}</h2>
        <p className="text-sm text-ink-2 leading-relaxed mt-1">{p.intro}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Text label={p.make} value={identity.make} testId="identity-make" onChange={(make) => onChange({ make })} />
        <Text label={p.model} value={identity.model} testId="identity-model" onChange={(model) => onChange({ model })} />
        <YearField label={p.year} year={identity.year} onChange={(year) => onChange({ year })} />
        <Text label={p.serial} hint={p.serialHint} value={identity.serial} testId="identity-serial" onChange={(serial) => onChange({ serial })} />
        <Text label={p.insurance} hint={p.insuranceHint} value={identity.insurance} testId="identity-insurance" onChange={(insurance) => onChange({ insurance })} />
      </div>
      <PhotoField t={t} photo={identity.photo} onChange={(photo) => onChange({ photo })} />
      <p className="flex gap-2 text-xs text-ink-2" data-testid="passport-privacy"><ShieldCheck aria-hidden="true" className="w-4 h-4 shrink-0 mt-0.5" />{p.privacy}</p>
      <SetupBlock t={t} fit={fit} care={care} />
    </SurfaceCard>
  );
};
