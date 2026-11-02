import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { DEFAULT_CARE } from '@/types/maintain';
import { editPassport, entry, go, openGarage, seed } from '@/test/garageHarness';

describe.each(['en', 'cs'] as Locale[])('the layout of the garage (%s)', (locale) => {
  const s = translations[locale].service;
  beforeEach(() => localStorage.clear());

  it('should open on the Overview with three tabs, an attention number and the number of entries', () => {
    seed([entry({ at: '2026-09-01' }), entry({ id: 'e2', kind: 'sealant', value: 40, at: '2026-10-01' })]);
    openGarage(locale, { ...DEFAULT_CARE, tubeless: true, sealantAt: '2026-07-30' });
    expect(screen.getByRole('tablist', { name: s.garageTabs.label })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: new RegExp(s.garageTabs.overview) })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('garage-badge-overview')).toHaveTextContent('2');
    expect(screen.getByTestId('garage-badge-log')).toHaveTextContent('2');
    expect(screen.getByRole('tabpanel')).toHaveAttribute('id', 'garage-panel-overview');
    go('intervals');
    expect(screen.getByRole('radiogroup', { name: s.reminders.settings.chain })).toBeInTheDocument();
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'garage-tab-intervals');
  });

  it('should show how complete the passport is and what is missing, and keep the form closed until it is asked for', () => {
    openGarage(locale);
    const summary = screen.getByTestId('passport-completeness');
    expect(summary).toHaveTextContent('0 / 6');
    expect(summary).toHaveTextContent(fill(s.summary.missing, { list: [s.passport.make, s.passport.model, s.passport.year, s.passport.serial, s.passport.insurance, s.passport.photo.label].join(', ').toLowerCase() }));
    expect(screen.queryByTestId('identity-make')).not.toBeInTheDocument();
    editPassport();
    fireEvent.change(screen.getByTestId('identity-make'), { target: { value: 'Canyon' } });
    fireEvent.change(screen.getByTestId('identity-model'), { target: { value: 'Endurace' } });
    expect(screen.getByTestId('passport-completeness')).toHaveTextContent('2 / 6');
    expect(screen.getByTestId('summary-name')).toHaveTextContent('Endurace');
    expect(screen.getByTestId('passport-edit')).toHaveAttribute('aria-expanded', 'true');
    editPassport();
    expect(screen.queryByTestId('identity-make')).not.toBeInTheDocument();
    expect(screen.getByTestId('summary-serial')).toHaveTextContent('-');
  });

  it('should draw a lane for every reminder with the most urgent first, and say it in text inside the lane', () => {
    seed([entry({ at: '2026-09-01' }), entry({ id: 'f', kind: 'suspension', variant: 'small', at: '2026-03-01', value: null })]);
    openGarage(locale, { ...DEFAULT_CARE, inspectedAt: '2026-08-12' });
    const lanes = within(screen.getByTestId('runway')).getAllByRole('listitem');
    expect(lanes.map((lane) => lane.getAttribute('data-testid'))).toEqual(['reminder-suspension', 'reminder-chain', 'reminder-mcheck']);
    expect(lanes[0]).toHaveTextContent(s.reminders.state.overdue);
    expect(lanes[0]).toHaveTextContent(fill(s.reminders.daysOver, { days: 58 }));
    expect(lanes[1]).toHaveTextContent(s.reminders.state.soon);
    expect(lanes[2]).toHaveTextContent(s.reminders.state.ok);
    expect(screen.getByTestId('runway').querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(3);
  });

  it('should open the entry that fits a lane, with its variant chosen, and have no button for the M-Check', () => {
    seed([entry({ id: 'b', kind: 'brakes', variant: 'bleed', at: '2025-12-01', value: null })]);
    openGarage(locale);
    expect(screen.queryByTestId('runway-log-mcheck')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('runway-log-brakes'));
    expect(screen.getByTestId('entry-dialog')).toHaveTextContent(s.log.quick.brakes.title);
    expect(screen.getByTestId('entry-variant')).toHaveValue('bleed');
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.click(screen.getByTestId('runway-log-chain'));
    expect(screen.getByTestId('entry-dialog')).toHaveTextContent(s.log.quick.chain.title);
  });

  it('should ask for the first entry where nothing is known and give a list with progress bars for a narrow screen', () => {
    openGarage(locale);
    expect(screen.getByTestId('runway-log-chain')).toHaveTextContent(s.overview.logFirst);
    expect(within(screen.getByTestId('reminder-mobile-chain')).getByText(s.reminders.items.chain.title)).toBeInTheDocument();
    expect(screen.getByTestId('reminder-progress').className).toContain('md:hidden');
    expect(screen.getByTestId('runway').className).toContain('hidden md:block');
  });

  it('should sum the cost of the history above it, per currency', () => {
    seed([entry({ price: 20, currency: 'eur' }), entry({ id: 'x', price: 5, currency: 'eur', at: '2026-05-01' })]);
    openGarage(locale, undefined, 'log');
    expect(screen.getByTestId('log-total')).toHaveTextContent(`${s.certificate.totalLabel}: 25 EUR`);
  });
});
