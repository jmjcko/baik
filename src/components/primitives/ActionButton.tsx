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
    'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-sm border border-cyan-400/40 active:translate-y-px',
  secondary: 'bg-sunken hover:opacity-80 text-ink-2 border border-line active:translate-y-px',
  outline: 'bg-transparent hover:bg-tone-info-bg text-accent-ink border border-tone-info-line active:translate-y-px',
  danger: 'bg-red-600 hover:bg-red-500 text-slate-50 font-semibold border border-red-500 active:translate-y-px',
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
