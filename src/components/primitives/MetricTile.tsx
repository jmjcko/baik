import React from 'react';

export interface MetricTileProps {
  label: string;
  value: string | number;
  unit?: string;
  subLabel?: string;
  statusVariant?: 'cyan' | 'neutral' | 'success' | 'warning' | 'danger';
  className?: string;
}

const VALUE_COLORS: Record<NonNullable<MetricTileProps['statusVariant']>, string> = {
  cyan: 'text-accent-ink',
  neutral: 'text-ink',
  success: 'text-tone-success-ink',
  warning: 'text-tone-warning-ink',
  danger: 'text-tone-danger-ink',
};

const TileValue: React.FC<{ value: string | number; unit?: string; colorClass: string }> = ({ value, unit, colorClass }) => (
  <div className="flex items-baseline gap-1">
    <span className={`text-2xl font-bold mono-chip tracking-tight ${colorClass}`}>{value}</span>
    {unit && <span className="text-xs font-medium text-ink-3 mono-chip">{unit}</span>}
  </div>
);

export const MetricTile: React.FC<MetricTileProps> = ({
  label,
  value,
  unit,
  subLabel,
  statusVariant = 'cyan',
  className = '',
}) => (
  <div
    className={`flex flex-col p-3.5 rounded-xl bg-surface border border-line hover:border-ink-3 transition-colors ${className}`}
  >
    <span className="text-xs uppercase font-medium text-ink-3 tracking-wider select-none mb-1">{label}</span>
    <TileValue value={value} unit={unit} colorClass={VALUE_COLORS[statusVariant]} />
    {subLabel && <span className="text-[11px] text-ink-3 mt-1 line-clamp-2">{subLabel}</span>}
  </div>
);
