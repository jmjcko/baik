import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { painsFor, type RiderPainType, type RidingDiscipline, type RidingStyle } from '@/types/baikfit';
import { cx } from '@/lib/classNames';
import { RidingStylePicker } from '@/components/baikfit/RidingStylePicker';
import type { HamstringLevel, ReleaseResult } from '@/lib/engines/baikfit/mobility';
import { MiniTests } from './MiniTests';
import { StepHeading } from './WizardChrome';

interface PostureStepProps {
  t: Translations;
  ridingStyle: RidingStyle;
  setRidingStyle: (value: RidingStyle) => void;
  currentPains: RiderPainType[];
  togglePain: (pain: RiderPainType) => void;
  /** Decides whether arm pump is offered (MTB only). */
  discipline?: RidingDiscipline;
  /** The two mobility mini-tests; shown only where the app provides their state. */
  hamstringTest?: HamstringLevel | null;
  setHamstringTest?: (answer: HamstringLevel | null) => void;
  releaseTest?: ReleaseResult | null;
  setReleaseTest?: (answer: ReleaseResult | null) => void;
}

const PainToggle: React.FC<{ label: string; selected: boolean; onToggle: () => void }> = ({ label, selected, onToggle }) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={selected}
    onClick={onToggle}
    className={cx(
      'w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all',
      selected
        ? 'border-tone-warning-line bg-tone-warning-bg text-tone-warning-ink shadow-sm'
        : 'border-line bg-sunken text-ink-2 hover:border-line'
    )}
  >
    <span className="text-sm font-medium">{label}</span>
    <span
      aria-hidden="true"
      className={cx(
        'w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors',
        selected ? 'border-amber-500 bg-amber-500 text-slate-50' : 'border-line bg-surface text-transparent'
      )}
    >
      ✓
    </span>
  </button>
);

const PainChecklist: React.FC<Pick<PostureStepProps, 't' | 'currentPains' | 'togglePain' | 'discipline'>> = ({ t, currentPains, togglePain, discipline }) => (
  <div className="space-y-2.5">
    <label className="text-xs font-semibold text-ink-2 block">{t.studio.currentPainsLabel}</label>
    <div className="space-y-2">
      {painsFor(discipline).map((pain) => (
        <PainToggle key={pain} label={t.studio.pains[pain]} selected={currentPains.includes(pain)} onToggle={() => togglePain(pain)} />
      ))}
    </div>
  </div>
);

/** Wizard step 3: riding posture with rider silhouettes and the symptom checklist. */
export const PostureStep: React.FC<PostureStepProps> = (props) => (
  <div className="space-y-6" data-testid="posture-step">
    <StepHeading title={props.t.wizard.postureTitle} subtitle={props.t.wizard.postureSubtitle} />
    <RidingStylePicker t={props.t} value={props.ridingStyle} onChange={props.setRidingStyle} />
    <PainChecklist t={props.t} currentPains={props.currentPains} togglePain={props.togglePain} discipline={props.discipline} />
    {props.setHamstringTest && props.setReleaseTest && (
      <MiniTests t={props.t} hamstringTest={props.hamstringTest ?? null} setHamstringTest={props.setHamstringTest} releaseTest={props.releaseTest ?? null} setReleaseTest={props.setReleaseTest} />
    )}
  </div>
);
