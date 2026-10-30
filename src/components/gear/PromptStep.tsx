import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type { PromptParameter } from '@/lib/agents/lukeCykloAgent';

interface PromptStepProps {
  t: Translations;
  parameters: PromptParameter[];
  notes: string;
  onNotes: (notes: string) => void;
  onOpen: () => void;
}

/** Step 5: what the rider chose and answered, and the button that makes the master prompt. */
export const PromptStep: React.FC<PromptStepProps> = ({ t, parameters, notes, onNotes, onOpen }) => (
  <div className="space-y-4" data-testid="gear-prompt-step">
    <p className="text-sm text-ink-2">{t.gear.prompt.intro}</p>
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-ink-3">{t.gear.prompt.summaryTitle}</p>
      {parameters.length === 0 && <p className="text-sm text-ink-2 mt-1" data-testid="prompt-no-answers">{t.gear.prompt.noAnswers}</p>}
      <ul className="mt-1 space-y-1 list-disc pl-5 text-sm text-ink" data-testid="prompt-answers">
        {parameters.map((parameter) => <li key={parameter.label}>{parameter.label}: {parameter.value ?? t.gearKb.prompt.undecided}</li>)}
      </ul>
    </div>
    <label className="block space-y-1">
      <span className="text-sm font-bold text-ink">{t.gear.notes.label}</span>
      <span className="block text-xs text-ink-2">{t.gear.notes.hint}</span>
      <textarea value={notes} maxLength={300} rows={3} placeholder={t.gear.notes.placeholder} onChange={(e) => onNotes(e.target.value)} data-testid="notes-input" className="w-full rounded-xl border border-line bg-surface p-3 text-sm text-ink" />
    </label>
    <button type="button" onClick={onOpen} data-testid="prompt-open" className="h-12 px-6 rounded-full bg-blue-600 text-slate-50 text-sm font-semibold hover:bg-blue-700 transition-colors">{t.gear.prompt.open}</button>
  </div>
);
