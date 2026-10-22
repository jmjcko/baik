import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { diagnoseSymptoms } from '@/lib/engines/baikfit/diagnostics';
import type { RiderPainType } from '@/types/baikfit';

/** Compact list of the KB diagnosis rows for the reported symptoms (details are in the report). */
export const StudioDiagnosis: React.FC<{ t: Translations; pains: RiderPainType[] }> = ({ t, pains }) => {
  const ids = diagnoseSymptoms(pains);
  if (ids.length === 0) return null;
  return (
    <div data-testid="studio-diagnosis" className="p-3 rounded-lg border border-slate-800 bg-slate-900/90 space-y-1">
      <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">{t.diagnosis.heading}</span>
      <ul className="text-xs text-slate-300 list-disc pl-4 space-y-0.5">
        {ids.map((id) => (
          <li key={id}>{t.diagnosis.items[id].title}</li>
        ))}
      </ul>
    </div>
  );
};
