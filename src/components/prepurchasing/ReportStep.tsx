import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type { PrePurchaseAnalysisResponse } from '@/types/baikfit';
import { AlternativesCard, ChecklistCard, ProsConsCard, TrapsCard } from './ReportCards';
import { buildVerdictRows, type VerdictRider } from './verdicts';
import type { IntakeValues } from './auditState';

const PILL = 'px-3.5 py-1.5 rounded-full font-mono text-xs text-ink-2 border border-line hover:border-line bg-sunken hover:bg-sunken transition-colors';

function signed(value: number): string | number {
  return value > 0 ? `+${value}` : value;
}

const MetricsRow: React.FC<{ t: Translations; analysis: PrePurchaseAnalysisResponse }> = ({ t, analysis }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-50 shadow-md">
      <div className="text-xs font-mono text-emerald-100 uppercase tracking-wide mb-1 font-semibold">{t.prePurchaseAudit.fitScoreLabel}</div>
      <div className="text-3xl font-extrabold font-mono text-slate-50">{analysis.fitMatchScore}%</div>
    </div>
    <div className="p-5 rounded-2xl border border-line bg-sunken">
      <div className="text-xs font-mono text-ink-3 uppercase tracking-wide mb-1">{t.prePurchaseAudit.recommendedSizeLabel}</div>
      <div className="text-2xl font-bold font-mono text-ink">{analysis.recommendedFrameSize}</div>
    </div>
    <div className="p-5 rounded-2xl border border-line bg-sunken">
      <div className="text-xs font-mono text-ink-3 uppercase tracking-wide mb-1">{t.prePurchaseAudit.stackReachDeltaLabel}</div>
      <div className="text-sm font-mono font-semibold text-ink">
        {t.prePurchaseAudit.stackLabel}: {signed(analysis.stackMatch.spacerDeltaMm)} mm
        <br />
        {t.prePurchaseAudit.reachLabel}: {signed(analysis.reachMatch.stemDeltaMm)} mm
      </div>
    </div>
  </div>
);

interface ReportStepProps {
  t: Translations;
  locale: 'en' | 'cs';
  analysis: PrePurchaseAnalysisResponse;
  bikeModel: string;
  values: IntakeValues;
  onEditSearch: () => void;
  onEditMorphology: () => void;
  onBackToEntry: () => void;
}

const ReportHeader: React.FC<Pick<ReportStepProps, 't' | 'bikeModel' | 'onEditSearch' | 'onEditMorphology'>> = (props) => (
  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-line pb-5 mb-5">
    <div>
      <div className="font-mono text-xs text-accent-ink uppercase tracking-wider mb-0.5 font-semibold">
        {props.t.prePurchaseAudit.auditedCandidate}: {props.bikeModel}
      </div>
      <h2 className="text-xl font-bold text-ink tracking-tight">{props.t.prePurchaseAudit.step3Title}</h2>
    </div>
    <div className="flex gap-2">
      <button type="button" onClick={props.onEditSearch} className={PILL}>{props.t.prePurchaseAudit.editSearchButton}</button>
      <button type="button" onClick={props.onEditMorphology} className={PILL}>{props.t.prePurchaseAudit.editMorphologyButton}</button>
    </div>
  </div>
);

const ReportFooter: React.FC<Pick<ReportStepProps, 't' | 'onEditSearch' | 'onBackToEntry'>> = ({ t, onEditSearch, onBackToEntry }) => (
  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-line">
    <button
      type="button"
      onClick={onEditSearch}
      className="h-12 px-6 rounded-full font-mono text-xs text-ink-2 border border-line hover:border-ink-3 bg-surface hover:bg-sunken transition-colors shadow-sm"
    >
      {t.prePurchaseAudit.editSearchButton}
    </button>
    <button
      type="button"
      onClick={onBackToEntry}
      className="h-12 px-8 rounded-full font-bold text-sm bg-blue-600 hover:bg-blue-700 text-slate-50 shadow-md transition-all"
    >
      {t.prePurchaseAudit.backToModeSelect}
    </button>
  </div>
);

/** The rider values that the verdict table needs, including the kind of bike under audit. */
const verdictRiderOf = (values: IntakeValues): VerdictRider => ({
  acromionWidthMm: values.acromionWidthMm, flexibilityScore: values.flexibility, riderWeightKg: values.riderWeightKg, heightCm: values.heightCm, bikeKind: values.bikeKind, mtbStyle: values.mtbStyle,
});

/** For a mountain bike the stack, reach and frame size are estimated from road frames: the note says to read the maker's table. */
const MtbGeometryNote: React.FC<{ t: Translations; bikeKind: IntakeValues['bikeKind'] }> = ({ t, bikeKind }) =>
  bikeKind === 'xc_mtb' ? <p className="mt-2 text-[11px] text-ink-3 leading-snug" data-testid="mtb-geometry-note">{t.prePurchaseAudit.mtbGeometryNote}</p> : null;

/** Picks the English or Czech variant of an AI-generated, paired list. */
function localized<T>(isCzech: boolean, en: T, cs: T): T {
  return isCzech ? cs : en;
}

export const ReportStep: React.FC<ReportStepProps> = (props) => {
  const { t, analysis, values } = props;
  const cz = props.locale === 'cs';
  const rows = buildVerdictRows(t.prePurchaseAudit, verdictRiderOf(values), analysis.reachMatch);
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="p-6 rounded-2xl border border-line bg-surface shadow-sm">
        <ReportHeader t={t} bikeModel={props.bikeModel} onEditSearch={props.onEditSearch} onEditMorphology={props.onEditMorphology} />
        <MetricsRow t={t} analysis={analysis} />
        <div className="mt-5 p-4 rounded-xl border border-line bg-sunken text-xs text-ink-2 leading-relaxed font-sans">
          {localized(cz, analysis.overallSummaryEn, analysis.overallSummaryCs)}
        </div>
        <p className="mt-3 text-[11px] text-ink-3 leading-snug">{t.prePurchaseAudit.estimateNote}</p>
        <MtbGeometryNote t={t} bikeKind={values.bikeKind} />
      </div>
      <ProsConsCard
        t={t}
        pros={localized(cz, analysis.biomechanicalProsEn, analysis.biomechanicalProsCs) || []}
        cons={localized(cz, analysis.biomechanicalConsEn, analysis.biomechanicalConsCs) || []}
      />
      <TrapsCard t={t} traps={localized(cz, analysis.factoryComponentTrapsEn, analysis.factoryComponentTrapsCs) || []} rows={rows} />
      <ChecklistCard t={t} items={localized(cz, analysis.dealerChecklistEn, analysis.dealerChecklistCs) || []} />
      <AlternativesCard t={t} alternatives={localized(cz, analysis.alternativeBikesEn, analysis.alternativeBikesCs) || []} />
      <ReportFooter t={t} onEditSearch={props.onEditSearch} onBackToEntry={props.onBackToEntry} />
    </div>
  );
};
