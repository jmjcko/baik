import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { STOCK_BIKE_SPECS } from '@/lib/bikes';
import type { StockSelection } from '@/lib/bikes/types';
import { fakeAuthClient, riderSession } from '@/test/fakeAuthClient';
import { StockBikePicker } from '../stock/StockBikePicker';

const mockExtract = vi.fn();
vi.mock('@/app/actions/extractStockBikeSpec', () => ({ extractStockBikeSpec: (input: unknown) => mockExtract(input), extractStockBikeSpecFromImage: vi.fn() }));

const spec = { ...STOCK_BIKE_SPECS[0].sizes.M, frameStackMm: 575, frameReachMm: 374, stockHandlebarMm: 420, stockCrankMm: 170 };
const row = (over: Record<string, unknown> = {}) => ({ id: 'c1', brand: 'Cube', model: 'Attain GTC', year: 2024, size: '54', key: 'cube|attaingtc|2024|54', spec, origin: 'community', confirmations: 2, note: null, ...over });

async function setup(locale: Locale, { signedIn = false, catalog = [row()], initial = null }: { signedIn?: boolean; catalog?: Array<Record<string, unknown>>; initial?: StockSelection | null } = {}) {
  const fake = fakeAuthClient();
  fake.database.tables.bike_catalog = catalog;
  const spies = { setBar: vi.fn(), setCrank: vi.fn(), onChange: vi.fn() };
  const Harness = () => {
    const [stockBike, setStockBike] = useState<StockSelection | null>(initial);
    return <StockBikePicker t={translations[locale]} stockBike={stockBike} setStockBike={(next) => { spies.onChange(next); setStockBike(next); }} setCurrentBarWidthMm={spies.setBar} setCrankLengthMm={spies.setCrank} />;
  };
  render(<AuthProvider client={fake.client}><Harness /></AuthProvider>);
  await act(async () => fake.emit('INITIAL_SESSION', null));
  if (signedIn) await act(async () => fake.emit('SIGNED_IN', riderSession));
  return { fake, spies };
}

describe.each(['en', 'cs'] as Locale[])('the community catalog in the picker (%s)', (locale) => {
  const p = translations[locale].stockBike.picker;
  const choose = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label, { selector: 'select' }), { target: { value } });
  const openCube = async () => {
    fireEvent.click(screen.getByRole('switch'));
    await waitFor(() => expect(within(screen.getByLabelText(p.brandLabel)).getAllByRole('option').map((o) => o.textContent)).toContain('Cube'));
    choose(p.brandLabel, 'Cube');
  };

  beforeEach(() => mockExtract.mockReset());

  it('should add the brands and models of the catalog to the lists and mark them as community bikes', async () => {
    await setup(locale);
    await openCube();
    expect(within(screen.getByLabelText(p.modelLabel)).getAllByRole('option').map((o) => o.textContent)).toEqual([p.choose, `Attain GTC (${p.communityLabel})`]);
    choose(p.modelLabel, 'Attain GTC');
    expect(screen.getByLabelText(p.yearLabel)).toHaveValue('2024');
    expect(within(screen.getByLabelText(p.sizeLabel)).getAllByRole('option').map((o) => o.textContent)).toEqual([p.choose, '54']);
  });

  it('should keep the seed brands first and show only seed bikes without a catalog', async () => {
    await setup(locale, { catalog: [] });
    fireEvent.click(screen.getByRole('switch'));
    expect(within(screen.getByLabelText(p.brandLabel)).getAllByRole('option').map((o) => o.textContent)).toEqual([p.choose, 'Canyon', 'Specialized', 'Trek', 'Giant']);
  });

  it('should hide a catalog bike that the seed already has', async () => {
    await setup(locale, { catalog: [row({ brand: 'Canyon', model: 'Endurace CF 8', year: 2024, size: 'M' })] });
    fireEvent.click(screen.getByRole('switch'));
    choose(p.brandLabel, 'Canyon');
    expect(within(screen.getByLabelText(p.modelLabel)).getAllByRole('option').map((o) => o.textContent)).toEqual([p.choose, 'Endurace CF 8', 'Endurace CF SLX 8', 'Ultimate CF SLX 8']);
  });

  it('should show a bike shared by riders in the editable card with the number of riders, and use it only after the confirmation', async () => {
    const { spies } = await setup(locale);
    await openCube();
    choose(p.modelLabel, 'Attain GTC');
    choose(p.sizeLabel, '54');
    const card = screen.getByTestId('stock-review');
    expect(within(card).getByText(p.review.communityTitle.replace('{n}', '2'))).toBeInTheDocument();
    expect(within(card).getByText(p.review.communityBody)).toBeInTheDocument();
    expect(screen.queryByLabelText(p.review.share)).not.toBeInTheDocument();
    expect(spies.onChange).not.toHaveBeenCalledWith(expect.objectContaining({ source: 'community' }));
    fireEvent.click(within(card).getByRole('button', { name: p.review.confirm }));
    expect(spies.onChange).toHaveBeenCalledWith({ source: 'community', brand: 'Cube', model: 'Attain GTC', year: 2024, size: '54', spec, origin: 'community', confirmations: 2 });
    expect(spies.setBar).toHaveBeenCalledWith(420);
    expect(screen.getByTestId('stock-ai-card')).toHaveTextContent(/Cube Attain GTC 2024/);
    expect(screen.getByTestId('stock-ai-card')).toHaveTextContent(p.communityCardTitle);
  });

  it('should make the bike private to the rider when a number is changed in the card', async () => {
    const { spies } = await setup(locale);
    await openCube();
    choose(p.modelLabel, 'Attain GTC');
    choose(p.sizeLabel, '54');
    fireEvent.change(screen.getByLabelText(new RegExp(`^${p.review.stack}`)), { target: { value: '576' } });
    fireEvent.click(screen.getByRole('button', { name: p.review.confirm }));
    expect(spies.onChange).toHaveBeenCalledWith(expect.objectContaining({ source: 'ai', spec: { ...spec, frameStackMm: 576 } }));
  });

  it('should use a bike that the owner verified at once, without the card', async () => {
    const { spies } = await setup(locale, { catalog: [row({ origin: 'owner', confirmations: 0 })] });
    await openCube();
    choose(p.modelLabel, 'Attain GTC');
    choose(p.sizeLabel, '54');
    expect(screen.queryByTestId('stock-review')).not.toBeInTheDocument();
    expect(spies.onChange).toHaveBeenCalledWith(expect.objectContaining({ source: 'community', origin: 'owner', confirmations: 0 }));
    expect(spies.setCrank).toHaveBeenCalledWith(170);
  });

  it('should drop the card when the rider chooses another bike', async () => {
    await setup(locale);
    await openCube();
    choose(p.modelLabel, 'Attain GTC');
    choose(p.sizeLabel, '54');
    expect(screen.getByTestId('stock-review')).toBeInTheDocument();
    choose(p.brandLabel, 'Trek');
    expect(screen.queryByTestId('stock-review')).not.toBeInTheDocument();
  });

  it('should show a catalog bike that was confirmed earlier as the chosen bike', async () => {
    await setup(locale, { initial: { source: 'community', brand: 'Cube', model: 'Attain GTC', year: 2024, size: '54', spec, origin: 'community', confirmations: 2 } });
    expect(screen.getByTestId('stock-ai-card')).toHaveTextContent(p.communityCardTitle);
    expect(screen.queryByLabelText(p.brandLabel)).not.toBeInTheDocument();
  });
});

describe.each(['en', 'cs'] as Locale[])('sharing a bike read by the AI (%s)', (locale) => {
  const p = translations[locale].stockBike.picker;
  const proposal = { brand: 'Cube', model: 'Attain', year: 2024, size: '54', spec };
  const readBike = async () => {
    mockExtract.mockResolvedValue({ success: true, bike: proposal });
    fireEvent.click(screen.getByRole('switch'));
    fireEvent.click(screen.getByText(p.notListed));
    fireEvent.change(screen.getByLabelText(p.urlLabel), { target: { value: 'https://www.cube.eu/attain' } });
    fireEvent.change(screen.getByLabelText(p.urlSizeLabel), { target: { value: '54' } });
    fireEvent.click(screen.getByRole('button', { name: p.urlButton }));
    await screen.findByTestId('stock-review');
  };

  beforeEach(() => mockExtract.mockReset());

  it('should offer no sharing to a guest', async () => {
    await setup(locale);
    await readBike();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('should offer sharing to a signed in rider, switched off, and share nothing when it stays off', async () => {
    const { fake } = await setup(locale, { signedIn: true });
    await readBike();
    expect(screen.getByRole('checkbox', { name: p.review.share })).not.toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: p.review.confirm }));
    await waitFor(() => expect(screen.getByTestId('stock-ai-card')).toBeInTheDocument());
    expect(fake.database.submissionsUpsert).not.toHaveBeenCalled();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('should share the numbers only after the consent, and say that they wait for a check', async () => {
    const { fake } = await setup(locale, { signedIn: true });
    await readBike();
    fireEvent.click(screen.getByRole('checkbox', { name: p.review.share }));
    fireEvent.click(screen.getByRole('button', { name: p.review.confirm }));
    expect(await screen.findByRole('status')).toHaveTextContent(p.shareSent);
    expect(fake.database.submissionsUpsert).toHaveBeenCalledWith({ user_id: 'u1', brand: 'Cube', model: 'Attain', year: 2024, size: '54', spec }, { onConflict: 'user_id,key' });
    expect(JSON.stringify(fake.database.submissionsUpsert.mock.calls)).not.toContain('cube.eu');
  });

  it('should keep the bike for the rider and say so when the numbers could not be shared', async () => {
    const { fake, spies } = await setup(locale, { signedIn: true });
    fake.database.tableError.current = { code: '42501' };
    await readBike();
    fireEvent.click(screen.getByRole('checkbox', { name: p.review.share }));
    fireEvent.click(screen.getByRole('button', { name: p.review.confirm }));
    expect(await screen.findByRole('status')).toHaveTextContent(p.shareFailed);
    expect(spies.onChange).toHaveBeenCalledWith(expect.objectContaining({ source: 'ai', brand: 'Cube' }));
  });
});
