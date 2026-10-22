'use client';

import React, { useState } from 'react';
import { cx } from '@/lib/classNames';

interface InfoTipProps {
  label: string;
  tip: string;
  /** Unique id of the tooltip element (referenced by aria-describedby). */
  id: string;
  className?: string;
}

const TOOLTIP_BASE =
  'absolute left-0 top-full z-30 mt-2 w-64 rounded-lg border border-line bg-surface p-3 text-xs font-sans normal-case tracking-normal leading-relaxed text-ink-2 shadow-lg';

function closeOnEscape(event: React.KeyboardEvent<HTMLButtonElement>, close: () => void): void {
  if (event.key !== 'Escape') return;
  close();
  event.currentTarget.blur();
}

/**
 * Text label with an explanation in a tooltip: dotted underline marks it, it opens on hover and keyboard focus,
 * toggles on tap and closes with Escape. No icon, so it follows the zero-icons rule.
 */
export const InfoTip: React.FC<InfoTipProps> = ({ label, tip, id, className }) => {
  const [open, setOpen] = useState(false);
  return (
    <span className={cx('relative inline-block group', className)}>
      <button
        type="button"
        aria-describedby={id}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => closeOnEscape(event, () => setOpen(false))}
        className="text-left uppercase underline decoration-dotted underline-offset-4 cursor-help"
      >
        {label}
      </button>
      <span role="tooltip" id={id} className={cx(TOOLTIP_BASE, open ? 'block' : 'hidden group-hover:block group-focus-within:block')}>
        {tip}
      </span>
    </span>
  );
};
