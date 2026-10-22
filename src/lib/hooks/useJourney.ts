'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AppMode } from '@/components/navigation/ModeRouter';

/** Steps of the "Tune My Current Bike" journey: four wizard steps, then the report and the CAD studio. */
export const JOURNEY_STEPS = ['discipline', 'body', 'posture', 'bike', 'report', 'studio'] as const;

export type JourneyStep = (typeof JOURNEY_STEPS)[number];

export type WizardStepNumber = 1 | 2 | 3 | 4;

export const JOURNEY_UNLOCKED_KEY = 'baiktime_journey_unlocked';

export interface Journey {
  /** Current step of the journey, or null outside of it (entry and pre-purchase views). */
  current: JourneyStep | null;
  wizardStep: WizardStepNumber;
  setWizardStep: (step: WizardStepNumber) => void;
  /** Report and CAD studio unlock after the wizard was completed once. */
  unlocked: boolean;
  goTo: (step: JourneyStep) => void;
  /** Mode switch for the whole app: starting the wizard always begins at its first step. */
  selectMode: (mode: AppMode) => void;
}

function readUnlocked(): boolean {
  try {
    return window.localStorage.getItem(JOURNEY_UNLOCKED_KEY) === '1';
  } catch {
    return false;
  }
}

function writeUnlocked(): void {
  try {
    window.localStorage.setItem(JOURNEY_UNLOCKED_KEY, '1');
  } catch {
    /* storage unavailable: the unlock then lasts for this session only */
  }
}

function currentStep(mode: AppMode, wizardStep: WizardStepNumber): JourneyStep | null {
  if (mode === 'wizard') return JOURNEY_STEPS[wizardStep - 1];
  return mode === 'report' || mode === 'studio' ? mode : null;
}

/** Shared state of the fit journey: wizard step, unlock after the first completion, one navigation function. */
export function useJourney(mode: AppMode, setMode: (mode: AppMode) => void): Journey {
  const [wizardStep, setWizardStep] = useState<WizardStepNumber>(1);
  const [unlocked, setUnlocked] = useState(false);

  /* Storage does not exist during SSR, so the stored unlock is read and set from effects on purpose. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (readUnlocked()) setUnlocked(true);
  }, []);

  useEffect(() => {
    if ((mode === 'report' || mode === 'studio') && !unlocked) {
      setUnlocked(true);
      writeUnlocked();
    }
  }, [mode, unlocked]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const goTo = useCallback(
    (step: JourneyStep) => {
      const index = JOURNEY_STEPS.indexOf(step);
      if (index < 4) {
        setWizardStep((index + 1) as WizardStepNumber);
        setMode('wizard');
      } else if (unlocked) {
        setMode(step === 'report' ? 'report' : 'studio');
      }
    },
    [setMode, unlocked]
  );

  const selectMode = (next: AppMode) => (next === 'wizard' ? goTo('discipline') : setMode(next));

  return { current: currentStep(mode, wizardStep), wizardStep, setWizardStep, unlocked, goTo, selectMode };
}
