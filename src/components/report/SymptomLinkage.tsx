import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { assessBar, linkSymptoms, type SymptomLink } from '@/lib/engines/baikfit/advice';
import { saddleAdjustment } from '@/lib/engines/baikfit/kbRules';
import type { RiderPainType } from '@/types/baikfit';
import type { FindingInput } from './reportFindings';

/** Symptoms explained by the rider's measured deviations (empty without data or within tolerance). */
export function symptomLinksFor(pains: RiderPainType[], input: FindingInput): SymptomLink[] {
  const saddle = input.currentSaddleHeightMm === null ? null : saddleAdjustment(input.currentSaddleHeightMm, input.saddleHeightMm);
  return linkSymptoms(pains, { saddle, bar: assessBar(input.currentBarWidthMm, input.acromionWidthMm) });
}

function causeText(t: Translations, link: SymptomLink, input: FindingInput): string {
  const l = t.diagnosticReport.linkage;
  if (link.cause === 'barWide') {
    const bar = assessBar(input.currentBarWidthMm, input.acromionWidthMm);
    return fill(l.barWide, { bar: bar.stockMm, excess: link.deltaMm, recommended: bar.recommendedMm });
  }
  return fill(link.cause === 'saddleLow' ? l.saddleLow : l.saddleHigh, { delta: link.deltaMm });
}

/** Prominent box that ties each reported symptom to its measured cause on the rider's bike. */
export const SymptomLinkage: React.FC<{ t: Translations; links: SymptomLink[]; input: FindingInput }> = ({ t, links, input }) => {
  if (links.length === 0) return null;
  const l = t.diagnosticReport.linkage;
  return (
    <section data-testid="symptom-linkage" className="p-6 rounded-2xl border-2 border-tone-info-line bg-surface">
      <h2 className="text-lg font-bold text-ink tracking-tight">{l.title}</h2>
      <p className="text-xs text-ink-3 mt-1 mb-4">{l.subtitle}</p>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.pain} data-testid={`symptom-link-${link.pain}`} className="text-sm text-ink-2 leading-relaxed">
            <span className="font-bold text-ink">{t.studio.pains[link.pain]}</span>
            <span className="font-mono text-teal-ink"> → </span>
            {causeText(t, link, input)}
          </li>
        ))}
      </ul>
    </section>
  );
};
