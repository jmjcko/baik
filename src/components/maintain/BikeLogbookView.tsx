import React, { useMemo } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { wearReport } from '@/lib/engines/baikcare/wearEngine';
import type { WearId } from '@/lib/engines/baikcare/wearEngine';
import type { WearComponent } from '@/lib/engines/baikcare/wearIntervals';
import { lastServiceDays, wearInputFor, withRide } from '@/lib/service/wearInput';
import type { BikeCare } from '@/types/maintain';
import { BOOK_LIMITS, type BikeBook } from '@/types/service';
import { ComponentWearCard } from './ComponentWearCard';
import { MaintenanceAlertBanner } from './MaintenanceAlertBanner';
import { RideList, RideLogForm } from './RideLogForm';
import { StateChip } from './StateChip';
import { LEVEL_STATE, visibleParts } from './logbookView';

interface ViewProps {
  t: Translations;
  locale: 'en' | 'cs';
  book: BikeBook;
  care: BikeCare;
  today: string;
  update: (change: (book: BikeBook) => BikeBook) => void;
}

/** The score, its level and the totals of the rides. */
const HealthCard: React.FC<{ t: Translations; health: number; level: 1 | 2 | 3 | 4; book: BikeBook }> = ({ t, health, level, book }) => {
  const l = t.service.logbook;
  const km = Math.round(book.rides.reduce((sum, ride) => sum + ride.km, 0));
  const climb = Math.round(book.rides.reduce((sum, ride) => sum + ride.elevationM, 0));
  return (
    <section data-testid="health-card" className="rounded-2xl border border-line bg-surface p-5 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-ink">{l.health.title}</h2>
        <StateChip t={t} state={LEVEL_STATE[level]} label={l.health.levels[level]} />
      </div>
      <p className="text-3xl font-bold text-ink" data-testid="health-score">{fill(l.health.score, { score: health })}</p>
      <p className="text-xs text-ink-3">{[fill(l.totals.rides, { n: book.rides.length }), fill(l.totals.km, { km }), fill(l.totals.climb, { m: climb })].join(' · ')}</p>
      <p className="text-xs text-ink-2">{l.health.hint}</p>
    </section>
  );
};

interface PartsProps extends ViewProps {
  report: ReturnType<typeof wearReport>;
  done: (id: WearId) => void;
}

/** The notices: the rain advice and every part that reached its interval. */
const Notices: React.FC<PartsProps> = ({ t, report, care, done }) => {
  const l = t.service.logbook;
  const alerts = report.alerts.filter((alert) => alert.kind === 'wetRide' || care.tubeless || alert.component !== 'sealant');
  return (
    <section className="space-y-3" aria-label={l.notices.title}>
      <h2 className="text-base font-bold text-ink">{l.notices.title}</h2>
      {alerts.length === 0 && <p className="text-sm text-ink-2" data-testid="notices-none">{l.notices.none}</p>}
      <ul className="space-y-2">
        {alerts.map((alert) => (
          <MaintenanceAlertBanner key={alert.kind === 'wetRide' ? 'wet' : alert.component} t={t} alert={alert} onDone={alert.kind === 'due' && alert.component !== 'chainStretch' ? () => done(alert.component) : undefined} />
        ))}
      </ul>
    </section>
  );
};

/** The parts, the most worn first. */
const Parts: React.FC<PartsProps> = ({ t, locale, report, care, book, done }) => {
  const l = t.service.logbook;
  const days = useMemo(() => lastServiceDays(book, care), [book, care]);
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-bold text-ink">{l.partsTitle}</h2>
        <p className="text-xs text-ink-3">{l.partsHint}</p>
      </div>
      <ul className="grid gap-3 md:grid-cols-2">
        {visibleParts(report.components, care.tubeless).map((part) => <ComponentWearCard key={part.id} t={t} locale={locale} part={part} care={care} lastDone={part.id === 'chainStretch' ? null : days[part.id] ?? null} onDone={() => done(part.id)} />)}
      </ul>
    </section>
  );
};

/** The wear and technical logbook of a bike: the score, the notices, the parts and the rides. */
export const BikeLogbookView: React.FC<ViewProps> = (props) => {
  const { t, book, care, today, update } = props;
  const l = t.service.logbook;
  const report = useMemo(() => wearReport(wearInputFor(book, care, today)), [book, care, today]);
  const done = (id: WearId) => id !== 'chainStretch' && update((previous) => ({ ...previous, wearDone: { ...previous.wearDone, [id as WearComponent]: today } }));
  return (
    <div className="space-y-6" data-testid="logbook">
      <p className="text-sm text-ink-2 max-w-3xl">{l.intro}</p>
      <HealthCard t={t} health={report.health} level={report.level} book={book} />
      <Notices {...props} report={report} done={done} />
      <Parts {...props} report={report} done={done} />
      <section className="space-y-3 rounded-2xl border border-line bg-surface p-5 shadow-sm">
        <h2 className="text-base font-bold text-ink">{l.rides.title}</h2>
        <RideLogForm t={t} today={today} onAdd={(ride) => update((previous) => withRide(previous, ride, BOOK_LIMITS.rides))} />
        <RideList t={t} rides={book.rides} onRemove={(id) => update((previous) => ({ ...previous, rides: previous.rides.filter((ride) => ride.id !== id) }))} />
        <p className="text-xs text-ink-3">{fill(l.rides.kept, { n: BOOK_LIMITS.rides })}</p>
      </section>
    </div>
  );
};
