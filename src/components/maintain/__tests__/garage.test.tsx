import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import HomePage from '@/app/page';
import { NO_FIT } from '@/test/noFit';
import { EditableView, Harness, PHOTO, TODAY, editPassport, entry, go, openGarage, savePassport, seed, storedBook } from '@/test/garageHarness';
import { openCare } from '@/test/careNav';
import { BOOK_STORAGE_KEY } from '@/lib/service/bookStore';
import { PASSPORT_STORAGE_KEY } from '@/lib/passport/localStore';
import { DEFAULT_CARE } from '@/types/maintain';
import { DEFAULT_BOOK } from '@/types/service';
import { pickLanguage } from '@/test/accountMenu';

const download = vi.hoisted(() => vi.fn());
const shrink = vi.hoisted(() => vi.fn());
vi.mock('@/lib/download', () => ({ downloadText: download }));
vi.mock('@/lib/service/photo', async (importOriginal) => ({ ...(await importOriginal<typeof import('@/lib/service/photo')>()), shrinkPhoto: shrink }));

describe.each(['en', 'cs'] as Locale[])('the garage and service book (%s)', (locale) => {
  const t = translations[locale];
  const s = t.service;
  beforeEach(() => { localStorage.clear(); download.mockReset(); shrink.mockReset(); });

  it('should keep the Workshop as the first tab and switch to the Garage and back', () => {
    render(<Harness locale={locale} />);
    expect(screen.getByRole('tab', { name: s.tabs.workshop })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('mcheck-summary')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: s.tabs.garage }));
    expect(screen.getByTestId('garage-section')).toBeInTheDocument();
    expect(screen.queryByTestId('mcheck-summary')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: s.tabs.workshop }));
    expect(screen.getByTestId('mcheck-summary')).toBeInTheDocument();
  });

  describe('the passport', () => {
    it('should keep the identity of the bike in the book of this browser when it is saved, and show the setup in the summary', () => {
      openGarage(locale);
      editPassport();
      fireEvent.change(screen.getByTestId('identity-make'), { target: { value: 'Canyon' } });
      fireEvent.change(screen.getByTestId('identity-serial'), { target: { value: 'WCAN123' } });
      fireEvent.change(screen.getByTestId('identity-year'), { target: { value: '2024' } });
      expect(screen.getByTestId('passport-privacy')).toHaveTextContent(s.passport.privacy);
      expect(storedBook()).toBeUndefined();
      savePassport();
      expect(storedBook().identity).toMatchObject({ make: 'Canyon', serial: 'WCAN123', year: 2024 });
      expect(screen.getByTestId('summary-serial')).toHaveTextContent('WCAN123');
      expect(screen.getByTestId('summary-crank')).toHaveTextContent('173 mm');
      expect(screen.getByTestId('summary-saddleHeight')).toHaveTextContent('742 mm');
    });

    it('should read the book back for the bike after a reload and let a half typed year stay in the field', () => {
      localStorage.setItem(BOOK_STORAGE_KEY, JSON.stringify({ version: 1, bikes: { current: { ...DEFAULT_BOOK, identity: { ...DEFAULT_BOOK.identity, model: 'Endurace', year: 2023 } } } }));
      openGarage(locale);
      editPassport();
      expect(screen.getByTestId('identity-model')).toHaveValue('Endurace');
      expect(screen.getByTestId('identity-year')).toHaveValue('2023');
      fireEvent.change(screen.getByTestId('identity-year'), { target: { value: '20' } });
      expect(screen.getByTestId('identity-year')).toHaveValue('20');
      savePassport();
      expect(storedBook().identity.year).toBeNull();
    });

    it('should keep a shrunk photo and say so when a picture cannot be used', async () => {
      openGarage(locale);
      editPassport();
      shrink.mockResolvedValueOnce(PHOTO);
      fireEvent.change(screen.getByTestId('photo-input'), { target: { files: [new File(['x'], 'bike.jpg', { type: 'image/jpeg' })] } });
      await waitFor(() => expect(screen.getByTestId('photo-image')).toHaveAttribute('src', PHOTO));
      savePassport();
      expect(screen.getByTestId('summary-photo')).toHaveAttribute('src', PHOTO);
      expect(storedBook().identity.photo).toBe(PHOTO);
      editPassport();
      shrink.mockResolvedValueOnce(null);
      fireEvent.change(screen.getByTestId('photo-input'), { target: { files: [new File(['x'], 'bad.txt', { type: 'text/plain' })] } });
      await waitFor(() => expect(screen.getByTestId('photo-failed')).toHaveTextContent(s.passport.photo.failed));
      fireEvent.click(screen.getByTestId('photo-remove'));
      expect(screen.queryByTestId('photo-image')).not.toBeInTheDocument();
      savePassport();
      expect(storedBook()).toBeUndefined();
    });
  });

  describe('the service log', () => {
    const addChain = (value: string) => {
      fireEvent.click(screen.getByTestId('log-quick-chain'));
      fireEvent.change(within(screen.getByTestId('entry-dialog')).getByTestId('entry-value'), { target: { value } });
      fireEvent.click(screen.getByTestId('entry-save'));
    };

    it('should offer five quick entries and start with an empty timeline', () => {
      openGarage(locale, undefined, 'log');
      for (const kind of ['chain', 'sealant', 'brakes', 'suspension', 'cable'] as const) expect(screen.getByTestId(`log-quick-${kind}`)).toHaveTextContent(s.log.quick[kind].title);
      expect(screen.getByTestId('log-empty')).toHaveTextContent(s.log.empty);
    });

    it('should write a chain reading to the timeline with its verdict and update the chain gauge of the bike, and start the chain reminder', () => {
      openGarage(locale, undefined, 'log');
      addChain('0,6');
      const row = screen.getByTestId('log-entry');
      expect(row).toHaveTextContent(TODAY);
      expect(row).toHaveTextContent(s.log.quick.chain.short);
      expect(row).toHaveTextContent(`0.6 % (${s.log.chainWorn})`);
      expect(screen.queryByTestId('entry-dialog')).not.toBeInTheDocument();
      go('overview');
      expect(screen.getByTestId('reminder-chain')).toHaveAttribute('data-state', 'ok');
      fireEvent.click(screen.getByTestId('care-tab-workshop'));
      openCare('chain');
      expect(screen.getByTestId('chain-reading')).toHaveValue('0.6');
    });

    it('should refuse a day in the future and a number that does not fit, and keep the dialog open', () => {
      openGarage(locale, undefined, 'log');
      fireEvent.click(screen.getByTestId('log-quick-chain'));
      fireEvent.change(screen.getByTestId('entry-day'), { target: { value: '2026-12-01' } });
      fireEvent.click(screen.getByTestId('entry-save'));
      expect(screen.getByTestId('entry-problem')).toHaveTextContent(s.log.form.problems.day);
      fireEvent.change(screen.getByTestId('entry-day'), { target: { value: TODAY } });
      fireEvent.change(screen.getByTestId('entry-value'), { target: { value: '9' } });
      fireEvent.click(screen.getByTestId('entry-save'));
      expect(screen.getByTestId('entry-problem')).toHaveTextContent(s.log.form.problems.value);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByTestId('entry-dialog')).not.toBeInTheDocument();
      expect(screen.getByTestId('log-empty')).toBeInTheDocument();
    });

    it('should offer the currencies of the language, with the first one chosen, and write the price and the warranty on the timeline', () => {
      openGarage(locale, undefined, 'log');
      fireEvent.click(screen.getByTestId('log-quick-brakes'));
      const currencies = Array.from(within(screen.getByTestId('entry-currency')).getAllByRole('option')).map((option) => option.textContent);
      expect(currencies).toEqual(locale === 'en' ? ['EUR', 'USD'] : ['CZK', 'EUR']);
      expect(screen.getByTestId('entry-currency')).toHaveValue(locale === 'en' ? 'eur' : 'czk');
      expect(screen.queryByTestId('entry-value')).not.toBeInTheDocument();
      fireEvent.change(screen.getByTestId('entry-variant'), { target: { value: 'bleed' } });
      fireEvent.change(screen.getByTestId('entry-price'), { target: { value: '25,5' } });
      fireEvent.change(screen.getByTestId('entry-warranty'), { target: { value: '2027-10-29' } });
      fireEvent.change(screen.getByTestId('entry-note'), { target: { value: 'Shimano mineral oil' } });
      fireEvent.click(screen.getByTestId('entry-save'));
      const row = screen.getByTestId('log-entry');
      expect(row).toHaveTextContent(s.log.variants.bleed);
      expect(row).toHaveTextContent(`25.5 ${locale === 'en' ? 'EUR' : 'CZK'}`);
      expect(row).toHaveTextContent(fill(s.log.warranty, { date: '2027-10-29' }));
      expect(row).toHaveTextContent('Shimano mineral oil');
    });

    it('should make the tyres tubeless and start the sealant reminder when sealant is added, and delete an entry', () => {
      openGarage(locale, undefined, 'log');
      fireEvent.click(screen.getByTestId('log-quick-sealant'));
      fireEvent.change(screen.getByTestId('entry-value'), { target: { value: '40' } });
      fireEvent.click(screen.getByTestId('entry-save'));
      expect(screen.getByTestId('log-entry')).toHaveTextContent('40 ml');
      go('overview');
      expect(screen.getByTestId('reminder-sealant')).toHaveAttribute('data-state', 'ok');
      go('log');
      fireEvent.click(screen.getByTestId('log-remove'));
      expect(screen.getByTestId('log-empty')).toBeInTheDocument();
      expect(storedBook()).toBeUndefined();
    });
  });

  describe('the reminders', () => {
    it('should show an overdue chain with text, an icon and the days over, and the worst state of the bike', () => {
      seed([entry({})]);
      openGarage(locale);
      const chain = screen.getByTestId('reminder-chain');
      expect(chain).toHaveAttribute('data-state', 'overdue');
      expect(chain).toHaveTextContent(s.reminders.state.overdue);
      expect(chain).toHaveTextContent(fill(s.reminders.daysOver, { days: 90 }));
      expect(chain.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
      expect(screen.getByTestId('reminder-overall')).toHaveTextContent(s.reminders.overall.overdue);
    });

    it('should ask for the date when nothing was logged, and add the sealant and tape reminders only for a tubeless or trainer bike', () => {
      openGarage(locale, { ...DEFAULT_CARE, tubeless: true, sealantAt: '2026-07-01', trainer: true, barTapeAt: '2026-10-01' });
      expect(screen.getByTestId('reminder-chain')).toHaveAttribute('data-state', 'unknown');
      expect(screen.getByTestId('reminder-chain')).toHaveTextContent(s.reminders.unknown);
      expect(screen.getByTestId('reminder-sealant')).toHaveAttribute('data-state', 'overdue');
      expect(screen.getByTestId('reminder-tape')).toHaveAttribute('data-state', 'ok');
    });

    it('should move the due day when the interval is changed and keep the setting', () => {
      seed([entry({ at: '2026-10-01' })]);
      openGarage(locale);
      expect(screen.getByTestId('reminder-chain')).toHaveTextContent(fill(s.reminders.due, { date: '2026-11-30' }));
      go('intervals');
      fireEvent.click(screen.getByTestId('setting-chain-30'));
      expect(screen.getByTestId('setting-chain-30')).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByTestId('setting-chain-60')).toHaveAttribute('aria-checked', 'false');
      go('overview');
      expect(screen.getByTestId('reminder-chain')).toHaveTextContent(fill(s.reminders.due, { date: '2026-10-31' }));
      expect(screen.getByTestId('reminder-chain')).toHaveAttribute('data-state', 'soon');
      expect(storedBook().reminders.chainDays).toBe(30);
    });

    it('should add a reminder for the brake bleed, the suspension and the cables after the first entry, and always one for the M-Check', () => {
      openGarage(locale);
      expect(screen.getByTestId('reminder-mcheck')).toHaveAttribute('data-state', 'unknown');
      expect(screen.queryByTestId('reminder-brakes')).not.toBeInTheDocument();
      go('log');
      fireEvent.click(screen.getByTestId('log-quick-brakes'));
      fireEvent.change(screen.getByTestId('entry-variant'), { target: { value: 'bleed' } });
      fireEvent.click(screen.getByTestId('entry-save'));
      fireEvent.click(screen.getByTestId('log-quick-suspension'));
      fireEvent.click(screen.getByTestId('entry-save'));
      fireEvent.click(screen.getByTestId('log-quick-cable'));
      fireEvent.click(screen.getByTestId('entry-save'));
      go('overview');
      expect(screen.getByTestId('reminder-brakes')).toHaveTextContent(fill(s.reminders.due, { date: '2027-10-29' }));
      expect(screen.getByTestId('reminder-suspension')).toHaveTextContent(fill(s.reminders.due, { date: '2027-04-29' }));
      expect(screen.getByTestId('reminder-cable')).toHaveAttribute('data-state', 'ok');
      go('intervals');
      expect(screen.getByTestId('appears-after')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('setting-brakes-6'));
      go('overview');
      expect(screen.getByTestId('reminder-brakes')).toHaveTextContent(fill(s.reminders.due, { date: '2027-04-29' }));
    });

    it('should download the calendar file only when there is a day, with the title of the language', () => {
      openGarage(locale);
      expect(screen.getByTestId('ics-download')).toBeDisabled();
      fireEvent.click(screen.getByTestId('runway-log-chain'));
      fireEvent.click(screen.getByTestId('entry-save'));
      fireEvent.click(screen.getByTestId('ics-download'));
      const [fileName, mime, content] = download.mock.calls[0];
      expect(fileName).toBe(`${s.reminders.ics.fileName}.ics`);
      expect(mime).toContain('text/calendar');
      expect(content).toContain('BEGIN:VEVENT');
      expect(content).toContain(s.reminders.items.chain.title);
    });

    it('should preview the e-mail in a sandboxed frame, say that nothing is sent, and close it again', () => {
      openGarage(locale);
      expect(screen.getByTestId('not-sent')).toHaveTextContent(s.reminders.notSent);
      fireEvent.click(screen.getByTestId('email-toggle'));
      const frame = screen.getByTestId('email-frame');
      expect(frame).toHaveAttribute('sandbox', '');
      expect(frame.getAttribute('srcdoc')).toContain(s.email.logButton);
      expect(screen.getByTestId('email-subject')).toHaveTextContent(fill(s.email.subject, { bike: 'Road bike' }));
      fireEvent.click(screen.getByTestId('email-toggle'));
      expect(screen.queryByTestId('email-preview')).not.toBeInTheDocument();
    });
  });

  describe('the certificate', () => {
    it('should show the honesty line, the identity, the history and the total, and print it', () => {
      const print = vi.spyOn(window, 'print').mockImplementation(() => undefined);
      seed([entry({ price: 20, currency: 'eur', note: 'Gauge' }), entry({ id: 'e2', kind: 'brakes', variant: 'pads', price: 30, currency: 'eur', at: '2026-05-01' })]);
      openGarage(locale);
      fireEvent.click(screen.getByTestId('certificate-open'));
      const dialog = screen.getByTestId('certificate-dialog');
      expect(within(dialog).getByTestId('certificate-honesty')).toHaveTextContent(s.certificate.honesty);
      expect(dialog).toHaveTextContent(fill(s.certificate.generatedOn, { date: TODAY }));
      expect(within(dialog).getByTestId('certificate-history')).toHaveTextContent(s.log.variants.pads);
      expect(dialog).toHaveTextContent(`${s.certificate.totalLabel}: 50 EUR`);
      expect(dialog).toHaveTextContent(s.certificate.notGiven);
      expect(dialog).toHaveTextContent(`${s.certificate.bikeName}Road bike`);
      const sheet = screen.getByTestId('certificate-sheet');
      expect(sheet).toHaveAttribute('aria-hidden', 'true');
      expect(sheet).toHaveTextContent(s.certificate.honesty);
      expect(sheet.querySelectorAll('tbody tr')).toHaveLength(2);
      fireEvent.click(screen.getByTestId('certificate-print'));
      expect(print).toHaveBeenCalledTimes(1);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByTestId('certificate-dialog')).not.toBeInTheDocument();
      expect(screen.queryByTestId('certificate-sheet')).not.toBeInTheDocument();
      print.mockRestore();
    });

    it('should say that no service has been written down for a new bike', () => {
      openGarage(locale);
      fireEvent.click(screen.getByTestId('certificate-open'));
      expect(screen.getByTestId('certificate-history')).toHaveTextContent(s.certificate.empty);
    });
  });

  it('should have no emoji anywhere in the texts', () => {
    expect(JSON.stringify(s)).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});

describe('the passport starts with the known bike', () => {
  beforeEach(() => localStorage.clear());

  it('should fill make, model and year from the factory bike into an empty book, and leave a book that has data alone', () => {
    const known = { make: 'Cube', model: 'Attain', year: 2027 };
    const view = (<EditableView locale="en" fit={NO_FIT} known={known} t={translations.en} bikeId="current" bikeName="Cube Attain 2027" kind="road" discipline="road" riderWeightKg={75} care={DEFAULT_CARE} onCareChange={() => undefined} today={TODAY} />);
    const first = render(view);
    fireEvent.click(screen.getByTestId('care-tab-garage'));
    editPassport();
    expect(screen.getByTestId('identity-make')).toHaveValue('Cube');
    expect(screen.getByTestId('identity-model')).toHaveValue('Attain');
    expect(screen.getByTestId('identity-year')).toHaveValue('2027');
    fireEvent.change(screen.getByTestId('identity-model'), { target: { value: 'Attain SLX' } });
    savePassport();
    first.unmount();
    render(view);
    fireEvent.click(screen.getByTestId('care-tab-garage'));
    editPassport();
    expect(screen.getByTestId('identity-model')).toHaveValue('Attain SLX');
  });
});

describe('the passport follows a change of the factory bike', () => {
  beforeEach(() => localStorage.clear());
  const show = (known: { make: string; model: string; year: number }) => render(<EditableView locale="en" fit={NO_FIT} known={known} t={translations.en} bikeId="current" bikeName="Bike" kind="road" discipline="road" riderWeightKg={75} care={DEFAULT_CARE} onCareChange={() => undefined} today={TODAY} />);
  const open = () => { fireEvent.click(screen.getByTestId('care-tab-garage')); editPassport(); };

  it('should replace what was filled in from the old factory bike, and keep what the rider typed', () => {
    const first = show({ make: 'Superior', model: 'X-Road', year: 2025 });
    open();
    fireEvent.change(screen.getByTestId('identity-year'), { target: { value: '2024' } });
    savePassport();
    first.unmount();
    show({ make: 'Cube', model: 'Attain', year: 2027 });
    open();
    expect(screen.getByTestId('identity-make')).toHaveValue('Cube');
    expect(screen.getByTestId('identity-model')).toHaveValue('Attain');
    expect(screen.getByTestId('identity-year')).toHaveValue('2024');
  });

  it('should take the filled in values out again when the garage no longer vouches for them, and keep what the rider typed', () => {
    const first = show({ make: 'Superior', model: 'X-Road', year: 2025 });
    open();
    fireEvent.change(screen.getByTestId('identity-serial'), { target: { value: 'ABC1' } });
    fireEvent.change(screen.getByTestId('identity-model'), { target: { value: 'My own model' } });
    savePassport();
    first.unmount();
    render(<EditableView locale="en" fit={NO_FIT} t={translations.en} bikeId="current" bikeName="Cube Attain 2027" kind="road" discipline="road" riderWeightKg={75} care={DEFAULT_CARE} onCareChange={() => undefined} today={TODAY} />);
    open();
    expect(screen.getByTestId('identity-make')).toHaveValue('');
    expect(screen.getByTestId('identity-year')).toHaveValue('');
    expect(screen.getByTestId('identity-model')).toHaveValue('My own model');
    expect(screen.getByTestId('identity-serial')).toHaveValue('ABC1');
  });

  it('should fix a book that was filled by the first version, which kept no note of its source', () => {
    localStorage.setItem(BOOK_STORAGE_KEY, JSON.stringify({ version: 1, bikes: { current: { ...DEFAULT_BOOK, identity: { ...DEFAULT_BOOK.identity, make: 'Superior', model: 'X-Road', year: 2025 } } } }));
    show({ make: 'Cube', model: 'Attain', year: 2027 });
    open();
    expect(screen.getByTestId('identity-make')).toHaveValue('Cube');
    expect(screen.getByTestId('identity-year')).toHaveValue('2027');
  });
});

describe.each(['en', 'cs'] as Locale[])('the garage in the app (%s)', (locale) => {
  const t = translations[locale];
  beforeEach(() => localStorage.clear());

  it('should keep the frame number, the insurance number and the photo out of the passport that goes to the account', () => {
    render(<HomePage />);
    if (locale === 'cs') pickLanguage('CS');
    fireEvent.click(within(screen.getByTestId('sidebar')).getByRole('button', { name: new RegExp(t.navigation.baikcareStudio) }));
    fireEvent.click(screen.getByTestId('care-tab-garage'));
    editPassport();
    fireEvent.change(screen.getByTestId('identity-serial'), { target: { value: 'SERIAL-SECRET-1' } });
    fireEvent.change(screen.getByTestId('identity-insurance'), { target: { value: 'POLICY-SECRET-2' } });
    savePassport();
    go('log');
    fireEvent.click(screen.getByTestId('log-quick-chain'));
    fireEvent.change(screen.getByTestId('entry-value'), { target: { value: '0.4' } });
    fireEvent.click(screen.getByTestId('entry-save'));
    expect(localStorage.getItem(BOOK_STORAGE_KEY)).toContain('SERIAL-SECRET-1');
    const passport = localStorage.getItem(PASSPORT_STORAGE_KEY) ?? '';
    expect(passport).not.toContain('SERIAL-SECRET-1');
    expect(passport).not.toContain('POLICY-SECRET-2');
    expect(passport).toContain('"chainWearPct":0.4');
  });
});
