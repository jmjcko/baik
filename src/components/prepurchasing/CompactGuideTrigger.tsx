import React from 'react';
import { cx } from '@/lib/classNames';
import type { FieldAccent } from '@/components/baikfit/fields/SliderField';

const COLORS: Record<FieldAccent, string> = {
  blue: 'text-accent-ink hover:text-tone-info-ink',
  teal: 'text-teal-ink hover:text-teal-ink',
};

interface CompactGuideTriggerProps {
  testId: string;
  label: string;
  onClick: () => void;
  accent?: FieldAccent;
}

/** Small mono link that opens a measurement guide modal. */
export const CompactGuideTrigger: React.FC<CompactGuideTriggerProps> = ({ testId, label, onClick, accent = 'blue' }) => (
  <div className="pt-1 flex items-center justify-between">
    <button
      type="button"
      data-testid={testId}
      onClick={onClick}
      className={cx('inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold transition-colors', COLORS[accent])}
    >
      <span>{label}</span>
      <span className="font-mono">→</span>
    </button>
  </div>
);
