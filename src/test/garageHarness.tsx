import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { BOOK_STORAGE_KEY } from '@/lib/service/bookStore';
import { MaintainView } from '@/components/maintain/MaintainView';
import { DEFAULT_CARE, type BikeCare } from '@/types/maintain';
import { DEFAULT_BOOK, type ServiceEntry } from '@/types/service';
import { NO_FIT } from './noFit';

export const TODAY = '2026-10-29';
export const PHOTO = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
export const entry = (over: Partial<ServiceEntry>): ServiceEntry => ({ id: 'e1', kind: 'chain', variant: null, at: '2026-06-01', value: 0.3, price: null, currency: null, warrantyUntil: null, note: '', ...over });
export const seed = (log: ServiceEntry[]) => localStorage.setItem(BOOK_STORAGE_KEY, JSON.stringify({ version: 1, bikes: { current: { ...DEFAULT_BOOK, log } } }));
export const storedBook = () => JSON.parse(localStorage.getItem(BOOK_STORAGE_KEY) ?? '{}').bikes?.current;

export function Harness({ locale, initial = DEFAULT_CARE }: { locale: Locale; initial?: BikeCare }) {
  const [care, setCare] = React.useState(initial);
  return <MaintainView locale={locale} fit={{ ...NO_FIT, crankLengthMm: 172.5, saddleHeightMm: 742.4 }} t={translations[locale]} bikeId="current" bikeName="Road bike" kind="road" discipline="road" riderWeightKg={75} care={care} onCareChange={(patch) => setCare({ ...care, ...patch })} today={TODAY} />;
}

export const go = (tab: 'overview' | 'log' | 'intervals') => fireEvent.click(screen.getByTestId(`garage-tab-${tab}`));
export const editPassport = () => fireEvent.click(screen.getByTestId('passport-edit'));

export const openGarage = (locale: Locale, initial?: BikeCare, tab: 'overview' | 'log' | 'intervals' = 'overview') => {
  render(<Harness locale={locale} initial={initial} />);
  fireEvent.click(screen.getByTestId('care-tab-garage'));
  if (tab !== 'overview') go(tab);
};

