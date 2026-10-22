import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { STOCK_BIKE_SPECS } from '@/lib/bikes';
import type { AiStockSelection, StockSelection } from '@/lib/bikes/types';
import { StockBikePicker } from '../stock/StockBikePicker';

const mockExtract = vi.fn();
vi.mock('@/app/actions/extractStockBikeSpec', () => ({ extractStockBikeSpec: (input: unknown) => mockExtract(input) }));

const canyon = STOCK_BIKE_SPECS[0];
const ai: AiStockSelection = { source: 'ai', brand: 'Cube', model: 'Attain GTC', year: 2024, size: '54', spec: { ...canyon.sizes.M, stockStemMm: null, stockHandlebarMm: 420, stockCrankMm: 170 } };

function setup(locale: Locale, initial: StockSelection | null = null) {
  const spies = { setBar: vi.fn(), setCrank: vi.fn(), onChange: vi.fn() };
  const Harness = () => {
    const [stockBike, setStockBike] = useState<StockSelection | null>(initial);
    return (
      <StockBikePicker
        t={translations[locale]}
        stockBike={stockBike}
        setStockBike={(next) => { spies.onChange(next); setStockBike(next); }}
        setCurrentBarWidthMm={spies.setBar}
        setCrankLengthMm={spies.setCrank}
      />
    );
  };
  render(<Harness />);
  return spies;
}

describe.each(['en', 'cs'] as Locale[])('StockBikePicker (%s)', (locale) => {
  const p = translations[locale].stockBike.picker;
  const choose = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

  beforeEach(() => mockExtract.mockReset());

  it('should start switched off with no list, and open the list with the switch', () => {
    setup(locale);
    const toggle = screen.getByRole('switch', { name: new RegExp(p.toggleLabel) });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(screen.queryByLabelText(p.brandLabel)).not.toBeInTheDocument();
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByLabelText(p.brandLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(p.modelLabel)).toBeDisabled();
    expect(screen.getByLabelText(p.sizeLabel)).toBeDisabled();
  });

  it('should offer the brands of the seed and narrow Model, Year and Frame size step by step', () => {
    setup(locale);
    fireEvent.click(screen.getByRole('switch'));
    const brands = within(screen.getByLabelText(p.brandLabel)).getAllByRole('option').map((o) => o.textContent);
    expect(brands).toEqual([p.choose, 'Canyon', 'Specialized', 'Trek', 'Giant']);
    choose(p.brandLabel, 'Canyon');
    expect(within(screen.getByLabelText(p.modelLabel)).getAllByRole('option').map((o) => o.textContent)).toEqual([p.choose, 'Endurace CF 8']);
    choose(p.modelLabel, 'Endurace CF 8');
    expect(screen.getByLabelText(p.yearLabel)).toHaveValue('2024');
    expect(within(screen.getByLabelText(p.sizeLabel)).getAllByRole('option').map((o) => o.textContent)).toEqual([p.choose, 'XS', 'S', 'M', 'L', 'XL']);
  });

  it('should select the seed bike with its size, prefill the stock handlebar and cranks and show the source', () => {
    const spies = setup(locale);
    fireEvent.click(screen.getByRole('switch'));
    choose(p.brandLabel, 'Canyon');
    choose(p.modelLabel, 'Endurace CF 8');
    choose(p.sizeLabel, 'M');
    expect(spies.onChange).toHaveBeenLastCalledWith({ source: 'seed', bikeId: 'canyon-endurace-cf-8-di2-2024', size: 'M' });
    expect(spies.setBar).toHaveBeenCalledWith(410);
    expect(spies.setCrank).toHaveBeenCalledWith(172.5);
    expect(screen.getByTestId('stock-summary')).toHaveTextContent(/Canyon Endurace CF 8 2024/);
    expect(screen.getByTestId('stock-summary')).toHaveTextContent(/590 mm/);
    expect(screen.getByTestId('stock-summary')).toHaveTextContent(canyon.source.name);
  });

  it('should not prefill a component that the maker does not publish (Trek: handlebar and cranks)', () => {
    const spies = setup(locale);
    fireEvent.click(screen.getByRole('switch'));
    choose(p.brandLabel, 'Trek');
    choose(p.modelLabel, 'Domane SL 6 Gen 4');
    choose(p.sizeLabel, '56');
    expect(spies.onChange).toHaveBeenLastCalledWith({ source: 'seed', bikeId: 'trek-domane-sl-6-gen-4-2024', size: '56' });
    expect(spies.setBar).not.toHaveBeenCalled();
    expect(spies.setCrank).not.toHaveBeenCalled();
  });

  it('should clear the selection when an earlier choice changes, and keep it when only the year is picked again', () => {
    const spies = setup(locale);
    fireEvent.click(screen.getByRole('switch'));
    choose(p.brandLabel, 'Giant');
    choose(p.modelLabel, 'Defy Advanced 2');
    choose(p.sizeLabel, 'ML');
    spies.onChange.mockClear();
    choose(p.yearLabel, '2023');
    expect(spies.onChange).not.toHaveBeenCalled();
    choose(p.brandLabel, 'Trek');
    expect(spies.onChange).toHaveBeenLastCalledWith(null);
    expect(screen.getByLabelText(p.sizeLabel)).toBeDisabled();
  });

  it('should show a stored seed bike again when the rider returns, and clear it with the switch', () => {
    const spies = setup(locale, { source: 'seed', bikeId: 'specialized-tarmac-sl8-expert-2024', size: '56' });
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByLabelText(p.brandLabel)).toHaveValue('Specialized');
    expect(screen.getByLabelText(p.sizeLabel)).toHaveValue('56');
    fireEvent.click(screen.getByRole('switch'));
    expect(spies.onChange).toHaveBeenLastCalledWith(null);
    expect(screen.queryByLabelText(p.brandLabel)).not.toBeInTheDocument();
  });

  it('should load a bike that is not in the list from a link and wait for the confirmation before using it', async () => {
    mockExtract.mockResolvedValue({ success: true, bike: ai });
    const spies = setup(locale);
    fireEvent.click(screen.getByRole('switch'));
    fireEvent.click(screen.getByText(p.notListed));
    fireEvent.change(screen.getByLabelText(p.urlLabel), { target: { value: ' https://www.cube.eu/attain ' } });
    fireEvent.change(screen.getByLabelText(p.urlSizeLabel), { target: { value: '54' } });
    fireEvent.click(screen.getByRole('button', { name: p.urlButton }));
    const review = await screen.findByTestId('stock-review');
    expect(mockExtract).toHaveBeenCalledWith({ url: 'https://www.cube.eu/attain', size: '54' });
    expect(within(review).getByText(p.review.title)).toBeInTheDocument();
    expect(within(review).getByText('Cube')).toBeInTheDocument();
    expect(within(review).getByText('420 mm')).toBeInTheDocument();
    expect(within(review).getByText(p.review.notStated)).toBeInTheDocument();
    expect(spies.onChange).not.toHaveBeenCalled();
    fireEvent.click(within(review).getByRole('button', { name: p.review.confirm }));
    expect(spies.onChange).toHaveBeenCalledWith(ai);
    expect(spies.setBar).toHaveBeenCalledWith(420);
    expect(spies.setCrank).toHaveBeenCalledWith(170);
    expect(screen.getByTestId('stock-summary')).toHaveTextContent(/Cube Attain GTC 2024/);
    expect(screen.queryByText(/cube\.eu/)).not.toBeInTheDocument();
  });

  it('should drop what the AI read when the rider discards it, and forget the link', async () => {
    mockExtract.mockResolvedValue({ success: true, bike: ai });
    const spies = setup(locale);
    fireEvent.click(screen.getByRole('switch'));
    fireEvent.click(screen.getByText(p.notListed));
    fireEvent.change(screen.getByLabelText(p.urlLabel), { target: { value: 'https://www.cube.eu/attain' } });
    fireEvent.change(screen.getByLabelText(p.urlSizeLabel), { target: { value: '54' } });
    fireEvent.click(screen.getByRole('button', { name: p.urlButton }));
    fireEvent.click(await screen.findByRole('button', { name: p.review.discard }));
    expect(spies.onChange).not.toHaveBeenCalled();
    expect(screen.getByLabelText(p.urlLabel)).toHaveValue('');
  });

  it.each(['invalid_input', 'not_configured', 'rate_limited', 'unavailable', 'unreadable'] as const)('should show the fixed text for the error %s and keep the fields', async (error) => {
    mockExtract.mockResolvedValue({ success: false, error });
    setup(locale);
    fireEvent.click(screen.getByRole('switch'));
    fireEvent.click(screen.getByText(p.notListed));
    fireEvent.change(screen.getByLabelText(p.urlLabel), { target: { value: 'https://www.cube.eu/attain' } });
    fireEvent.change(screen.getByLabelText(p.urlSizeLabel), { target: { value: '54' } });
    fireEvent.click(screen.getByRole('button', { name: p.urlButton }));
    expect(await screen.findByRole('alert')).toHaveTextContent(p.errors[error]);
    expect(screen.getByLabelText(p.urlLabel)).toHaveValue('https://www.cube.eu/attain');
  });

  it('should disable the buttons while the page is read and go back to the list', async () => {
    let finish: (value: unknown) => void = () => undefined;
    mockExtract.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    setup(locale);
    fireEvent.click(screen.getByRole('switch'));
    fireEvent.click(screen.getByText(p.notListed));
    fireEvent.change(screen.getByLabelText(p.urlLabel), { target: { value: 'https://www.cube.eu/attain' } });
    fireEvent.change(screen.getByLabelText(p.urlSizeLabel), { target: { value: '54' } });
    fireEvent.click(screen.getByRole('button', { name: p.urlButton }));
    expect(screen.getByRole('button', { name: p.urlWorking })).toBeDisabled();
    expect(screen.getByRole('button', { name: p.urlBack })).toBeDisabled();
    finish({ success: false, error: 'unavailable' });
    await waitFor(() => expect(screen.getByRole('button', { name: p.urlBack })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: p.urlBack }));
    expect(screen.getByLabelText(p.brandLabel)).toBeInTheDocument();
  });

  it('should show an AI bike that was confirmed earlier, with no source line of a seed table', () => {
    setup(locale, ai);
    expect(screen.getByTestId('stock-summary')).toHaveTextContent(/Cube Attain GTC 2024/);
    expect(screen.getByTestId('stock-summary')).not.toHaveTextContent(canyon.source.name);
  });
});
