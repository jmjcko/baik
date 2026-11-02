'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { PageHeader } from '@/components/primitives/PageHeader';
import { SurfaceCard } from '@/components/primitives/SurfaceCard';
import type { WireframeKind } from '@/components/studio/wireframe/geometry';
import { todayOf } from '@/lib/engines/baikcare/barTape';
import { withNodeStatus, withTyreStatus } from '@/lib/engines/baikcare/mcheck';
import type { RidingDiscipline } from '@/types/baikfit';
import type { BikeIdentity, FitSummary } from '@/types/service';
import type { BikeCare, MCheckNodeId, NodeStatus, WheelId } from '@/types/maintain';
import { ChainTracker } from './ChainTracker';
import { MCheckHotspotView } from './MCheckHotspotView';
import { NodeDiagnosticModal } from './NodeDiagnosticModal';
import { BikePicker, type PickerBike } from './BikePicker';
import { CareTabs, type CareTab } from './CareTabs';
import { GarageSection } from './GarageSection';
import { TrainerCare } from './TrainerCare';
import { TyreDialog } from './TyreDialog';
import { WashProtocol } from './WashProtocol';
import { WheelsTyresSection } from './WheelsTyresSection';
import { WorkshopSection } from './WorkshopSection';

interface MaintainViewProps {
  t: Translations;
  locale: 'en' | 'cs';
  /** What the fit works out for the bike; the garage tab shows it. */
  fit: FitSummary;
  /** Make, model and year of the factory bike, when the garage knows them. */
  known?: Partial<BikeIdentity>;
  /** The id of the active bike; the fields start again when another bike is chosen. */
  bikeId: string;
  bikeName: string | null;
  /** All the rider's bikes for the drop-down, and the way to make another one active. */
  bikes?: PickerBike[];
  onSwitchBike?: (bikeId: string) => void;
  kind: WireframeKind;
  /** The discipline of the bike and the weight of the rider choose the pressure guide. */
  discipline: RidingDiscipline;
  riderWeightKg: number;
  care: BikeCare;
  onCareChange: (patch: Partial<BikeCare>) => void;
  /** Today as `YYYY-MM-DD` (the real day unless a test gives one). */
  today?: string;
}

type CardProps = Pick<React.ComponentProps<typeof MCheckHotspotView>, 't' | 'care' | 'kind' | 'onOpenNode' | 'onOpenTyre'>;

/** The M-Check card: the title and the drawing of the bike with its five nodes and the two tyre points. */
const MCheckCard: React.FC<CardProps> = (props) => (
  <SurfaceCard as="section" className="space-y-4" padding="lg">
    <div>
      <h2 className="text-lg font-bold text-ink tracking-tight">{props.t.care.mcheck.title}</h2>
      <p className="text-sm text-ink-2 leading-relaxed mt-1">{props.t.care.mcheck.intro}</p>
    </div>
    <MCheckHotspotView {...props} />
  </SurfaceCard>
);

/** Scrolls the page to the chain gauge (the target of the symptoms about the chain). */
const goToChain = () => document.getElementById('care-chain')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });

type PanelProps = Omit<MaintainViewProps, 'locale' | 'fit' | 'known' | 'bikeName' | 'today'> & { today: string };

/** The Workshop tab: the M-Check on the drawing of the bike, wheels and tyres, the chain gauge, the indoor trainer, the troubleshooters and the 5-minute wash. */
const WorkshopPanel: React.FC<PanelProps> = ({ t, bikeId, kind, discipline, riderWeightKg, care, onCareChange, today }) => {
  const [openNode, setOpenNode] = useState<MCheckNodeId | null>(null);
  const [openTyre, setOpenTyre] = useState<WheelId | null>(null);
  const [flat, setFlat] = useState(false);
  const setStatus = (node: MCheckNodeId, status: NodeStatus) => onCareChange(withNodeStatus(care, node, status, today));
  const setTyre = (wheel: WheelId, status: NodeStatus) => onCareChange(withTyreStatus(care, wheel, status, today));
  const openFlat = () => { setOpenTyre(null); setFlat(true); document.getElementById('care-wheels')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }); };
  return (
    <div className="space-y-8" id="care-workshop" role="tabpanel" aria-labelledby="care-tab-workshop" data-testid="care-panel-workshop">
      <MCheckCard t={t} care={care} kind={kind} onOpenNode={setOpenNode} onOpenTyre={setOpenTyre} />
      <div id="care-wheels"><WheelsTyresSection t={t} care={care} discipline={discipline} riderWeightKg={riderWeightKg} today={today} onChange={onCareChange} flat={flat} onFlatChange={setFlat} /></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div id="care-chain"><ChainTracker key={bikeId} t={t} care={care} onChange={onCareChange} /></div>
        <TrainerCare t={t} care={care} today={today} onChange={onCareChange} />
      </div>
      <WorkshopSection t={t} onOpenNode={setOpenNode} onGoToChain={goToChain} />
      <WashProtocol t={t} />
      {openTyre && <TyreDialog t={t} wheel={openTyre} status={care.tyres[openTyre]} kind={kind} onSetStatus={(status) => setTyre(openTyre, status)} onOpenFlat={openFlat} onClose={() => setOpenTyre(null)} />}
      {openNode && <NodeDiagnosticModal t={t} node={openNode} status={care.nodes[openNode]} kind={kind} onSetStatus={(status) => setStatus(openNode, status)} onClose={() => setOpenNode(null)} />}
    </div>
  );
};

/** The bAIkcare page for the active bike: the Workshop tab and the Garage and service book tab. */
export const MaintainView: React.FC<MaintainViewProps> = ({ today = todayOf(), ...props }) => {
  const { t, locale, fit, known, bikeId, bikeName, care, onCareChange } = props;
  const [tab, setTab] = useState<CareTab>('workshop');
  return (
    <div className="space-y-8 pb-10" data-testid="maintain-view">
      <div className="space-y-6 print:hidden">
        <PageHeader eyebrow={t.navigation.baikcareStudio} title={t.care.title} subtitle={t.care.subtitle} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CareTabs t={t} active={tab} onChange={setTab} />
          <BikePicker t={t} bikes={props.bikes ?? []} activeId={bikeId} fallbackName={bikeName ?? t.care.noBike} onSwitch={props.onSwitchBike} />
        </div>
      </div>
      {tab === 'workshop' ? <div className="print:hidden"><WorkshopPanel {...props} today={today} /></div> : (
        <GarageSection key={bikeId} t={t} locale={locale} bikeId={bikeId} bikeName={bikeName ?? t.care.noBike} care={care} fit={fit} known={known} today={today} onCareChange={onCareChange} />
      )}
    </div>
  );
};
