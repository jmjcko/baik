'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { useEscape } from '@/lib/hooks/useEscape';
import { SERVICE_CURRENCIES, SERVICE_VARIANTS, type PriceCurrency, type ServiceEntry, type ServiceKind, type WorkshopOffer } from '@/types/service';
import { draftProblem, emptyDraft, entryOf, newEntryId, type EntryDraft } from '@/lib/service/quickLog';
import { FIELD } from '@/components/primitives/fieldStyles';
import { FIELD_AREA } from '@/components/primitives/fieldStyles';

interface DialogProps {
  t: Translations;
  locale: 'en' | 'cs';
  kind: ServiceKind;
  /** The variant to start with (a reminder knows what it asks for); the first one of the kind otherwise. */
  variant?: string | null;
  today: string;
  /** The workshop has recorded this: the form starts with it and offers to skip instead of cancel. */
  offer?: WorkshopOffer;
  onSave: (entry: ServiceEntry) => void;
  onClose: () => void;
}



const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <label className="block space-y-1">
    <span className="text-xs font-semibold text-ink-2">{label}</span>
    {children}
    {hint && <span className="block text-xs text-ink-3">{hint}</span>}
  </label>
);

/** The value field of the entries that carry a number (the chain gauge, the millilitres of sealant). */
const ValueField: React.FC<{ t: Translations; draft: EntryDraft; set: (patch: Partial<EntryDraft>) => void }> = ({ t, draft, set }) => {
  if (draft.kind !== 'chain' && draft.kind !== 'sealant') return null;
  const f = t.service.log.form;
  return (
    <Field label={f.value[draft.kind]} hint={f.valueHint[draft.kind]}>
      <input type="text" inputMode="decimal" value={draft.value} onChange={(e) => set({ value: e.target.value })} data-testid="entry-value" className={FIELD} />
    </Field>
  );
};

const VariantField: React.FC<{ t: Translations; draft: EntryDraft; set: (patch: Partial<EntryDraft>) => void }> = ({ t, draft, set }) => {
  const variants = SERVICE_VARIANTS[draft.kind];
  if (variants.length === 0) return null;
  return (
    <Field label={t.service.log.form.variant}>
      <select value={draft.variant ?? variants[0]} onChange={(e) => set({ variant: e.target.value })} data-testid="entry-variant" className={FIELD}>
        {variants.map((variant) => <option key={variant} value={variant}>{t.service.log.variants[variant as keyof typeof t.service.log.variants]}</option>)}
      </select>
    </Field>
  );
};

const PriceFields: React.FC<{ t: Translations; locale: 'en' | 'cs'; draft: EntryDraft; set: (patch: Partial<EntryDraft>) => void }> = ({ t, locale, draft, set }) => (
  <div className="grid grid-cols-[1fr_8rem] gap-3">
    <Field label={t.service.log.form.price}>
      <input type="text" inputMode="decimal" value={draft.price} onChange={(e) => set({ price: e.target.value })} data-testid="entry-price" className={FIELD} />
    </Field>
    <Field label={t.service.log.form.currency}>
      <select value={draft.currency} onChange={(e) => set({ currency: e.target.value as PriceCurrency })} data-testid="entry-currency" className={FIELD}>
        {SERVICE_CURRENCIES[locale].map((currency) => <option key={currency} value={currency}>{t.service.log.currencies[currency]}</option>)}
      </select>
    </Field>
  </div>
);

const DialogHeader: React.FC<{ t: Translations; kind: ServiceKind; fromWorkshop: boolean; onClose: () => void }> = ({ t, kind, fromWorkshop, onClose }) => (
  <div className="flex items-start justify-between gap-4">
    <div>
      <h2 id="entry-title" className="text-lg font-bold text-ink tracking-tight">{fromWorkshop ? t.service.log.fromWorkshop.title : t.service.log.quick[kind].title}</h2>
      <p className="text-sm text-ink-2 mt-1">{fromWorkshop ? t.service.log.fromWorkshop.intro : t.service.log.form.title}</p>
    </div>
    <button type="button" onClick={onClose} aria-label={t.service.log.form.cancel} className="h-10 w-10 shrink-0 rounded-full border border-line bg-surface text-ink-2 hover:bg-sunken inline-flex items-center justify-center"><X aria-hidden="true" className="w-4 h-4" /></button>
  </div>
);

const DialogButtons: React.FC<{ t: Translations; fromWorkshop: boolean; onClose: () => void }> = ({ t, fromWorkshop, onClose }) => (
  <div className="flex flex-wrap gap-3">
    <button type="submit" data-testid="entry-save" className="h-12 px-6 rounded-full bg-blue-600 text-slate-50 text-sm font-semibold hover:bg-blue-700 transition-colors">{fromWorkshop ? t.service.log.fromWorkshop.save : t.service.log.form.save}</button>
    <button type="button" onClick={onClose} data-testid="entry-skip" className="h-12 px-6 rounded-full border border-line bg-surface text-sm font-semibold text-ink hover:bg-sunken">{fromWorkshop ? t.service.log.fromWorkshop.skip : t.service.log.form.cancel}</button>
  </div>
);

/** The form of a quick entry: the day, what was done, the number where there is one, the price, the warranty and a note. */
export const QuickEntryDialog: React.FC<DialogProps> = ({ t, locale, kind, variant, today, offer, onSave, onClose }) => {
  const f = t.service.log.form;
  const [draft, setDraft] = useState<EntryDraft>(() => ({ ...emptyDraft(kind, today, SERVICE_CURRENCIES[locale][0]), ...(variant ? { variant } : {}), ...(offer ? { at: offer.at, value: offer.value, ...(offer.note ? { note: offer.note } : {}) } : {}) }));
  const [problem, setProblem] = useState<ReturnType<typeof draftProblem>>(null);
  const set = (patch: Partial<EntryDraft>) => setDraft((previous) => ({ ...previous, ...patch }));
  useEscape(onClose);
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const found = draftProblem(draft, today);
    setProblem(found);
    if (found === null) onSave(entryOf(draft, newEntryId()));
  };
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="entry-title" data-testid="entry-dialog" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim print:hidden" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form noValidate onSubmit={submit} className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-line bg-surface p-6 shadow-xl space-y-4">
        <DialogHeader t={t} kind={kind} fromWorkshop={!!offer} onClose={onClose} />
        <Field label={f.day}><input type="date" value={draft.at} max={today} onChange={(e) => set({ at: e.target.value })} data-testid="entry-day" className={FIELD} /></Field>
        <VariantField t={t} draft={draft} set={set} />
        <ValueField t={t} draft={draft} set={set} />
        <PriceFields t={t} locale={locale} draft={draft} set={set} />
        <Field label={f.warranty}><input type="date" value={draft.warrantyUntil} onChange={(e) => set({ warrantyUntil: e.target.value })} data-testid="entry-warranty" className={FIELD} /></Field>
        <Field label={f.note}><textarea value={draft.note} maxLength={300} rows={2} onChange={(e) => set({ note: e.target.value })} data-testid="entry-note" className={FIELD_AREA} /></Field>
        {problem && <p role="alert" data-testid="entry-problem" className="text-sm font-semibold text-tone-danger-ink">{f.problems[problem]}</p>}
        <DialogButtons t={t} fromWorkshop={!!offer} onClose={onClose} />
      </form>
    </div>
  );
};
