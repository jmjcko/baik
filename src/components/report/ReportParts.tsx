import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
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
    card: 'border-tone-danger-line bg-tone-danger-bg',
    badge: 'border-tone-danger-line text-tone-danger-ink bg-tone-danger-badge',
    link: 'text-tone-danger-ink hover:underline',
    action: 'border-tone-danger-line bg-tone-danger-badge text-tone-danger-ink',
  },
  info: {
    card: 'border-tone-info-line bg-surface',
    badge: 'border-tone-info-line text-tone-info-ink bg-tone-info-badge',
    link: 'text-accent-ink hover:underline',
    action: 'border-tone-info-line bg-tone-info-badge text-tone-info-ink',
  },
  warning: {
    card: 'border-tone-warning-line bg-tone-warning-bg',
    badge: 'border-tone-warning-line text-tone-warning-ink bg-tone-warning-badge',
    link: 'text-tone-warning-ink hover:underline',
    action: 'border-tone-warning-line bg-tone-warning-badge text-tone-warning-ink',
  },
};

interface FindingCardProps {
  finding: Finding;
  learnMore: string;
  onLearnMore: () => void;
  /** Number of the matching step in the action plan. */
  stepText?: string;
  /** Vector schematic that illustrates the adjustment. */
  schematic?: React.ReactNode;
  /** Expandable how-to guide shown under the card content. */
  howTo?: React.ReactNode;
}

const FindingHeader: React.FC<Omit<FindingCardProps, 'schematic' | 'howTo'>> = ({ finding, learnMore, onLearnMore, stepText }) => {
  const tone = TONE_STYLES[finding.tone];
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
      <div className="flex flex-wrap items-center gap-2">
        {stepText && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-600 text-slate-50">{stepText}</span>}
        <span className={`text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full border font-semibold ${tone.badge}`}>{finding.badge}</span>
      </div>
      {finding.modal && (
        <button onClick={onLearnMore} className={`text-sm font-semibold ${tone.link}`}>
          {learnMore}
        </button>
      )}
    </div>
  );
};

export const FindingCard: React.FC<FindingCardProps> = ({ schematic, howTo, ...header }) => {
  const { finding } = header;
  const tone = TONE_STYLES[finding.tone];
  return (
    <div className={`p-6 rounded-2xl border shadow-sm ${tone.card}`}>
      <FindingHeader {...header} />
      <div className={schematic ? 'grid lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] gap-6 items-start' : ''}>
        <div>
          <h3 className="text-xl font-bold text-ink tracking-tight mb-2">{finding.title}</h3>
          <p className="text-sm text-ink-2 leading-relaxed">{finding.body}</p>
          {finding.action && <div className={`mt-4 p-3 rounded-xl border text-sm font-medium ${tone.action}`}>{finding.action}</div>}
        </div>
        {schematic}
      </div>
      {howTo}
    </div>
  );
};

const DiagnosisFixes: React.FC<{ label: string; fixes: string[] }> = ({ label, fixes }) => (
  <div className="text-sm text-ink-2">
    <span className="font-semibold text-teal-ink block mb-1">{label}</span>
    <ol className="list-decimal pl-5 space-y-1 leading-relaxed">
      {fixes.map((fix) => (
        <li key={fix}>{fix}</li>
      ))}
    </ol>
  </div>
);

const DiagnosisCard: React.FC<{ t: Translations; id: DiagnosisId; onLearnMore: () => void }> = ({ t, id, onLearnMore }) => {
  const item = t.diagnosis.items[id];
  const isNerve = id === 'ulnar' || id === 'median';
  return (
    <details data-testid={`diagnosis-${id}`} className="group rounded-2xl border border-line bg-surface">
      <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-3 text-base font-bold text-ink">
        <span>{item.title}</span>
        <span aria-hidden="true" className="text-ink-3 text-sm transition-transform group-open:rotate-180">▾</span>
      </summary>
      <div className="px-5 pb-5 space-y-3">
        <p className="text-sm text-ink-2 leading-relaxed">
          <span className="font-semibold text-teal-ink">{t.diagnosis.rootCauseLabel}: </span>
          {item.rootCause}
        </p>
        <DiagnosisFixes label={t.diagnosis.fixesLabel} fixes={item.fixes} />
        {isNerve && (
          <button onClick={onLearnMore} className="text-sm font-semibold text-teal-ink hover:underline">
            {t.diagnosis.learnMore}
          </button>
        )}
      </div>
    </details>
  );
};

export const DiagnosisPanel: React.FC<{ t: Translations; ids: DiagnosisId[]; onLearnMore: () => void }> = ({ t, ids, onLearnMore }) => (
  <section className="space-y-3">
    <h2 className="text-lg font-bold text-ink tracking-tight">{t.diagnosis.heading}</h2>
    {ids.length === 0 && <p className="text-sm text-ink-2 leading-relaxed">{t.diagnosis.noSymptoms}</p>}
    {ids.map((id) => (
      <DiagnosisCard key={id} t={t} id={id} onLearnMore={onLearnMore} />
    ))}
  </section>
);

export const ReportCta: React.FC<{ t: Translations; onOpenCadStudio: () => void }> = ({ t, onOpenCadStudio }) => (
  <section className="p-6 rounded-2xl border border-line bg-surface flex flex-col sm:flex-row items-center justify-between gap-4">
    <div>
      <h3 className="text-lg font-bold text-ink">{t.diagnosticReport.ctaTitle}</h3>
      <p className="text-sm text-ink-2 mt-0.5">{t.diagnosticReport.ctaBody}</p>
    </div>
    <button
      onClick={onOpenCadStudio}
      className="whitespace-nowrap h-12 px-6 rounded-full text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-slate-50 shadow-sm transition-colors"
    >
      {t.diagnosticReport.openCadButton}
    </button>
  </section>
);
