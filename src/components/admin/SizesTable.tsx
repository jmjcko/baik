'use client';

import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { cx } from '@/lib/classNames';
import type { ReviewField, ReviewFields } from '@/components/wizard/stock/reviewForm';

/** One frame size in the table: what the owner can edit (as text, so an empty box means "not stated") and whether it is saved. */
export interface SizeRow {
  size: string;
  include: boolean;
  fields: Pick<ReviewFields, 'stack' | 'reach' | 'seatAngle' | 'stem' | 'handlebar' | 'crank'>;
}

export type RowStatus = 'new' | 'replaces' | 'seed';

type NumberField = keyof SizeRow['fields'];
const COLUMNS: NumberField[] = ['stack', 'reach', 'seatAngle', 'stem', 'handlebar', 'crank'];

interface TableProps {
  texts: Translations['admin']['upload'];
  rows: SizeRow[];
  /** Fields of each row that are unusable (shown marked). */
  bad: ReviewField[][];
  statuses: RowStatus[];
  onChange: (index: number, change: Partial<SizeRow> | { field: NumberField; value: string }) => void;
}

const STATUS_KEY = { new: 'statusNew', replaces: 'statusReplaces', seed: 'statusSeed' } as const;
const CELL = 'w-20 h-9 rounded-lg border bg-surface px-2 text-sm text-ink focus:outline-none focus:border-tone-info-line';

interface RowProps {
  texts: TableProps['texts'];
  row: SizeRow;
  bad: ReviewField[];
  status: RowStatus;
  onChange: TableProps['onChange'];
  index: number;
}

const SizeRowView: React.FC<RowProps> = ({ texts, row, bad, status, onChange, index }) => (
  <tr className={cx('border-t border-line', !row.include && 'opacity-50')} data-testid="size-row">
    <th scope="row" className="px-3 py-2 text-left font-semibold text-ink">
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={row.include} aria-label={fill(texts.include, { size: row.size })} onChange={(e) => onChange(index, { include: e.target.checked })} />
        {row.size}
      </label>
    </th>
    {COLUMNS.map((key) => (
      <td key={key} className="px-2 py-2">
        <input
          type="text"
          inputMode="decimal"
          value={row.fields[key]}
          placeholder={texts.notStated}
          aria-label={`${texts.columns[key]} ${row.size}`}
          aria-invalid={bad.includes(key) || undefined}
          onChange={(e) => onChange(index, { field: key, value: e.target.value })}
          className={cx(CELL, bad.includes(key) ? 'border-tone-danger-line' : 'border-line')}
        />
      </td>
    ))}
    <td className={cx('px-3 py-2 text-xs', status === 'new' ? 'text-ink-2' : 'text-tone-warning-ink')}>{texts[STATUS_KEY[status]]}</td>
  </tr>
);

/** The sizes that the AI read: every number can be corrected, a size can be left out, and the status says what saving does to it. */
export const SizesTable: React.FC<TableProps> = ({ texts, rows, bad, statuses, onChange }) => (
  <div className="overflow-x-auto rounded-xl border border-line" data-testid="sizes-table">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-sunken text-left text-xs font-semibold text-ink-2">
          <th className="px-3 py-2" scope="col">{texts.columns.size}</th>
          {COLUMNS.map((key) => <th key={key} className="px-2 py-2" scope="col">{texts.columns[key]}</th>)}
          <th className="px-3 py-2" scope="col">{texts.columns.status}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => <SizeRowView key={row.size} texts={texts} row={row} bad={bad[index]} status={statuses[index]} onChange={onChange} index={index} />)}
      </tbody>
    </table>
  </div>
);
