import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { DEFAULT_MTB_SETUP, type MtbSetup } from '@/lib/engines/baikfit/mtb';
import { CurrentBikeStep } from '../CurrentBikeStep';
import { PostureStep } from '../PostureStep';

function Harness({ locale, discipline }: { locale: Locale; discipline: 'road' | 'xc_mtb' }) {
  const [mtb, setMtbState] = useState<MtbSetup>(DEFAULT_MTB_SETUP);
  const [bar, setBar] = useState<number | null>(null);
  return (
    <CurrentBikeStep
      t={translations[locale]} inseamMm={840} crankLengthMm={170} currentSaddleHeightMm={null} currentBarWidthMm={bar} setCrankLengthMm={vi.fn()} setCurrentSaddleHeightMm={vi.fn()} setCurrentBarWidthMm={setBar}
      stockBike={null} setStockBike={vi.fn()} discipline={discipline} mtb={mtb} setMtb={(patch) => setMtbState((prev) => ({ ...prev, ...patch }))}
    />
  );
}

describe.each(['en', 'cs'] as Locale[])('MTB setup in the wizard (%s)', (locale) => {
  const w = translations[locale].wizard;

  it('should show the MTB setup and a flat bar slider for the MTB discipline only', () => {
    const mtb = render(<Harness locale={locale} discipline="xc_mtb" />);
    expect(screen.getByTestId('mtb-setup')).toBeInTheDocument();
    const slider = screen.getByLabelText(w.currentBarLabel) as HTMLInputElement;
    expect(slider.min).toBe('680');
    expect(slider.max).toBe('840');
    expect(screen.queryByTestId('bar-guide-trigger')).not.toBeInTheDocument();
    mtb.unmount();
    render(<Harness locale={locale} discipline="road" />);
    expect(screen.queryByTestId('mtb-setup')).not.toBeInTheDocument();
    expect((screen.getByLabelText(w.currentBarLabel) as HTMLInputElement).max).toBe('460');
  });

  it('should change the kind, the suspension and the numbers, and clear a number again', () => {
    render(<Harness locale={locale} discipline="xc_mtb" />);
    expect(screen.getByRole('button', { name: w.mtb.styles.xc })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: w.mtb.styles.trail }));
    expect(screen.getByRole('button', { name: w.mtb.styles.trail })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: w.mtb.full }));
    expect(screen.getByRole('button', { name: w.mtb.full })).toHaveAttribute('aria-pressed', 'true');
    const travel = screen.getByLabelText(w.mtb.travelLabel);
    expect(screen.getByTestId('mtb-setup')).toHaveTextContent(w.notSetChip);
    fireEvent.change(travel, { target: { value: '140' } });
    expect(screen.getByTestId('mtb-setup')).toHaveTextContent('140 mm');
    fireEvent.click(screen.getByRole('button', { name: w.clearValue }));
    expect(screen.getByTestId('mtb-setup')).not.toHaveTextContent('140 mm');
  });
});

describe.each(['en', 'cs'] as Locale[])('the symptom list of the posture step (%s)', (locale) => {
  const t = translations[locale];
  const posture = (discipline: 'road' | 'xc_mtb') => render(
    <PostureStep t={t} ridingStyle="balanced" setRidingStyle={vi.fn()} currentPains={[]} togglePain={vi.fn()} discipline={discipline} />
  );

  it('should offer arm pump on a mountain bike only', () => {
    const mtb = posture('xc_mtb');
    expect(screen.getByText(t.studio.pains.arm_pump)).toBeInTheDocument();
    mtb.unmount();
    posture('road');
    expect(screen.queryByText(t.studio.pains.arm_pump)).not.toBeInTheDocument();
  });
});
