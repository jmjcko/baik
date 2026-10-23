import React from 'react';

export interface SurfaceCardProps {
  children: React.ReactNode;
  className?: string;
  elevation?: 'flat' | 'elevated' | 'glow';
  /** The inner space: 'md' for a card in a grid, 'lg' for a main panel (the setup guide), 'none' when the card lays out its own parts. */
  padding?: 'none' | 'md' | 'lg';
  /** The element that is drawn: a section where the card has a heading of its own. */
  as?: 'div' | 'section';
  testId?: string;
}

const PADDING = { none: '', md: 'p-5', lg: 'p-8' } as const;

/** The shared M3 container of the Aurora design: an opaque white (themed) surface with a border and a shadow. */
export const SurfaceCard: React.FC<SurfaceCardProps> = ({
  children,
  className = '',
  elevation = 'flat',
  padding = 'md',
  as: Tag = 'div',
  testId,
}) => {
  const elevationStyles = {
    flat: 'bg-surface border border-line shadow-sm',
    elevated: 'bg-surface border border-line shadow-md',
    glow: 'bg-surface border border-tone-info-line shadow-md',
  }[elevation];

  return (
    <Tag data-testid={testId} className={`rounded-2xl ${PADDING[padding]} ${elevationStyles} ${className}`}>
      {children}
    </Tag>
  );
};
