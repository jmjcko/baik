import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import HomePage from '../page';
import { loadLocalPassport } from '@/lib/passport/localStore';
import { translations, type Locale } from '@/lib/i18n/translations';

function openStep4(t = translations.en) {
  fireEvent.click(screen.getByText(t.shell.dashboard.hero.start));
  fireEvent.click(screen.getByText(t.wizard.continueToBody));
  fireEvent.click(screen.getByText(t.wizard.continueToPosture));
  fireEvent.click(screen.getByText(t.wizard.continueToBike));
}

function choose(t: typeof translations.en, brand: string, model: string, size: string) {
  const p = t.stockBike.picker;
  fireEvent.change(screen.getByLabelText(p.brandLabel), { target: { value: brand } });
  fireEvent.change(screen.getByLabelText(p.modelLabel), { target: { value: model } });
  fireEvent.change(screen.getByLabelText(p.sizeLabel), { target: { value: size } });
}

/** The rider has the Canyon Endurace CF 8 in the garage and picks the Specialized Tarmac SL8 (2024) on top of it. */
function pickAnotherBike(locale: Locale) {
  const t = translations[locale];
  render(<HomePage />);
  if (locale === 'cs') fireEvent.click(screen.getByText('CS'));
  openStep4(t);
  fireEvent.click(screen.getByRole('switch'));
  choose(t, 'Canyon', 'Endurace CF 8', 'M');
  expect(screen.queryByTestId('save-bike-dialog')).not.toBeInTheDocument();
  choose(t, 'Specialized', 'Tarmac SL8', '54');
  return { t, dialog: screen.getByTestId('save-bike-dialog') };
}

describe.each(['en', 'cs'] as const)('Choosing another factory bike asks what to keep (%s)', (locale) => {
  beforeEach(() => localStorage.clear());

  it('should hold the choice and offer the three ways out, with a name proposed for the new bike', () => {
    const { t, dialog } = pickAnotherBike(locale);
    const s = t.stockBike.picker.save;
    expect(within(dialog).getByRole('button', { name: s.saveAsNew })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: s.cancel })).toBeInTheDocument();
    expect((within(dialog).getByLabelText(s.nameLabel) as HTMLInputElement).value).toContain('Specialized Tarmac SL8');
    expect(screen.getByTestId('stock-summary')).toHaveTextContent('Canyon');
  });

  it('should keep the old bike when the rider cancels', () => {
    const { t, dialog } = pickAnotherBike(locale);
    fireEvent.click(within(dialog).getByRole('button', { name: t.stockBike.picker.save.cancel }));
    expect(screen.queryByTestId('save-bike-dialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('stock-summary')).toHaveTextContent('Canyon');
  });

  it('should replace the setup of the active bike', () => {
    const { dialog } = pickAnotherBike(locale);
    fireEvent.click(within(dialog).getAllByRole('button')[1]);
    expect(screen.queryByTestId('save-bike-dialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('stock-summary')).toHaveTextContent('Specialized');
  });

  it('should save the chosen bike as a new bike of the garage and leave the old one as it was', () => {
    const { t, dialog } = pickAnotherBike(locale);
    fireEvent.change(within(dialog).getByLabelText(t.stockBike.picker.save.nameLabel), { target: { value: 'Race bike' } });
    fireEvent.click(within(dialog).getByRole('button', { name: t.stockBike.picker.save.saveAsNew }));
    expect(screen.queryByTestId('save-bike-dialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('stock-summary')).toHaveTextContent('Specialized');
    expect(screen.getAllByText(/Race bike/).length).toBeGreaterThan(0);
    const bikes = loadLocalPassport()?.passport.bikes ?? [];
    expect(bikes).toHaveLength(2);
    expect(bikes.map((bike) => bike.stock?.source === 'seed' ? bike.stock.bikeId : null)).toEqual(['canyon-endurace-cf-8-di2-2024', 'specialized-tarmac-sl8-expert-2024']);
  });

  it('should refuse an empty name and say why', () => {
    const { t, dialog } = pickAnotherBike(locale);
    fireEvent.change(within(dialog).getByLabelText(t.stockBike.picker.save.nameLabel), { target: { value: '  ' } });
    fireEvent.click(within(dialog).getByRole('button', { name: t.stockBike.picker.save.saveAsNew }));
    expect(screen.getByRole('alert')).toHaveTextContent(t.stockBike.picker.save.failed);
    expect(screen.getByTestId('save-bike-dialog')).toBeInTheDocument();
  });
});
