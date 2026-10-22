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
  cyan: 'text-cyan-400 drop-shadow-[0_0_12px_rgba(0,180,216,0.3)]',
  neutral: 'text-slate-100',
  success: 'text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]',
  warning: 'text-amber-400',
  danger: 'text-red-400',
};

const TileValue: React.FC<{ value: string | number; unit?: string; colorClass: string }> = ({ value, unit, colorClass }) => (
  <div className="flex items-baseline gap-1">
    <span className={`text-2xl font-bold mono-chip tracking-tight ${colorClass}`}>{value}</span>
    {unit && <span className="text-xs font-medium text-slate-400 mono-chip">{unit}</span>}
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
    className={`flex flex-col p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors ${className}`}
  >
    <span className="text-xs uppercase font-medium text-slate-400 tracking-wider select-none mb-1">{label}</span>
    <TileValue value={value} unit={unit} colorClass={VALUE_COLORS[statusVariant]} />
    {subLabel && <span className="text-[11px] text-slate-400 mt-1 line-clamp-2">{subLabel}</span>}
  </div>
);
