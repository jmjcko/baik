import React from 'react';

export interface BadgeChipProps {
  label: string;
  variant?: 'cyan' | 'neutral' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const BadgeChip: React.FC<BadgeChipProps> = ({
  label,
  variant = 'cyan',
  className = '',
}) => {
  const variantStyles = {
    cyan: 'border-tone-info-line text-tone-info-ink bg-tone-info-badge',
    neutral: 'border-line text-ink-2 bg-sunken',
    success: 'border-tone-success-line text-tone-success-ink bg-tone-success-badge',
    warning: 'border-tone-warning-line text-tone-warning-ink bg-tone-warning-badge',
    danger: 'border-tone-danger-line text-tone-danger-ink bg-tone-danger-badge',
  }[variant];

  return (
    <span
      className={`mono-chip inline-flex items-center text-xs px-2.5 py-0.5 rounded border uppercase font-medium tracking-wider select-none ${variantStyles} ${className}`}
    >
      {label}
    </span>
  );
};
