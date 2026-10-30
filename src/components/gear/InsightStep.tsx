import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { TAXONOMY } from '@/types/gearTaxonomy';
import type { GearCategoryId } from '@/types/gearTypes';

/** Step 3: the rules of the knowledge bases that apply to the category, each with its source (the High-ROI insight). */
export const InsightStep: React.FC<{ t: Translations; category: GearCategoryId | null }> = ({ t, category }) => {
  const ids = category ? TAXONOMY[category].insights : [];
  return (
    <div className="space-y-4" data-testid="gear-insight-step">
      <p className="text-sm text-ink-2">{t.gear.insight.intro}</p>
      {ids.length === 0 && <p className="text-sm font-semibold text-ink" data-testid="insight-none">{t.gear.insight.none}</p>}
      <ul className="space-y-3">
        {ids.map((id) => (
          <li key={id} className="rounded-xl border border-line p-4" data-testid={`insight-${id}`}>
            <p className="font-bold text-ink">{t.gearKb.insights[id].title}</p>
            <p className="text-sm text-ink-2 leading-relaxed mt-1">{t.gearKb.insights[id].body}</p>
            <p className="text-xs font-mono text-ink-3 mt-2">{fill(t.gear.insight.source, { source: t.gearKb.insights[id].source })}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};
