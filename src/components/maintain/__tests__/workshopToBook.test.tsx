import { beforeEach, describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { translations } from '@/lib/i18n/translations';
import { DEFAULT_CARE } from '@/types/maintain';
import { Harness, TODAY, entry, seed, storedBook } from '@/test/garageHarness';
import { openCare } from '@/test/careNav';

const TUBELESS = { ...DEFAULT_CARE, tubeless: true };
const setSealantDay = (day: string) => { fireEvent.change(screen.getByTestId('sealant-date'), { target: { value: day } }); fireEvent.blur(screen.getByTestId('sealant-date')); };
const readChain = (text: string) => { const input = screen.getByTestId('chain-reading'); fireEvent.focus(input); fireEvent.change(input, { target: { value: text } }); fireEvent.blur(input); };

describe.each(['en', 'cs'] as const)('what the workshop records is offered to the service book (%s)', (locale) => {
  const f = translations[locale].service.log.fromWorkshop;
  beforeEach(() => localStorage.clear());

  it('should open the form with the day when the sealant is topped up, and write the entry into the book', async () => {
    render(<Harness locale={locale} initial={TUBELESS} />);
    openCare('wheels');
    setSealantDay('2026-10-20');
    expect(screen.getByTestId('entry-dialog')).toHaveTextContent(f.title);
    expect(screen.getByTestId('entry-day')).toHaveValue('2026-10-20');
    fireEvent.change(screen.getByTestId('entry-price'), { target: { value: '240' } });
    fireEvent.click(screen.getByTestId('entry-save'));
    expect(screen.queryByTestId('entry-dialog')).toBeNull();
    await act(async () => {});
    expect(storedBook().log).toMatchObject([{ kind: 'sealant', at: '2026-10-20', price: 240 }]);
  });

  it('should write nothing when the rider skips', () => {
    render(<Harness locale={locale} initial={TUBELESS} />);
    openCare('wheels');
    setSealantDay('2026-10-20');
    fireEvent.click(screen.getByTestId('entry-skip'));
    expect(screen.queryByTestId('entry-dialog')).toBeNull();
    expect(storedBook()?.log ?? []).toEqual([]);
    expect(screen.getByTestId('sealant-date')).toHaveValue('2026-10-20');
  });

  it('should not ask when the book already has the sealant of that day', () => {
    seed([entry({ kind: 'sealant', at: '2026-10-20', value: null })]);
    render(<Harness locale={locale} initial={TUBELESS} />);
    openCare('wheels');
    setSealantDay('2026-10-20');
    expect(screen.queryByTestId('entry-dialog')).toBeNull();
  });

  it('should not ask when the day is cleared', () => {
    render(<Harness locale={locale} initial={{ ...TUBELESS, sealantAt: '2026-10-01' }} />);
    openCare('wheels');
    setSealantDay('');
    expect(screen.queryByTestId('entry-dialog')).toBeNull();
  });

  it('should ask about the chain reading once it is left, and only when it differs from the last entry', () => {
    seed([entry({ kind: 'chain', at: '2026-09-01', value: 0.4 })]);
    render(<Harness locale={locale} />);
    openCare('chain');
    readChain('0.4');
    expect(screen.queryByTestId('entry-dialog')).toBeNull();
    readChain('0.5');
    expect(screen.getByTestId('entry-value')).toHaveValue('0.5');
    expect(screen.getByTestId('entry-day')).toHaveValue(TODAY);
  });

  it('should not ask while the reading is not a plausible number', () => {
    render(<Harness locale={locale} />);
    openCare('chain');
    readChain('abc');
    expect(screen.queryByTestId('entry-dialog')).toBeNull();
  });

  it('should ask for the bar tape of a trainer bike with the cable entry in its tape variant', () => {
    render(<Harness locale={locale} initial={{ ...DEFAULT_CARE, trainer: true }} />);
    openCare('trainer');
    fireEvent.change(screen.getByTestId('tape-date'), { target: { value: '2026-10-10' } });
    fireEvent.blur(screen.getByTestId('tape-date'));
    expect(screen.getByTestId('entry-variant')).toHaveValue('tape');
    expect(screen.getByTestId('entry-day')).toHaveValue('2026-10-10');
  });

  it('should keep the old workshop data as it is: opening the workshop and leaving a field untouched asks nothing', () => {
    render(<Harness locale={locale} initial={{ ...TUBELESS, sealantAt: '2026-10-01', chainWearPct: 0.4 }} />);
    openCare('chain');
    const input = screen.getByTestId('chain-reading');
    fireEvent.focus(input);
    fireEvent.blur(input);
    openCare('wheels');
    fireEvent.blur(screen.getByTestId('sealant-date'));
    expect(screen.queryByTestId('entry-dialog')).toBeNull();
  });
});
