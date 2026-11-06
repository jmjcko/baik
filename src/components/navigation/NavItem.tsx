'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cx } from '@/lib/classNames';

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  /** A module that does not exist yet: shown, not clickable, with its badge. */
  badge?: string;
  /** A module of the app: larger than a link, with the full name. */
  prominent?: boolean;
  /** A prefix of the label that stays white while the rest is set in light blue ("bAIk" and then "fit", "care", "gear"). */
  accentAfter?: string;
  onClick?: () => void;
}

/** One entry of the sidebar: a functional icon next to its text label (the icon is hidden from screen readers). */
/** The label with the part after the prefix in light blue (lighter on the blue of the current page, so it stays readable). */
const AccentLabel: React.FC<{ label: string; prefix: string; active: boolean }> = ({ label, prefix, active }) =>
  label.startsWith(prefix) && label.length > prefix.length ? <span>{prefix}<span className={active ? 'text-sky-200' : 'text-sky-400'}>{label.slice(prefix.length)}</span></span> : <>{label}</>;

export const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active, badge, prominent, accentAfter, onClick }) => {
  const icon = <Icon aria-hidden="true" className={cx('shrink-0', prominent ? 'w-6 h-6' : 'w-4 h-4')} />;
  if (badge) {
    return (
      <div className={cx('rounded-xl text-slate-400 border border-slate-800/80 bg-slate-900 cursor-not-allowed', prominent ? 'px-4 py-3 space-y-2' : 'px-3.5 py-2.5 text-xs flex items-center justify-between gap-2')}>
        <span className={cx('flex items-center gap-3 min-w-0', prominent && 'text-base font-semibold')}>{icon}<span className={prominent ? '' : 'truncate'}>{label}</span></span>
        <span className={cx('whitespace-nowrap text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full border border-amber-500/30 text-amber-400', prominent ? 'inline-block ml-8' : 'shrink-0')}>{badge}</span>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cx(
        'w-full text-left rounded-xl font-semibold flex items-center transition-colors',
        prominent ? 'px-4 py-4 text-base gap-3 shadow-sm' : 'px-3.5 py-2.5 text-xs gap-2.5',
        active ? 'bg-blue-600 text-white shadow-sm' : prominent ? 'bg-slate-800 text-slate-100 hover:bg-slate-700' : 'text-slate-200 hover:bg-slate-800'
      )}
    >
      {icon}
      {accentAfter ? <AccentLabel label={label} prefix={accentAfter} active={Boolean(active)} /> : label}
    </button>
  );
};
