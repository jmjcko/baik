import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface PathTexts {
  badge: string;
  title: string;
  text: string;
  button: string;
}

/** The two flat colors of the tiles: royal blue for the bike I ride, emerald for the bike I might buy (the Aurora accents). */
export type PathColor = 'blue' | 'green';

const COLOR: Record<PathColor, { tile: string; symbol: string; button: string }> = {
  blue: { tile: 'bg-blue-600', symbol: 'bg-blue-500 border-blue-400', button: 'text-blue-700 hover:bg-blue-50' },
  green: { tile: 'bg-emerald-600', symbol: 'bg-emerald-500 border-emerald-400', button: 'text-emerald-700 hover:bg-emerald-50' },
};

interface PathCardProps {
  testId: string;
  texts: PathTexts;
  color: PathColor;
  /** The symbol of the tile (hidden from screen readers: the title says it). */
  icon: LucideIcon;
  onSelect: () => void;
}

/** One big flat colored tile: a symbol, a badge, the title, one sentence and one white button. */
export const PathCard: React.FC<PathCardProps> = ({ testId, texts, color, icon: Icon, onSelect }) => (
  <section data-testid={testId} data-color={color} className={`rounded-3xl ${COLOR[color].tile} text-slate-50 shadow-md p-8 flex flex-col justify-between gap-10 min-h-[22rem]`}>
    <div>
      <div className="flex items-center justify-between gap-4">
        <span className="inline-block px-3 py-1 rounded-full border border-slate-50 text-[11px] font-mono uppercase tracking-wider">{texts.badge}</span>
        <span className={`w-16 h-16 rounded-2xl border flex items-center justify-center ${COLOR[color].symbol}`}>
          <Icon aria-hidden="true" className="w-8 h-8" />
        </span>
      </div>
      <h2 className="text-3xl font-extrabold tracking-tight mt-6">{texts.title}</h2>
      <p className="text-base leading-relaxed mt-3 max-w-md">{texts.text}</p>
    </div>
    <button type="button" onClick={onSelect} className={`self-start h-14 px-8 rounded-full bg-white font-bold text-base shadow-sm transition-colors ${COLOR[color].button}`}>{texts.button}</button>
  </section>
);
