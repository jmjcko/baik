'use client';

import React from 'react';
import { cx } from '@/lib/classNames';

interface SegmentedProps<T extends string> {
  label: string;
  options: Array<{ value: T; text: string }>;
  value: T;
  onChange: (value: T) => void;
  /** Tighter buttons for a narrow place, such as the account menu. */
  compact?: boolean;
}

/** A pill-shaped switch between a few text options (language, theme); the chosen one is pressed. */
export function Segmented<T extends string>({ label, options, value, onChange, compact }: SegmentedProps<T>) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-full border border-line bg-sunken p-0.5">
      {options.map((option) => (
        <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => onChange(option.value)} className={cx(compact ? 'h-8 px-2.5' : 'h-9 px-4', 'rounded-full text-xs font-mono font-semibold transition-colors', value === option.value ? 'bg-blue-600 text-slate-50 shadow-sm' : 'text-ink-2 hover:text-ink')}>
          {option.text}
        </button>
      ))}
    </div>
  );
}
