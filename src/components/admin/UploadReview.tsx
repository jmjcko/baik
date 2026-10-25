'use client';

import React, { useMemo, useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { cx } from '@/lib/classNames';
import { parseBikeName, type BikeName } from '@/lib/bikes/parseBikeName';
import type { BikeTable } from '@/lib/bikes/tableExtraction';
import type { BikeShare, CatalogRow } from '@/lib/catalog/types';
import type { ReviewField } from '@/components/wizard/stock/reviewForm';
import type { AdminActions } from './useAdminData';
import { Card, FIELD, PILL_OUTLINE, PILL_PRIMARY } from './AdminParts';
import { NO_SEED_DISK, SeedDiskOption, seedDiskReady, writeToSeedFile, type SeedDiskChoice, type SeedDiskOutcome } from './SeedDiskOption';
import { SizesTable, type SizeRow } from './SizesTable';
import { headBad, planSave, rowBad, rowsOf, statusOf } from './tableRows';

/** How many sizes were saved of those that were ticked. */
export interface SaveResult {
  saved: number;
  total: number;
  /** The result of writing to seedBikes.json, when the owner asked for it. */
  seed?: SeedDiskOutcome;
}

const NAME_FIELDS = ['brand', 'model', 'year'] as const;

/** Brand, model and year, taken from the typed name: a first guess that the owner corrects. */
const HeadFields: React.FC<{ t: Translations; head: BikeName; bad: ReviewField[]; onChange: (head: BikeName) => void }> = ({ t, head, bad, onChange }) => (
  <div className="grid grid-cols-3 gap-3">
    {NAME_FIELDS.map((key) => (
      <label key={key} className="block space-y-1">
        <span className="text-xs font-semibold text-ink-2">{t.stockBike.picker.review[key]}</span>
        <input type="text" value={head[key]} aria-invalid={bad.includes(key) || undefined} onChange={(e) => onChange({ ...head, [key]: e.target.value })} className={cx(FIELD, bad.includes(key) && 'border-tone-danger-line')} />
      </label>
    ))}
  </div>
);

interface ReviewProps {
  t: Translations;
  table: BikeTable;
  name: string;
  catalog: CatalogRow[];
  actions: AdminActions;
  onDone: (result: SaveResult | null) => void;
}

type RowEdit = Partial<SizeRow> | { field: keyof SizeRow['fields']; value: string };

/** The editable rows of the table. */
function useRows(table: BikeTable) {
  const [rows, setRows] = useState<SizeRow[]>(() => rowsOf(table.sizes));
  const change = (index: number, edit: RowEdit) =>
    setRows(rows.map((row, at) => (at !== index ? row : 'field' in edit ? { ...row, fields: { ...row.fields, [edit.field]: edit.value } } : { ...row, ...edit })));
  return { rows, change };
}

const Intro: React.FC<{ u: Translations['admin']['upload'] }> = ({ u }) => (
  <div>
    <h4 className="text-sm font-bold text-ink">{u.checkTitle}</h4>
    <p className="text-xs text-ink-2 leading-relaxed mt-1">{u.checkHint}</p>
  </div>
);

const Buttons: React.FC<{ u: Translations['admin']['upload']; count: number; busy: boolean; onSave: () => void; onDiscard: () => void }> = ({ u, count, busy, onSave, onDiscard }) => (
  <div className="flex flex-wrap gap-2">
    <button type="button" disabled={busy || count === 0} onClick={onSave} className={PILL_PRIMARY}>{fill(u.save, { count })}</button>
    <button type="button" disabled={busy} onClick={onDiscard} className={PILL_OUTLINE}>{u.discard}</button>
  </div>
);

/** Saves the sizes to the catalog and, when asked and everything was saved, also to seedBikes.json. */
async function saveAll(plan: BikeShare[], seedDisk: SeedDiskChoice, actions: AdminActions): Promise<SaveResult> {
  const saved = await actions.saveOwnerMany(plan, null);
  const seed = seedDisk.enabled && saved === plan.length ? await writeToSeedFile(plan, seedDisk) : undefined;
  return { saved, total: plan.length, ...(seed ? { seed } : {}) };
}

/** What the AI read: the owner checks and corrects every size, leaves out what is not wanted, and saves all of them as verified. */
export const UploadReview: React.FC<ReviewProps> = ({ t, table, name, catalog, actions, onDone }) => {
  const u = t.admin.upload;
  const [head, setHead] = useState(() => parseBikeName(name));
  const { rows, change } = useRows(table);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [seedDisk, setSeedDisk] = useState<SeedDiskChoice>(NO_SEED_DISK);
  const statuses = useMemo(() => rows.map((row, index) => statusOf(head, row, table.sizes[index], catalog)), [head, rows, table.sizes, catalog]);
  const plan = planSave(head, rows, table.sizes);
  const save = async () => {
    setTried(true);
    if (!plan || !seedDiskReady(seedDisk, head.brand)) return;
    setBusy(true);
    onDone(await saveAll(plan, seedDisk, actions));
  };
  return (
    <Card testId="upload-review">
      <Intro u={u} />
      <HeadFields t={t} head={head} bad={headBad(head, rows)} onChange={setHead} />
      <p className="text-xs font-semibold text-ink-2">{fill(u.sizesFound, { count: table.sizes.length })}</p>
      {table.skipped > 0 && <p className="text-xs text-tone-warning-ink">{fill(u.skipped, { count: table.skipped })}</p>}
      <SizesTable texts={u} rows={rows} bad={rows.map((row) => rowBad(head, row))} statuses={statuses} onChange={change} />
      <SeedDiskOption t={t} brand={head.brand} choice={seedDisk} tried={tried} onChange={setSeedDisk} />
      {tried && plan === null && <p role="alert" className="text-sm text-tone-danger-ink">{u.invalid}</p>}
      <Buttons u={u} count={rows.filter((row) => row.include).length} busy={busy} onSave={() => void save()} onDiscard={() => onDone(null)} />
    </Card>
  );
};
