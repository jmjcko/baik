'use client';

import React from 'react';
import { Translations } from '@/lib/i18n/translations';
import { GUIDES, GUIDE_STEPS, GUIDE_TEXT_KEYS, type GuideType } from './guides';
import { GuideDiagram } from './guides/GuideDiagram';

export interface MeasurementGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  guideType: GuideType | null;
  t: Translations;
}

const CloseIcon: React.FC = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ModalHeader: React.FC<{ t: Translations; title: string; onClose: () => void }> = ({ t, title, onClose }) => (
  <div className="flex items-start justify-between border-b border-slate-100 pb-4">
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="font-mono text-[10px] tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 uppercase font-semibold">
          {t.wizard.cadSchematicBadge}
        </span>
        <span className="text-xs text-slate-500 font-mono">{t.wizard.visualCadDiagramTitle}</span>
      </div>
      <h3 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h3>
    </div>
    <button
      type="button"
      data-testid="modal-close-btn"
      onClick={onClose}
      className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2.5 rounded-full transition-colors flex items-center justify-center"
      aria-label="Close"
    >
      <CloseIcon />
    </button>
  </div>
);

const BlueprintGrid: React.FC = () => (
  <svg className="absolute inset-0 w-full h-full opacity-60 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="cadGridModalLight" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#cadGridModalLight)" />
  </svg>
);

const StepList: React.FC<{ steps: readonly string[] }> = ({ steps }) => (
  <ol className="space-y-2.5">
    {steps.map((stepText, idx) => (
      <li
        key={idx}
        className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed shadow-xs"
      >
        <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
          {idx + 1}
        </span>
        <span>{stepText}</span>
      </li>
    ))}
  </ol>
);

const ClinicalNote: React.FC<{ heading: string; note: string }> = ({ heading, note }) => (
  <div className="border-l-4 border-emerald-500 bg-emerald-50/70 p-3.5 rounded-r-xl space-y-1 border border-emerald-200/60">
    <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800">{heading}</div>
    <p className="text-xs text-emerald-900 leading-relaxed">{note}</p>
  </div>
);

const ProtocolColumn: React.FC<{ t: Translations; guideType: GuideType; onClose: () => void }> = ({ t, guideType, onClose }) => {
  const keys = GUIDE_TEXT_KEYS[guideType];
  return (
    <div className="space-y-4 flex flex-col justify-between">
      <div className="space-y-3">
        {keys.intro && (
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/70">
            {t.wizard[keys.intro]}
          </p>
        )}
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">{t.wizard.guideStepHeading}</div>
        <StepList steps={t.wizard[GUIDE_STEPS[guideType]]} />
      </div>
      <ClinicalNote heading={t.wizard.clinicalEvidenceHeading} note={t.wizard[keys.clinicalNote]} />
      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
        {t.wizard.measurementPrecisionWarning}
      </div>
      <div className="pt-2">
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 px-4 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 font-semibold text-xs tracking-wider uppercase text-white transition-all shadow-sm focus:outline-none"
        >
          {t.wizard.closeGuideBtn}
        </button>
      </div>
    </div>
  );
};

export const MeasurementGuideModal: React.FC<MeasurementGuideModalProps> = ({ isOpen, onClose, guideType, t }) => {
  if (!isOpen || !guideType) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="measurement-guide-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200/90 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto text-slate-900 p-6 md:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader t={t} title={t.wizard[GUIDE_TEXT_KEYS[guideType].title]} onClose={onClose} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
          <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 flex flex-col items-center justify-center relative min-h-[380px] overflow-hidden">
            <BlueprintGrid />
            <GuideDiagram guide={GUIDES[guideType]} t={t} />
          </div>
          <ProtocolColumn t={t} guideType={guideType} onClose={onClose} />
        </div>
      </div>
    </div>
  );
};
