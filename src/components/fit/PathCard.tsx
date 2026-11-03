import React from 'react';
import { ArrowRight, type LucideIcon } from 'lucide-react';

export interface PathTexts {
  badge: string;
  title: string;
  text: string;
  /** What happens, in three short steps. */
  points: [string, string, string];
  button: string;
}

/** The two audiences: the rider who already has the bike (info tone) and the rider who is about to buy one (success tone). */
export type PathTone = 'own' | 'buying';

const TONE: Record<PathTone, { card: string; label: string }> = {
  own: { card: 'border-t-tone-info-line', label: 'border-tone-info-line bg-tone-info-bg text-tone-info-ink' },
  buying: { card: 'border-t-tone-success-line', label: 'border-tone-success-line bg-tone-success-bg text-tone-success-ink' },
};

interface PathCardProps {
  testId: string;
  texts: PathTexts;
  tone: PathTone;
  /** The symbol next to the audience label (hidden from screen readers: the label says it). */
  icon: LucideIcon;
  onSelect: () => void;
}

/** One way in: who it is for (a tinted label), the title, one sentence, the three steps and one button. A white M3 card, the tone only in the top line and the label. */
export const PathCard: React.FC<PathCardProps> = ({ testId, texts, tone, icon: Icon, onSelect }) => (
  <section data-testid={testId} data-tone={tone} className={`rounded-2xl border border-line border-t-4 ${TONE[tone].card} bg-surface shadow-sm p-7 flex flex-col gap-5`}>
    <span className={`self-start inline-flex items-center gap-2 h-8 px-3 rounded-full border text-xs font-bold ${TONE[tone].label}`}>
      <Icon aria-hidden="true" className="w-4 h-4" />
      {texts.badge}
    </span>
    <div className="space-y-2">
      <h2 className="text-2xl font-bold tracking-tight text-ink">{texts.title}</h2>
      <p className="text-sm leading-relaxed text-ink-2 max-w-md">{texts.text}</p>
    </div>
    <ol className="space-y-2 text-sm text-ink list-decimal pl-5 grow" data-testid={`${testId}-steps`}>
      {texts.points.map((point) => <li key={point}>{point}</li>)}
    </ol>
    <button type="button" onClick={onSelect} className="self-start h-12 px-6 rounded-full bg-blue-600 text-slate-50 text-sm font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
      {texts.button}
      <ArrowRight aria-hidden="true" className="w-4 h-4" />
    </button>
  </section>
);
