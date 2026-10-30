'use client';

import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { cx } from '@/lib/classNames';
import { BikeSilhouette } from '@/components/studio/wireframe/BikeSilhouette';
import { referenceGeometry } from '@/components/studio/wireframe/referenceGeometry';
import type { WireframeKind } from '@/components/studio/wireframe/geometry';
import { summarize, tyreAttention } from '@/lib/engines/baikcare/mcheck';
import { MCHECK_NODES, NODE_STATUSES, WHEELS, type BikeCare, type MCheckNodeId, type WheelId } from '@/types/maintain';
import { DRAWING_BOX, nodePositions, percentOf, tyrePositions } from './nodePositions';
import { STATUS_VIEW } from './statusView';

interface HotspotViewProps {
  t: Translations;
  care: BikeCare;
  kind: WireframeKind;
  onOpenNode: (node: MCheckNodeId) => void;
  onOpenTyre: (wheel: WheelId) => void;
}

/** One bubble over the drawing: the number of the node and the icon of its status; it is a real button, so the keyboard works. */
const Hotspot: React.FC<{ t: Translations; care: BikeCare; node: MCheckNodeId; at: { left: string; top: string }; onOpen: () => void }> = ({ t, care, node, at, onOpen }) => {
  const status = care.nodes[node];
  const { Icon, tone } = STATUS_VIEW[status];
  const label = fill(t.care.mcheck.hotspot, { n: node, name: t.care.nodes[String(node) as '1'].name, status: t.care.status[status] });
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={label}
      title={label}
      data-testid={`mcheck-node-${node}`}
      data-status={status}
      style={at}
      className={cx('absolute -translate-x-1/2 -translate-y-1/2 h-8 min-w-8 px-1.5 md:h-11 md:min-w-11 md:px-2 rounded-full border-2 shadow-md flex items-center justify-center gap-0.5 md:gap-1 text-xs md:text-sm font-bold transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-blue-500', tone)}
    >
      <Icon aria-hidden="true" className="w-3 h-3 md:w-4 md:h-4" />
      <span aria-hidden="true">{node}</span>
    </button>
  );
};

/** The point on the tyre of a wheel: a square with rounded corners and the letter of the wheel, so it is not mistaken for a node of the M-Check. */
const TyrePoint: React.FC<{ t: Translations; care: BikeCare; wheel: WheelId; at: { left: string; top: string }; onOpen: () => void }> = ({ t, care, wheel, at, onOpen }) => {
  const status = care.tyres[wheel];
  const { Icon, tone } = STATUS_VIEW[status];
  const label = fill(t.wheels.points.hotspot, { name: t.wheels.points[wheel], status: t.care.status[status] });
  return (
    <button type="button" onClick={onOpen} aria-label={label} title={label} data-testid={`tyre-point-${wheel}`} data-status={status} style={at} className={cx('absolute -translate-x-1/2 -translate-y-1/2 h-7 min-w-7 px-1.5 md:h-9 md:min-w-9 rounded-lg border-2 border-dashed shadow-md flex items-center justify-center gap-0.5 text-[11px] md:text-xs font-bold transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-blue-500', tone)}>
      <Icon aria-hidden="true" className="w-3 h-3" />
      <span aria-hidden="true">{wheel === 'front' ? t.wheels.points.frontShort : t.wheels.points.rearShort}</span>
    </button>
  );
};

const Legend: React.FC<{ t: Translations }> = ({ t }) => (
  <div className="flex flex-wrap items-center gap-2" aria-label={t.care.mcheck.legendTitle}>
    {NODE_STATUSES.map((status) => {
      const { Icon, tone } = STATUS_VIEW[status];
      return (
        <span key={status} className={cx('inline-flex items-center gap-1.5 h-7 px-3 rounded-full border text-xs font-semibold', tone)}>
          <Icon aria-hidden="true" className="w-3.5 h-3.5" />
          {t.care.status[status]}
        </span>
      );
    })}
  </div>
);

/** What the inspection found so far, in one line under the drawing. */
const Summary: React.FC<{ t: Translations; care: BikeCare }> = ({ t, care }) => {
  const c = t.care.mcheck;
  const summary = summarize(care);
  const tyres = tyreAttention(care);
  const names = summary.attention.map((node) => t.care.nodes[String(node) as '1'].short).join(', ');
  return (
    <div className="space-y-1 text-sm text-ink-2" data-testid="mcheck-summary">
      <p className="font-mono text-xs text-ink-3">
        {fill(c.summary, { n: summary.checked })} · {care.inspectedAt ? fill(c.lastInspection, { date: care.inspectedAt }) : c.neverInspected}
      </p>
      {tyres.length > 0 && <p className="font-semibold text-tone-warning-ink" data-testid="tyre-attention">{fill(t.wheels.points.attention, { tyres: tyres.map((wheel) => t.wheels.points[wheel]).join(', ') })}</p>}
      {summary.attention.length > 0 && <p className="font-semibold text-tone-warning-ink">{fill(c.attention, { nodes: names })}</p>}
      {summary.attention.length === 0 && tyres.length === 0 && summary.overall === 'pass' && <p>{c.allClear}</p>}
    </div>
  );
};

/** The side view of the bike (the one of the CAD studio) with the five clickable nodes of the M-Check; each node takes the colour of its status. */
export const MCheckHotspotView: React.FC<HotspotViewProps> = ({ t, care, kind, onOpenNode, onOpenTyre }) => {
  const g = referenceGeometry(kind);
  const positions = nodePositions(g);
  const tyres = tyrePositions(g);
  const { x, y, width, height } = DRAWING_BOX;
  return (
    <div className="space-y-4" data-testid="mcheck-view">
      <div className="relative w-full max-w-3xl mx-auto rounded-xl border border-cad-border bg-cad-canvas" style={{ aspectRatio: `${width} / ${height}` }}>
        <svg viewBox={`${x} ${y} ${width} ${height}`} role="img" aria-label={t.care.mcheck.drawingLabel} className="absolute inset-0 w-full h-full">
          <BikeSilhouette g={g} />
        </svg>
        {MCHECK_NODES.map((node) => (
          <Hotspot key={node} t={t} care={care} node={node} at={percentOf(positions[node])} onOpen={() => onOpenNode(node)} />
        ))}
        {WHEELS.map((wheel) => (
          <TyrePoint key={wheel} t={t} care={care} wheel={wheel} at={percentOf(tyres[wheel])} onOpen={() => onOpenTyre(wheel)} />
        ))}
      </div>
      <Legend t={t} />
      <Summary t={t} care={care} />
    </div>
  );
};
