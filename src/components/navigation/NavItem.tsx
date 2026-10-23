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
  onClick?: () => void;
}

/** One entry of the sidebar: a functional icon next to its text label (the icon is hidden from screen readers). */
export const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active, badge, onClick }) => {
  if (badge) {
    return (
      <div className="px-3.5 py-2.5 rounded-xl text-xs text-slate-400 border border-slate-800/80 bg-slate-900 flex items-center justify-between gap-2 cursor-not-allowed">
        <span className="flex items-center gap-2.5 min-w-0"><Icon aria-hidden="true" className="w-4 h-4 shrink-0" /><span className="truncate">{label}</span></span>
        <span className="shrink-0 whitespace-nowrap text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full border border-amber-500/30 text-amber-400">{badge}</span>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cx(
        'w-full text-left px-3.5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2.5 transition-colors',
        active ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-200 hover:bg-slate-800'
      )}
    >
      <Icon aria-hidden="true" className="w-4 h-4 shrink-0" />
      {label}
    </button>
  );
};
