import React from 'react';
import { ShieldAlert } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';

/** The pressure washer warning: where the jet must never go and the safe way to wash (KB bAIkcare 3.1, 1.5 m from the product owner). */
export const PressureWarning: React.FC<{ t: Translations }> = ({ t }) => {
  const p = t.care.wash.pressure;
  return (
    <div className="rounded-xl border-2 border-tone-warning-line bg-tone-warning-bg p-4 flex gap-3" data-testid="wash-pressure">
      <ShieldAlert aria-hidden="true" className="w-5 h-5 shrink-0 text-tone-warning-ink mt-0.5" />
      <div className="space-y-2 text-sm text-tone-warning-ink leading-relaxed">
        <p className="font-bold">{p.title}</p>
        <p>{p.body}</p>
        <p><span className="font-semibold">{p.safeTitle}: </span>{p.safe}</p>
      </div>
    </div>
  );
};
