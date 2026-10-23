import React from 'react';
import { cx } from '@/lib/classNames';

type Density = 'roomy' | 'compact';

const CARD_SPACING: Record<Density, { card: string; title: string; description: string }> = {
  roomy: { card: 'p-4', title: 'mb-1', description: 'text-ink-2 leading-relaxed' },
  compact: { card: 'p-3.5', title: 'mb-0.5', description: 'text-ink-3 leading-snug' },
};

const SELECTED = 'border-blue-600 bg-tone-info-bg/70 text-ink ring-1 ring-blue-600/30';
const IDLE = 'border-line bg-sunken text-ink-2 hover:border-line';

interface ChoiceCardProps {
  selected: boolean;
  title: string;
  description: string;
  onSelect: () => void;
  density?: Density;
  descriptionClassName?: string;
  /** Optional diagram shown above the title (for example a posture silhouette). */
  visual?: React.ReactNode;
  /** Where the visual sits: above the title (default) or below the description as a quiet accent. */
  visualPosition?: 'top' | 'bottom';
  /** Text size class of the title, for cards where the title is the dominant element. */
  titleSize?: string;
}

/** Selectable option card with a title and a short description. */
export const ChoiceCard: React.FC<ChoiceCardProps> = ({
  selected,
  title,
  description,
  onSelect,
  density = 'roomy',
  descriptionClassName,
  visual,
  visualPosition = 'top',
  titleSize = 'text-xs',
}) => {
  const spacing = CARD_SPACING[density];
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cx('rounded-xl border text-left transition-all', spacing.card, selected ? SELECTED : IDLE)}
    >
      {visualPosition === 'top' && visual}
      <div className={cx(titleSize, 'font-bold text-ink', spacing.title)}>{title}</div>
      <div className={cx('text-[11px]', descriptionClassName ?? spacing.description)}>{description}</div>
      {visualPosition === 'bottom' && visual}
    </button>
  );
};
