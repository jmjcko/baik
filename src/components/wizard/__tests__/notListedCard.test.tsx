import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { STOCK_BIKE_SPECS } from '@/lib/bikes';
import { StockBikePicker } from '../stock/StockBikePicker';

const EMOJI = /\p{Extended_Pictographic}/u;

describe.each(['en', 'cs'] as Locale[])('the card of a bike that is not in the list (%s)', (locale) => {
  const t = translations[locale];
  const p = t.stockBike.picker;
  const show = (onManual?: () => void) => {
    render(<StockBikePicker t={t} stockBike={null} setStockBike={vi.fn()} setCurrentBarWidthMm={vi.fn()} setCrankLengthMm={vi.fn()} onManual={onManual} />);
    const toggle = screen.getByRole('switch');
    if (toggle.getAttribute('aria-checked') !== 'true') fireEvent.click(toggle);
  };

  it('should be a visible card with a title, a sentence and two buttons, not a small link', () => {
    show(vi.fn());
    const card = screen.getByTestId('not-listed');
    expect(card).toHaveTextContent(p.notListedTitle);
    expect(card).toHaveTextContent(p.notListedBody);
    expect(screen.getByTestId('not-listed-read')).toHaveTextContent(p.readFromImage);
    expect(screen.getByTestId('not-listed-manual')).toHaveTextContent(p.enterByHand);
    expect(card.className).toContain('border-dashed');
    expect(card.textContent).not.toMatch(EMOJI);
  });

  it('should open the reading of the picture of the table', () => {
    show(vi.fn());
    fireEvent.click(screen.getByTestId('not-listed-read'));
    expect(screen.getByText(p.urlTitle)).toBeInTheDocument();
    expect(screen.queryByTestId('not-listed')).not.toBeInTheDocument();
  });

  it('should switch to the numbers typed by hand', () => {
    const onManual = vi.fn();
    show(onManual);
    fireEvent.click(screen.getByTestId('not-listed-manual'));
    expect(onManual).toHaveBeenCalledTimes(1);
  });

  it('should leave the manual button out when the page cannot switch', () => {
    show();
    expect(screen.queryByTestId('not-listed-manual')).not.toBeInTheDocument();
    expect(screen.getByTestId('not-listed-read')).toBeInTheDocument();
  });

  it('should be stressed only once a brand is chosen', () => {
    show(vi.fn());
    expect(screen.getByTestId('not-listed')).toHaveAttribute('data-stressed', 'false');
    fireEvent.change(screen.getByLabelText(p.brandLabel), { target: { value: STOCK_BIKE_SPECS[0].brand } });
    expect(screen.getByTestId('not-listed')).toHaveAttribute('data-stressed', 'true');
  });
});
