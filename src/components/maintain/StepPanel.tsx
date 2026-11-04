'use client';

import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { cx } from '@/lib/classNames';
import type { WireframeKind } from '@/components/studio/wireframe/geometry';
import type { WizardId } from '@/lib/engines/baikcare/troubleshooting';
import { videoFor } from '@/lib/care/videoGuides';
import { VideoStepButton } from '@/components/video/VideoStepButton';
import type { BikeCare, NodeStatus } from '@/types/maintain';
import { CHECK_STEPS, dateOfStep, nameOfStep, shortDay, statusOfStep, toolsOfStep, type CheckStep } from './checkSteps';
import { NodeDiagram } from './NodeDiagram';
import { ResultButtons } from './ResultButtons';
import { STATUS_VIEW } from './statusView';
import { TyreDiagram } from './TyreDiagram';
import type { AreaTool } from './workshopAreas';

interface StepPanelProps {
  t: Translations;
  care: BikeCare;
  kind: WireframeKind;
  index: number;
  ticks: number[];
  onTick: (item: number, checked: boolean) => void;
  onSetStatus: (status: NodeStatus) => void;
  onGo: (index: number) => void;
  onFinish: () => void;
  onOpenWizard: (wizard: WizardId) => void;
  onOpenFlat: () => void;
  onOpenWheels: () => void;
}

/** What to do at a step, as lines to tick: the numbered checks of a node, or the four checks of a tyre and its rim. */
function todoOf(t: Translations, step: CheckStep): string[] {
  if (step.kind === 'node') return t.care.nodes[String(step.node) as '1'].steps;
  return t.wheels.wear.items.map((item) => `${item.title}: ${item.body}`);
}

const introOf = (t: Translations, step: CheckStep): string => (step.kind === 'node' ? t.care.nodes[String(step.node) as '1'].intro : t.wheels.points.intro);

const ToolButton: React.FC<{ t: Translations; tool: AreaTool; onRun: () => void }> = ({ t, tool, onRun }) => (
  <button type="button" onClick={onRun} data-testid={`related-${tool.kind === 'wizard' ? tool.wizard : tool.kind}`} className="min-h-10 px-4 py-1.5 rounded-full border border-line bg-surface text-sm font-semibold text-accent-ink hover:bg-sunken transition-colors text-left">
    {tool.kind === 'wizard' ? t.workshop.troubleshooter.wizardNames[tool.wizard] : tool.kind === 'flat' ? t.wheels.points.openFlat : t.care.guide.openWheels}
  </button>
);

const Tools: React.FC<Pick<StepPanelProps, 't' | 'onOpenWizard' | 'onOpenFlat' | 'onOpenWheels'> & { step: CheckStep }> = ({ t, step, onOpenWizard, onOpenFlat, onOpenWheels }) => {
  const tools = toolsOfStep(step);
  if (tools.length === 0) return null;
  const run = (tool: AreaTool) => (tool.kind === 'wizard' ? onOpenWizard(tool.wizard) : tool.kind === 'flat' ? onOpenFlat() : onOpenWheels());
  return (
    <div className="space-y-2" data-testid="step-tools">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-3">{t.care.guide.related}</h3>
      <div className="flex flex-wrap gap-2">{tools.map((tool) => <ToolButton key={tool.kind === 'wizard' ? tool.wizard : tool.kind} t={t} tool={tool} onRun={() => run(tool)} />)}</div>
    </div>
  );
};

const TodoList: React.FC<{ t: Translations; items: string[]; ticks: number[]; onTick: StepPanelProps['onTick'] }> = ({ t, items, ticks, onTick }) => (
  <div className="space-y-2">
    <h3 className="text-sm font-bold text-ink">{t.care.guide.whatToDo}</h3>
    <ul data-testid="step-todo" className="divide-y divide-line">
      {items.map((item, i) => (
        <li key={item}>
          <label className="grid grid-cols-[30px_1fr] gap-3 py-2.5 cursor-pointer">
            <input type="checkbox" checked={ticks.includes(i)} onChange={(e) => onTick(i, e.target.checked)} className="mt-0.5 h-5 w-5 accent-blue-600" />
            <span className={cx('text-sm leading-relaxed', ticks.includes(i) ? 'text-ink-3 line-through' : 'text-ink')}>{item}</span>
          </label>
        </li>
      ))}
    </ul>
  </div>
);

const StepHeader: React.FC<{ t: Translations; care: BikeCare; step: CheckStep; index: number }> = ({ t, care, step, index }) => {
  const status = statusOfStep(care, step);
  const date = dateOfStep(care, step);
  const { Icon, tone } = STATUS_VIEW[status];
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-ink-3">{fill(t.care.guide.stepOf, { n: index + 1, total: CHECK_STEPS.length })}</p>
        <h2 className="text-xl font-bold text-ink tracking-tight mt-0.5">{nameOfStep(t, step)}</h2>
        <p className="text-sm text-ink-2 leading-relaxed mt-1">{introOf(t, step)}</p>
      </div>
      {status !== 'unchecked' && (
        <span className={cx('inline-flex items-center gap-1.5 h-7 px-3 rounded-full border text-xs font-semibold shrink-0', tone)}>
          <Icon aria-hidden="true" className="w-3.5 h-3.5" />
          {t.care.status[status]}{date ? ` · ${shortDay(date)}` : ''}
        </span>
      )}
    </div>
  );
};

/** Where the place is on the bike (or the tyre), as a drawing and, for a node, the video; folded, so the step stays short. */
const Where: React.FC<{ t: Translations; step: CheckStep; kind: WireframeKind }> = ({ t, step, kind }) => (
  <details className="rounded-xl border border-line">
    <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-ink-2">{step.kind === 'node' ? fill(t.care.node.diagramLabel, { n: step.node }) : t.wheels.points[step.wheel]}</summary>
    <div className="p-4 space-y-3">
      {step.kind === 'node' ? <NodeDiagram t={t} node={step.node} kind={kind} /> : <TyreDiagram t={t} wheel={step.wheel} kind={kind} />}
      {step.kind === 'node' && <VideoStepButton t={t} video={videoFor('mcheck', step.node)} />}
    </div>
  </details>
);

/** What is saved when the result is picked, said in a sentence. */
const Saved: React.FC<{ t: Translations; care: BikeCare; step: CheckStep }> = ({ t, care, step }) => {
  const status = statusOfStep(care, step);
  const date = dateOfStep(care, step);
  return (
    <div className="rounded-xl border border-dashed border-line bg-sunken p-4 space-y-1" data-testid="step-saved">
      <h3 className="text-sm font-bold text-ink">{t.care.guide.whatSaved}</h3>
      <p className="text-xs text-ink-2 leading-relaxed">{status === 'unchecked' ? t.care.guide.savedNone : fill(t.care.guide.savedLine, { name: nameOfStep(t, step), status: t.care.status[status], date: date ? shortDay(date) : '' })}</p>
    </div>
  );
};

/** Back and the next step (the last step finishes the check). */
const StepNav: React.FC<Pick<StepPanelProps, 't' | 'index' | 'onGo' | 'onFinish'>> = ({ t, index, onGo, onFinish }) => {
  const last = index === CHECK_STEPS.length - 1;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <button type="button" disabled={index === 0} onClick={() => onGo(index - 1)} data-testid="step-back" className="h-12 px-6 rounded-full border border-line bg-surface text-sm font-semibold text-ink-2 hover:bg-sunken disabled:opacity-50 disabled:cursor-not-allowed">{t.care.guide.back}</button>
      <button type="button" onClick={() => (last ? onFinish() : onGo(index + 1))} data-testid="step-next" className="h-12 px-6 rounded-full bg-blue-600 text-slate-50 text-sm font-semibold hover:bg-blue-700 transition-colors">{last ? t.care.guide.finish : t.care.guide.next}</button>
    </div>
  );
};

/** One step of the guided check: what to do (lines to tick), what was found (the result), what is saved, and the way on. */
export const StepPanel: React.FC<StepPanelProps> = (props) => {
  const { t, care, kind, index } = props;
  const step = CHECK_STEPS[index];
  return (
    <section data-testid="step-panel" data-step={index} aria-label={nameOfStep(t, step)} className="rounded-2xl border border-line bg-surface p-6 shadow-sm space-y-6">
      <StepHeader t={t} care={care} step={step} index={index} />
      <TodoList t={t} items={todoOf(t, step)} ticks={props.ticks} onTick={props.onTick} />
      <Where t={t} step={step} kind={kind} />
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-ink">{t.care.guide.whatFound}</h3>
        <ResultButtons t={t} status={statusOfStep(care, step)} onSetStatus={props.onSetStatus} testPrefix={step.kind === 'node' ? 'node' : 'tyre'} showLabel={false} />
      </div>
      <Saved t={t} care={care} step={step} />
      <Tools t={t} step={step} onOpenWizard={props.onOpenWizard} onOpenFlat={props.onOpenFlat} onOpenWheels={props.onOpenWheels} />
      <StepNav t={t} index={index} onGo={props.onGo} onFinish={props.onFinish} />
    </section>
  );
};
