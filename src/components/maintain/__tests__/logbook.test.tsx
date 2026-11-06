import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { BOOK_STORAGE_KEY } from '@/lib/service/bookStore';
import { openGarage, storedBook, entry, TODAY } from '@/test/garageHarness';
import { DEFAULT_CARE } from '@/types/maintain';
import { DEFAULT_BOOK, type LoggedRide } from '@/types/service';

const ride = (over: Partial<LoggedRide> = {}): LoggedRide => ({ id: 'r1', date: '2026-10-20', terrain: 'road', km: 100, elevationM: 0, rain: false, ...over });
const seedBook = (over: Record<string, unknown>) => localStorage.setItem(BOOK_STORAGE_KEY, JSON.stringify({ version: 1, bikes: { current: { ...DEFAULT_BOOK, ...over } } }));

describe.each(['en', 'cs'] as Locale[])('the wear logbook of the garage (%s)', (locale) => {
  const t = translations[locale];
  const l = t.service.logbook;
  const addRide = (km: string, { rain = false, climb = '0' }: { rain?: boolean; climb?: string } = {}) => {
    fireEvent.change(within(screen.getByTestId('ride-form')).getByLabelText(l.rides.km), { target: { value: km } });
    fireEvent.change(within(screen.getByTestId('ride-form')).getByLabelText(l.rides.climb), { target: { value: climb } });
    if (rain) fireEvent.click(within(screen.getByTestId('ride-form')).getByLabelText(l.rides.rain));
    fireEvent.click(screen.getByRole('button', { name: l.rides.add }));
  };
  beforeEach(() => localStorage.clear());

  it('should open the Wear tab of a new bike with a perfect score, no notices and no rides', () => {
    openGarage(locale, undefined, 'wear');
    expect(screen.getByTestId('health-score')).toHaveTextContent(fill(l.health.score, { score: 100 }));
    expect(screen.getByTestId('health-card')).toHaveTextContent(l.health.levels[1]);
    expect(screen.getByTestId('notices-none')).toBeInTheDocument();
    expect(screen.getByTestId('ride-empty')).toHaveTextContent(l.rides.empty);
  });

  it('should add a ride, keep it in this browser, raise the notice for the chain and lower the score by the safety parts only', () => {
    openGarage(locale, undefined, 'wear');
    addRide('100');
    expect(screen.getByTestId('notice-chainLube')).toHaveTextContent(l.parts.chainLube.action);
    expect(screen.getByTestId('health-score')).toHaveTextContent(fill(l.health.score, { score: 88 }));
    expect(screen.getByTestId('ride-row')).toHaveTextContent('100');
    expect(storedBook().rides).toHaveLength(1);
    expect(storedBook().rides[0]).toMatchObject({ km: 100, terrain: 'road', rain: false });
  });

  it('should accept a decimal comma and tell what is wrong before adding anything', () => {
    openGarage(locale, undefined, 'wear');
    addRide('0');
    expect(screen.getByRole('alert')).toHaveTextContent(l.rides.errors.km);
    addRide('12,5', { climb: '30000' });
    expect(screen.getByRole('alert')).toHaveTextContent(l.rides.errors.climb);
    expect(screen.queryByTestId('ride-row')).not.toBeInTheDocument();
    addRide('12,5', { climb: '300' });
    expect(screen.getByTestId('ride-row')).toHaveTextContent('12.5');
  });

  it('should say how many kilometres were ridden in the rain since the chain was cleaned', () => {
    openGarage(locale, undefined, 'wear');
    addRide('40', { rain: true });
    expect(screen.getByTestId('notice-wet')).toHaveTextContent(fill(l.notices.wet, { km: 40 }));
    expect(screen.getByTestId('ride-row')).toHaveTextContent(l.rides.wet);
  });

  it('should clear the notice and show the day when the part is marked as done today', () => {
    seedBook({ rides: [ride()] });
    openGarage(locale, undefined, 'wear');
    fireEvent.click(within(screen.getByTestId('notice-chainLube')).getByRole('button', { name: l.card.markDone }));
    expect(screen.queryByTestId('notice-chainLube')).not.toBeInTheDocument();
    expect(within(screen.getByTestId('wear-card-chainLube')).getByText(fill(l.card.lastDone, { date: TODAY }))).toBeInTheDocument();
    expect(storedBook().wearDone.chainLube).toBe(TODAY);
  });

  it('should take the last service from the service log', () => {
    seedBook({ rides: [ride()], log: [entry({ kind: 'chain', value: null, at: '2026-10-25' })] });
    openGarage(locale, undefined, 'wear');
    expect(screen.queryByTestId('notice-chainLube')).not.toBeInTheDocument();
    expect(within(screen.getByTestId('wear-card-chainLube')).getByText(fill(l.card.lastDone, { date: '2026-10-25' }))).toBeInTheDocument();
  });

  it('should show a safety part that reached its interval as inspection needed, with the score at 40', () => {
    seedBook({ rides: [ride({ km: 500 })] });
    openGarage(locale, undefined, 'wear');
    expect(screen.getByTestId('notice-brakeCheck')).toHaveTextContent(l.parts.brakeCheck.action);
    expect(screen.getByTestId('health-score')).toHaveTextContent(fill(l.health.score, { score: 40 }));
    expect(screen.getByTestId('health-card')).toHaveTextContent(l.health.levels[3]);
    expect(within(screen.getByTestId('wear-card-brakeCheck')).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('should show the sealant only for tubeless tyres', () => {
    openGarage(locale, undefined, 'wear');
    expect(screen.queryByTestId('wear-card-sealant')).not.toBeInTheDocument();
  });

  it('should show the sealant card for tubeless tyres', () => {
    openGarage(locale, { ...DEFAULT_CARE, tubeless: true }, 'wear');
    expect(screen.getByTestId('wear-card-sealant')).toBeInTheDocument();
  });

  it('should show the gauge reading of the chain as a part and ask to replace a stretched chain', () => {
    openGarage(locale, { ...DEFAULT_CARE, chainWearPct: 0.6, drivetrain: '11-12' }, 'wear');
    expect(screen.getByTestId('notice-chainStretch')).toHaveTextContent(l.notices.stretch);
    expect(within(screen.getByTestId('wear-card-chainStretch')).queryByRole('button')).not.toBeInTheDocument();
  });

  it('should remove a ride', () => {
    seedBook({ rides: [ride(), ride({ id: 'r2', date: '2026-10-21', km: 20 })] });
    openGarage(locale, undefined, 'wear');
    fireEvent.click(screen.getByRole('button', { name: fill(l.rides.remove, { date: '2026-10-21' }) }));
    expect(screen.getAllByTestId('ride-row')).toHaveLength(1);
    expect(storedBook().rides).toHaveLength(1);
  });

  it('should open a book stored before the logbook existed', () => {
    localStorage.setItem(BOOK_STORAGE_KEY, JSON.stringify({ version: 1, bikes: { current: { identity: { make: 'Cube' }, log: [], reminders: {}, fromBike: null } } }));
    openGarage(locale, undefined, 'wear');
    expect(screen.getByTestId('health-score')).toHaveTextContent(fill(l.health.score, { score: 100 }));
  });

  it('should show no emoji', () => {
    seedBook({ rides: [ride({ km: 500, rain: true })] });
    openGarage(locale, undefined, 'wear');
    expect(screen.getByTestId('logbook').textContent).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});
