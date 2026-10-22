'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AppMode } from '@/components/navigation/ModeRouter';

/** Steps of the "Tune My Current Bike" journey: four wizard steps, then the report. The CAD studio is a simulator opened from the report. */
export const JOURNEY_STEPS = ['discipline', 'body', 'posture', 'bike', 'report'] as const;

export type JourneyStep = (typeof JOURNEY_STEPS)[number];

export type WizardStepNumber = 1 | 2 | 3 | 4;

export const JOURNEY_UNLOCKED_KEY = 'baiktime_journey_unlocked';

export interface Journey {
  /** Current step of the journey, or null outside of it (entry and pre-purchase views) and in the studio simulator. */
  current: JourneyStep | null;
  /** True on the journey screens: the wizard, the report and the studio simulator (the stepper stays visible in all of them). */
  active: boolean;
  wizardStep: WizardStepNumber;
  setWizardStep: (step: WizardStepNumber) => void;
  /** The report (and the studio simulator behind it) unlocks after the wizard was completed once. */
  unlocked: boolean;
  goTo: (step: JourneyStep) => void;
  /** Mode switch for the whole app: starting the wizard always begins at its first step. */
  selectMode: (mode: AppMode) => void;
  /** True while the wizard was opened from "My profile": leaving it returns there instead of going to the report or the entry. */
  fromProfile: boolean;
  openFromProfile: (step: JourneyStep) => void;
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
  return mode === 'report' ? mode : null;
}

/** The report (and the studio simulator behind it) unlocks once the wizard was completed; the unlock is remembered in this browser. */
function useUnlocked(mode: AppMode): boolean {
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
  return unlocked;
}

/** Shared state of the fit journey: wizard step, unlock after the first completion, one navigation function. */
export function useJourney(mode: AppMode, setMode: (mode: AppMode) => void): Journey {
  const [wizardStep, setWizardStep] = useState<WizardStepNumber>(1);
  const [fromProfile, setFromProfile] = useState(false);
  const unlocked = useUnlocked(mode);

  const goTo = useCallback(
    (step: JourneyStep) => {
      setFromProfile(false);
      const index = JOURNEY_STEPS.indexOf(step);
      if (index < 4) {
        setWizardStep((index + 1) as WizardStepNumber);
        setMode('wizard');
      } else if (unlocked) {
        setMode('report');
      }
    },
    [setMode, unlocked]
  );

  const selectMode = (next: AppMode) => {
    if (next === 'wizard') return goTo('discipline');
    setFromProfile(false);
    setMode(next);
  };

  const openFromProfile = (step: JourneyStep) => {
    goTo(step);
    setFromProfile(true);
  };

  const active = mode === 'wizard' || mode === 'report' || mode === 'studio';
  return { current: currentStep(mode, wizardStep), active, wizardStep, setWizardStep, unlocked, goTo, selectMode, fromProfile, openFromProfile };
}
