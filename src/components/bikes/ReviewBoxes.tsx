'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type { ExtractedBike } from '@/lib/bikes/extraction';
import type { AiStockSelection } from '@/lib/bikes/types';
import { fieldsOf, invalidFields, selectionOf, type ReviewField, type ReviewFields } from '@/components/wizard/stock/reviewForm';

const INPUT = 'w-full h-10 rounded-lg border bg-white px-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500';

interface BoxProps {
  label: string;
  field: ReviewField;
  fields: ReviewFields;
  bad: ReviewField[];
  numeric?: boolean;
  placeholder?: string;
  onChange: (field: ReviewField, value: string) => void;
}

const Box: React.FC<BoxProps> = ({ label, field, fields, bad, numeric, placeholder, onChange }) => (
  <label className="block space-y-1">
    <span className="text-xs font-semibold text-slate-700">{label}</span>
    <input
      type="text"
      inputMode={numeric ? 'decimal' : 'text'}
      autoComplete="off"
      value={fields[field]}
      placeholder={placeholder}
      aria-invalid={bad.includes(field) || undefined}
      onChange={(e) => onChange(field, e.target.value)}
      className={`${INPUT} ${bad.includes(field) ? 'border-rose-500' : 'border-slate-300'}`}
    />
  </label>
);


/** The fields of an editable bike card and the check on confirm: nothing is confirmed while a box is empty or out of range. */
export function useReviewForm(bike: ExtractedBike, onConfirm: (selection: AiStockSelection, share: boolean) => void) {
  const [fields, setFields] = useState<ReviewFields>(() => fieldsOf(bike));
  const [bad, setBad] = useState<ReviewField[]>([]);
  const [share, setShare] = useState(false);
  const change = (field: ReviewField, value: string) => setFields((current) => ({ ...current, [field]: value }));
  const confirm = () => {
    const wrong = invalidFields(fields);
    setBad(wrong);
    if (wrong.length === 0) onConfirm(selectionOf(fields, bike.size, bike), share);
  };
  return { fields, bad, change, confirm, share, setShare };
}

type ReviewTexts = Translations['stockBike']['picker']['review'];

/** The boxes in order: the label, the field, whether it is a number, whether it is optional. */
const ROWS: Array<[(r: ReviewTexts) => string, ReviewField, boolean, boolean]> = [
  [(r) => r.brand, 'brand', false, false],
  [(r) => r.model, 'model', false, false],
  [(r) => r.year, 'year', true, false],
  [(r) => `${r.stack} (mm)`, 'stack', true, false],
  [(r) => `${r.reach} (mm)`, 'reach', true, false],
  [(r) => `${r.seatAngle} (°)`, 'seatAngle', true, false],
  [(r) => `${r.stem} (mm)`, 'stem', true, true],
  [(r) => `${r.handlebar} (mm)`, 'handlebar', true, true],
  [(r) => `${r.crank} (mm)`, 'crank', true, true],
];

export const Boxes: React.FC<{ r: ReviewTexts; form: ReturnType<typeof useReviewForm> }> = ({ r, form }) => (
  <div className="grid grid-cols-2 gap-3">
    {ROWS.map(([label, field, numeric, optional]) => (
      <Box
        key={field}
        label={optional ? `${label(r)} (${r.optional})` : label(r)}
        field={field}
        fields={form.fields}
        bad={form.bad}
        numeric={numeric}
        placeholder={optional ? r.notStated : undefined}
        onChange={form.change}
      />
    ))}
  </div>
);
