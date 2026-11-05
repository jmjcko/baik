'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { PageHeader } from '@/components/primitives/PageHeader';
import type { WireframeKind } from '@/components/studio/wireframe/geometry';
import { todayOf } from '@/lib/engines/baikcare/barTape';
import type { RidingDiscipline } from '@/types/baikfit';
import { useBikeBook } from '@/lib/hooks/useBikeBook';
import { useWorkshopOffer } from '@/lib/hooks/useWorkshopOffer';
import { bookAdder } from '@/lib/service/quickLog';
import type { BikeIdentity, FitSummary } from '@/types/service';
import type { BikeCare } from '@/types/maintain';
import { QuickEntryDialog } from './QuickEntryDialog';
import { WorkshopPanel } from './WorkshopPanel';
import { BikePicker, type PickerBike } from './BikePicker';
import { peekStravaReturn } from '@/lib/strava/returnFlag';
import { CareTabs, type CareTab } from './CareTabs';
import { GarageSection } from './GarageSection';

interface MaintainViewProps {
  t: Translations;
  locale: 'en' | 'cs';
  /** What the fit works out for the bike; the garage tab shows it. */
  fit: FitSummary;
  /** Make, model and year of the factory bike, when the garage knows them. */
  known?: Partial<BikeIdentity>;
  /** The id of the active bike; the fields start again when another bike is chosen. */
  bikeId: string;
  bikeName: string | null;
  /** All the rider's bikes for the drop-down, and the way to make another one active. */
  bikes?: PickerBike[];
  onSwitchBike?: (bikeId: string) => void;
  kind: WireframeKind;
  /** The discipline of the bike and the weight of the rider choose the pressure guide. */
  discipline: RidingDiscipline;
  riderWeightKg: number;
  care: BikeCare;
  onCareChange: (patch: Partial<BikeCare>) => void;
  /** Today as `YYYY-MM-DD` (the real day unless a test gives one). */
  today?: string;
}

/** The bAIkcare page for the active bike: the Workshop tab and the Garage and service book tab. */
export const MaintainView: React.FC<MaintainViewProps> = ({ today = todayOf(), ...props }) => {
  const { t, locale, fit, known, bikeId, bikeName, care, onCareChange } = props;
  const [tab, setTab] = useState<CareTab>(peekStravaReturn() ? 'garage' : 'workshop');
  const { book, update, saved } = useBikeBook(bikeId, known);
  const { offer, offerEntry, clear } = useWorkshopOffer(book.log);
  const addToBook = bookAdder(book.log, update, care, onCareChange);
  return (
    <div className="space-y-8 pb-10" data-testid="maintain-view">
      <div className="space-y-6 print:hidden">
        <PageHeader eyebrow={t.navigation.baikcareStudio} title={t.care.title} subtitle={t.care.subtitle} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CareTabs t={t} active={tab} onChange={setTab} />
          <BikePicker t={t} bikes={props.bikes ?? []} activeId={bikeId} fallbackName={bikeName ?? t.care.noBike} onSwitch={props.onSwitchBike} />
        </div>
      </div>
      {tab === 'workshop' ? <div className="print:hidden"><WorkshopPanel t={t} bikeId={bikeId} kind={props.kind} discipline={props.discipline} riderWeightKg={props.riderWeightKg} care={care} onCareChange={onCareChange} today={today} onRecorded={offerEntry} /></div> : (
        <GarageSection key={bikeId} t={t} locale={locale} bikeId={bikeId} bikeName={bikeName ?? t.care.noBike} care={care} fit={fit} today={today} book={book} update={update} saved={saved} onAdd={addToBook} />
      )}
      {offer && <QuickEntryDialog t={t} locale={locale} kind={offer.kind} variant={offer.variant} offer={offer} today={today} onSave={(entry) => { addToBook(entry); clear(); }} onClose={clear} />}
    </div>
  );
};
