'use client';

import React, { useMemo, useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { cx } from '@/lib/classNames';
import { STOCK_BIKE_SPECS } from '@/lib/bikes';
import type { CatalogRow } from '@/lib/catalog/types';
import type { AdminActions } from './useAdminData';
import { FIELD } from './AdminParts';
import { CatalogDetail } from './CatalogDetail';
import { filterBikes, listBikes, sortBikes, type ListedBike, type SortDirection, type SortKey } from './catalogListing';

const COLUMNS: SortKey[] = ['brand', 'model', 'year', 'sizes', 'source'];
/** On a narrow screen these columns move under the model, so that the buttons stay in view. */
const WIDE_ONLY: SortKey[] = ['year', 'sizes', 'source'];
const WIDE_CELL = 'hidden md:table-cell';
const SMALL = 'h-9 px-4 rounded-full border text-sm font-semibold transition-colors disabled:opacity-50';

const SourceLabel: React.FC<{ t: Translations; bike: ListedBike }> = ({ t, bike }) => {
  const c = t.admin.catalog;
  if (bike.source === 'seed') return <>{c.listing.sourceSeed}</>;
  if (bike.source === 'owner') return <>{c.ownerBadge}</>;
  return <>{fill(c.communityBadge, { n: bike.confirmations })}{bike.autoApproved ? ` · ${c.autoBadge}` : ''}</>;
};

const sizesText = (bike: ListedBike): string => {
  const names = bike.sizes.map(([size]) => size);
  return names.length > 1 ? `${names[0]} – ${names[names.length - 1]} (${names.length})` : names[0] ?? '';
};

/** Deleting asks once more; it removes every size of the bike, one after the other, and stops at the first one that fails. */
const DeleteControl: React.FC<{ t: Translations; bike: ListedBike; actions: AdminActions }> = ({ t, bike, actions }) => {
  const c = t.admin.catalog;
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const remove = async () => {
    setBusy(true);
    for (const row of bike.rows) if (!(await actions.remove(row.id))) break;
    setBusy(false);
    setAsking(false);
  };
  if (!asking) return <button type="button" onClick={() => setAsking(true)} className={cx(SMALL, 'border-line bg-surface text-ink hover:bg-sunken')}>{c.delete}</button>;
  return (
    <span role="group" aria-label={c.confirmDelete} className="inline-flex flex-wrap gap-2">
      <button type="button" disabled={busy} onClick={() => void remove()} className={cx(SMALL, 'border-tone-danger-line bg-tone-danger-bg text-tone-danger-ink hover:opacity-80')}>{c.confirmDelete}</button>
      <button type="button" disabled={busy} onClick={() => setAsking(false)} className={cx(SMALL, 'border-line bg-surface text-ink hover:bg-sunken')}>{c.cancel}</button>
    </span>
  );
};

const BikeRow: React.FC<{ t: Translations; bike: ListedBike; open: boolean; onToggle: () => void; actions: AdminActions }> = ({ t, bike, open, onToggle, actions }) => {
  const c = t.admin.catalog;
  return (
    <>
      <tr data-testid="catalog-row" className="border-t border-line hover:bg-sunken">
        <td className="px-4 py-3 font-semibold text-ink">{bike.brand}</td>
        <td className="px-4 py-3 text-ink">
          {bike.model}
          <span className="md:hidden block text-xs text-ink-3">{bike.year} · {sizesText(bike)} · <SourceLabel t={t} bike={bike} /></span>
        </td>
        <td className={cx(WIDE_CELL, 'px-4 py-3 text-ink-2')}>{bike.year}</td>
        <td className={cx(WIDE_CELL, 'px-4 py-3 text-ink-2 whitespace-nowrap')}>{sizesText(bike)}</td>
        <td className={cx(WIDE_CELL, 'px-4 py-3 text-ink-2')}><SourceLabel t={t} bike={bike} /></td>
        <td className="px-4 py-3">
          <span className="inline-flex flex-wrap items-center gap-2">
            <button type="button" aria-expanded={open} onClick={onToggle} className={cx(SMALL, 'border-line bg-surface text-ink hover:bg-sunken')}>{open ? c.listing.hideDetail : c.listing.detail}</button>
            {bike.rows.length > 0 && <DeleteControl t={t} bike={bike} actions={actions} />}
          </span>
        </td>
      </tr>
      {open && <tr className="bg-sunken"><td colSpan={COLUMNS.length + 1} className="px-4 max-w-0"><CatalogDetail t={t} bike={bike} /></td></tr>}
    </>
  );
};

const HeaderCell: React.FC<{ label: string; wide: boolean; active: boolean; direction: SortDirection; onSort: () => void }> = ({ label, wide, active, direction, onSort }) => (
  <th scope="col" aria-sort={active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'} className={cx(wide && WIDE_CELL, 'px-4 py-3 text-left text-xs font-semibold text-ink-3')}>
    <button type="button" onClick={onSort} className="inline-flex items-center gap-1 font-semibold hover:text-ink">
      {label}{active && <span aria-hidden="true">{direction === 'asc' ? '▴' : '▾'}</span>}
    </button>
  </th>
);

function useTableState() {
  const [text, setText] = useState('');
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'brand', direction: 'asc' });
  const [openKeys, setOpenKeys] = useState<ReadonlySet<string>>(new Set());
  const toggleSort = (key: SortKey) => setSort((now) => ({ key, direction: now.key === key && now.direction === 'asc' ? 'desc' : 'asc' }));
  const toggleOpen = (key: string) => setOpenKeys((now) => { const next = new Set(now); if (!next.delete(key)) next.add(key); return next; });
  return { text, setText, sort, toggleSort, openKeys, toggleOpen };
}

/** Every bike the app knows, the seed and the catalog together, one row per bike: search, sort by a column, open a row for its sizes. */
export const CatalogTable: React.FC<{ t: Translations; rows: CatalogRow[]; actions: AdminActions }> = ({ t, rows, actions }) => {
  const c = t.admin.catalog;
  const state = useTableState();
  const all = useMemo(() => listBikes(rows, STOCK_BIKE_SPECS), [rows]);
  const shown = useMemo(() => sortBikes(filterBikes(all, state.text), state.sort.key, state.sort.direction), [all, state.text, state.sort]);
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h3 className="text-base font-bold text-ink">{c.title}</h3>
        <p className="text-xs text-ink-3" role="status">{fill(c.listing.count, { n: shown.length })}</p>
      </div>
      <input type="search" aria-label={c.listing.searchLabel} placeholder={c.listing.searchPlaceholder} value={state.text} onChange={(e) => state.setText(e.target.value)} className={cx(FIELD, 'max-w-md')} />
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-sm">
        <table className="w-full text-sm" data-testid="catalog-table">
          <thead className="bg-sunken">
            <tr>
              {COLUMNS.map((key) => <HeaderCell key={key} label={c.columns[key]} wide={WIDE_ONLY.includes(key)} active={state.sort.key === key} direction={state.sort.direction} onSort={() => state.toggleSort(key)} />)}
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-ink-3">{c.columns.actions}</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((bike) => <BikeRow key={bike.key} t={t} bike={bike} open={state.openKeys.has(bike.key)} onToggle={() => state.toggleOpen(bike.key)} actions={actions} />)}
          </tbody>
        </table>
        {shown.length === 0 && <p className="px-4 py-6 text-sm text-ink-2">{rows.length === 0 && state.text === '' ? c.empty : c.listing.noMatch}</p>}
      </div>
    </section>
  );
};
