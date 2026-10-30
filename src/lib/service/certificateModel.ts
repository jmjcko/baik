import { fill } from '@/lib/i18n/format';
import type { ServiceTexts } from '@/lib/i18n/types/service';
import type { BikeCare } from '@/types/maintain';
import type { BikeBook, FitSummary } from '@/types/service';
import { priceText, setupRows, valueText, workName, type SetupRow } from './describe';
import { totalsByCurrency } from './quickLog';

export interface CertificateModel {
  title: string;
  generatedOn: string;
  honesty: string;
  photo: string | null;
  identity: SetupRow[];
  spec: SetupRow[];
  history: Array<{ key: string; day: string; work: string; value: string; price: string; warranty: string }>;
  totals: string[];
}

/**
 * Everything the certificate shows, as plain text: the same model fills the preview and the printed sheet. Whatever the rider did not give is
 * written as "not given", and the sheet always says that the history was kept by the rider and not verified by a third party.
 */
export function certificateModel(texts: ServiceTexts, input: { book: BikeBook; bikeName: string; fit: FitSummary; care: Pick<BikeCare, 'drivetrain' | 'tubeless' | 'trainer'>; today: string }): CertificateModel {
  const c = texts.certificate;
  const { identity, log } = input.book;
  const given = (value: string | number | null): string => (value === null || value === '' ? c.notGiven : String(value));
  const p = texts.passport;
  return {
    title: c.docTitle,
    generatedOn: fill(c.generatedOn, { date: input.today }),
    honesty: c.honesty,
    photo: identity.photo,
    identity: [
      { key: 'name', label: c.bikeName, value: input.bikeName },
      { key: 'make', label: p.make, value: given(identity.make) },
      { key: 'model', label: p.model, value: given(identity.model) },
      { key: 'year', label: p.year, value: given(identity.year) },
      { key: 'serial', label: p.serial, value: given(identity.serial) },
      { key: 'insurance', label: p.insurance, value: given(identity.insurance) },
    ],
    spec: setupRows(texts, input.fit, input.care),
    history: log.map((entry) => ({ key: entry.id, day: entry.at, work: entry.note === '' ? workName(texts, entry) : `${workName(texts, entry)}: ${entry.note}`, value: valueText(texts, entry), price: priceText(texts, entry), warranty: entry.warrantyUntil ?? '' })),
    totals: totalsByCurrency(log).map(({ currency, total }) => `${total} ${texts.log.currencies[currency]}`),
  };
}
