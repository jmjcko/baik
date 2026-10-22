import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { MeasurementWizard } from '../MeasurementWizard';

const LOCALES: Locale[] = ['en', 'cs'];

function renderWizard(locale: Locale, overrides = {}) {
  const props = {
    t: translations[locale],
    inseamMm: 840, setInseamMm: vi.fn(), acromionWidthMm: 420, setAcromionWidthMm: vi.fn(),
    crankLengthMm: 170, setCrankLengthMm: vi.fn(), currentSaddleHeightMm: null, setCurrentSaddleHeightMm: vi.fn(), currentBarWidthMm: null, setCurrentBarWidthMm: vi.fn(), heightCm: 178, setHeightCm: vi.fn(),
    armLengthMm: 620, setArmLengthMm: vi.fn(), discipline: 'gravel' as const, setDiscipline: vi.fn(),
    ridingStyle: 'balanced' as const, setRidingStyle: vi.fn(), currentPains: ['numb_hands' as const],
    togglePain: vi.fn(), onCompleteWizard: vi.fn(), onCancel: vi.fn(), ...overrides,
  };
  return { props, ...render(<MeasurementWizard {...props} />) };
}

describe.each(LOCALES)('MeasurementWizard (%s)', (locale) => {
  const t = translations[locale];

  it('should render step 1 (morphology)', () => {
    expect(renderWizard(locale).asFragment()).toMatchSnapshot();
  });

  it('should render step 2 (pains, crank, discipline) and report interactions', () => {
    const { props, asFragment } = renderWizard(locale);
    fireEvent.click(screen.getByText(t.wizard.toPainButton));
    expect(asFragment()).toMatchSnapshot();
    fireEvent.click(screen.getByText(t.studio.pains.front_knee));
    fireEvent.click(screen.getByText('165mm'));
    fireEvent.click(screen.getByText(t.studio.disciplines.road));
    expect(props.togglePain).toHaveBeenCalledWith('front_knee');
    expect(props.setCrankLengthMm).toHaveBeenCalledWith(165);
    expect(props.setDiscipline).toHaveBeenCalledWith('road');
  });

  it('should navigate back and forward and complete the wizard', () => {
    const { props } = renderWizard(locale);
    fireEvent.click(screen.getByText(t.wizard.backButton));
    expect(props.onCancel).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText(t.wizard.toPainButton));
    fireEvent.click(screen.getByText(t.wizard.backButton));
    expect(screen.getByText(t.wizard.toPainButton)).toBeInTheDocument();
    fireEvent.click(screen.getByText(t.wizard.toPainButton));
    fireEvent.click(screen.getByText(t.wizard.toReportButton));
    expect(props.onCompleteWizard).toHaveBeenCalledTimes(1);
  });
});
