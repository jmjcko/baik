import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type {
  AlternativeBikeRecommendation,
  BiomechanicalPoint,
  DealerChecklistItem,
  FactoryComponentTrap,
} from '@/types/baikfit';
import { VerdictTable, type VerdictRow } from './verdicts';

const CARD = 'p-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm space-y-5';

const CardHeading: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div>
    <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
    <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
  </div>
);

type PointTone = 'teal' | 'rose';

const POINT_STYLES: Record<PointTone, { header: string; card: string; title: string }> = {
  teal: { header: 'text-teal-700 border-teal-200', card: 'border-teal-200 bg-teal-50/60', title: 'text-teal-900' },
  rose: { header: 'text-rose-700 border-rose-200', card: 'border-rose-200 bg-rose-50/60', title: 'text-rose-900' },
};

const PointColumn: React.FC<{ header: string; points: BiomechanicalPoint[]; tone: PointTone }> = ({ header, points, tone }) => {
  const styles = POINT_STYLES[tone];
  return (
    <div className="space-y-3">
      <div className={`font-mono text-xs uppercase tracking-wide font-semibold border-b pb-2 ${styles.header}`}>{header}</div>
      <div className="space-y-2.5">
        {points.map((point, idx) => (
          <div key={idx} className={`p-3.5 rounded-xl border ${styles.card}`}>
            <div className={`text-xs font-bold mb-1 ${styles.title}`}>{point.title}</div>
            <div className="text-xs text-slate-700 leading-relaxed">{point.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface ProsConsCardProps {
  t: Translations;
  pros: BiomechanicalPoint[];
  cons: BiomechanicalPoint[];
}

export const ProsConsCard: React.FC<ProsConsCardProps> = ({ t, pros, cons }) => (
  <div className={CARD}>
    <CardHeading title={t.prePurchaseAudit.cardProsConsTitle} subtitle={t.prePurchaseAudit.cardProsConsSubtitle} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <PointColumn header={t.prePurchaseAudit.prosHeader} points={pros} tone="teal" />
      <PointColumn header={t.prePurchaseAudit.consHeader} points={cons} tone="rose" />
    </div>
  </div>
);

const SavingsAdvisory: React.FC<{ t: Translations }> = ({ t }) => (
  <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
    <div className="flex items-center gap-2 mb-1.5">
      <span className="font-mono text-[11px] uppercase px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 text-white font-semibold">
        {t.prePurchaseAudit.financialAdvisory}
      </span>
    </div>
    <h4 className="text-sm font-bold text-white mb-1">{t.prePurchaseAudit.savingsAlertTitle}</h4>
    <p className="text-xs text-amber-50 leading-relaxed font-sans">{t.prePurchaseAudit.savingsAlertDesc}</p>
  </div>
);

const TrapCard: React.FC<{ t: Translations; trap: FactoryComponentTrap }> = ({ t, trap }) => (
  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
    <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
      <span className="font-mono text-xs font-bold text-slate-900">{trap.component}</span>
      <span className="font-mono text-[11px] text-amber-800 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 font-semibold">
        {trap.stockSpec} → {trap.recommendedSpec}
      </span>
    </div>
    <div className="text-xs text-slate-700 leading-relaxed">
      <span className="font-bold text-amber-900">{t.prePurchaseAudit.factoryTrapRiskLabel}: </span>{trap.riskExplanation}
    </div>
    <div className="text-xs font-mono text-blue-700 pt-1">
      <span className="font-bold text-blue-800">{t.prePurchaseAudit.factoryTrapSavingsLabel}: </span>{trap.savingsNote}
    </div>
  </div>
);

interface TrapsCardProps {
  t: Translations;
  traps: FactoryComponentTrap[];
  rows: VerdictRow[];
}

export const TrapsCard: React.FC<TrapsCardProps> = ({ t, traps, rows }) => (
  <div className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm space-y-6">
    <CardHeading title={t.prePurchaseAudit.cardTrapsTitle} subtitle={t.prePurchaseAudit.cardTrapsSubtitle} />
    <SavingsAdvisory t={t} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {traps.map((trap, idx) => (
        <TrapCard key={idx} t={t} trap={trap} />
      ))}
    </div>
    <VerdictTable t={t} rows={rows} />
  </div>
);

export const ChecklistCard: React.FC<{ t: Translations; items: DealerChecklistItem[] }> = ({ t, items }) => (
  <div className={CARD}>
    <CardHeading title={t.prePurchaseAudit.cardChecklistTitle} subtitle={t.prePurchaseAudit.cardChecklistSubtitle} />
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-start gap-3">
          <span className="font-mono text-xs px-2.5 py-1 rounded bg-blue-100 text-blue-700 font-bold mt-0.5">{idx + 1}</span>
          <div>
            <div className="text-xs font-bold text-slate-900 mb-0.5">{item.action}</div>
            <div className="text-xs text-slate-600 leading-relaxed font-sans">{item.detail}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AlternativeCard: React.FC<{ t: Translations; alt: AlternativeBikeRecommendation }> = ({ t, alt }) => (
  <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40 space-y-2">
    <div className="flex items-center justify-between border-b border-blue-100 pb-2">
      <span className="text-sm font-bold text-slate-900 font-mono">{alt.modelName}</span>
      <span className="text-[11px] font-mono text-teal-700 px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 font-semibold">
        {t.prePurchaseAudit.betterBadge}
      </span>
    </div>
    <div className="text-xs text-slate-700">
      <span className="font-bold text-blue-700 font-mono">{t.prePurchaseAudit.alternativeComparisonLabel}: </span>
      {alt.stackReachComparison}
    </div>
    <div className="text-xs text-slate-600 leading-relaxed font-sans">
      <span className="font-bold text-slate-800 font-mono">{t.prePurchaseAudit.alternativeReasonLabel}: </span>
      {alt.reasonWhyBetter}
    </div>
  </div>
);

export const AlternativesCard: React.FC<{ t: Translations; alternatives: AlternativeBikeRecommendation[] }> = ({ t, alternatives }) => (
  <div className={CARD}>
    <CardHeading title={t.prePurchaseAudit.cardAlternativesTitle} subtitle={t.prePurchaseAudit.cardAlternativesSubtitle} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {alternatives.map((alt, idx) => (
        <AlternativeCard key={idx} t={t} alt={alt} />
      ))}
    </div>
  </div>
);
