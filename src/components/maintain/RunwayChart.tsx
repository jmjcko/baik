import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { runwayModel, type RunwayLane } from '@/lib/notifications/runway';
import type { Reminder, ReminderId } from '@/lib/notifications/reminderEngine';
import { StateChip } from './StateChip';
import { LANE_TONE, TONE_FILL, entryFor, logButtonClass, timeText } from './reminderText';

const LABEL = '230px';

interface ChartProps {
  t: Translations;
  locale: 'en' | 'cs';
  reminders: Reminder[];
  today: string;
  onLog: (id: ReminderId) => void;
}

/** The bar of a lane: from the last time to the due day, cut with a square end when it starts before the window, hatched from the due day to today when overdue. */
const Bar: React.FC<{ lane: RunwayLane; reminder: Reminder; todayPct: number }> = ({ lane, reminder, todayPct }) => {
  if (lane.startPct === null || lane.duePct === null) return <div aria-hidden="true" className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-line" />;
  const fill = TONE_FILL[reminder.state];
  const overdue = reminder.state === 'overdue' && todayPct > lane.duePct;
  return (
    <>
      <div className={lane.cutStart ? 'absolute top-1/2 h-2.5 -translate-y-1/2 rounded-r-full' : 'absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full'} style={{ left: `${lane.startPct}%`, width: `${Math.max(lane.duePct - lane.startPct, 0.6)}%`, background: fill }} />
      {overdue && <div className="absolute top-1/2 h-2.5 -translate-y-1/2" style={{ left: `${lane.duePct}%`, width: `${todayPct - lane.duePct}%`, background: 'repeating-linear-gradient(135deg, var(--tone-danger-line) 0 5px, var(--tone-danger-bg) 5px 10px)' }} />}
      {!lane.cutEnd && <div className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[4px] border-2 border-surface" style={{ left: `${lane.duePct}%`, background: fill }} />}
    </>
  );
};

const LaneRow: React.FC<ChartProps & { reminder: Reminder; lane: RunwayLane; todayPct: number }> = ({ t, reminder, lane, todayPct, onLog }) => {
  const r = t.service.reminders;
  const target = entryFor(reminder.id);
  return (
    <li data-testid={`reminder-${reminder.id}`} data-state={reminder.state} className={`grid items-center border-t border-line border-l-4 pl-3 min-h-[76px] py-2 ${LANE_TONE[reminder.state]}`} style={{ gridTemplateColumns: `${LABEL} minmax(0, 1fr)` }}>
      <div className="pr-4 space-y-1">
        <p className="text-sm font-bold text-ink">{r.items[reminder.id].title}</p>
        <StateChip t={t} state={reminder.state} />
        <p className="text-xs text-ink-2">{timeText(t, reminder)}</p>
        {target && <button type="button" onClick={() => onLog(reminder.id)} data-testid={`runway-log-${reminder.id}`} className={logButtonClass(reminder.state, 'h-8')}>{reminder.state === 'unknown' ? t.service.overview.logFirst : t.service.overview.logIt}</button>}
      </div>
      <div aria-hidden="true" className="relative h-full min-h-[44px]"><Bar lane={lane} reminder={reminder} todayPct={todayPct} /></div>
    </li>
  );
};

/** The timeline of the next twelve months: a lane for each reminder, a line for today, the months on top. The text of each lane says all of it, the drawing only shows it. */
export const RunwayChart: React.FC<ChartProps> = (props) => {
  const { t, locale, reminders, today } = props;
  const model = runwayModel(reminders, today);
  const month = new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' });
  return (
    <div className="hidden md:block" data-testid="runway">
      <div aria-hidden="true" className="grid h-6" style={{ gridTemplateColumns: `${LABEL} minmax(0, 1fr)` }}>
        <span />
        <div className="relative">{model.ticks.map((tick) => <span key={tick.day} className="absolute text-[11px] font-semibold text-ink-3 pl-1.5 border-l border-line h-full" style={{ left: `${tick.pct}%` }}>{month.format(new Date(tick.day))}</span>)}</div>
      </div>
      <div className="relative pb-7">
        <div aria-hidden="true" className="absolute top-0 bottom-0 z-10 border-l-2 border-dashed" style={{ left: `calc(${LABEL} + (100% - ${LABEL}) * ${model.todayPct / 100})`, borderColor: 'var(--tone-info-ink)' }}>
          <span className="mono-chip absolute -bottom-6 left-1.5 text-[11px] font-bold whitespace-nowrap text-tone-info-ink">{t.service.overview.today.toUpperCase()} {today.slice(5)}</span>
        </div>
        <ul>{reminders.map((reminder, index) => <LaneRow key={reminder.id} {...props} reminder={reminder} lane={model.lanes[index]} todayPct={model.todayPct} />)}</ul>
      </div>
    </div>
  );
};
