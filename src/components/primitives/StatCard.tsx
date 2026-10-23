import React from 'react';
import { cx } from '@/lib/classNames';

export type StatTone = 'info' | 'success' | 'warning' | 'danger';

const ACCENT: Record<StatTone, string> = {
  info: 'border-l-tone-info-line',
  success: 'border-l-tone-success-line',
  warning: 'border-l-tone-warning-line',
  danger: 'border-l-tone-danger-line',
};

interface StatCardProps {
  label: string;
  value: string;
  tone: StatTone;
  /** The unit shown small after the value. */
  unit?: string;
  /** A value that is not a number (a date, "not set up yet") is shown smaller and quieter. */
  muted?: boolean;
  testId?: string;
}

/** One number of the rider: a white card with a colored left edge, the label and the value (the KPI card of the Aurora design). */
export const StatCard: React.FC<StatCardProps> = ({ label, value, tone, unit, muted, testId }) => (
  <div data-testid={testId} className={cx('p-4 rounded-2xl border border-line border-l-4 bg-surface shadow-sm', ACCENT[tone])}>
    <p className="text-xs font-semibold text-ink-2">{label}</p>
    <p className={cx('mt-2 font-extrabold tracking-tight', muted ? 'text-base text-ink-3' : 'text-3xl text-ink')}>
      {value}
      {unit && !muted && <span className="ml-1 text-base font-semibold text-ink-2">{unit}</span>}
    </p>
  </div>
);
