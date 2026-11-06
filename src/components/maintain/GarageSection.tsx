'use client';

import React, { useMemo, useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { usePrintReport } from '@/lib/hooks/usePrintReport';
import { computeReminders, type Reminder, type ReminderId } from '@/lib/notifications/reminderEngine';
import { certificateModel } from '@/lib/service/certificateModel';
import type { BikeCare } from '@/types/maintain';
import type { BikeBook, FitSummary, ServiceEntry, ServiceKind } from '@/types/service';
import { peekStravaReturn } from '@/lib/strava/returnFlag';
import { BikeLogbookView } from './BikeLogbookView';
import { ConnectionsView } from './ConnectionsView';
import { Pencil } from 'lucide-react';
import { CertificateSheet } from './CertificateSheet';
import { GarageTabs, type GarageTab } from './GarageTabs';
import { NotificationSettings } from './NotificationSettings';
import { PassportSummary } from './PassportSummary';
import { QuickEntryDialog } from './QuickEntryDialog';
import { RemindersOverview } from './RemindersOverview';
import { ServiceCertificateModal } from './ServiceCertificateModal';
import { ServiceHistoryLog } from './ServiceHistoryLog';
import { entryFor } from './reminderText';
import { CHIP_OFF } from '@/components/primitives/fieldStyles';
import { cx } from '@/lib/classNames';

interface GarageProps {
  t: Translations;
  locale: 'en' | 'cs';
  bikeId: string;
  bikeName: string;
  care: BikeCare;
  fit: FitSummary;
  today: string;
  /** The book of the bike, kept by the page (the workshop writes into it too), and the way to change it. */
  book: BikeBook;
  update: (change: (book: BikeBook) => BikeBook) => void;
  /** False when the browser refused to store the book. */
  saved: boolean;
  /** Writes an entry into the book and carries its state over to the workshop. */
  onAdd: (entry: ServiceEntry) => void;
  /** Opens the "Edit bike" dialog of the app for this bike. */
  onEditBike?: () => void;
  /** The rider of the bike, the bikes of that rider and the name to show (only when the account has several riders): Intervals.icu belongs to the rider. */
  riderId?: string;
  riderBikeIds?: string[];
  riderName?: string;
}

interface Open {
  kind: ServiceKind;
  variant: string | null;
}

/** The state of the tab: which section is shown, the certificate and the entry that is being written. */
function useGarageView() {
  const [tab, setTab] = useState<GarageTab>(peekStravaReturn() ? 'connections' : 'overview');
  const [certificate, setCertificate] = useState(false);
  const [entry, setEntry] = useState<Open | null>(null);
  return { tab, setTab, certificate, setCertificate, entry, setEntry };
}

type View = ReturnType<typeof useGarageView>;

interface MainProps extends GarageProps {
  book: BikeBook;
  change: (next: (previous: BikeBook) => BikeBook) => void;
  reminders: Reminder[];
  view: View;
  logFor: (id: ReminderId) => void;
}

/** The right column: the form of the passport when it is open, the tabs and the section that is chosen. */
const GarageMain: React.FC<MainProps> = ({ t, locale, bikeId, bikeName, care, today, book, change, reminders, view, logFor, riderId, riderBikeIds, riderName }) => {
  const attention = reminders.filter((reminder) => reminder.state === 'soon' || reminder.state === 'overdue').length;
  return (
    <div className="space-y-6 min-w-0">
      <GarageTabs t={t} active={view.tab} onChange={view.setTab} badges={{ overview: { count: attention, alert: true }, log: { count: book.log.length, alert: false } }} />
      <div role="tabpanel" id={`garage-panel-${view.tab}`} aria-labelledby={`garage-tab-${view.tab}`} className="space-y-6">
        {view.tab === 'overview' && <RemindersOverview t={t} locale={locale} bikeId={bikeId} bikeName={bikeName} reminders={reminders} settings={book.reminders} today={today} onLog={logFor} />}
        {view.tab === 'log' && <ServiceHistoryLog t={t} log={book.log} drivetrain={care.drivetrain} onQuick={(kind) => view.setEntry({ kind, variant: null })} onRemove={(id) => change((previous) => ({ ...previous, log: previous.log.filter((entry) => entry.id !== id) }))} />}
        {view.tab === 'wear' && <BikeLogbookView t={t} locale={locale} bikeId={bikeId} book={book} care={care} today={today} update={change} onOpenConnections={() => view.setTab('connections')} />}
        {view.tab === 'connections' && <ConnectionsView t={t} bikeId={bikeId} book={book} update={change} today={today} riderId={riderId} riderBikeIds={riderBikeIds} riderName={riderName} />}
        {view.tab === 'intervals' && <NotificationSettings t={t} settings={book.reminders} onChange={(patch) => change((previous) => ({ ...previous, reminders: { ...previous.reminders, ...patch } }))} />}
      </div>
    </div>
  );
};

/** The "Garage and service book" tab of bAIkcare: the passport on the left, and on the right the Overview (timeline), the Service log and the Intervals. The book is kept in this browser only. */
export const GarageSection: React.FC<GarageProps> = (props) => {
  const { t, locale, bikeName, care, fit, today, book, update, saved, onAdd } = props;
  const view = useGarageView();
  const { print } = usePrintReport(t.service.certificate.fileName);
  const reminders = useMemo(() => computeReminders(care, book.log, book.reminders, today), [care, book.log, book.reminders, today]);
  const model = useMemo(() => certificateModel(t.service, { book, bikeName, fit, care, today }), [t, book, bikeName, fit, care, today]);
  const change = (next: (previous: BikeBook) => BikeBook) => update(next);
  const logFor = (id: ReminderId) => { const target = entryFor(id); if (target) view.setEntry(target); };
  return (
    <>
      <div className="space-y-4 print:hidden" data-testid="garage-section">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p role={saved ? undefined : 'alert'} data-testid="garage-saved" className={saved ? 'text-xs text-ink-2' : 'text-sm font-semibold text-tone-danger-ink'}>{saved ? t.service.garage.storedHere : t.service.garage.notStored}</p>
          {props.onEditBike && <button type="button" onClick={props.onEditBike} data-testid="garage-edit-bike" className={cx(CHIP_OFF, 'h-10 px-4 rounded-full text-sm font-semibold text-accent-ink inline-flex items-center gap-2')}><Pencil aria-hidden="true" className="w-4 h-4" />{t.bikeEdit.button}</button>}
        </div>
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="order-2 lg:order-1 lg:[&>section]:h-full"><PassportSummary t={t} bikeName={bikeName} identity={book.identity} fit={fit} care={care} onCertificate={() => view.setCertificate(true)} /></div>
          <div className="order-1 lg:order-2 min-w-0"><GarageMain {...props} book={book} change={change} reminders={reminders} view={view} logFor={logFor} /></div>
        </div>
        {view.entry && <QuickEntryDialog t={t} locale={locale} kind={view.entry.kind} variant={view.entry.variant} today={today} onSave={(entry) => { onAdd(entry); view.setEntry(null); }} onClose={() => view.setEntry(null)} />}
        {view.certificate && <ServiceCertificateModal t={t} model={model} onPrint={print} onClose={() => view.setCertificate(false)} />}
      </div>
      {view.certificate && <CertificateSheet t={t} model={model} />}
    </>
  );
};
