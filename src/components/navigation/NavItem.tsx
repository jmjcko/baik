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
  onClick?: () => void;
}

/** One entry of the sidebar: a functional icon next to its text label (the icon is hidden from screen readers). */
export const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active, badge, prominent, onClick }) => {
  const icon = <Icon aria-hidden="true" className={cx('shrink-0', prominent ? 'w-5 h-5' : 'w-4 h-4')} />;
  if (badge) {
    return (
      <div className={cx('rounded-xl text-slate-400 border border-slate-800/80 bg-slate-900 cursor-not-allowed', prominent ? 'px-4 py-3 space-y-2' : 'px-3.5 py-2.5 text-xs flex items-center justify-between gap-2')}>
        <span className={cx('flex items-center gap-3 min-w-0', prominent && 'text-sm font-semibold')}>{icon}<span className={prominent ? '' : 'truncate'}>{label}</span></span>
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
        prominent ? 'px-4 py-3.5 text-sm gap-3 shadow-sm' : 'px-3.5 py-2.5 text-xs gap-2.5',
        active ? 'bg-blue-600 text-white shadow-sm' : prominent ? 'bg-slate-800 text-slate-100 hover:bg-slate-700' : 'text-slate-200 hover:bg-slate-800'
      )}
    >
      {icon}
      {label}
    </button>
  );
};
