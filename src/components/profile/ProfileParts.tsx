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
