import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { RIDER_PAIN_TYPES, type RiderPainType, type RidingStyle } from '@/types/baikfit';
import { cx } from '@/lib/classNames';
import { RidingStylePicker } from '@/components/baikfit/RidingStylePicker';
import { StepHeading } from './WizardChrome';

interface PostureStepProps {
  t: Translations;
  ridingStyle: RidingStyle;
  setRidingStyle: (value: RidingStyle) => void;
  currentPains: RiderPainType[];
  togglePain: (pain: RiderPainType) => void;
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
        ? 'border-amber-400 bg-amber-50 text-amber-900 shadow-sm'
        : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
    )}
  >
    <span className="text-sm font-medium">{label}</span>
    <span
      aria-hidden="true"
      className={cx(
        'w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors',
        selected ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-300 bg-white text-transparent'
      )}
    >
      ✓
    </span>
  </button>
);

const PainChecklist: React.FC<Pick<PostureStepProps, 't' | 'currentPains' | 'togglePain'>> = ({ t, currentPains, togglePain }) => (
  <div className="space-y-2.5">
    <label className="text-xs font-semibold text-slate-700 block">{t.studio.currentPainsLabel}</label>
    <div className="space-y-2">
      {RIDER_PAIN_TYPES.map((pain) => (
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
    <PainChecklist t={props.t} currentPains={props.currentPains} togglePain={props.togglePain} />
  </div>
);
