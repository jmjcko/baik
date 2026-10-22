'use client';

import React, { useState } from 'react';
import { Translations } from '@/lib/i18n/translations';
import { BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { diagnoseSymptoms } from '@/lib/engines/baikfit/diagnostics';
import type { RiderPainType, RidingDiscipline } from '@/types/baikfit';
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

interface DiagnosticReportProps {
  t: Translations;
  inseamMm: number;
  acromionWidthMm: number;
  crankLengthMm: number;
  riderWeightKg: number;
  heightCm?: number;
  discipline?: RidingDiscipline;
  currentSaddleHeightMm: number | null;
  currentBarWidthMm: number | null;
  currentPains: RiderPainType[];
  coordinates: BikeFitCoordinates;
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
  onOpen: (topic: ModalTopic) => void;
}

/** Text of the action plan step that matches a finding, so the card and the plan point at the same thing. */
function stepTextFor(t: Translations, steps: ActionStep[], id: Finding['id']): string | undefined {
  const index = steps.findIndex((step) => step.id === id);
  return index < 0 ? undefined : fill(t.diagnosticReport.actionPlan.stepLabel, { n: index + 1 });
}

const FindingsSection: React.FC<FindingsSectionProps> = ({ t, findings, input, steps, onOpen }) => (
  <section className="space-y-5">
    <h2 className="text-lg font-bold text-ink tracking-tight">{t.diagnosticReport.criticalAlertsTitle}</h2>
    {findings.map((finding) => (
      <FindingCard
        key={finding.id}
        finding={finding}
        learnMore={t.diagnosticReport.learnMoreButton}
        onLearnMore={() => onOpen(finding.modal)}
        stepText={stepTextFor(t, steps, finding.id)}
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
  return {
    input,
    findings: buildFindings(t, input),
    steps: buildActionPlan(t, input),
    links: symptomLinksFor(currentPains, input),
  };
}

export const DiagnosticReport: React.FC<DiagnosticReportProps> = (props) => {
  const { t, coordinates, currentPains } = props;
  const [activeModal, setActiveModal] = useState<ModalTopic>(null);
  const { input, findings, steps, links } = useReportModel(props);

  return (
    <div className="max-w-6xl mx-auto py-4 space-y-10">
      <ReportHeader
        t={t}
        stepCount={steps.length}
        linkedSymptomCount={links.length}
        onEditMeasurements={props.onEditMeasurements}
        onOpenCadStudio={props.onOpenCadStudio}
      />
      <ActionPlan t={t} steps={steps} />
      <SymptomLinkage t={t} links={links} input={input} />
      <TargetNumbers t={t} coordinates={coordinates} input={input} discipline={props.discipline ?? 'road'} />
      <FindingsSection t={t} findings={findings} input={input} steps={steps} onOpen={setActiveModal} />
      <DiagnosisPanel t={t} ids={diagnoseSymptoms(currentPains)} onLearnMore={() => setActiveModal('nerveFlossing')} />
      <ReportCta t={t} onOpenCadStudio={props.onOpenCadStudio} />
      <ReportModal t={t} topic={activeModal} onClose={() => setActiveModal(null)} />
    </div>
  );
};
