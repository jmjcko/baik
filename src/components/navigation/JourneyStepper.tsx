'use client';

import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';
import { JOURNEY_STEPS, type Journey, type JourneyStep } from '@/lib/hooks/useJourney';

const isLocked = (step: JourneyStep, unlocked: boolean) => !unlocked && (step === 'report' || step === 'studio');

const Marker: React.FC<{ index: number; done: boolean; active: boolean }> = ({ index, done, active }) => (
  <span
    aria-hidden="true"
    className={cx(
      'w-6 h-6 shrink-0 rounded-full border text-[11px] font-mono font-bold flex items-center justify-center',
      active ? 'border-blue-400 bg-blue-600 text-white' : done ? 'border-emerald-500/70 text-emerald-300' : 'border-slate-600 text-slate-400'
    )}
  >
    {done ? '✓' : index + 1}
  </span>
);

interface StepButtonProps {
  t: Translations;
  step: JourneyStep;
  index: number;
  currentIndex: number;
  locked: boolean;
  onSelect: (step: JourneyStep) => void;
}

const StepButton: React.FC<StepButtonProps> = ({ t, step, index, currentIndex, locked, onSelect }) => {
  const active = index === currentIndex;
  return (
    <button
      type="button"
      disabled={locked}
      aria-current={active ? 'step' : undefined}
      title={locked ? t.navigation.journeyLocked : undefined}
      onClick={() => onSelect(step)}
      className={cx(
        'w-full flex items-center gap-3 px-2.5 py-1.5 rounded-xl text-left text-xs transition-colors',
        active ? 'bg-slate-800 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800/60',
        locked && 'opacity-40 cursor-not-allowed hover:bg-transparent'
      )}
    >
      <Marker index={index} done={index < currentIndex} active={active} />
      <span>{t.navigation.journeySteps[step]}</span>
    </button>
  );
};

/** Vertical navigation of the whole fit journey; every available step is one click away from every screen. */
export const JourneyStepper: React.FC<{ t: Translations; journey?: Journey }> = ({ t, journey }) => {
  if (!journey?.current) return null;
  const currentIndex = JOURNEY_STEPS.indexOf(journey.current);
  return (
    <nav aria-label={t.navigation.journeyTitle} className="flex flex-col gap-2">
      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold px-1">{t.navigation.journeyTitle}</span>
      <ol className="flex flex-col gap-1">
        {JOURNEY_STEPS.map((step, index) => (
          <li key={step}>
            <StepButton t={t} step={step} index={index} currentIndex={currentIndex} locked={isLocked(step, journey.unlocked)} onSelect={journey.goTo} />
          </li>
        ))}
      </ol>
    </nav>
  );
};
