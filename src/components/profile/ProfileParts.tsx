import React from 'react';
import { SurfaceCard } from '@/components/primitives/SurfaceCard';

/** One label and value line of a profile block. */
export const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex justify-between gap-4 text-sm">
    <dt className="text-ink-3">{label}</dt>
    <dd className="font-semibold text-ink text-right">{value}</dd>
  </div>
);

/** A titled block of the profile page. */
export const Block: React.FC<{ id: string; title: string; intro?: string; children: React.ReactNode }> = ({ id, title, intro, children }) => (
  <section aria-labelledby={id} className="space-y-4">
    <div>
      <h2 id={id} className="text-lg font-bold text-ink tracking-tight">{title}</h2>
      {intro && <p className="text-sm text-ink-2 leading-relaxed mt-1 max-w-3xl">{intro}</p>}
    </div>
    {children}
  </section>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <SurfaceCard className={className}>{children}</SurfaceCard>
);

export const PILL = 'h-12 px-6 rounded-full text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
export const PILL_OUTLINE = `${PILL} border border-line bg-surface text-ink hover:bg-sunken`;
export const PILL_DANGER = `${PILL} border border-tone-danger-line bg-tone-danger-bg text-tone-danger-ink hover:opacity-80`;

/** The one main action of a card: a filled pill. */
export const PILL_SOLID = `${PILL} border border-blue-600 bg-blue-600 text-slate-50 hover:bg-blue-700`;
/** The other actions of a card: smaller outlined pills, quieter than the main one. */
export const PILL_SECONDARY = 'h-10 px-4 rounded-full text-sm font-semibold transition-colors border border-line bg-surface text-ink-2 hover:bg-sunken hover:text-ink disabled:opacity-50';
/** A drop-down that works like a small action ("Give to another rider"): the first option is the action's name. */
export const SELECT_ACTION = 'h-10 rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink-2 hover:bg-sunken focus:outline-none focus:border-tone-info-line max-w-full';

/** The name of a card and, next to it, its state (a small label, not a button). */
export const CardHead: React.FC<{ children: React.ReactNode; badge?: string; tone?: 'success' | 'neutral'; testId?: string }> = ({ children, badge, tone = 'success', testId }) => (
  <div className="flex items-start justify-between gap-3" data-testid={testId}>
    <div className="min-w-0 flex-1">{children}</div>
    {badge && <span className={tone === 'success' ? 'shrink-0 text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border border-tone-success-line bg-tone-success-bg text-tone-success-ink' : 'shrink-0 text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border border-line bg-sunken text-ink-3'}>{badge}</span>}
  </div>
);

/** The title of a card as text. */
export const CardName: React.FC<{ children: React.ReactNode }> = ({ children }) => <h3 className="text-lg font-extrabold text-ink tracking-tight break-words">{children}</h3>;

/** A small label over a block of facts or actions of a card. */
export const CardLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => <p className="text-[11px] font-mono uppercase tracking-wider text-ink-3 font-bold">{children}</p>;

/** The part of a card below the actions, set apart by a line, for what removes something. */
export const CardDanger: React.FC<{ children: React.ReactNode; label: string }> = ({ children, label }) => (
  <div role="group" aria-label={label} className="border-t border-line pt-3">{children}</div>
);
