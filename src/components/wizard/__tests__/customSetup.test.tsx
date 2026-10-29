import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { DEFAULT_CUSTOM_SETUP, type CustomSetup, type SetupMode } from '@/lib/engines/baikfit/customSetup';
import { CurrentBikeStep } from '../CurrentBikeStep';

function Harness({ locale, onMode }: { locale: Locale; onMode?: (mode: SetupMode) => void }) {
  const [mode, setMode] = useState<SetupMode>('stock');
  const [custom, setCustomState] = useState<CustomSetup>(DEFAULT_CUSTOM_SETUP);
  const [saddle, setSaddle] = useState<number | null>(null);
  const [crank, setCrank] = useState(170);
  return (
    <CurrentBikeStep
      t={translations[locale]} inseamMm={840} crankLengthMm={crank} currentSaddleHeightMm={saddle} currentBarWidthMm={null}
      setCrankLengthMm={setCrank} setCurrentSaddleHeightMm={setSaddle} setCurrentBarWidthMm={vi.fn()}
      stockBike={null} setStockBike={vi.fn()} discipline="road"
      setupMode={mode} setSetupMode={(next) => { onMode?.(next); setMode(next); }} custom={custom} setCustom={(patch) => setCustomState((prev) => ({ ...prev, ...patch }))}
    />
  );
}

describe.each(['en', 'cs'] as Locale[])('step 4 for a modified bike (%s)', (locale) => {
  const c = translations[locale].customSetup;

  it('should start with the series bike and switch to the measured setup, which hides the catalog picker', () => {
    const onMode = vi.fn();
    render(<Harness locale={locale} onMode={onMode} />);
    expect(screen.getByTestId('setup-mode-stock')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByTestId('custom-setup')).not.toBeInTheDocument();
    expect(screen.getByTestId('stock-picker')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('setup-mode-custom'));
    expect(onMode).toHaveBeenCalledWith('custom');
    const form = screen.getByTestId('custom-setup');
    for (const field of Object.values(c.fields)) expect(within(form).getByLabelText(field.label)).toBeInTheDocument();
    expect(screen.queryByTestId('stock-picker')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('setup-mode-stock'));
    expect(screen.queryByTestId('custom-setup')).not.toBeInTheDocument();
  });

  it('should take a typed measurement, refuse one outside its limits with a message, and clear it', () => {
    render(<Harness locale={locale} />);
    fireEvent.click(screen.getByTestId('setup-mode-custom'));
    const input = screen.getByLabelText(c.fields.saddleSetback.label) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '180' } });
    expect(input.value).toBe('180');
    expect(input).toHaveAttribute('aria-invalid', 'false');
    fireEvent.change(input, { target: { value: '900' } });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getAllByRole('alert')[0]).toHaveTextContent(c.outOfRange.replace('{min}', '0').replace('{max}', '300'));
    fireEvent.change(input, { target: { value: '' } });
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('should accept a negative drop and a decimal crank length, and select a crank preset', () => {
    render(<Harness locale={locale} />);
    fireEvent.click(screen.getByTestId('setup-mode-custom'));
    const drop = screen.getByLabelText(c.fields.drop.label);
    fireEvent.change(drop, { target: { value: '-15' } });
    expect(drop).toHaveAttribute('aria-invalid', 'false');
    const crank = screen.getByLabelText(c.fields.crank.label) as HTMLInputElement;
    fireEvent.change(crank, { target: { value: '172,5' } });
    expect(crank).toHaveAttribute('aria-invalid', 'false');
    fireEvent.click(screen.getByRole('button', { name: '175 mm' }));
    expect(crank.value).toBe('175');
  });

  it('should open the home measuring guide of every field with a drawing, three numbered steps and the impact', () => {
    render(<Harness locale={locale} />);
    fireEvent.click(screen.getByTestId('setup-mode-custom'));
    for (const [id, field] of Object.entries(c.fields)) {
      expect(screen.queryByTestId(`micro-guide-${id}`)).not.toBeInTheDocument();
      fireEvent.click(screen.getAllByTestId(`micro-guide-trigger-${id}`)[0]);
      const guide = screen.getByTestId(`micro-guide-${id}`);
      expect(within(guide).getByTestId(`measure-diagram-${id}`)).toHaveAttribute('aria-label', field.label);
      for (const step of field.steps) expect(within(guide).getByText(step)).toBeInTheDocument();
      expect(guide).toHaveTextContent(field.impact);
    }
  });
});
