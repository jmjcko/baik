import type { ReminderId, ReminderState } from '@/lib/notifications/reminderEngine';
import type { WearId } from '@/lib/engines/baikcare/wearEngine';
import type { DrivetrainSpeeds } from '@/types/maintain';
import type { PriceCurrency, ServiceKind } from '@/types/service';

export interface QuickTexts {
  title: string;
  /** The words of a timeline row. */
  short: string;
  hint: string;
}

/** The wear and technical logbook of the garage (Epic 51): the Health Score, the notices, the parts and the rides. */
export interface LogbookTexts {
  title: string;
  intro: string;
  health: { title: string; score: string; hint: string; levels: Record<1 | 2 | 3 | 4, string> };
  totals: { rides: string; km: string; climb: string };
  notices: { title: string; none: string; wet: string; reached: string; stretch: string; routine: string; safety: string };
  parts: Record<WearId, { name: string; action: string }>;
  card: {
    everyKm: string;
    everyKmClimb: string;
    everyKmMonths: string;
    offroad: string;
    routine: string;
    used: string;
    stretch: string;
    states: { ok: string; soon: string; due: string };
    lastDone: string;
    neverDone: string;
    markDone: string;
    markDoneFor: string;
  };
  rides: {
    title: string;
    empty: string;
    kept: string;
    date: string;
    terrain: string;
    terrains: Record<'road' | 'trainer' | 'gravel' | 'mtb', string>;
    km: string;
    climb: string;
    rain: string;
    add: string;
    errors: { date: string; km: string; climb: string };
    row: string;
    remove: string;
    wet: string;
  };
  partsTitle: string;
  partsHint: string;
}

/** The garage and service book of bAIkcare (Epic 39): passport, service log, reminders and the certificate of the bike. */
export interface ServiceTexts {
  tabs: { label: string; workshop: string; garage: string };
  garageTabs: { label: string; overview: string; log: string; intervals: string; wear: string };
  logbook: LogbookTexts;
  summary: { completeness: string; missing: string; complete: string; edit: string; closeEdit: string; noPhoto: string };
  overview: { attention: string; datesMissing: string; runwayTitle: string; runwayIntro: string; today: string; logIt: string; logFirst: string };
  intervals: { title: string; intro: string };
  garage: { title: string; subtitle: string; storedHere: string; notStored: string };
  passport: {
    title: string;
    intro: string;
    make: string;
    model: string;
    year: string;
    serial: string;
    serialHint: string;
    insurance: string;
    insuranceHint: string;
    privacy: string;
    photo: { label: string; add: string; change: string; remove: string; hint: string; failed: string; alt: string };
    setup: {
      title: string;
      intro: string;
      notSet: string;
      items: { crank: string; saddleHeight: string; setback: string; stack: string; reach: string; barWidth: string; drivetrain: string; tyres: string; trainer: string };
      drivetrain: Record<DrivetrainSpeeds, string>;
      tube: string;
      tubeless: string;
      yes: string;
      no: string;
    };
  };
  log: {
    title: string;
    intro: string;
    empty: string;
    quick: Record<ServiceKind, QuickTexts>;
    /** The form that opens after the workshop has recorded something: the same fields, but nothing has to be filled in. */
    fromWorkshop: { title: string; intro: string; save: string; skip: string };
    variants: Record<'pads' | 'bleed' | 'small' | 'large' | 'cable' | 'tape', string>;
    form: {
      title: string;
      day: string;
      variant: string;
      value: Record<'chain' | 'sealant', string>;
      valueHint: Record<'chain' | 'sealant', string>;
      price: string;
      currency: string;
      warranty: string;
      note: string;
      save: string;
      cancel: string;
      problems: Record<'day' | 'value' | 'price' | 'warranty', string>;
    };
    units: Record<'chain' | 'sealant', string>;
    chainOk: string;
    chainWorn: string;
    warranty: string;
    remove: string;
    currencies: Record<PriceCurrency, string>;
    careNote: string;
  };
  reminders: {
    title: string;
    intro: string;
    state: Record<ReminderState, string>;
    items: Record<ReminderId, { title: string; event: string }>;
    due: string;
    daysLeft: string;
    daysOver: string;
    last: string;
    unknown: string;
    overall: Record<ReminderState, string>;
    settings: { title: string; lead: string; chain: string; sealant: string; brakes: string; suspension: string; cable: string; mcheck: string; days: string; months: string };
    appearsAfter: string;
    ics: { button: string; hint: string; fileName: string; none: string };
    email: { open: string; close: string; title: string; hint: string; copy: string; copied: string; failed: string; subject: string };
    notSent: string;
  };
  email: { subject: string; intro: string; dueLine: string; unknownLine: string; logButton: string; guideButton: string; footer: string };
  certificate: {
    button: string;
    buttonHint: string;
    title: string;
    close: string;
    print: string;
    fileName: string;
    docTitle: string;
    generatedOn: string;
    honesty: string;
    identityTitle: string;
    bikeName: string;
    specTitle: string;
    historyTitle: string;
    empty: string;
    notGiven: string;
    totalLabel: string;
    columns: { day: string; work: string; value: string; price: string; warranty: string };
    photoAlt: string;
  };
}
