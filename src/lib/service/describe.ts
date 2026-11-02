import { fill } from '@/lib/i18n/format';
import type { ServiceTexts } from '@/lib/i18n/types/service';
import type { BikeCare } from '@/types/maintain';
import type { BikeIdentity, FitSummary, ServiceEntry } from '@/types/service';

type Variant = keyof ServiceTexts['log']['variants'];

/** What was done, in words: the variant where there is one, else the name of the quick entry. */
export const workName = (texts: ServiceTexts, entry: ServiceEntry): string =>
  entry.variant ? texts.log.variants[entry.variant as Variant] : texts.log.quick[entry.kind].short;

/** The number of an entry with its unit (percent of the chain gauge, millilitres of sealant); empty for the other kinds. */
export function valueText(texts: ServiceTexts, entry: ServiceEntry): string {
  if (entry.value === null || (entry.kind !== 'chain' && entry.kind !== 'sealant')) return '';
  const unit = texts.log.units[entry.kind];
  return unit === '%' ? `${entry.value} %` : `${entry.value} ${unit}`;
}

export const priceText = (texts: ServiceTexts, entry: ServiceEntry): string =>
  entry.price === null || entry.currency === null ? '' : `${entry.price} ${texts.log.currencies[entry.currency]}`;

export interface SetupRow {
  key: string;
  label: string;
  value: string;
}

const mm = (value: number | null, notSet: string): string => (value === null ? notSet : `${Math.round(value)} mm`);

/** The setup of the bike as rows: what bAIkfit works out and what the care of the bike knows. A value that is not known says so. */
export function setupRows(texts: ServiceTexts, fit: FitSummary, care: Pick<BikeCare, 'drivetrain' | 'tubeless' | 'trainer'>): SetupRow[] {
  const s = texts.passport.setup;
  const rows: Array<[string, string, string]> = [
    ['crank', s.items.crank, mm(fit.crankLengthMm, s.notSet)],
    ['saddleHeight', s.items.saddleHeight, mm(fit.saddleHeightMm, s.notSet)],
    ['setback', s.items.setback, mm(fit.setbackMm, s.notSet)],
    ['stack', s.items.stack, mm(fit.stackMm, s.notSet)],
    ['reach', s.items.reach, mm(fit.reachMm, s.notSet)],
    ['barWidth', s.items.barWidth, mm(fit.barWidthMm, s.notSet)],
    ['drivetrain', s.items.drivetrain, s.drivetrain[care.drivetrain]],
    ['tyres', s.items.tyres, care.tubeless ? s.tubeless : s.tube],
    ['trainer', s.items.trainer, care.trainer ? s.yes : s.no],
  ];
  return rows.map(([key, label, value]) => ({ key, label, value }));
}

export const dayLine = (template: string, date: string): string => fill(template, { date });

/** How much of the passport is filled in: the six fields of the identity, and the names of the ones that are still empty. */
export function passportGaps(texts: ServiceTexts, identity: BikeIdentity): { filled: number; total: number; missing: string[] } {
  const p = texts.passport;
  const fields: Array<[boolean, string]> = [
    [identity.make !== '', p.make],
    [identity.model !== '', p.model],
    [identity.year !== null, p.year],
    [identity.serial !== '', p.serial],
    [identity.insurance !== '', p.insurance],
    [identity.photo !== null, p.photo.label],
  ];
  return { filled: fields.filter(([done]) => done).length, total: fields.length, missing: fields.filter(([done]) => !done).map(([, name]) => name) };
}
