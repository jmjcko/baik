import React, { useState } from 'react';
import { cx } from '@/lib/classNames';
import { fill } from '@/lib/i18n/format';

interface NumberFieldProps {
  id: string;
  label: string;
  hint: string;
  value: number | null;
  limits: readonly [number, number];
  step?: number;
  clearLabel: string;
  errorText: string;
  /** False where a value is always needed (the cranks): there is no way back to "not measured". */
  clearable?: boolean;
  onChange: (value: number | null) => void;
  children?: React.ReactNode;
}

const parse = (text: string): number | null | undefined => {
  if (text.trim() === '') return null;
  const value = Number(text.replace(',', '.'));
  return Number.isFinite(value) ? value : undefined;
};

const toText = (value: number | null) => (value === null ? '' : String(value));

/** The text of the input: it follows the stored value when that changes from outside (another bike), and keeps what is typed otherwise. */
function useFieldText(value: number | null, limits: readonly [number, number], onChange: (value: number | null) => void) {
  const [text, setText] = useState(toText(value));
  const [seen, setSeen] = useState(value);
  if (seen !== value) {
    setSeen(value);
    if (parse(text) !== value) setText(toText(value));
  }
  const parsed = parse(text);
  const invalid = parsed === undefined || (parsed !== null && (parsed < limits[0] || parsed > limits[1]));
  const change = (raw: string) => {
    setText(raw);
    const next = parse(raw);
    if (next === null) onChange(null);
    else if (next !== undefined && next >= limits[0] && next <= limits[1]) onChange(next);
  };
  return { text, invalid, change };
}

/** A measured value in millimetres: it is stored only while it is inside the limits, and an empty field means "not measured". */
export const NumberField: React.FC<NumberFieldProps> = ({ id, label, hint, value, limits, step = 1, clearLabel, errorText, clearable = true, onChange, children }) => {
  const { text, invalid, change } = useFieldText(value, limits, onChange);
  return (
    <div className="space-y-2" data-testid={`custom-field-${id}`}>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-ink">{label}</label>
        {clearable && value !== null && <button type="button" onClick={() => change('')} className="text-xs text-ink-3 hover:text-ink underline">{clearLabel}</button>}
      </div>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={text}
          step={step}
          aria-invalid={invalid}
          aria-describedby={`${id}-hint`}
          onChange={(event) => change(event.target.value)}
          className={cx('w-full h-12 pl-4 pr-12 rounded-xl border bg-surface text-ink text-base focus:outline-none focus:ring-2 focus:ring-blue-600/20', invalid ? 'border-tone-danger-line' : 'border-line')}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink-3" aria-hidden="true">mm</span>
      </div>
      <p id={`${id}-hint`} className={cx('text-xs', invalid ? 'text-tone-danger-ink' : 'text-ink-3')} role={invalid ? 'alert' : undefined}>
        {invalid ? fill(errorText, { min: limits[0], max: limits[1] }) : hint}
      </p>
      {children}
    </div>
  );
};
