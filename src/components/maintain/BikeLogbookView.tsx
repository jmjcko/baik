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
import { CHIP_OFF } from '@/components/primitives/fieldStyles';
import { cx } from '@/lib/classNames';

interface ViewProps {
  t: Translations;
  locale: 'en' | 'cs';
  bikeId: string;
  book: BikeBook;
  care: BikeCare;
  today: string;
  update: (change: (book: BikeBook) => BikeBook) => void;
  /** Opens the Connections tab (the pointer line is shown only when this is given). */
  onOpenConnections?: () => void;
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

/** A line that says where the rides from Strava and Intervals.icu are set up (shown while none of them feeds this bike). */
const ConnectionsPointer: React.FC<{ t: Translations; onOpen: () => void }> = ({ t, onOpen }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-tone-info-line bg-tone-info-bg p-4" data-testid="connections-pointer">
    <p className="text-sm text-ink">{t.connections.pointer}</p>
    <button type="button" onClick={onOpen} data-testid="connections-open" className={cx(CHIP_OFF, 'h-10 px-4 rounded-full text-xs font-semibold text-accent-ink')}>{t.connections.pointerButton}</button>
  </div>
);

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
      {!book.strava && !book.intervals && props.onOpenConnections && <ConnectionsPointer t={t} onOpen={props.onOpenConnections} />}
      <section className="space-y-3 rounded-2xl border border-line bg-surface p-5 shadow-sm">
        <h2 className="text-base font-bold text-ink">{l.rides.title}</h2>
        <RideLogForm t={t} today={today} onAdd={(ride) => update((previous) => withRide(previous, ride, BOOK_LIMITS.rides))} />
        <RideList t={t} rides={book.rides} onRemove={(id) => update((previous) => ({ ...previous, rides: previous.rides.filter((ride) => ride.id !== id) }))} onRain={(id, rain) => update((previous) => ({ ...previous, rides: previous.rides.map((ride) => (ride.id === id ? { ...ride, rain } : ride)) }))} />
        <p className="text-xs text-ink-3">{fill(l.rides.kept, { n: BOOK_LIMITS.rides })}</p>
      </section>
    </div>
  );
};
