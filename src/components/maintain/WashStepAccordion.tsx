import React, { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { WashStepTexts } from '@/lib/i18n/types/care';

interface WashStepAccordionProps {
  step: WashStepTexts;
  tipLabel: string;
  index: number;
}

/** One step of the wash with its expert tip, which opens under the step on demand. */
export const WashStepAccordion: React.FC<WashStepAccordionProps> = ({ step, tipLabel, index }) => {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <li className="rounded-xl border border-line p-4">
      <p className="font-bold text-ink">{step.title}</p>
      <p className="text-sm text-ink-2 leading-relaxed mt-1">{step.body}</p>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        data-testid={`wash-tip-toggle-${index + 1}`}
        className="mt-3 inline-flex items-center gap-1.5 min-h-11 px-4 rounded-full border border-line text-sm font-semibold text-accent-ink hover:bg-sunken transition-colors"
      >
        {tipLabel}
        <ChevronDown aria-hidden="true" className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <p id={panelId} data-testid={`wash-tip-${index + 1}`} className="mt-2 text-sm text-ink leading-relaxed rounded-xl bg-tone-info-bg border border-tone-info-line px-4 py-3">
          {step.tip}
        </p>
      )}
    </li>
  );
};
