import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { isDeep, paramsOf } from '@/types/gearTaxonomy';
import type { GearAnswer, GearAnswers, GearCategoryId, GearParamId } from '@/types/gearTypes';
import { ParamField } from './ParamField';

interface SurveyStepProps {
  t: Translations;
  category: GearCategoryId;
  answers: GearAnswers;
  onAnswer: (id: GearParamId, answer: GearAnswer | null) => void;
}

/** Step 2: the questions of the category, its own first and then the general form; every one is optional. */
export const SurveyStep: React.FC<SurveyStepProps> = ({ t, category, answers, onAnswer }) => (
  <div className="space-y-4" data-testid="gear-survey-step">
    <p className="text-sm text-ink-2">{t.gear.surveyIntro}</p>
    <p className="text-xs font-semibold text-ink-3" data-testid="survey-note">{isDeep(category) ? t.gear.deepNote : t.gear.generalNote}</p>
    <div className="grid gap-3 md:grid-cols-2">
      {paramsOf(category).map((id) => <ParamField key={id} t={t} id={id} answer={answers[id]} onChange={(answer) => onAnswer(id, answer)} />)}
    </div>
  </div>
);
