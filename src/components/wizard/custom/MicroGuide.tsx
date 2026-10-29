import React, { useState } from 'react';
import type { CustomFieldId, CustomSetupTexts } from '@/lib/i18n/types/customSetup';
import { MeasureDiagram } from './MeasureDiagram';

interface MicroGuideProps {
  field: CustomFieldId;
  texts: CustomSetupTexts;
  mtb?: boolean;
}

/** The "how to measure at home" guide of one field: a drawing with the measurement vector, three numbered steps and what the number changes. */
export const MicroGuide: React.FC<MicroGuideProps> = ({ field, texts, mtb }) => {
  const [open, setOpen] = useState(false);
  const f = texts.fields[field];
  const panelId = `micro-guide-${field}`;
  return (
    <div>
      <button type="button" aria-expanded={open} aria-controls={panelId} data-testid={`micro-guide-trigger-${field}`} onClick={() => setOpen(!open)} className="text-xs font-semibold text-accent-ink hover:underline py-1">
        {open ? texts.guideClose : texts.guideOpen} {open ? '▴' : '▾'}
      </button>
      {open && (
        <div id={panelId} data-testid={panelId} className="mt-2 p-4 rounded-xl border border-line bg-surface space-y-4">
          <MeasureDiagram field={field} tag={f.tag} label={f.label} mtb={mtb} />
          <ol className="space-y-2">
            {f.steps.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm text-ink-2">
                <span className="shrink-0 w-6 h-6 rounded-full bg-tone-info-bg text-tone-info-ink text-xs font-bold flex items-center justify-center">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="text-sm text-ink-2"><span className="font-semibold text-ink">{texts.impactLabel}: </span>{f.impact}</p>
        </div>
      )}
    </div>
  );
};
