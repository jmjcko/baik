import React from 'react';

export interface RangeSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  error?: string;
  disabled?: boolean;
  id?: string;
}

const SliderHeader: React.FC<{ id?: string; label: string; value: number; unit: string }> = ({ id, label, value, unit }) => (
  <div className="flex items-center justify-between text-sm">
    <label htmlFor={id} className="text-ink-2 font-medium tracking-tight">{label}</label>
    <span className="mono-chip px-2 py-0.5 rounded bg-sunken border border-line text-accent-ink font-semibold text-sm">
      {value} {unit}
    </span>
  </div>
);

const SliderBounds: React.FC<{ min: number; max: number; unit: string }> = ({ min, max, unit }) => (
  <div className="flex justify-between text-sm text-ink-3 mono-chip">
    <span>{min}{unit}</span>
    <span>{max}{unit}</span>
  </div>
);

export const RangeSlider: React.FC<RangeSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = 'mm',
  onChange,
  error,
  disabled = false,
  id,
}) => (
  <div className="flex flex-col gap-2">
    <SliderHeader id={id} label={label} value={value} unit={unit} />
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 bg-sunken rounded-lg appearance-none cursor-pointer accent-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
    />
    <SliderBounds min={min} max={max} unit={unit} />
    {error && <span className="text-sm text-tone-danger-ink mono-chip font-medium mt-0.5">{error}</span>}
  </div>
);
