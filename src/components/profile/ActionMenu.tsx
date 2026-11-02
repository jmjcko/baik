'use client';

import React, { useState } from 'react';
import { cx } from '@/lib/classNames';
import { useDismiss } from '@/lib/hooks/useDismiss';
import { PILL_SECONDARY, PILL_SOLID } from './ProfileParts';

export interface MenuItem {
  id: string;
  label: string;
  onSelect: () => void;
  danger?: boolean;
  /** Set when the action is not possible now: the item is dimmed and this says why. */
  unavailable?: string;
}

interface MenuProps {
  /** The visible name of the button. */
  label: string;
  /** What the button acts on, for the screen reader ("More: Cube Attain"). */
  subject: string;
  items: MenuItem[];
  solid?: boolean;
  testId?: string;
}

/** A button that opens a short list of actions; the less used ones live here so each row has only one main button. */
export const ActionMenu: React.FC<MenuProps> = ({ label, subject, items, solid, testId }) => {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-haspopup="menu" aria-expanded={open} aria-label={`${label}: ${subject}`} data-testid={testId} onClick={() => setOpen(!open)} className={cx(solid ? PILL_SOLID : PILL_SECONDARY, 'inline-flex items-center gap-2')}>
        {label}<span aria-hidden="true" className="text-[10px] opacity-70">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-20 mt-1.5 min-w-56 max-w-[calc(100vw-2rem)] rounded-2xl border border-line bg-surface p-1.5 shadow-lg">
          {items.map((item) => (
            <div key={item.id}>
              <button type="button" role="menuitem" disabled={item.unavailable !== undefined} onClick={() => { setOpen(false); item.onSelect(); }} className={cx('w-full text-left rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-sunken disabled:opacity-50 disabled:hover:bg-transparent', item.danger ? 'text-tone-danger-ink' : 'text-ink')}>{item.label}</button>
              {item.unavailable && <p className="px-3 pb-2 text-xs text-ink-3">{item.unavailable}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
