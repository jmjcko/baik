'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { SurfaceCard } from '@/components/primitives/SurfaceCard';
import type { WireframeKind } from '@/components/studio/wireframe/geometry';
import type { WizardId } from '@/lib/engines/baikcare/troubleshooting';
import type { RidingDiscipline } from '@/types/baikfit';
import type { BikeCare, NodeStatus } from '@/types/maintain';
import type { WorkshopOffer } from '@/types/service';
import { BrakeBleedWizard } from './BrakeBleedWizard';
import { CareTasks, type CareTaskId } from './CareTasks';
import { ChainTracker } from './ChainTracker';
import { CheckBanner } from './CheckBanner';
import { CheckList } from './CheckList';
import { CheckSummary } from './CheckSummary';
import { DerailleurAdjustmentWizard } from './DerailleurAdjustmentWizard';
import { MCheckHotspotView } from './MCheckHotspotView';
import { RotorTruingWizard } from './RotorTruingWizard';
import { StepPanel } from './StepPanel';
import { TrainerCare } from './TrainerCare';
import { WashProtocol } from './WashProtocol';
import { WheelsTyresSection } from './WheelsTyresSection';
import { WorkshopSection } from './WorkshopSection';
import { CHECK_STEPS, checkedCount, firstOpenStep, withStepStatus, type CheckStep } from './checkSteps';

const WIZARDS: Record<WizardId, React.FC<{ t: Translations; onClose: () => void }>> = {
  bleed: BrakeBleedWizard,
  derailleur: DerailleurAdjustmentWizard,
  rotor: RotorTruingWizard,
};

export interface WorkshopPanelProps {
  t: Translations;
  bikeId: string;
  kind: WireframeKind;
  discipline: RidingDiscipline;
  riderWeightKg: number;
  care: BikeCare;
  onCareChange: (patch: Partial<BikeCare>) => void;
  today: string;
  onRecorded: (offer: WorkshopOffer) => void;
}

const scrollTo = (id: string) => window.setTimeout(() => document.getElementById(id)?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }), 0);

/** The note of the service book entry: the result of every place of the check, in a line. */
function checkNote(t: Translations, care: BikeCare): string {
  return CHECK_STEPS.map((step) => {
    const status = step.kind === 'node' ? care.nodes[step.node] : care.tyres[step.wheel];
    const name = step.kind === 'node' ? t.care.nodes[String(step.node) as '1'].short : t.wheels.points[step.wheel];
    return `${name}: ${t.care.status[status]}`;
  }).join('; ');
}

/** The task that is open under the row: the chain gauge, the wheels and tyres, the trainer, the troubleshooter or the wash. */
const TaskPanel: React.FC<{ props: WorkshopPanelProps; task: CareTaskId; flat: boolean; onFlat: (open: boolean) => void; onStep: (node: number) => void; onTask: (task: CareTaskId) => void; onWizard: (wizard: WizardId) => void }> = ({ props, task, flat, onFlat, onStep, onTask, onWizard }) => {
  const { t, care, today, onCareChange, onRecorded } = props;
  return (
    <div id="care-panel" data-testid="care-panel" data-item={task}>
      {task === 'chain' && <div id="care-chain"><ChainTracker key={props.bikeId} t={t} care={care} today={today} onChange={onCareChange} onRecorded={onRecorded} /></div>}
      {task === 'wheels' && <div id="care-wheels"><WheelsTyresSection t={t} care={care} discipline={props.discipline} riderWeightKg={props.riderWeightKg} today={today} onChange={onCareChange} onRecorded={onRecorded} flat={flat} onFlatChange={onFlat} /></div>}
      {task === 'trainer' && <TrainerCare t={t} care={care} today={today} onChange={onCareChange} onRecorded={onRecorded} />}
      {task === 'fix' && <WorkshopSection t={t} onOpenNode={onStep} onGoToChain={() => onTask('chain')} onOpenWizard={onWizard} />}
      {task === 'wash' && <WashProtocol t={t} />}
    </div>
  );
};

/** The side of the check: the bike as the overview (marks and days) and the list of steps. */
const CheckSide: React.FC<{ props: WorkshopPanelProps; index: number; done: boolean; onGo: (index: number) => void }> = ({ props, index, done, onGo }) => {
  const { t, care } = props;
  const step = CHECK_STEPS[index];
  const stepOf = (match: (candidate: CheckStep) => boolean) => CHECK_STEPS.findIndex(match);
  return (
    <aside className="space-y-4 lg:sticky lg:top-4" data-testid="check-side">
      <SurfaceCard as="section" className="space-y-3" padding="md">
        <h2 className="text-xs font-bold uppercase tracking-wider text-ink-3">{t.care.guide.overviewTitle}</h2>
        <MCheckHotspotView t={t} care={care} kind={props.kind} selectedNode={step.kind === 'node' ? step.node : undefined} selectedTyre={step.kind === 'tyre' ? step.wheel : null} onOpenNode={(node) => onGo(stepOf((c) => c.kind === 'node' && c.node === node))} onOpenTyre={(wheel) => onGo(stepOf((c) => c.kind === 'tyre' && c.wheel === wheel))} />
        <p className="text-xs text-ink-3">{t.care.guide.overviewHint}</p>
      </SurfaceCard>
      <SurfaceCard as="section" padding="md">
        <h2 className="text-xs font-bold uppercase tracking-wider text-ink-3 mb-2">{t.care.guide.listTitle}</h2>
        <CheckList t={t} care={care} current={done ? -1 : index} onSelect={onGo} />
      </SurfaceCard>
    </aside>
  );
};

/** The state of the guided check: the step, the end of the check, the ticks of the lines, the open task and the guide that replaces the page. */
function useGuide(props: WorkshopPanelProps) {
  const { t, care, onCareChange, today } = props;
  const [index, setIndex] = useState(() => Math.max(0, firstOpenStep(care)));
  const [done, setDone] = useState(false);
  const [booked, setBooked] = useState(false);
  const [ticks, setTicks] = useState<Record<number, number[]>>({});
  const [task, setTask] = useState<CareTaskId | null>(null);
  const [flat, setFlat] = useState(false);
  const [wizard, setWizard] = useState<WizardId | null>(null);
  const go = (next: number) => { setIndex(next); setDone(false); };
  const openTask = (next: CareTaskId) => { setTask(next); scrollTo('care-panel'); };
  return {
    index, done, booked, flat, wizard, task, ticks: ticks[index] ?? [], go, openTask, setDone, setFlat, setWizard, setTask,
    tick: (item: number, checked: boolean) => setTicks((all) => ({ ...all, [index]: checked ? [...(all[index] ?? []), item] : (all[index] ?? []).filter((one) => one !== item) })),
    setStatus: (status: NodeStatus) => { onCareChange(withStepStatus(care, CHECK_STEPS[index], status, today)); setBooked(false); },
    book: () => { props.onRecorded({ kind: 'mcheck', variant: null, at: today, value: '', note: checkNote(t, care) }); setBooked(true); },
    again: () => { setTicks({}); go(0); setBooked(false); },
    toNode: (node: number) => go(CHECK_STEPS.findIndex((step) => step.kind === 'node' && step.node === node)),
  };
}

/** The tab Workshop as a guided check: what to do now, the bike as the overview with marks and days, the list of steps and the current step; the things done by time are under it. */
export const WorkshopPanel: React.FC<WorkshopPanelProps> = (props) => {
  const { t, care, today } = props;
  const g = useGuide(props);
  if (g.wizard) {
    const Wizard = WIZARDS[g.wizard];
    return <div id="care-workshop" role="tabpanel" aria-labelledby="care-tab-workshop" data-testid="care-panel-workshop"><Wizard t={t} onClose={() => g.setWizard(null)} /></div>;
  }
  return (
    <div className="space-y-8" id="care-workshop" role="tabpanel" aria-labelledby="care-tab-workshop" data-testid="care-panel-workshop">
      <CheckBanner t={t} checked={checkedCount(care)} next={firstOpenStep(care)} done={g.done} onGo={g.go} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start">
        <CheckSide props={props} index={g.index} done={g.done} onGo={g.go} />
        <div id="care-step">
          {g.done ? <CheckSummary t={t} care={care} booked={g.booked} onBook={g.book} onSkip={() => g.setDone(false)} onAgain={g.again} /> : (
            <StepPanel t={t} care={care} kind={props.kind} index={g.index} ticks={g.ticks} onTick={g.tick} onSetStatus={g.setStatus} onGo={g.go} onFinish={() => g.setDone(true)} onOpenWizard={g.setWizard} onOpenFlat={() => { g.setFlat(true); g.openTask('wheels'); }} onOpenWheels={() => { g.setFlat(false); g.openTask('wheels'); }} />
          )}
        </div>
      </div>
      <CareTasks t={t} care={care} today={today} open={g.task} onToggle={(next) => g.setTask(g.task === next ? null : next)} />
      {g.task && <TaskPanel props={props} task={g.task} flat={g.flat} onFlat={g.setFlat} onStep={g.toNode} onTask={g.openTask} onWizard={g.setWizard} />}
    </div>
  );
};
