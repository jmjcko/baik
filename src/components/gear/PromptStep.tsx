import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { describeAnswer } from '@/lib/agents/lukeCykloAgent';
import { paramsOf } from '@/types/gearTaxonomy';
import type { GearAnswers, GearCategoryId } from '@/types/gearTypes';

interface PromptStepProps {
  t: Translations;
  category: GearCategoryId;
  answers: GearAnswers;
  onOpen: () => void;
}

/** Step 4: what the rider answered and the button that makes the master prompt. */
export const PromptStep: React.FC<PromptStepProps> = ({ t, category, answers, onOpen }) => {
  const lines = paramsOf(category).flatMap((id) => {
    const answer = answers[id];
    return answer && id !== 'currency' ? [{ id, text: describeAnswer(t, id, answer.value, answers) }] : [];
  });
  return (
    <div className="space-y-4" data-testid="gear-prompt-step">
      <p className="text-sm text-ink-2">{t.gear.prompt.intro}</p>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-ink-3">{t.gear.prompt.summaryTitle}</p>
        {lines.length === 0 && <p className="text-sm text-ink-2 mt-1" data-testid="prompt-no-answers">{t.gear.prompt.noAnswers}</p>}
        <ul className="mt-1 space-y-1 list-disc pl-5 text-sm text-ink" data-testid="prompt-answers">{lines.map((line) => <li key={line.id}>{line.text}</li>)}</ul>
      </div>
      <button type="button" onClick={onOpen} data-testid="prompt-open" className="h-12 px-6 rounded-full bg-blue-600 text-slate-50 text-sm font-semibold hover:bg-blue-700 transition-colors">{t.gear.prompt.open}</button>
    </div>
  );
};
