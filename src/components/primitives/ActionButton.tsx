import React from 'react';

export interface ActionButtonProps {
  label: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  id?: string;
}

const SIZE_STYLES: Record<NonNullable<ActionButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

const VARIANT_STYLES: Record<NonNullable<ActionButtonProps['variant']>, string> = {
  primary:
    'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-md shadow-cyan-900/30 border border-cyan-400/40 active:translate-y-px',
  secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:translate-y-px',
  outline: 'bg-transparent hover:bg-cyan-950/30 text-cyan-400 border border-cyan-500/50 active:translate-y-px',
  danger: 'bg-red-600 hover:bg-red-500 text-white font-semibold border border-red-500 active:translate-y-px',
};

const BASE_STYLES =
  'rounded-full tracking-wide transition-all duration-150 inline-flex items-center justify-center font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  id,
}) => (
  <button
    id={id}
    type={type}
    disabled={disabled}
    onClick={onClick}
    className={`${BASE_STYLES} ${SIZE_STYLES[size]} ${VARIANT_STYLES[variant]} ${className}`}
  >
    {label}
  </button>
);
