import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type { FlexibilityScore, PrePurchaseAnalysisResponse } from '@/types/baikfit';
import {
  KB_RULES,
  formatCrankRange,
  isBarTooWide,
  isCrankOversized,
  recommendedBarWidthMm,
} from '@/lib/engines/baikfit/kbRules';

type Tone = 'danger' | 'success' | 'warning' | 'neutral';

const TONE_CLASS: Record<Tone, string> = {
  danger: 'border border-rose-300 text-rose-700 bg-rose-50 font-bold',
  success: 'border border-teal-300 text-teal-700 bg-teal-50',
  warning: 'border border-amber-300 text-amber-800 bg-amber-50 font-bold',
  neutral: 'border border-slate-200 text-slate-700 bg-slate-100',
};

export interface VerdictRow {
  component: string;
  stock: React.ReactNode;
  recommended: string;
  tone: Tone;
  verdict: string;
}

type VerdictTexts = Translations['prePurchaseAudit'];

export interface VerdictRider {
  acromionWidthMm: number;
  flexibilityScore: FlexibilityScore;
  riderWeightKg: number;
  heightCm?: number;
}

function stemVerdict(deltaMm: number, stemWord: string, neutral: string): string {
  if (deltaMm === 0) return neutral;
  return `${deltaMm > 0 ? '+' : ''}${deltaMm} mm ${stemWord}`;
}

function handlebarRow(t: VerdictTexts, rider: VerdictRider): VerdictRow {
  const tooWide = isBarTooWide(KB_RULES.factoryBarWidthMm, rider.acromionWidthMm);
  const recommended = recommendedBarWidthMm(rider.acromionWidthMm);
  return {
    component: t.tableHandlebar,
    stock: <>{KB_RULES.factoryBarWidthMm} mm ({t.factoryStockSuffix})</>,
    recommended: `${recommended} mm (${t.acromionMeasuredLabel} ${rider.acromionWidthMm} mm)`,
    tone: tooWide ? 'danger' : 'success',
    verdict: tooWide ? t.verdictTooWide : t.verdictOptimal,
  };
}

function crankRow(t: VerdictTexts, rider: VerdictRider): VerdictRow {
  const oversized = isCrankOversized(KB_RULES.factoryCrankMm, { ...rider, riderHeightCm: rider.heightCm });
  return {
    component: t.tableCrank,
    stock: <>{KB_RULES.factoryCrankMm} mm ({t.factoryStockSuffix})</>,
    recommended: `${formatCrankRange()} mm`,
    tone: oversized ? 'warning' : 'success',
    verdict: oversized ? t.verdictTooLong : t.verdictOptimal,
  };
}

function reachRow(t: VerdictTexts, reach: PrePurchaseAnalysisResponse['reachMatch']): VerdictRow {
  return {
    component: t.tableReach,
    stock: <>{reach.stockReachMm} mm</>,
    recommended: `${reach.recommendedReachMm} mm`,
    tone: 'neutral',
    verdict: stemVerdict(reach.stemDeltaMm, t.verdictStem, t.verdictNeutral),
  };
}

/** Handlebar and crank verdicts follow the KB rules; reach is an estimate (see estimates.ts). */
export function buildVerdictRows(
  t: VerdictTexts,
  rider: VerdictRider,
  reach: PrePurchaseAnalysisResponse['reachMatch']
): VerdictRow[] {
  return [handlebarRow(t, rider), crankRow(t, rider), reachRow(t, reach)];
}

export const VerdictTable: React.FC<{ t: Translations; rows: VerdictRow[] }> = ({ t, rows }) => (
  <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
    <table className="w-full text-left font-mono text-xs">
      <thead>
        <tr className="border-b border-slate-200 text-slate-500">
          <th className="pb-3">{t.prePurchaseAudit.tableHeaderComponent}</th>
          <th className="pb-3">{t.prePurchaseAudit.tableHeaderStock}</th>
          <th className="pb-3">{t.prePurchaseAudit.tableHeaderRecommended}</th>
          <th className="pb-3">{t.prePurchaseAudit.tableHeaderVerdict}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200/80">
        {rows.map((row) => (
          <tr key={row.component}>
            <td className="py-3 font-semibold text-slate-800">{row.component}</td>
            <td className="py-3 text-slate-600">{row.stock}</td>
            <td className="py-3 text-blue-600 font-bold">{row.recommended}</td>
            <td className="py-3">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] ${TONE_CLASS[row.tone]}`}>{row.verdict}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
