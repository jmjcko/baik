'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { STEP_COUNT } from '@/lib/gear/gearState';
import { MAX_PURCHASES, type SavedPurchase } from '@/lib/gear/savedPurchases';

interface SavedProps {
  t: Translations;
  locale: 'en' | 'cs';
  purchases: SavedPurchase[];
  onOpen: (purchase: SavedPurchase) => void;
  onDelete: (id: string) => void;
  onDone: (purchase: SavedPurchase) => void;
}

const BUTTON = 'h-10 px-4 rounded-full text-xs font-semibold border transition-colors';
const GHOST = `${BUTTON} border-line bg-surface text-ink-2 hover:bg-sunken`;

const date = (locale: 'en' | 'cs', iso: string): string => new Date(iso).toLocaleDateString(locale === 'cs' ? 'cs-CZ' : 'en-GB');

/** One saved purchase: the product, where the rider stopped and the buttons; deleting asks once more in the same place. */
const PurchaseCard: React.FC<Omit<SavedProps, 'purchases'> & { purchase: SavedPurchase }> = ({ t, locale, purchase, onOpen, onDelete, onDone }) => {
  const [asking, setAsking] = useState(false);
  const s = t.gear.saved;
  const answered = Object.keys(purchase.answers).filter((id) => purchase.selected.includes(id)).length;
  return (
    <li data-testid={`purchase-${purchase.id}`} className="rounded-xl border border-line bg-surface p-4 space-y-3">
      <div>
        <p className="text-sm font-bold text-ink">{purchase.title || s.untitled}</p>
        <p className="text-xs font-mono text-ink-3 mt-0.5">{fill(s.stepOf, { n: purchase.step + 1, total: STEP_COUNT })} · {fill(s.answered, { n: answered })} · {fill(s.updated, { date: date(locale, purchase.updatedAt) })}</p>
      </div>
      {asking ? (
        <div role="alertdialog" aria-label={s.confirmDelete} className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-ink">{s.confirmDelete}</span>
          <button type="button" onClick={() => onDelete(purchase.id)} data-testid="purchase-delete-yes" className={`${BUTTON} border-tone-danger-line bg-tone-danger-bg text-tone-danger-ink`}>{s.yes}</button>
          <button type="button" onClick={() => setAsking(false)} className={GHOST}>{s.no}</button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => onOpen(purchase)} data-testid="purchase-open" className={`${BUTTON} border-blue-600 bg-blue-600 text-slate-50 hover:bg-blue-700`}>{purchase.status === 'open' ? s.continue : s.reopen}</button>
          {purchase.status === 'open' && <button type="button" onClick={() => onDone(purchase)} data-testid="purchase-done" className={GHOST}>{s.markDone}</button>}
          <button type="button" onClick={() => setAsking(true)} data-testid="purchase-delete" className={GHOST}>{s.delete}</button>
        </div>
      )}
    </li>
  );
};

const Group: React.FC<SavedProps & { title: string; status: SavedPurchase['status']; testId: string }> = ({ title, status, testId, purchases, ...rest }) => {
  const list = purchases.filter((one) => one.status === status);
  if (list.length === 0) return null;
  return (
    <div className="space-y-2" data-testid={testId}>
      <p className="text-xs font-bold uppercase tracking-wider text-ink-3">{title} ({list.length})</p>
      <ul className="grid gap-3 md:grid-cols-2">{list.map((purchase) => <PurchaseCard key={purchase.id} {...rest} purchase={purchase} />)}</ul>
    </div>
  );
};

/** The purchases the rider saved: the ones in progress first, the finished ones under them; nothing at all when there are none. */
export const SavedPurchases: React.FC<SavedProps> = (props) => {
  const s = props.t.gear.saved;
  if (props.purchases.length === 0) return null;
  return (
    <section data-testid="saved-purchases" aria-label={s.title} className="rounded-2xl border border-tone-info-line bg-tone-info-bg p-5 space-y-4">
      <div>
        <h2 className="text-base font-bold text-ink tracking-tight">{s.title}</h2>
        <p className="text-xs text-ink-2 mt-1">{fill(s.limit, { max: MAX_PURCHASES })}</p>
      </div>
      <Group {...props} title={s.openTitle} status="open" testId="purchases-open" />
      <Group {...props} title={s.doneTitle} status="done" testId="purchases-done" />
    </section>
  );
};
