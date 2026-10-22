import React, { useState } from 'react';
import { RIDER_PAIN_TYPES, type RiderPainType, type RidingDiscipline } from '@/types/baikfit';
import { cx } from '@/lib/classNames';
import { MeasurementGuideModal } from '@/components/baikfit/MeasurementGuideModal';
import type { GuideType } from '@/components/baikfit/guides';
import { CurrentSetupFields, type CurrentSetupProps } from './CurrentSetupFields';

const DISCIPLINES: RidingDiscipline[] = ['road', 'gravel', 'xc_mtb'];

const PILL_IDLE = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200';

interface PainStepProps extends Omit<CurrentSetupProps, 'onOpenGuide'> {
  currentPains: RiderPainType[];
  togglePain: (pain: RiderPainType) => void;
  discipline: RidingDiscipline;
  setDiscipline: (value: RidingDiscipline) => void;
}

const PainToggle: React.FC<{ label: string; selected: boolean; onToggle: () => void }> = ({ label, selected, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className={cx(
      'w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all',
      selected
        ? 'border-amber-400 bg-amber-50 text-amber-900 shadow-sm'
        : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
    )}
  >
    <span className="text-sm font-medium">{label}</span>
    <span className="text-xs px-2.5 py-1 rounded-full font-mono border border-slate-200 bg-white text-slate-700 font-bold">
      {selected ? '✓' : '—'}
    </span>
  </button>
);

const PainChecklist: React.FC<Pick<PainStepProps, 't' | 'currentPains' | 'togglePain'>> = ({ t, currentPains, togglePain }) => (
  <div className="space-y-2.5">
    <label className="text-xs font-semibold text-slate-700 block">{t.studio.currentPainsLabel}</label>
    <div className="space-y-2">
      {RIDER_PAIN_TYPES.map((pain) => (
        <PainToggle key={pain} label={t.studio.pains[pain]} selected={currentPains.includes(pain)} onToggle={() => togglePain(pain)} />
      ))}
    </div>
  </div>
);

const DisciplineSelector: React.FC<Pick<PainStepProps, 't' | 'discipline' | 'setDiscipline'>> = ({ t, discipline, setDiscipline }) => (
  <div className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-3">
    <label className="text-xs font-semibold text-slate-700 block">{t.studio.disciplineLabel}</label>
    <div className="grid grid-cols-3 gap-2.5">
      {DISCIPLINES.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setDiscipline(option)}
          className={cx(
            'py-2.5 px-3 rounded-full text-xs font-medium border transition-all text-center',
            discipline === option ? 'bg-teal-600 text-white border-teal-600 font-semibold shadow-sm' : PILL_IDLE
          )}
        >
          {t.studio.disciplines[option]}
        </button>
      ))}
    </div>
  </div>
);

/** Wizard step 2: pain checklist, the rider's current bike setup and riding discipline. */
export const PainStep: React.FC<PainStepProps> = (props) => {
  const [activeGuide, setActiveGuide] = useState<GuideType | null>(null);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1.5 tracking-tight">{props.t.wizard.step2Title}</h2>
        <p className="text-slate-500 text-sm leading-relaxed">{props.t.wizard.step2Subtitle}</p>
      </div>
      <PainChecklist t={props.t} currentPains={props.currentPains} togglePain={props.togglePain} />
      <CurrentSetupFields {...props} onOpenGuide={setActiveGuide} />
      <DisciplineSelector t={props.t} discipline={props.discipline} setDiscipline={props.setDiscipline} />
      <MeasurementGuideModal isOpen={activeGuide !== null} onClose={() => setActiveGuide(null)} guideType={activeGuide} t={props.t} />
    </div>
  );
};
