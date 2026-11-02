import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';

export type ProfileTab = 'riders' | 'numbers' | 'account';

const TABS: ProfileTab[] = ['riders', 'numbers', 'account'];

interface TabsProps {
  t: Translations;
  active: ProfileTab;
  onChange: (tab: ProfileTab) => void;
}

/** The three sections of "My profile": the riders and their bikes, the calculated numbers, the account with the data rights. */
export const ProfileTabs: React.FC<TabsProps> = ({ t, active, onChange }) => (
  <div role="tablist" aria-label={t.profile.tabs.label} className="inline-flex max-w-full overflow-x-auto gap-1 rounded-full border border-line bg-sunken p-1">
    {TABS.map((tab) => (
      <button key={tab} type="button" role="tab" id={`profile-tab-${tab}`} aria-selected={active === tab} aria-controls={`profile-panel-${tab}`} onClick={() => onChange(tab)} className={cx('h-11 px-5 rounded-full text-sm font-bold whitespace-nowrap transition-colors', active === tab ? 'bg-blue-600 text-slate-50 shadow-sm' : 'text-ink-2 hover:text-ink hover:bg-surface')}>
        {t.profile.tabs[tab]}
      </button>
    ))}
  </div>
);
