'use client';

import React, { useState } from 'react';
import { Translations } from '@/lib/i18n/translations';
import { BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { diagnoseSymptoms } from '@/lib/engines/baikfit/diagnostics';
import type { RiderPainType } from '@/types/baikfit';
import { EducationalModal, ModalTopic } from './EducationalModal';
import { buildFindings, type Finding, type FindingInput } from './reportFindings';
import { buildActionPlan } from './buildActionPlan';
import { ActionPlan } from './ActionPlan';
import { schematicFor } from './schematics';
import { SymptomLinkage, symptomLinksFor } from './SymptomLinkage';
import { CoordinateSummary, DiagnosisPanel, FindingCard, ReportCta, ReportHeader } from './ReportParts';

interface DiagnosticReportProps {
  t: Translations;
  inseamMm: number;
  acromionWidthMm: number;
  crankLengthMm: number;
  riderWeightKg: number;
  heightCm?: number;
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
  onOpen: (topic: ModalTopic) => void;
}

const FindingsSection: React.FC<FindingsSectionProps> = ({ t, findings, input, onOpen }) => (
  <div className="space-y-6">
    <h2 className="text-sm font-mono uppercase tracking-wider text-slate-400">{t.diagnosticReport.criticalAlertsTitle}</h2>
    {findings.map((finding) => (
      <FindingCard
        key={finding.id}
        finding={finding}
        learnMore={t.diagnosticReport.learnMoreButton}
        onLearnMore={() => onOpen(finding.modal)}
        schematic={schematicFor(finding.id, t, input)}
      />
    ))}
  </div>
);

export const DiagnosticReport: React.FC<DiagnosticReportProps> = (props) => {
  const { t, coordinates, currentPains } = props;
  const [activeModal, setActiveModal] = useState<ModalTopic>(null);
  const input: FindingInput = { ...props, saddleHeightMm: coordinates.saddle.heightAlongTubeMm };
  const findings = buildFindings(t, input);
  const modal = modalCopy(t.diagnosticReport.modals, activeModal);

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <ReportHeader t={t} onEditMeasurements={props.onEditMeasurements} onOpenCadStudio={props.onOpenCadStudio} />
      <CoordinateSummary t={t} coordinates={coordinates} onLemond={() => setActiveModal('lemond')} />
      <p className="text-[11px] font-mono text-slate-500 -mt-5 mb-8">{t.studio.estimateNote}</p>
      <ActionPlan t={t} steps={buildActionPlan(t, input)} />
      <FindingsSection t={t} findings={findings} input={input} onOpen={setActiveModal} />
      <SymptomLinkage t={t} links={symptomLinksFor(currentPains, input)} input={input} />
      <DiagnosisPanel t={t} ids={diagnoseSymptoms(currentPains)} onLearnMore={() => setActiveModal('nerveFlossing')} />
      <ReportCta t={t} onOpenCadStudio={props.onOpenCadStudio} />
      <EducationalModal
        topic={activeModal}
        title={modal.title}
        description={modal.desc}
        badge={t.diagnosticReport.evidenceBadge}
        closeLabel={t.diagnosticReport.closeModalButton}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
};
