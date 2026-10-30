'use client';

import React, { useMemo, useState } from 'react';
import { FileText } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { SurfaceCard } from '@/components/primitives/SurfaceCard';
import { useBikeBook } from '@/lib/hooks/useBikeBook';
import { usePrintReport } from '@/lib/hooks/usePrintReport';
import { computeReminders } from '@/lib/notifications/reminderEngine';
import { certificateModel } from '@/lib/service/certificateModel';
import { addEntry, carePatch } from '@/lib/service/quickLog';
import type { BikeCare } from '@/types/maintain';
import type { BikeIdentity, FitSummary, ServiceEntry } from '@/types/service';
import { BikePassportCard } from './BikePassportCard';
import { CertificateSheet } from './CertificateSheet';
import { NotificationSettings } from './NotificationSettings';
import { ServiceCertificateModal } from './ServiceCertificateModal';
import { ServiceHistoryLog } from './ServiceHistoryLog';

interface GarageProps {
  t: Translations;
  locale: 'en' | 'cs';
  bikeId: string;
  bikeName: string;
  care: BikeCare;
  fit: FitSummary;
  /** What is known about the bike from the garage (the factory bike): the empty book starts with it. */
  known?: Partial<BikeIdentity>;
  today: string;
  onCareChange: (patch: Partial<BikeCare>) => void;
}

const CertificateCard: React.FC<{ t: Translations; onOpen: () => void }> = ({ t, onOpen }) => (
  <SurfaceCard as="section" className="flex flex-wrap items-center justify-between gap-4" testId="certificate-card">
    <p className="text-sm text-ink-2">{t.service.certificate.buttonHint}</p>
    <button type="button" onClick={onOpen} data-testid="certificate-open" className="h-12 px-6 rounded-full bg-blue-600 text-slate-50 text-sm font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"><FileText aria-hidden="true" className="w-4 h-4" />{t.service.certificate.button}</button>
  </SurfaceCard>
);

/** The "Garage and service book" tab of bAIkcare: passport, service log, reminders and the certificate. The book is kept in this browser only. */
export const GarageSection: React.FC<GarageProps> = ({ t, locale, bikeId, bikeName, care, fit, known, today, onCareChange }) => {
  const { book, update, saved } = useBikeBook(bikeId, known);
  const [certificate, setCertificate] = useState(false);
  const { print } = usePrintReport(t.service.certificate.fileName);
  const reminders = useMemo(() => computeReminders(care, book.log, book.reminders, today), [care, book.log, book.reminders, today]);
  const model = useMemo(() => certificateModel(t.service, { book, bikeName, fit, care, today }), [t, book, bikeName, fit, care, today]);
  const add = (entry: ServiceEntry) => {
    const patch = carePatch(care, book.log, entry);
    update((previous) => ({ ...previous, log: addEntry(previous.log, entry) }));
    if (Object.keys(patch).length > 0) onCareChange(patch);
  };
  return (
    <>
      <div className="space-y-8 print:hidden" data-testid="garage-section">
        <p role={saved ? undefined : 'alert'} data-testid="garage-saved" className={saved ? 'text-xs text-ink-3' : 'text-sm font-semibold text-tone-danger-ink'}>{saved ? t.service.garage.storedHere : t.service.garage.notStored}</p>
        <BikePassportCard t={t} identity={book.identity} fit={fit} care={care} onChange={(patch) => update((previous) => ({ ...previous, identity: { ...previous.identity, ...patch } }))} />
        <ServiceHistoryLog t={t} locale={locale} log={book.log} drivetrain={care.drivetrain} today={today} onAdd={add} onRemove={(id) => update((previous) => ({ ...previous, log: previous.log.filter((entry) => entry.id !== id) }))} />
        <NotificationSettings t={t} locale={locale} bikeId={bikeId} bikeName={bikeName} reminders={reminders} settings={book.reminders} onChange={(patch) => update((previous) => ({ ...previous, reminders: { ...previous.reminders, ...patch } }))} />
        <CertificateCard t={t} onOpen={() => setCertificate(true)} />
        {certificate && <ServiceCertificateModal t={t} model={model} onPrint={print} onClose={() => setCertificate(false)} />}
      </div>
      {certificate && <CertificateSheet t={t} model={model} />}
    </>
  );
};
