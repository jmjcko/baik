'use client';

import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { cx } from '@/lib/classNames';

type Platform = keyof Translations['gear']['useGuide']['platforms'];
const PLATFORMS: Platform[] = ['chatgpt', 'claude', 'gemini', 'perplexity'];

/** The chatbots to choose from (the chosen one is pressed). */
const PlatformChips: React.FC<{ t: Translations; platform: Platform; onChange: (platform: Platform) => void }> = ({ t, platform, onChange }) => (
  <div role="group" aria-label={t.gear.useGuide.platformLabel} className="flex flex-wrap gap-2">
    {PLATFORMS.map((one) => (
      <button key={one} type="button" aria-pressed={platform === one} onClick={() => onChange(one)} data-testid={`guide-${one}`} className={cx('h-10 px-4 rounded-full text-xs font-semibold border transition-colors', platform === one ? 'bg-blue-600 border-blue-600 text-slate-50' : 'border-line bg-surface text-ink-2 hover:bg-sunken')}>
        {t.gear.useGuide.platforms[one].name}
      </button>
    ))}
  </div>
);

/** What to do with the master prompt: the steps for the chatbot the rider picks, what to do with the answer, and who sees what. */
export const PromptGuide: React.FC<{ t: Translations }> = ({ t }) => {
  const [platform, setPlatform] = useState<Platform>('chatgpt');
  const g = t.gear.useGuide;
  const chosen = g.platforms[platform];
  return (
    <section data-testid="prompt-guide" className="rounded-2xl border border-tone-info-line bg-tone-info-bg p-5 space-y-4" aria-labelledby="prompt-guide-title">
      <div>
        <h3 id="prompt-guide-title" className="text-base font-bold text-ink tracking-tight">{g.title}</h3>
        <p className="text-sm text-ink-2 mt-1">{g.intro}</p>
      </div>
      <PlatformChips t={t} platform={platform} onChange={setPlatform} />
      <ol className="list-decimal pl-5 space-y-1.5 text-sm text-ink" data-testid="guide-steps">
        {chosen.steps.map((step) => <li key={step}>{step}</li>)}
      </ol>
      <a href={chosen.url} target="_blank" rel="noopener noreferrer" data-testid="guide-open" className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 text-sm font-semibold text-accent-ink hover:bg-sunken">
        <ExternalLink aria-hidden="true" className="w-4 h-4" />
        {fill(g.open, { name: chosen.name })}
      </a>
      <div className="space-y-1.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-ink-3">{g.afterTitle}</h4>
        <ol className="list-decimal pl-5 space-y-1.5 text-sm text-ink-2" start={4} data-testid="guide-after">
          {g.after.map((step) => <li key={step}>{step}</li>)}
        </ol>
      </div>
      <p className="text-xs text-ink-3">{g.privacy}</p>
    </section>
  );
};
