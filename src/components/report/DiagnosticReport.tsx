'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Translations, type Locale } from '@/lib/i18n/translations';
import { BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { diagnoseSymptoms } from '@/lib/engines/baikfit/diagnostics';
import type { RiderPainType, RidingDiscipline, RidingStyle } from '@/types/baikfit';
import type { StockSelection } from '@/lib/bikes/types';
import { StockBikeAudit } from './stock/StockBikeAudit';
import { useRecordDiagnosis } from './stock/useRecordDiagnosis';
import type { BikeDiagnosis } from '@/lib/passport/types';
import { buildStockAudit, reportValues } from './stock/buildStockAudit';
import { EducationalModal, ModalTopic } from './EducationalModal';
import { buildFindings, type Finding, type FindingInput } from './reportFindings';
import { buildActionPlan, type ActionStep } from './buildActionPlan';
import { fill } from '@/lib/i18n/format';
import { ActionPlan } from './ActionPlan';
import { schematicFor } from './schematics';
import { HowToGuide } from './HowToGuide';
import { buildHowTo } from './buildHowTo';
import { SymptomLinkage, symptomLinksFor } from './SymptomLinkage';
import { DiagnosisPanel, FindingCard, ReportCta } from './ReportParts';
import { TargetNumbers } from './TargetNumbers';
import { ReportHeader } from './ReportHeader';
import { ReportPrintSheet } from './ReportPrintSheet';
import { SignInOffer } from '@/components/auth/SignInOffer';
import { buildSummary } from './buildSummary';
import { usePrintReport } from '@/lib/hooks/usePrintReport';

interface DiagnosticReportProps {
  t: Translations;
  inseamMm: number;
  acromionWidthMm: number;
  crankLengthMm: number;
  riderWeightKg: number;
  heightCm?: number;
  torsoLengthMm?: number;
  armLengthMm?: number;
  discipline?: RidingDiscipline;
  ridingStyle?: RidingStyle;
  /** The bike has its original factory setup: the stock bike audit is shown and the handlebar and crank findings move into it. */
  stockBike?: StockSelection | null;
  locale?: Locale;
  currentSaddleHeightMm: number | null;
  currentBarWidthMm: number | null;
  currentPains: RiderPainType[];
  coordinates: BikeFitCoordinates;
  /** What the last report of this bike showed, and the way to store what this one shows (the garage of the profile keeps it). */
  lastDiagnosis?: BikeDiagnosis | null;
  onDiagnosis?: (diagnosis: BikeDiagnosis) => void;
  onOpenCadStudio: () => void;
  onEditMeasurements: () => void;
}

type ModalCopy = Translations['diagnosticReport']['modals'];

function modalCopy(modals: ModalCopy, topic: ModalTopic): { title: string; desc: string } {
  switch (topic) {
    case 'lemond':
      return { title: modals.lemondTitle, desc: modals.lemondDesc };
    case 'ulnar':
      return { title: modals.ulnarTitle, desc: modals.ulnarDesc };
    case 'nerveFlossing':
      return { title: modals.nerveFlossingTitle, desc: modals.nerveFlossingDesc };
    case 'crank':
      return { title: modals.crankTitle, desc: modals.crankDesc };
    default:
      return { title: '', desc: '' };
  }
}

interface FindingsSectionProps {
  t: Translations;
  findings: Finding[];
  input: FindingInput;
  steps: ActionStep[];
  highlightedId: string | null;
  onOpen: (topic: ModalTopic) => void;
}

/** Text of the action plan step that matches a finding, so the card and the plan point at the same thing. */
function stepTextFor(t: Translations, steps: ActionStep[], id: Finding['id']): string | undefined {
  const index = steps.findIndex((step) => step.id === id);
  return index < 0 ? undefined : fill(t.diagnosticReport.actionPlan.stepLabel, { n: index + 1 });
}

const FindingsSection: React.FC<FindingsSectionProps> = ({ t, findings, input, steps, highlightedId, onOpen }) => (
  <section id="report-details" className="space-y-5">
    <h2 className="text-lg font-bold text-ink tracking-tight">{t.diagnosticReport.criticalAlertsTitle}</h2>
    {findings.map((finding) => (
      <FindingCard
        key={finding.id}
        finding={finding}
        learnMore={t.diagnosticReport.learnMoreButton}
        onLearnMore={() => onOpen(finding.modal)}
        stepText={stepTextFor(t, steps, finding.id)}
        highlighted={highlightedId === finding.id}
        schematic={schematicFor(finding.id, t, input)}
        howTo={<HowToGuide t={t} id={finding.id} guide={buildHowTo(t, finding.id, input)} />}
      />
    ))}
  </section>
);

const ReportModal: React.FC<{ t: Translations; topic: ModalTopic; onClose: () => void }> = ({ t, topic, onClose }) => {
  const modal = modalCopy(t.diagnosticReport.modals, topic);
  return (
    <EducationalModal
      topic={topic}
      title={modal.title}
      description={modal.desc}
      badge={t.diagnosticReport.evidenceBadge}
      closeLabel={t.diagnosticReport.closeModalButton}
      onClose={onClose}
    />
  );
};

/** Findings, action plan and linked symptoms of the report, derived from the rider data and the KB rules. */
function useReportModel(props: DiagnosticReportProps) {
  const input: FindingInput = { ...props, saddleHeightMm: props.coordinates.saddle.heightAlongTubeMm };
  const { t, currentPains } = props;
  const stock = buildStockAudit(t, props.locale ?? 'en', props.stockBike ?? null, reportValues(props));
  useRecordDiagnosis(stock, props.lastDiagnosis, props.onDiagnosis);
  /* With the factory setup known, the handlebar and the crank are judged in the stock bike audit only. */
  const keep = (id: string) => !stock || (id !== 'handlebar' && id !== 'crank');
  return {
    input,
    stock,
    findings: buildFindings(t, input).filter((finding) => keep(finding.id)),
    steps: buildActionPlan(t, input).filter((step) => keep(step.id)),
    links: symptomLinksFor(currentPains, input),
  };
}

/** One-page summary for the PDF export: its rows and the print action (the browser offers "Save as PDF"). */
function usePrintSheet(props: DiagnosticReportProps, input: FindingInput) {
  const { printedOn, print } = usePrintReport(props.t.diagnosticReport.summary.fileName);
  const summary = buildSummary(props.t, { ...input, ...props, discipline: props.discipline ?? 'road' });
  return { printedOn, print, summary };
}

const HIGHLIGHT_MS = 1600;

/** Scrolls the report to a section or card and briefly highlights a finding card (respects reduced motion). */
function useReportJump() {
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const jump = (elementId: string, highlightId?: string) => {
    const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(elementId)?.scrollIntoView?.({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    if (!highlightId) return;
    clearTimeout(timer.current);
    setHighlightedId(highlightId);
    timer.current = setTimeout(() => setHighlightedId(null), HIGHLIGHT_MS);
  };
  return { highlightedId, jump };
}

/** The action plan with the offer to sign in above it (shown to guests only). */
const PlanWithOffer: React.FC<{ t: Translations; steps: ActionStep[]; onShowDetail: (id: ActionStep['id']) => void }> = ({ t, steps, onShowDetail }) => (
  <>
    <SignInOffer t={t} variant="report" />
    <ActionPlan t={t} steps={steps} onShowDetail={onShowDetail} />
  </>
);

interface LowerSectionsProps {
  props: DiagnosticReportProps;
  input: FindingInput;
  stock: ReturnType<typeof buildStockAudit>;
  onLearnMore: () => void;
}

/** The sections under the findings: the stock bike audit (when the factory setup is known), the target numbers, the diagnosis and the call to the studio. */
const LowerSections: React.FC<LowerSectionsProps> = ({ props, input, stock, onLearnMore }) => (
  <>
    {stock && <StockBikeAudit t={props.t} view={stock} />}
    <TargetNumbers t={props.t} coordinates={props.coordinates} input={input} discipline={props.discipline ?? 'road'} />
    <DiagnosisPanel t={props.t} ids={diagnoseSymptoms(props.currentPains)} onLearnMore={onLearnMore} />
    <ReportCta t={props.t} onOpenCadStudio={props.onOpenCadStudio} />
  </>
);

export const DiagnosticReport: React.FC<DiagnosticReportProps> = (props) => {
  const { t } = props;
  const [activeModal, setActiveModal] = useState<ModalTopic>(null);
  const { input, stock, findings, steps, links } = useReportModel(props);
  const { highlightedId, jump } = useReportJump();

  const { printedOn, print, summary } = usePrintSheet(props, input);

  return (
    <>
    <div className="max-w-6xl mx-auto py-4 space-y-10 print:hidden">
      <ReportHeader
        t={t}
        stepCount={steps.length}
        linkedSymptomCount={links.length}
        onJump={jump}
        onEditMeasurements={props.onEditMeasurements}
        onOpenCadStudio={props.onOpenCadStudio}
        onExportPdf={print}
      />
      <PlanWithOffer t={t} steps={steps} onShowDetail={(id) => jump(`finding-${id}`, id)} />
      <SymptomLinkage t={t} links={links} input={input} />
      <FindingsSection t={t} findings={findings} input={input} steps={steps} highlightedId={highlightedId} onOpen={setActiveModal} />
      <LowerSections props={props} input={input} stock={stock} onLearnMore={() => setActiveModal('nerveFlossing')} />
      <ReportModal t={t} topic={activeModal} onClose={() => setActiveModal(null)} />
    </div>
    <ReportPrintSheet t={t} summary={summary} steps={steps} printedOn={printedOn} />
    </>
  );
};
