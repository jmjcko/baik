'use client';

import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';
import type { CapabilityPlane, CapabilityStatus } from '@/lib/i18n/types/capabilities';
import { SurfaceCard } from '@/components/primitives/SurfaceCard';
import { CAPABILITIES, CAPABILITY_PLANES } from './capabilities';

const BADGE_TONE: Record<CapabilityStatus, string> = {
  calculated: 'border-tone-success-line bg-tone-success-bg text-tone-success-ink',
  educational: 'border-tone-info-line bg-tone-info-bg text-tone-info-ink',
  clinical: 'border-tone-warning-line bg-tone-warning-bg text-tone-warning-ink',
  interactive: 'border-tone-success-line bg-tone-success-bg text-tone-success-ink',
};

/** The status of a parameter as text; no icon, no emoji. */
const StatusBadge: React.FC<{ status: CapabilityStatus; label: string }> = ({ status, label }) => (
  <span data-testid="capability-status" data-status={status} className={cx('shrink-0 text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border', BADGE_TONE[status])}>
    {label}
  </span>
);

const Legend: React.FC<{ c: Translations['capabilities'] }> = ({ c }) => (
  <SurfaceCard className="space-y-2">
    <h2 className="text-sm font-bold text-ink">{c.legendTitle}</h2>
    <ul className="grid gap-2 sm:grid-cols-2">
      {(Object.keys(c.statuses) as CapabilityStatus[]).map((status) => (
        <li key={status} className="flex items-start gap-2 text-xs text-ink-2">
          <StatusBadge status={status} label={c.statuses[status].label} />
          <span className="leading-relaxed">{c.statuses[status].meaning}</span>
        </li>
      ))}
    </ul>
  </SurfaceCard>
);

interface CardProps {
  c: Translations['capabilities'];
  item: (typeof CAPABILITIES)[number];
  onTakeTests: () => void;
}

const CapabilityCard: React.FC<CardProps> = ({ c, item, onTakeTests }) => (
  <li data-testid="capability" className="p-4 rounded-2xl border border-line bg-surface space-y-2">
    <div className="flex items-start justify-between gap-3">
      <h3 className="text-sm font-bold text-ink">{c.items[item.id].name}</h3>
      <StatusBadge status={item.status} label={c.statuses[item.status].label} />
    </div>
    <p className="text-xs text-ink-2 leading-relaxed">{c.items[item.id].text}</p>
    {item.id === 'miniTests' && <button type="button" onClick={onTakeTests} className="h-10 px-5 rounded-full border border-blue-600 bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">{c.takeTests}</button>}
  </li>
);

const PlaneSection: React.FC<{ c: Translations['capabilities']; plane: CapabilityPlane; onTakeTests: () => void }> = ({ c, plane, onTakeTests }) => (
  <section aria-labelledby={`plane-${plane}`} className="space-y-3" data-testid={`plane-${plane}`}>
    <div>
      <h2 id={`plane-${plane}`} className="text-lg font-bold text-ink tracking-tight">{c.planes[plane].title}</h2>
      <p className="text-sm text-ink-2 mt-1 max-w-3xl">{c.planes[plane].intro}</p>
    </div>
    <ul className="grid gap-3 md:grid-cols-2">
      {CAPABILITIES.filter((item) => item.plane === plane).map((item) => <CapabilityCard key={item.id} c={c} item={item} onTakeTests={onTakeTests} />)}
    </ul>
  </section>
);

interface ViewProps {
  t: Translations;
  /** Opens the two mobility mini-tests (wizard step 3). */
  onTakeTests: () => void;
}

/** "Fitting capabilities": the 20 parameters in the 4 contact planes, each with its status. */
export const CapabilitiesView: React.FC<ViewProps> = ({ t, onTakeTests }) => {
  const c = t.capabilities;
  return (
    <div className="space-y-8 pb-10" data-testid="capabilities">
      <header>
        <span className="font-mono text-xs uppercase tracking-wider text-accent-ink">{c.navLabel}</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink mt-1">{c.title}</h1>
        <p className="text-sm text-ink-2 leading-relaxed mt-2 max-w-3xl">{c.subtitle}</p>
      </header>
      <Legend c={c} />
      {CAPABILITY_PLANES.map((plane) => <PlaneSection key={plane} c={c} plane={plane} onTakeTests={onTakeTests} />)}
    </div>
  );
};
