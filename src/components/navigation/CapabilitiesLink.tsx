'use client';

import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';

/** "Fitting capabilities" in the sidebar: open to everyone, guests included. */
export const CapabilitiesLink: React.FC<{ t: Translations; active: boolean; onOpen: () => void }> = ({ t, active, onOpen }) => (
  <button
    type="button"
    onClick={onOpen}
    aria-current={active ? 'page' : undefined}
    className={cx(
      'w-full text-left px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-colors',
      active ? 'bg-blue-600 text-white shadow-sm' : 'border border-slate-700/60 text-slate-200 hover:bg-slate-800/60'
    )}
  >
    {t.navigation.capabilities}
  </button>
);
