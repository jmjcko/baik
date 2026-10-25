import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import type { WizardStepNumber } from '@/lib/hooks/useJourney';
import { MeasurementWizard } from '../MeasurementWizard';

const LOCALES: Locale[] = ['en', 'cs'];

type WizardProps = React.ComponentProps<typeof MeasurementWizard>;

/** Holds the wizard step the way the app does (shared state), so the buttons can walk the steps. */
const Harness: React.FC<Omit<WizardProps, 'step' | 'onStepChange'>> = (props) => {
  const [step, setStep] = useState<WizardStepNumber>(1);
  return <MeasurementWizard {...props} step={step} onStepChange={setStep} />;
};

function renderWizard(locale: Locale, overrides = {}) {
  const props = {
    t: translations[locale],
    inseamMm: 840, setInseamMm: vi.fn(), acromionWidthMm: 420, setAcromionWidthMm: vi.fn(),
    crankLengthMm: 170, setCrankLengthMm: vi.fn(), currentSaddleHeightMm: null, setCurrentSaddleHeightMm: vi.fn(), currentBarWidthMm: null, setCurrentBarWidthMm: vi.fn(), heightCm: 178, setHeightCm: vi.fn(),
    armLengthMm: 620, setArmLengthMm: vi.fn(), discipline: 'gravel' as const, setDiscipline: vi.fn(),
    ridingStyle: 'balanced' as const, setRidingStyle: vi.fn(), currentPains: ['numb_hands' as const],
    togglePain: vi.fn(), stockBike: null, setStockBike: vi.fn(), onCompleteWizard: vi.fn(), onCancel: vi.fn(), ...overrides,
  };
  return { props, ...render(<Harness {...props} />) };
}

describe.each(LOCALES)('MeasurementWizard (%s)', (locale) => {
  const t = translations[locale];

  it('should start with the discipline step and show three selectable disciplines', () => {
    const { props, asFragment } = renderWizard(locale);
    expect(screen.getByText(t.wizard.step1Progress)).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
    for (const label of Object.values(t.studio.disciplines)) expect(screen.getByText(label)).toBeInTheDocument();
    for (const id of ['road', 'gravel', 'xc_mtb']) {
      expect(screen.getByTestId(`discipline-diagram-${id}`)).toHaveAttribute('aria-hidden', 'true');
    }
    expect(screen.getByText(t.studio.disciplines.gravel)).toHaveClass('text-lg', 'font-bold');
    fireEvent.click(screen.getByText(t.studio.disciplines.xc_mtb));
    expect(props.setDiscipline).toHaveBeenCalledWith('xc_mtb');
  });

  it('should render step 2 (body measurements without the riding style picker)', () => {
    const { asFragment } = renderWizard(locale);
    fireEvent.click(screen.getByText(t.wizard.continueToBody));
    expect(screen.getByText(t.wizard.step2Progress)).toBeInTheDocument();
    expect(screen.getByTestId('inseam-guide-trigger')).toBeInTheDocument();
    expect(screen.queryByTestId('posture-silhouette-race')).not.toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render step 3 with silhouettes and the symptom checklist', () => {
    const { props, asFragment } = renderWizard(locale);
    fireEvent.click(screen.getByText(t.wizard.continueToBody));
    fireEvent.click(screen.getByText(t.wizard.continueToPosture));
    expect(screen.getByText(t.wizard.step3Progress)).toBeInTheDocument();
    for (const style of ['endurance', 'balanced', 'race']) expect(screen.getByTestId(`posture-silhouette-${style}`)).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
    fireEvent.click(screen.getByText(t.wizard.ridingStyleRaceTitle));
    fireEvent.click(screen.getByText(t.studio.pains.front_knee));
    expect(screen.getByRole('checkbox', { name: new RegExp(t.studio.pains.numb_hands.slice(0, 10)) })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: new RegExp(t.studio.pains.front_knee.slice(0, 10)) })).not.toBeChecked();
    expect(props.setRidingStyle).toHaveBeenCalledWith('race');
    expect(props.togglePain).toHaveBeenCalledWith('front_knee');
  });

  it('should render step 4 (current bike) and report interactions', () => {
    const { props, asFragment } = renderWizard(locale);
    fireEvent.click(screen.getByText(t.wizard.continueToBody));
    fireEvent.click(screen.getByText(t.wizard.continueToPosture));
    fireEvent.click(screen.getByText(t.wizard.continueToBike));
    expect(screen.getByText(t.wizard.step4Progress)).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
    fireEvent.click(screen.getByText('165mm'));
    expect(props.setCrankLengthMm).toHaveBeenCalledWith(165);
  });

  it('should walk back and forward through four steps and complete the wizard', () => {
    const { props } = renderWizard(locale);
    fireEvent.click(screen.getByText(t.wizard.backButton));
    expect(props.onCancel).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText(t.wizard.continueToBody));
    fireEvent.click(screen.getByText(t.wizard.backButton));
    expect(screen.getByText(t.wizard.continueToBody)).toBeInTheDocument();
    fireEvent.click(screen.getByText(t.wizard.continueToBody));
    fireEvent.click(screen.getByText(t.wizard.continueToPosture));
    fireEvent.click(screen.getByText(t.wizard.continueToBike));
    expect(props.onCompleteWizard).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText(t.wizard.toReportButton));
    expect(props.onCompleteWizard).toHaveBeenCalledTimes(1);
  });
});
