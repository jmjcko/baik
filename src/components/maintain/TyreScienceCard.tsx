import React from 'react';
import type { Translations } from '@/lib/i18n/translations';

/** The science corner under the pressure guide: what the lab and the road say about width, pressure and the rim. Closed until the rider opens it. */
export const TyreScienceCard: React.FC<{ t: Translations }> = ({ t }) => {
  const s = t.wheels.science;
  return (
    <details data-testid="tyre-science" className="group rounded-2xl border border-line bg-surface">
      <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between gap-3 text-sm font-bold text-ink">
        <span>{s.title}</span>
        <span aria-hidden="true" className="text-ink-3 text-sm transition-transform group-open:rotate-180">▾</span>
      </summary>
      <div className="px-4 pb-4 space-y-4">
        <p className="text-sm text-ink-2 leading-relaxed">{s.intro}</p>
        {s.sections.map((section, index) => (
          <div key={section.title} className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-3"><span className="font-mono">{index + 1}</span> {section.title}</h4>
            <p className="text-sm text-ink-2 leading-relaxed">{section.body}</p>
          </div>
        ))}
        <div className="rounded-xl bg-sunken p-3 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink-3">{s.rulesTitle}</h4>
          <ol className="list-decimal pl-5 space-y-1 text-sm text-ink-2 leading-relaxed">
            {s.rules.map((rule) => <li key={rule}>{rule}</li>)}
          </ol>
        </div>
        <p className="text-xs text-ink-3">{s.scope}</p>
        <p className="text-xs text-ink-3">{s.source}</p>
      </div>
    </details>
  );
};
