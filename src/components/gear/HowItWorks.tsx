import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';

/** The short explanation at the start: what bAIkgear is, the three things that happen, that it sells nothing, and a peek at the prompt. */
export const HowItWorks: React.FC<{ t: Translations }> = ({ t }) => {
  const h = t.gear.howItWorks;
  const [open, setOpen] = useState(false);
  return (
    <section className="rounded-2xl border border-tone-info-line bg-tone-info-bg p-5 space-y-4" data-testid="how-it-works" aria-labelledby="how-title">
      <div>
        <h2 id="how-title" className="text-base font-bold text-ink">{h.title}</h2>
        <p className="text-sm text-ink-2 leading-relaxed mt-1">{h.intro}</p>
      </div>
      <ol className="grid gap-3 md:grid-cols-3">
        {h.items.map((item, index) => (
          <li key={item.title} className="rounded-xl bg-surface border border-line p-4 flex gap-3">
            <span aria-hidden="true" className="h-7 w-7 shrink-0 rounded-full bg-blue-600 text-slate-50 text-xs font-bold inline-flex items-center justify-center">{index + 1}</span>
            <span><span className="block text-sm font-bold text-ink">{item.title}</span><span className="block text-xs text-ink-2 leading-relaxed mt-1">{item.body}</span></span>
          </li>
        ))}
      </ol>
      <p className="text-xs text-ink-2">{h.notShop}</p>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} data-testid="example-toggle" className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-ink">
        {open ? h.exampleHide : h.exampleShow}
        <ChevronDown aria-hidden="true" className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <pre className="rounded-xl bg-surface border border-line p-4 text-xs font-mono text-ink whitespace-pre-wrap" data-testid="example-prompt">{h.example.join('\n')}</pre>}
    </section>
  );
};
