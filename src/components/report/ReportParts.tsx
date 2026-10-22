import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type { BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import type { DiagnosisId } from '@/lib/engines/baikfit/diagnostics';
import type { Finding, FindingTone } from './reportFindings';

interface ToneStyle {
  card: string;
  badge: string;
  link: string;
  action: string;
}

const TONE_STYLES: Record<FindingTone, ToneStyle> = {
  danger: {
    card: 'border-rose-500/40 bg-rose-950/20',
    badge: 'border-rose-500/50 text-rose-300 bg-rose-950/60',
    link: 'text-rose-400 hover:text-rose-300',
    action: 'border-rose-500/30 bg-rose-950/30 text-rose-200',
  },
  info: {
    card: 'border-cyan-500/40 bg-slate-900/90',
    badge: 'border-cyan-500/50 text-cyan-300 bg-cyan-950/60',
    link: 'text-cyan-400 hover:text-cyan-300',
    action: '',
  },
  warning: {
    card: 'border-amber-500/40 bg-amber-950/20',
    badge: 'border-amber-500/50 text-amber-300 bg-amber-950/60',
    link: 'text-amber-400 hover:text-amber-300',
    action: 'border-amber-500/30 bg-amber-950/30 text-amber-200',
  },
};

export const ReportHeader: React.FC<{
  t: Translations;
  onEditMeasurements: () => void;
  onOpenCadStudio: () => void;
}> = ({ t, onEditMeasurements, onOpenCadStudio }) => (
  <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
    <div>
      <div className="font-mono text-xs text-cyan-400 tracking-wider uppercase mb-1">{t.diagnosticReport.auditBadge}</div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{t.diagnosticReport.title}</h1>
      <p className="text-slate-400 text-xs md:text-sm mt-1">{t.diagnosticReport.subtitle}</p>
    </div>
    <div className="flex items-center gap-3">
      <button
        onClick={onEditMeasurements}
        className="px-4 py-2 rounded-lg font-mono text-xs font-semibold text-slate-300 border border-slate-700 hover:border-slate-500 bg-slate-900 transition-colors"
      >
        {t.diagnosticReport.editInputsButton}
      </button>
      <button
        onClick={onOpenCadStudio}
        className="px-5 py-2 rounded-lg font-mono text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-500/20 active:scale-[0.99]"
      >
        {t.diagnosticReport.openCadButton}
      </button>
    </div>
  </div>
);

const CoordinateCard: React.FC<{
  label: string;
  value: number;
  valueClass: string;
  children: React.ReactNode;
}> = ({ label, value, valueClass, children }) => (
  <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80">
    <span className="font-mono text-xs text-slate-400 uppercase block mb-1">{label}</span>
    <div className="flex items-baseline gap-1">
      <span className={`text-2xl font-bold font-mono ${valueClass}`}>{value}</span>
      <span className="text-xs font-mono text-slate-400">mm</span>
    </div>
    {children}
  </div>
);

const NOTE_CLASS = 'text-[11px] font-mono text-slate-500 mt-2 block';

export const CoordinateSummary: React.FC<{ t: Translations; coordinates: BikeFitCoordinates; onLemond: () => void }> = ({
  t,
  coordinates,
  onLemond,
}) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
    <CoordinateCard label={t.studio.saddleY} value={coordinates.saddle.heightAlongTubeMm} valueClass="text-cyan-400">
      <button onClick={onLemond} className="text-[11px] font-mono text-cyan-500 hover:underline mt-2 block">
        {t.diagnosticReport.lemondRef}
      </button>
    </CoordinateCard>
    <CoordinateCard label={t.studio.saddleX} value={coordinates.saddle.setbackXMm} valueClass="text-cyan-400">
      <span className={NOTE_CLASS}>{t.diagnosticReport.datumNote}</span>
    </CoordinateCard>
    <CoordinateCard label={t.studio.stack} value={coordinates.cockpit.stackYMm} valueClass="text-teal-400">
      <span className={NOTE_CLASS}>{t.diagnosticReport.stackNote}</span>
    </CoordinateCard>
    <CoordinateCard label={t.studio.reach} value={coordinates.cockpit.reachXMm} valueClass="text-teal-400">
      <span className={NOTE_CLASS}>{t.diagnosticReport.reachNote}</span>
    </CoordinateCard>
  </div>
);

interface FindingCardProps {
  finding: Finding;
  learnMore: string;
  onLearnMore: () => void;
  /** Vector schematic that illustrates the adjustment. */
  schematic?: React.ReactNode;
}

export const FindingCard: React.FC<FindingCardProps> = ({ finding, learnMore, onLearnMore, schematic }) => {
  const tone = TONE_STYLES[finding.tone];
  return (
    <div className={`p-6 rounded-xl border shadow-lg ${tone.card}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`font-mono text-xs uppercase px-2 py-0.5 rounded border font-semibold ${tone.badge}`}>{finding.badge}</span>
        <button onClick={onLearnMore} className={`font-mono text-xs underline ${tone.link}`}>
          {learnMore}
        </button>
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{finding.title}</h3>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">{finding.body}</p>
      {schematic}
      {finding.action && (
        <div className={`p-3 rounded-lg border font-mono text-xs ${tone.action}`}>{finding.action}</div>
      )}
    </div>
  );
};

const DiagnosisCard: React.FC<{ t: Translations; id: DiagnosisId; onLearnMore: () => void }> = ({ t, id, onLearnMore }) => {
  const item = t.diagnosis.items[id];
  const isNerve = id === 'ulnar' || id === 'median';
  return (
    <div data-testid={`diagnosis-${id}`} className="p-5 rounded-xl border border-slate-700 bg-slate-900/80 space-y-3">
      <h3 className="text-base font-bold text-white">{item.title}</h3>
      <p className="text-xs text-slate-300 leading-relaxed">
        <span className="font-mono text-teal-300 uppercase">{t.diagnosis.rootCauseLabel}: </span>
        {item.rootCause}
      </p>
      <div className="text-xs text-slate-300">
        <span className="font-mono text-teal-300 uppercase block mb-1">{t.diagnosis.fixesLabel}</span>
        <ol className="list-decimal pl-5 space-y-1 leading-relaxed">
          {item.fixes.map((fix) => (
            <li key={fix}>{fix}</li>
          ))}
        </ol>
      </div>
      {isNerve && (
        <button onClick={onLearnMore} className="font-mono text-xs text-teal-400 hover:text-teal-300 underline">
          {t.diagnosis.learnMore}
        </button>
      )}
    </div>
  );
};

export const DiagnosisPanel: React.FC<{ t: Translations; ids: DiagnosisId[]; onLearnMore: () => void }> = ({ t, ids, onLearnMore }) => (
  <div className="space-y-4 mt-6">
    <h2 className="text-sm font-mono uppercase tracking-wider text-slate-400">{t.diagnosis.heading}</h2>
    {ids.length === 0 && <p className="text-xs text-slate-400 leading-relaxed">{t.diagnosis.noSymptoms}</p>}
    {ids.map((id) => (
      <DiagnosisCard key={id} t={t} id={id} onLearnMore={onLearnMore} />
    ))}
  </div>
);

export const ReportCta: React.FC<{ t: Translations; onOpenCadStudio: () => void }> = ({ t, onOpenCadStudio }) => (
  <div className="mt-12 p-6 rounded-xl border border-slate-800 bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
    <div>
      <h3 className="text-base font-bold text-white">{t.diagnosticReport.ctaTitle}</h3>
      <p className="text-xs text-slate-400">{t.diagnosticReport.ctaBody}</p>
    </div>
    <button
      onClick={onOpenCadStudio}
      className="whitespace-nowrap px-6 py-3 rounded-lg font-mono text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-500/20"
    >
      {t.diagnosticReport.openCadButton}
    </button>
  </div>
);
