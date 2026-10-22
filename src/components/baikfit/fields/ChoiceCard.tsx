import React from 'react';
import { cx } from '@/lib/classNames';

type Density = 'roomy' | 'compact';

const CARD_SPACING: Record<Density, { card: string; title: string; description: string }> = {
  roomy: { card: 'p-4', title: 'mb-1', description: 'text-slate-600 leading-relaxed' },
  compact: { card: 'p-3.5', title: 'mb-0.5', description: 'text-slate-500 leading-snug' },
};

const SELECTED = 'border-blue-600 bg-blue-50/70 text-slate-900 ring-1 ring-blue-600/30';
const IDLE = 'border-slate-200 bg-slate-50/60 text-slate-600 hover:border-slate-300';

interface ChoiceCardProps {
  selected: boolean;
  title: string;
  description: string;
  onSelect: () => void;
  density?: Density;
  descriptionClassName?: string;
}

/** Selectable option card with a title and a short description. */
export const ChoiceCard: React.FC<ChoiceCardProps> = ({
  selected,
  title,
  description,
  onSelect,
  density = 'roomy',
  descriptionClassName,
}) => {
  const spacing = CARD_SPACING[density];
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cx('rounded-xl border text-left transition-all', spacing.card, selected ? SELECTED : IDLE)}
    >
      <div className={cx('text-xs font-bold text-slate-900', spacing.title)}>{title}</div>
      <div className={cx('text-[11px]', descriptionClassName ?? spacing.description)}>{description}</div>
    </button>
  );
};
