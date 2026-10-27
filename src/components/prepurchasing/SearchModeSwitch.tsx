import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';

export type SearchMode = 'known' | 'finder';

/** The two ways to start path B: a bike that the rider already knows, or help with choosing one. */
export const SearchModeSwitch: React.FC<{ t: Translations; mode: SearchMode; onChange: (mode: SearchMode) => void }> = ({ t, mode, onChange }) => (
  <div role="tablist" aria-label={t.finder.modeLabel} className="flex rounded-full border border-line bg-sunken p-0.5 max-w-md">
    {(['known', 'finder'] as const).map((value) => (
      <button
        key={value}
        type="button"
        role="tab"
        aria-selected={mode === value}
        onClick={() => onChange(value)}
        className={cx('flex-1 h-10 rounded-full text-sm font-semibold', mode === value ? 'bg-blue-600 text-slate-50 shadow-sm' : 'text-ink-2 hover:text-ink')}
      >
        {value === 'known' ? t.finder.modeKnown : t.finder.modeFinder}
      </button>
    ))}
  </div>
);
