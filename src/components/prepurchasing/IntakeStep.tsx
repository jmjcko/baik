import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { RIDING_DISCIPLINES, type FlexibilityScore, type RidingStyle } from '@/types/baikfit';
import { MTB_STYLES } from '@/lib/engines/baikfit/mtbRules';
import { cx } from '@/lib/classNames';
import type { GuideType } from '@/components/baikfit/guides';
import { ChoiceCard } from '@/components/baikfit/fields/ChoiceCard';
import { SliderField, type SliderFieldProps } from '@/components/baikfit/fields/SliderField';
import { CompactGuideTrigger } from './CompactGuideTrigger';
import type { IntakeValues } from './auditState';

interface IntakeStepProps {
  t: Translations;
  values: IntakeValues;
  update: (patch: Partial<IntakeValues>) => void;
  changeHeight: (heightCm: number) => void;
  onOpenGuide: (guide: GuideType) => void;
  onNext: () => void;
}

type AuditGuide = Extract<GuideType, 'inseam' | 'torso' | 'arm' | 'acromion'>;
type Slider = Omit<SliderFieldProps, 'children'> & { guide?: AuditGuide; hint?: string };

function sliderSpecs(t: Translations, v: IntakeValues, p: Pick<IntakeStepProps, 'update' | 'changeHeight'>): Slider[] {
  const a = t.prePurchaseAudit;
  return [
    { id: 'intake-inseam', label: a.inseamLabel, valueText: `${v.inseamMm} mm`, value: v.inseamMm, min: 650, max: 1020, step: 5, onChange: (inseamMm) => p.update({ inseamMm }), guide: 'inseam' },
    { id: 'intake-height', label: a.heightLabel, valueText: `${v.heightCm} cm`, value: v.heightCm, min: 145, max: 215, step: 1, onChange: p.changeHeight },
    { id: 'intake-torso', label: a.torsoLabel, valueText: `${v.torsoLengthMm} mm`, value: v.torsoLengthMm, min: 450, max: 800, step: 5, onChange: (torsoLengthMm) => p.update({ torsoLengthMm }), guide: 'torso' },
    { id: 'intake-arm', label: a.armLabel, valueText: `${v.armLengthMm} mm`, value: v.armLengthMm, min: 500, max: 850, step: 5, onChange: (armLengthMm) => p.update({ armLengthMm }), guide: 'arm' },
    { id: 'intake-acromion', label: a.acromionLabel, valueText: `${v.acromionWidthMm} mm`, value: v.acromionWidthMm, min: 340, max: 480, step: 5, accent: 'teal', className: 'md:col-span-2', onChange: (acromionWidthMm) => p.update({ acromionWidthMm }), guide: 'acromion', hint: a.acromionHint },
  ];
}

const GUIDE_TEST_IDS: Record<AuditGuide, string> = {
  inseam: 'prepurchasing-inseam-modal-trigger',
  torso: 'prepurchasing-torso-modal-trigger',
  arm: 'prepurchasing-arm-modal-trigger',
  acromion: 'prepurchasing-acromion-modal-trigger',
};

const SliderWithGuide: React.FC<{ spec: Slider; t: Translations; onOpenGuide: (g: GuideType) => void }> = ({ spec, t, onOpenGuide }) => {
  const { guide, hint, ...field } = spec;
  return (
    <SliderField {...field}>
      {hint && <p className="text-[11px] text-ink-3">{hint}</p>}
      {guide && (
        <CompactGuideTrigger
          testId={GUIDE_TEST_IDS[guide]}
          label={t.wizard.openVisualGuideBtn}
          accent={field.accent}
          onClick={() => onOpenGuide(guide)}
        />
      )}
    </SliderField>
  );
};

const WeightField: React.FC<Pick<IntakeStepProps, 't' | 'values' | 'update'>> = ({ t, values, update }) => (
  <SliderField
    id="intake-weight"
    label={t.prePurchaseAudit.weightLabel}
    valueText={`${values.riderWeightKg} kg`}
    value={values.riderWeightKg}
    min={40}
    max={160}
    step={1}
    onChange={(riderWeightKg) => update({ riderWeightKg })}
  />
);

const CHOICE_LABEL = 'text-sm font-semibold text-ink block';

const FlexibilityPicker: React.FC<Pick<IntakeStepProps, 't' | 'values' | 'update'>> = ({ t, values, update }) => {
  const a = t.prePurchaseAudit;
  const options: Array<[FlexibilityScore, string, string]> = [
    ['inflexible', a.flexibilityLow, a.flexibilityLowDesc],
    ['moderate', a.flexibilityModerate, a.flexibilityModerateDesc],
    ['flexible', a.flexibilityHigh, a.flexibilityHighDesc],
  ];
  return (
    <div className="border-t border-line pt-5 space-y-3">
      <label className={CHOICE_LABEL}>{a.flexibilityLabel}</label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map(([value, title, description]) => (
          <ChoiceCard
            key={value}
            density="compact"
            descriptionClassName="text-ink-3"
            selected={values.flexibility === value}
            title={title}
            description={description}
            onSelect={() => update({ flexibility: value })}
          />
        ))}
      </div>
    </div>
  );
};

const GoalPicker: React.FC<Pick<IntakeStepProps, 't' | 'values' | 'update'>> = ({ t, values, update }) => {
  const a = t.prePurchaseAudit;
  const options: Array<[RidingStyle, string, string]> = [
    ['endurance', a.ridingGoalEndurance, t.wizard.ridingStyleEnduranceDesc],
    ['balanced', a.ridingGoalBalanced, t.wizard.ridingStyleBalancedDesc],
    ['race', a.ridingGoalRace, t.wizard.ridingStyleRaceDesc],
  ];
  return (
    <div className="border-t border-line pt-5 space-y-3">
      <label className={CHOICE_LABEL}>{a.ridingGoalLabel}</label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map(([value, title, description]) => (
          <ChoiceCard
            key={value}
            density="compact"
            selected={values.ridingGoal === value}
            title={title}
            description={description}
            onSelect={() => update({ ridingGoal: value })}
          />
        ))}
      </div>
    </div>
  );
};

const KIND_OPTIONS = RIDING_DISCIPLINES;

const Pill: React.FC<{ label: string; selected: boolean; onClick: () => void }> = ({ label, selected, onClick }) => (
  <button type="button" aria-pressed={selected} onClick={onClick} className={cx('h-10 px-5 rounded-full text-xs font-semibold border transition-colors', selected ? 'bg-blue-600 border-blue-600 text-slate-50' : 'border-line bg-surface text-ink-2 hover:bg-sunken')}>
    {label}
  </button>
);

/** The kind of bike under audit (road, gravel, mountain bike) and, for a mountain bike, XC or Trail: a flat bar follows other rules than drop bars. */
const KindPicker: React.FC<Pick<IntakeStepProps, 't' | 'values' | 'update'>> = ({ t, values, update }) => (
  <div className="border-t border-line pt-5 space-y-3" data-testid="audit-kind">
    <label className={CHOICE_LABEL}>{t.prePurchaseAudit.kindLabel}</label>
    <div className="flex flex-wrap gap-2">
      {KIND_OPTIONS.map((kind) => <Pill key={kind} label={t.prePurchaseAudit.kinds[kind]} selected={values.bikeKind === kind} onClick={() => update({ bikeKind: kind })} />)}
    </div>
    {values.bikeKind === 'xc_mtb' && (
      <div className="flex flex-wrap gap-2">
        {MTB_STYLES.map((style) => <Pill key={style} label={t.wizard.mtb.styles[style]} selected={values.mtbStyle === style} onClick={() => update({ mtbStyle: style })} />)}
      </div>
    )}
    <p className="text-xs text-ink-3">{t.prePurchaseAudit.kindHint}</p>
  </div>
);

const SectionHeader: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div className="border-b border-line pb-3">
    <h2 className="text-lg font-bold text-ink tracking-tight">{title}</h2>
    <p className="text-sm text-ink-2 mt-0.5">{subtitle}</p>
  </div>
);

export const IntakeStep: React.FC<IntakeStepProps> = (props) => {
  const { t, values, update, onOpenGuide, onNext } = props;
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-line bg-surface shadow-sm space-y-6">
        <SectionHeader title={t.prePurchaseAudit.step1Heading} subtitle={t.prePurchaseAudit.step1Subtitle} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sliderSpecs(t, values, props).map((spec) => (
            <SliderWithGuide key={spec.id} spec={spec} t={t} onOpenGuide={onOpenGuide} />
          ))}
        </div>
        <WeightField t={t} values={values} update={update} />
        <FlexibilityPicker t={t} values={values} update={update} />
        <KindPicker t={t} values={values} update={update} />
        <GoalPicker t={t} values={values} update={update} />
        <div className="pt-4 flex justify-end">
          <button
            type="button"
            onClick={onNext}
            className="h-12 px-8 rounded-full font-bold text-sm bg-blue-600 hover:bg-blue-700 text-slate-50 shadow-md transition-all"
          >
            {t.prePurchaseAudit.nextStepButton}
          </button>
        </div>
      </div>
    </div>
  );
};
