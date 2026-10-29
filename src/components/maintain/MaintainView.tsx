'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { PageHeader } from '@/components/primitives/PageHeader';
import { SurfaceCard } from '@/components/primitives/SurfaceCard';
import type { WireframeKind } from '@/components/studio/wireframe/geometry';
import { todayOf } from '@/lib/engines/baikcare/barTape';
import { withNodeStatus } from '@/lib/engines/baikcare/mcheck';
import type { BikeCare, MCheckNodeId, NodeStatus } from '@/types/maintain';
import { ChainTracker } from './ChainTracker';
import { MCheckHotspotView } from './MCheckHotspotView';
import { NodeDiagnosticModal } from './NodeDiagnosticModal';
import { TrainerCare } from './TrainerCare';
import { WashProtocol } from './WashProtocol';
import { WorkshopSection } from './WorkshopSection';

interface MaintainViewProps {
  t: Translations;
  /** The id of the active bike; the fields start again when another bike is chosen. */
  bikeId: string;
  bikeName: string | null;
  kind: WireframeKind;
  care: BikeCare;
  onCareChange: (patch: Partial<BikeCare>) => void;
  /** Today as `YYYY-MM-DD` (the real day unless a test gives one). */
  today?: string;
}

/** Scrolls the page to the chain gauge (the target of the symptoms about the chain). */
const goToChain = () => document.getElementById('care-chain')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });

/** The bAIkcare page: the M-Check on the drawing of the bike, the chain gauge, the indoor trainer and the 5-minute wash, for the active bike. */
export const MaintainView: React.FC<MaintainViewProps> = ({ t, bikeId, bikeName, kind, care, onCareChange, today = todayOf() }) => {
  const [openNode, setOpenNode] = useState<MCheckNodeId | null>(null);
  const setStatus = (node: MCheckNodeId, status: NodeStatus) => onCareChange(withNodeStatus(care, node, status, today));
  return (
    <div className="space-y-8 pb-10" data-testid="maintain-view">
      <PageHeader eyebrow={t.navigation.baikcareStudio} title={t.care.title} subtitle={t.care.subtitle}>
        <p className="inline-flex mt-4 h-8 px-3 items-center rounded-full border border-line bg-surface text-xs font-semibold text-ink-2" data-testid="care-bike">{fill(t.care.bikeLabel, { bike: bikeName ?? t.care.noBike })}</p>
      </PageHeader>
      <SurfaceCard as="section" className="space-y-4" padding="lg">
        <div>
          <h2 className="text-lg font-bold text-ink tracking-tight">{t.care.mcheck.title}</h2>
          <p className="text-sm text-ink-2 leading-relaxed mt-1">{t.care.mcheck.intro}</p>
        </div>
        <MCheckHotspotView t={t} care={care} kind={kind} onOpenNode={setOpenNode} />
      </SurfaceCard>
      <div className="grid gap-6 lg:grid-cols-2">
        <div id="care-chain"><ChainTracker key={bikeId} t={t} care={care} onChange={onCareChange} /></div>
        <TrainerCare t={t} care={care} today={today} onChange={onCareChange} />
      </div>
      <WorkshopSection t={t} onOpenNode={setOpenNode} onGoToChain={goToChain} />
      <WashProtocol t={t} />
      {openNode && <NodeDiagnosticModal t={t} node={openNode} status={care.nodes[openNode]} kind={kind} onSetStatus={(status) => setStatus(openNode, status)} onClose={() => setOpenNode(null)} />}
    </div>
  );
};
