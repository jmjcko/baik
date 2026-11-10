import React from 'react';
import type { Translations } from '@/lib/i18n/translations';

type Guide = Translations['service']['logbook']['intervals']['guide'];

/** A sketch of the Settings page of Intervals.icu (its menu on the left, the block Developer Settings at the end): the two values are marked in the measure colour. */
const Sketch: React.FC<{ texts: Guide['diagram'] }> = ({ texts }) => (
  <svg viewBox="0 0 320 150" role="img" aria-label={texts.label} className="w-full max-w-md rounded-xl border border-line" style={{ background: 'var(--cad-canvas)' }}>
    <rect x="8" y="8" width="70" height="134" rx="6" fill="none" stroke="var(--schematic-muted)" />
    {[24, 50, 76].map((y) => <line key={y} x1="18" y1={y} x2="62" y2={y} stroke="var(--schematic-muted)" strokeWidth="3" strokeLinecap="round" />)}
    <rect x="14" y="94" width="58" height="20" rx="4" fill="none" stroke="var(--schematic-measure)" strokeWidth="2" />
    <text x="43" y="108" textAnchor="middle" fontSize="9" fill="var(--cad-ink)">{texts.settings}</text>
    <text x="43" y="132" textAnchor="middle" fontSize="9" fill="var(--cad-cyan-text)">1</text>
    <rect x="92" y="78" width="220" height="64" rx="6" fill="none" stroke="var(--schematic-line)" />
    <text x="102" y="94" fontSize="10" fontWeight="700" fill="var(--cad-ink)">{texts.developer}</text>
    <text x="304" y="94" textAnchor="end" fontSize="9" fill="var(--cad-cyan-text)">2</text>
    <text x="102" y="114" fontSize="9" fill="var(--cad-ink)">{texts.athleteId}</text>
    <text x="102" y="132" fontSize="9" fill="var(--cad-ink)">{texts.apiKey}</text>
    <line x1="184" y1="111" x2="212" y2="111" stroke="var(--schematic-measure)" strokeWidth="1.5" />
    <line x1="184" y1="129" x2="212" y2="129" stroke="var(--schematic-measure)" strokeWidth="1.5" />
    <text x="220" y="114" fontSize="9" fill="var(--cad-cyan-text)">3</text>
    <text x="220" y="132" fontSize="9" fill="var(--cad-cyan-text)">3</text>
    <line x1="78" y1="104" x2="92" y2="110" stroke="var(--schematic-muted)" strokeDasharray="3 3" />
  </svg>
);

/** Where the athlete id and the API key are found in Intervals.icu: three numbered steps and the sketch, closed by default. */
export const IntervalsGuide: React.FC<{ texts: Guide }> = ({ texts }) => (
  <details className="rounded-xl border border-line bg-sunken p-4" data-testid="intervals-guide">
    <summary className="cursor-pointer text-sm font-semibold text-accent-ink">{texts.summary}</summary>
    <div className="mt-3 space-y-3">
      <Sketch texts={texts.diagram} />
      <ol className="list-decimal space-y-1 pl-5 text-sm text-ink-2">{texts.steps.map((step) => <li key={step}>{step}</li>)}</ol>
      <p className="text-xs text-ink-3 max-w-3xl">{texts.english}</p>
    </div>
  </details>
);
