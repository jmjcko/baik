import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { STOCK_BIKE_SPECS } from '@/lib/bikes';
import type { AiStockSelection, StockSelection } from '@/lib/bikes/types';
import { MAX_IMAGE_BASE64_LENGTH, type ExtractedBike } from '@/lib/bikes/extraction';
import { StockBikePicker } from '../stock/StockBikePicker';

const mockExtractImage = vi.fn();
const mockPrepare = vi.fn();
vi.mock('@/app/actions/extractStockBikeSpec', () => ({
  extractStockBikeSpecFromImage: (input: unknown) => mockExtractImage(input),
}));
vi.mock('@/lib/bikes/prepareImage', async (importOriginal) => ({ ...(await importOriginal<typeof import('@/lib/bikes/prepareImage')>()), prepareGeometryImage: (file: unknown, limit: unknown) => mockPrepare(file, limit) }));

const canyon = STOCK_BIKE_SPECS[0];
const spec = { ...canyon.sizes.M, stockStemMm: null, stockHandlebarMm: 420, stockCrankMm: 170 };
const ai: AiStockSelection = { source: 'ai', brand: 'Cube', model: 'Attain GTC', year: 2024, size: '54', spec };
const proposal: ExtractedBike = { brand: 'Cube', model: 'Attain GTC', year: 2024, size: '54', spec };

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

  beforeEach(() => {
    mockExtractImage.mockReset();
    mockPrepare.mockReset();
  });

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
    expect(brands).toEqual([p.choose, 'Canyon', 'Specialized', 'Trek', 'Giant', 'Superior']);
    choose(p.brandLabel, 'Canyon');
    expect(within(screen.getByLabelText(p.modelLabel)).getAllByRole('option').map((o) => o.textContent)).toEqual([p.choose, 'Endurace CF 8', 'Endurace CF SLX 8', 'Ultimate CF SLX 8', 'Endurace CF 6', 'Grizl 6', 'Grail CF SLX 8 AXS']);
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

  const pictureBox = () => screen.getByLabelText(new RegExp(p.imageLabel.slice(0, 15)));
  const openLink = () => {
    mockPrepare.mockResolvedValue({ imageBase64: 'A'.repeat(300), mimeType: 'image/jpeg' });
    fireEvent.click(screen.getByRole('switch'));
    fireEvent.click(screen.getByText(p.notListed));
    fireEvent.change(pictureBox(), { target: { files: [new File(['x'], 'geometry.png', { type: 'image/png' })] } });
    fireEvent.change(screen.getByLabelText(p.urlSizeLabel), { target: { value: '54' } });
    fireEvent.click(screen.getByRole('button', { name: p.imageButton }));
  };
  const box = (label: string) => screen.getByLabelText(new RegExp(`^${label}`));

  it('should load a bike that is not in the list from a picture and show it in an editable card before using it', async () => {
    mockExtractImage.mockResolvedValue({ success: true, bike: proposal });
    const spies = setup(locale);
    openLink();
    const review = await screen.findByTestId('stock-review');
    expect(mockExtractImage).toHaveBeenCalledWith({ imageBase64: 'A'.repeat(300), mimeType: 'image/jpeg', size: '54' });
    expect(within(review).getByText(p.review.title)).toBeInTheDocument();
    expect(box(p.review.brand)).toHaveValue('Cube');
    expect(box(p.review.handlebar)).toHaveValue('420');
    expect(box(p.review.stem)).toHaveValue('');
    expect(box(p.review.stem)).toHaveAttribute('placeholder', p.review.notStated);
    expect(spies.onChange).not.toHaveBeenCalled();
    fireEvent.click(within(review).getByRole('button', { name: p.review.confirm }));
    expect(spies.onChange).toHaveBeenCalledWith(ai);
    expect(spies.setBar).toHaveBeenCalledWith(420);
    expect(spies.setCrank).toHaveBeenCalledWith(170);
    const card = screen.getByTestId('stock-ai-card');
    expect(card).toHaveTextContent(/Cube Attain GTC 2024, size 54|Cube Attain GTC 2024, velikost 54/);
    expect(card).toHaveTextContent(/590/);
    expect(card).toHaveTextContent(/420 mm/);
    expect(screen.queryByLabelText(p.brandLabel)).not.toBeInTheDocument();
    expect(screen.queryByText(/geometry\.png/)).not.toBeInTheDocument();
  });

  it('should use what the rider corrected and filled in: the stem read from the bike, a changed crank, a decimal comma', async () => {
    mockExtractImage.mockResolvedValue({ success: true, bike: proposal });
    const spies = setup(locale);
    openLink();
    await screen.findByTestId('stock-review');
    fireEvent.change(box(p.review.stem), { target: { value: '100' } });
    fireEvent.change(box(p.review.crank), { target: { value: '172,5' } });
    fireEvent.change(box(p.review.model), { target: { value: 'Attain SLX' } });
    fireEvent.click(screen.getByRole('button', { name: p.review.confirm }));
    expect(spies.onChange).toHaveBeenCalledWith({ ...ai, model: 'Attain SLX', spec: { ...spec, stockStemMm: 100, stockCrankMm: 172.5 } });
    expect(spies.setCrank).toHaveBeenCalledWith(172.5);
  });

  it('should not confirm while a box is empty or out of range, and mark the boxes', async () => {
    mockExtractImage.mockResolvedValue({ success: true, bike: { ...proposal, brand: '', year: null } });
    const spies = setup(locale);
    openLink();
    await screen.findByTestId('stock-review');
    fireEvent.change(box(p.review.crank), { target: { value: '9999' } });
    fireEvent.click(screen.getByRole('button', { name: p.review.confirm }));
    expect(screen.getByRole('alert')).toHaveTextContent(p.review.invalid);
    for (const label of [p.review.brand, p.review.year, p.review.crank]) expect(box(label)).toHaveAttribute('aria-invalid', 'true');
    expect(box(p.review.stack)).not.toHaveAttribute('aria-invalid');
    expect(spies.onChange).not.toHaveBeenCalled();
    fireEvent.change(box(p.review.brand), { target: { value: 'Cube' } });
    fireEvent.change(box(p.review.year), { target: { value: '2026' } });
    fireEvent.change(box(p.review.crank), { target: { value: '170' } });
    fireEvent.click(screen.getByRole('button', { name: p.review.confirm }));
    expect(spies.onChange).toHaveBeenCalledWith(expect.objectContaining({ brand: 'Cube', year: 2026 }));
  });

  it('should drop what the AI read when the rider discards it, and forget the picture', async () => {
    mockExtractImage.mockResolvedValue({ success: true, bike: proposal });
    const spies = setup(locale);
    openLink();
    fireEvent.click(await screen.findByRole('button', { name: p.review.discard }));
    expect(spies.onChange).not.toHaveBeenCalled();
    expect(screen.queryByTestId('picture-name')).not.toBeInTheDocument();
  });

  it('should read the bike from a picture: shrink it on this device, send only the small JPEG, and forget the file afterwards', async () => {
    mockPrepare.mockResolvedValue({ imageBase64: 'A'.repeat(300), mimeType: 'image/jpeg' });
    mockExtractImage.mockResolvedValue({ success: true, bike: { ...proposal, brand: '', model: '', year: null } });
    const spies = setup(locale);
    fireEvent.click(screen.getByRole('switch'));
    fireEvent.click(screen.getByText(p.notListed));
    const picture = new File(['x'], 'geometry.png', { type: 'image/png' });
    fireEvent.change(screen.getByLabelText(new RegExp(p.imageLabel.slice(0, 15))), { target: { files: [picture] } });
    fireEvent.change(screen.getByLabelText(p.urlSizeLabel), { target: { value: '54' } });
    fireEvent.click(screen.getByRole('button', { name: p.imageButton }));
    await screen.findByTestId('stock-review');
    expect(mockPrepare).toHaveBeenCalledWith(picture, MAX_IMAGE_BASE64_LENGTH);
    expect(mockExtractImage).toHaveBeenCalledWith({ imageBase64: 'A'.repeat(300), mimeType: 'image/jpeg', size: '54' });
    expect(box(p.review.brand)).toHaveValue('');
    fireEvent.change(box(p.review.brand), { target: { value: 'Cube' } });
    fireEvent.change(box(p.review.model), { target: { value: 'Attain' } });
    fireEvent.change(box(p.review.year), { target: { value: '2024' } });
    fireEvent.click(screen.getByRole('button', { name: p.review.confirm }));
    expect(spies.onChange).toHaveBeenCalledWith(expect.objectContaining({ source: 'ai', brand: 'Cube', model: 'Attain', year: 2024 }));
    expect(screen.queryByLabelText(new RegExp(p.imageLabel.slice(0, 15)))).not.toBeInTheDocument();
  });

  it('should say a picture is needed when none was chosen, without calling the service', async () => {
    setup(locale);
    fireEvent.click(screen.getByRole('switch'));
    fireEvent.click(screen.getByText(p.notListed));
    fireEvent.change(screen.getByLabelText(p.urlSizeLabel), { target: { value: '54' } });
    fireEvent.click(screen.getByRole('button', { name: p.imageButton }));
    expect(await screen.findByRole('alert')).toHaveTextContent(p.errors.invalid_image);
    expect(mockPrepare).not.toHaveBeenCalled();
    expect(mockExtractImage).not.toHaveBeenCalled();
  });

  it('should refuse a file that is not a PNG, JPG or WebP picture at once, and keep the form', () => {
    setup(locale);
    fireEvent.click(screen.getByRole('switch'));
    fireEvent.click(screen.getByText(p.notListed));
    fireEvent.change(screen.getByLabelText(p.imageLabel, { selector: 'input' }), { target: { files: [new File(['x'], 'catalog.pdf', { type: 'application/pdf' })] } });
    expect(screen.getByRole('alert')).toHaveTextContent(p.errors.invalid_image);
    expect(screen.queryByTestId('picture-name')).not.toBeInTheDocument();
    expect(screen.getByText(p.dropTitle)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(p.imageLabel, { selector: 'input' }), { target: { files: [new File(['x'], 'chart.png', { type: 'image/png' })] } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByTestId('picture-name')).toHaveTextContent('chart.png');
  });

  it('should say the picture cannot be used when it cannot be prepared, without calling the service', async () => {
    mockPrepare.mockResolvedValue(null);
    setup(locale);
    fireEvent.click(screen.getByRole('switch'));
    fireEvent.click(screen.getByText(p.notListed));
    fireEvent.change(screen.getByLabelText(new RegExp(p.imageLabel.slice(0, 15))), { target: { files: [new File(['x'], 'broken.png', { type: 'image/png' })] } });
    fireEvent.change(screen.getByLabelText(p.urlSizeLabel), { target: { value: '54' } });
    fireEvent.click(screen.getByRole('button', { name: p.imageButton }));
    expect(await screen.findByRole('alert')).toHaveTextContent(p.errors.invalid_image);
    expect(mockPrepare).toHaveBeenCalledTimes(1);
    expect(mockExtractImage).not.toHaveBeenCalled();
  });

  it.each(['invalid_input', 'invalid_image', 'not_configured', 'rate_limited', 'unavailable', 'unreadable'] as const)('should show the fixed text for the error %s and keep the fields', async (error) => {
    mockExtractImage.mockResolvedValue({ success: false, error });
    setup(locale);
    openLink();
    expect(await screen.findByRole('alert')).toHaveTextContent(p.errors[error]);
    expect(screen.getByTestId('picture-name')).toHaveTextContent('geometry.png');
  });

  it('should disable the buttons while the picture is read and go back to the list', async () => {
    let finish: (value: unknown) => void = () => undefined;
    mockExtractImage.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    setup(locale);
    openLink();
    expect(screen.getByRole('button', { name: p.urlWorking })).toBeDisabled();
    expect(screen.getByRole('button', { name: p.urlBack })).toBeDisabled();
    finish({ success: false, error: 'unavailable' });
    await waitFor(() => expect(screen.getByRole('button', { name: p.urlBack })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: p.urlBack }));
    expect(screen.getByLabelText(p.brandLabel)).toBeInTheDocument();
  });

  it('should show a bike that the AI read as the chosen bike, with what to do next, and not as an empty list', () => {
    setup(locale, ai);
    const card = screen.getByTestId('stock-ai-card');
    expect(within(card).getByText(p.aiCardTitle)).toBeInTheDocument();
    expect(card).toHaveTextContent(/Cube Attain GTC 2024/);
    expect(card).toHaveTextContent(p.aiCardNone);
    expect(screen.queryByLabelText(p.brandLabel)).not.toBeInTheDocument();
    expect(screen.queryByTestId('stock-summary')).not.toBeInTheDocument();
  });

  it('should open the picture form from the card without losing the bike, and go back to it', () => {
    const spies = setup(locale, ai);
    fireEvent.click(screen.getByRole('button', { name: p.readAnother }));
    expect(screen.getByTestId('stock-url-form')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: p.urlBack }));
    expect(screen.getByTestId('stock-ai-card')).toBeInTheDocument();
    expect(spies.onChange).not.toHaveBeenCalled();
  });

  it('should replace the bike with the one that the rider reads next', async () => {
    mockExtractImage.mockResolvedValue({ success: true, bike: { ...proposal, brand: 'Cannondale', model: 'Synapse' } });
    const spies = setup(locale, ai);
    fireEvent.click(screen.getByRole('button', { name: p.readAnother }));
    mockPrepare.mockResolvedValue({ imageBase64: 'A'.repeat(300), mimeType: 'image/jpeg' });
    fireEvent.change(pictureBox(), { target: { files: [new File(['x'], 'synapse.png', { type: 'image/png' })] } });
    fireEvent.change(screen.getByLabelText(p.urlSizeLabel), { target: { value: '56' } });
    fireEvent.click(screen.getByRole('button', { name: p.imageButton }));
    fireEvent.click(await screen.findByRole('button', { name: p.review.confirm }));
    expect(spies.onChange).toHaveBeenCalledWith(expect.objectContaining({ brand: 'Cannondale', model: 'Synapse' }));
    expect(screen.getByTestId('stock-ai-card')).toHaveTextContent(/Cannondale Synapse/);
  });

  it('should clear the bike and show the list when the rider prefers the list', () => {
    const spies = setup(locale, ai);
    fireEvent.click(screen.getByRole('button', { name: p.useList }));
    expect(spies.onChange).toHaveBeenLastCalledWith(null);
    expect(screen.getByLabelText(p.brandLabel)).toBeInTheDocument();
    expect(screen.queryByTestId('stock-ai-card')).not.toBeInTheDocument();
  });
});
