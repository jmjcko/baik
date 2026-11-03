import React from 'react';
import { cx } from '@/lib/classNames';

export type FieldAccent = 'blue' | 'teal';

const VALUE_COLOR: Record<FieldAccent, string> = { blue: 'text-accent-ink', teal: 'text-teal-ink' };

export interface SliderFieldProps {
  id: string;
  label: string;
  valueText: string;
  value: number;
  min: number | string;
  max: number | string;
  step: number | string;
  onChange: (value: number) => void;
  accent?: FieldAccent;
  className?: string;
  /** Shown but not editable (the value comes from elsewhere). */
  disabled?: boolean;
  children?: React.ReactNode;
}

const SliderHeader: React.FC<{ id: string; label: string; valueText: string; accent: FieldAccent }> = ({
  id,
  label,
  valueText,
  accent,
}) => (
  <div className="flex justify-between items-center">
    <label htmlFor={id} className="text-xs font-mono font-medium text-ink-2">
      {label}
    </label>
    <span className={cx('font-mono text-sm font-bold', VALUE_COLOR[accent])}>{valueText}</span>
  </div>
);

/** The filled share of the track in percent (the value between min and max). */
const fillPercent = (value: number, min: number | string, max: number | string): number => {
  const span = Number(max) - Number(min);
  return span > 0 ? Math.min(100, Math.max(0, ((value - Number(min)) / span) * 100)) : 0;
};

/** Labelled range input with the current value; children render below the slider (hints, guide triggers). */
export const SliderField: React.FC<SliderFieldProps> = ({ accent = 'blue', className, children, ...input }) => (
  <div className={cx('space-y-2', className)}>
    <SliderHeader id={input.id} label={input.label} valueText={input.valueText} accent={accent} />
    <input
      id={input.id}
      type="range"
      min={input.min}
      max={input.max}
      step={input.step}
      value={input.value}
      disabled={input.disabled}
      onChange={(e) => input.onChange(Number(e.target.value))}
      data-accent={accent}
      style={{ '--pct': `${fillPercent(input.value, input.min, input.max)}%` } as React.CSSProperties}
      className="range-input"
    />
    {children}
  </div>
);
