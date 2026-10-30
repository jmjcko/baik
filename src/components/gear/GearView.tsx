'use client';

import React, { useMemo, useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { cx } from '@/lib/classNames';
import { PageHeader } from '@/components/primitives/PageHeader';
import { SurfaceCard } from '@/components/primitives/SurfaceCard';
import { lukeContext, prefillAnswers } from '@/lib/agents/gearPrefill';
import type { ProfileValues } from '@/lib/profile/values';
import type { GearAnswer, GearAnswers, GearCategoryId, GearParamId } from '@/types/gearTypes';
import { CategoryStep } from './CategoryStep';
import { InsightStep } from './InsightStep';
import { MasterPromptModal } from './MasterPromptModal';
import { PromptStep } from './PromptStep';
import { SurveyStep } from './SurveyStep';

const STEPS = ['category', 'survey', 'insight', 'prompt'] as const;
const PILL = 'h-12 px-6 rounded-full text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

/** The answers with one answer set, or taken back when the value is null. */
function withAnswer(answers: GearAnswers, id: GearParamId, value: GearAnswer | null): GearAnswers {
  const next = { ...answers };
  if (value) next[id] = value;
  else delete next[id];
  return next;
}

const Progress: React.FC<{ t: Translations; step: number }> = ({ t, step }) => (
  <div className="space-y-2">
    <p className="text-xs font-bold uppercase tracking-wider text-ink-3" data-testid="gear-progress">{fill(t.gear.stepOf, { n: step + 1, total: STEPS.length })} · {t.gear.steps[STEPS[step]]}</p>
    <div className="flex gap-1.5" aria-hidden="true">{STEPS.map((id, i) => <span key={id} className={cx('h-1.5 flex-1 rounded-full', i <= step ? 'bg-blue-600' : 'bg-sunken')} />)}</div>
  </div>
);

/** The bAIkgear page: a four-step wizard (category, questions, rules of the knowledge base, master prompt for the rider's own AI chatbot). */
export const GearView: React.FC<{ t: Translations; values: ProfileValues }> = ({ t, values }) => {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<GearCategoryId | null>(null);
  const [answers, setAnswers] = useState<GearAnswers>({});
  const [open, setOpen] = useState(false);
  const context = useMemo(() => lukeContext(values), [values]);
  const pick = (id: GearCategoryId) => { setCategory(id); setAnswers(prefillAnswers(values)); };
  const answer = (id: GearParamId, value: GearAnswer | null) => setAnswers((previous) => withAnswer(previous, id, value));
  return (
    <div className="space-y-6 pb-10" data-testid="gear-view">
      <PageHeader eyebrow={t.navigation.baikshopAdvisory} title={t.gear.title} subtitle={t.gear.subtitle} />
      <SurfaceCard as="section" padding="lg" className="space-y-5">
        <Progress t={t} step={step} />
        {step === 0 && <CategoryStep t={t} category={category} onPick={pick} />}
        {step === 1 && category && <SurveyStep t={t} category={category} answers={answers} onAnswer={answer} />}
        {step === 2 && category && <InsightStep t={t} category={category} />}
        {step === 3 && category && <PromptStep t={t} category={category} answers={answers} onOpen={() => setOpen(true)} />}
        <div className="flex flex-wrap gap-3">
          <button type="button" disabled={step === 0} onClick={() => setStep(step - 1)} data-testid="gear-previous" className={cx(PILL, 'border border-line bg-surface text-ink-2 hover:bg-sunken')}>{t.gear.previous}</button>
          {step < STEPS.length - 1 && <button type="button" disabled={!category} onClick={() => setStep(step + 1)} data-testid="gear-next" className={cx(PILL, 'bg-blue-600 text-slate-50 hover:bg-blue-700')}>{t.gear.next}</button>}
        </div>
      </SurfaceCard>
      {open && category && <MasterPromptModal t={t} input={{ category, answers, ...context }} onClose={() => setOpen(false)} />}
    </div>
  );
};
