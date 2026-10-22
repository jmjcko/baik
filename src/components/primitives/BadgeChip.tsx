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
    cyan: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/20',
    neutral: 'border-slate-700 text-slate-300 bg-slate-800/40',
    success: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20',
    warning: 'border-amber-500/40 text-amber-400 bg-amber-950/20',
    danger: 'border-red-500/40 text-red-400 bg-red-950/20',
  }[variant];

  return (
    <span
      className={`mono-chip inline-flex items-center text-xs px-2.5 py-0.5 rounded border uppercase font-medium tracking-wider select-none ${variantStyles} ${className}`}
    >
      {label}
    </span>
  );
};
