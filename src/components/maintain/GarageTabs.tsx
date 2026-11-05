import React from 'react';
import { CalendarClock, ClipboardList, Gauge, SlidersHorizontal, type LucideIcon } from 'lucide-react';
import { cx } from '@/lib/classNames';
import type { Translations } from '@/lib/i18n/translations';

export type GarageTab = 'overview' | 'log' | 'wear' | 'intervals';

const TABS: GarageTab[] = ['overview', 'log', 'wear', 'intervals'];

const ICONS: Record<GarageTab, LucideIcon> = { overview: CalendarClock, log: ClipboardList, wear: Gauge, intervals: SlidersHorizontal };

interface TabsProps {
  t: Translations;
  active: GarageTab;
  /** A number next to a tab: what needs attention, how many entries there are. */
  badges: Partial<Record<GarageTab, { count: number; alert: boolean }>>;
  onChange: (tab: GarageTab) => void;
}

/** The four sections of the garage: Overview (the timeline), Service log, Wear (the technical logbook) and Intervals. */
export const GarageTabs: React.FC<TabsProps> = ({ t, active, badges, onChange }) => (
  <div role="tablist" aria-label={t.service.garageTabs.label} className="inline-flex max-w-full overflow-x-auto gap-1 rounded-full border border-line bg-sunken p-1">
    {TABS.map((tab) => {
      const badge = badges[tab];
      const Icon = ICONS[tab];
      return (
        <button key={tab} type="button" role="tab" id={`garage-tab-${tab}`} aria-selected={active === tab} aria-controls={`garage-panel-${tab}`} onClick={() => onChange(tab)} data-testid={`garage-tab-${tab}`} className={cx('h-11 px-5 rounded-full text-sm font-bold whitespace-nowrap transition-colors inline-flex items-center gap-2', active === tab ? 'bg-blue-600 text-slate-50 shadow-sm' : 'text-ink-2 hover:text-ink hover:bg-surface')}>
          <Icon aria-hidden="true" className="w-4 h-4" />
          {t.service.garageTabs[tab]}
          {badge && badge.count > 0 && <span data-testid={`garage-badge-${tab}`} className={cx('min-w-5 h-5 px-1.5 rounded-full text-[11px] font-bold inline-flex items-center justify-center', badge.alert ? 'bg-tone-warning-bg text-tone-warning-ink border border-tone-warning-line' : 'bg-sunken text-ink-2')}>{badge.count}</span>}
        </button>
      );
    })}
  </div>
);
