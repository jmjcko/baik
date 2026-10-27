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
  /** The sizes that were saved (the caller may go on with them, for example the audit of the owner's own bike). */
  plan?: BikeShare[];
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

/** The rider's way out of the review: use the checked sizes for an audit (and share them), instead of saving to the catalog. */
export interface RiderFinish {
  /** Sharing needs a signed in rider. */
  canShare: boolean;
}

interface ReviewProps {
  t: Translations;
  table: BikeTable;
  name: string;
  catalog: CatalogRow[];
  /** What saving does to the catalog; none in the rider's review. */
  actions?: AdminActions;
  onDone: (result: SaveResult | null) => void;
  /** The rider's review (no catalog, no seed file) or, next to the owner's save, a use of the sizes without saving. */
  rider?: RiderFinish;
  onUse?: (plan: BikeShare[], share: boolean) => void;
  /** Show the write-to-seed-file option (the owner's catalog page; not in path B). */
  seedOption?: boolean;
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

interface ButtonsProps {
  t: Translations;
  count: number;
  busy: boolean;
  rider: RiderFinish | undefined;
  share: boolean;
  onShare: (share: boolean) => void;
  onSave: () => void;
  onUse: ((share: boolean) => void) | undefined;
  /** The rider's way to open the table of numbers (shown while it is folded away). */
  onCheck?: () => void;
  onDiscard: () => void;
}

const Buttons: React.FC<ButtonsProps> = ({ t, count, busy, rider, share, onShare, onSave, onUse, onCheck, onDiscard }) => {
  const u = t.admin.upload;
  const g = t.geometry;
  return (
    <div className="space-y-2">
      {rider?.canShare && <label className="flex items-start gap-2 text-xs text-ink-2"><input type="checkbox" checked={share} onChange={(e) => onShare(e.target.checked)} className="mt-0.5" />{g.shareLabel}</label>}
      <div className="flex flex-wrap gap-2">
        {rider ? <button type="button" disabled={busy || count === 0} onClick={() => onUse?.(share)} className={PILL_PRIMARY}>{g.use}</button> : <button type="button" disabled={busy || count === 0} onClick={onSave} className={PILL_PRIMARY}>{fill(u.save, { count })}</button>}
        {onCheck && <button type="button" disabled={busy} onClick={onCheck} className={PILL_OUTLINE}>{g.check}</button>}
        {!rider && onUse && <button type="button" disabled={busy || count === 0} onClick={() => onUse(false)} className={PILL_OUTLINE}>{g.useWithoutSaving}</button>}
        <button type="button" disabled={busy} onClick={onDiscard} className={PILL_OUTLINE}>{rider ? g.discard : u.discard}</button>
      </div>
    </div>
  );
};

/** Saves the sizes to the catalog and, when asked and everything was saved, also to seedBikes.json. */
async function saveAll(plan: BikeShare[], seedDisk: SeedDiskChoice, actions: AdminActions): Promise<SaveResult> {
  const saved = await actions.saveOwnerMany(plan, null);
  const seed = seedDisk.enabled && saved === plan.length ? await writeToSeedFile(plan, seedDisk) : undefined;
  return { saved, total: plan.length, plan, ...(seed ? { seed } : {}) };
}

/** What the buttons do with the checked sizes: save them to the catalog (the owner) or use them (the rider, or the owner without saving). */
function useReviewFinish({ plan, actions, onDone, onUse }: { plan: BikeShare[] | null; actions?: AdminActions; onDone: ReviewProps['onDone']; onUse?: ReviewProps['onUse'] }) {
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [seedDisk, setSeedDisk] = useState<SeedDiskChoice>(NO_SEED_DISK);
  const save = async () => {
    setTried(true);
    if (!plan || !actions || !seedDiskReady(seedDisk)) return;
    setBusy(true);
    onDone(await saveAll(plan, seedDisk, actions));
  };
  const use = (share: boolean) => {
    setTried(true);
    if (plan) onUse?.(plan, share);
  };
  return { tried, busy, seedDisk, setSeedDisk, save, use };
}

interface ReviewBodyProps {
  t: Translations;
  u: Translations['admin']['upload'];
  table: BikeTable;
  head: BikeName;
  setHead: (head: BikeName) => void;
  rows: SizeRow[];
  change: ReturnType<typeof useRows>['change'];
  statuses: ReturnType<typeof statusOf>[] | undefined;
  seed: { brand: string; choice: SeedDiskChoice; tried: boolean; onChange: (choice: SeedDiskChoice) => void } | null;
}

/** The numbers that the AI read, open to correction: the name split into brand, model and year, and every size of the table. */
const ReviewBody: React.FC<ReviewBodyProps> = ({ t, u, table, head, setHead, rows, change, statuses, seed }) => (
  <>
    <Intro u={u} />
    <HeadFields t={t} head={head} bad={headBad(head, rows)} onChange={setHead} />
    <p className="text-xs font-semibold text-ink-2">{fill(u.sizesFound, { count: table.sizes.length })}</p>
    {table.skipped > 0 && <p className="text-xs text-tone-warning-ink">{fill(u.skipped, { count: table.skipped })}</p>}
    <SizesTable texts={u} rows={rows} bad={rows.map((row) => rowBad(head, row))} statuses={statuses} onChange={change} />
    {seed && <SeedDiskOption t={t} brand={seed.brand} choice={seed.choice} tried={seed.tried} onChange={seed.onChange} />}
  </>
);

/** What the AI read: the checks and the corrections of every size, then the owner saves them as verified, or the rider uses them for an audit (the rider sees a short summary first and opens the numbers only to correct them). */
export const UploadReview: React.FC<ReviewProps> = ({ t, table, name, catalog, actions, onDone, rider, onUse, seedOption = true }) => {
  const u = rider ? { ...t.admin.upload, include: t.geometry.include, checkHint: t.geometry.checkHint } : t.admin.upload;
  const [head, setHead] = useState(() => parseBikeName(name));
  const { rows, change } = useRows(table);
  const [share, setShare] = useState(false);
  const [open, setOpen] = useState(false);
  const statuses = useMemo(() => rows.map((row, index) => statusOf(head, row, table.sizes[index], catalog)), [head, rows, table.sizes, catalog]);
  const plan = planSave(head, rows, table.sizes);
  const finish = useReviewFinish({ plan, actions, onDone, onUse });
  const folded = rider !== undefined && !open && plan !== null;
  return (
    <Card testId="upload-review">
      {folded ? <p className="text-sm text-ink" data-testid="review-summary">{fill(t.geometry.found, { sizes: rows.map((row) => row.size).join(', ') })}</p> : (
        <ReviewBody t={t} u={u} table={table} head={head} setHead={setHead} rows={rows} change={change} statuses={rider ? undefined : statuses} seed={!rider && seedOption ? { brand: head.brand, choice: finish.seedDisk, tried: finish.tried, onChange: finish.setSeedDisk } : null} />
      )}
      {finish.tried && plan === null && <p role="alert" className="text-sm text-tone-danger-ink">{u.invalid}</p>}
      <Buttons t={t} count={rows.filter((row) => row.include).length} busy={finish.busy} rider={rider} share={share} onShare={setShare} onSave={() => void finish.save()} onUse={onUse ? (shared) => finish.use(shared || share) : undefined} onCheck={folded ? () => setOpen(true) : undefined} onDiscard={() => onDone(null)} />
    </Card>
  );
};
