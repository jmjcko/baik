import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type { FlexibilityScore, PrePurchaseAnalysisResponse, RidingDiscipline } from '@/types/baikfit';
import { flatBarTarget } from '@/lib/analysis/mtbPrePurchase';
import { MTB_RULES, type MtbStyle } from '@/lib/engines/baikfit/mtbRules';
import {
  KB_RULES,
  formatCrankRange,
  isBarTooWide,
  isCrankOversized,
  recommendedBarWidthMm,
} from '@/lib/engines/baikfit/kbRules';

type Tone = 'danger' | 'success' | 'warning' | 'neutral';

const TONE_CLASS: Record<Tone, string> = {
  danger: 'border border-tone-danger-line text-tone-danger-ink bg-tone-danger-bg font-bold',
  success: 'border border-tone-success-line text-teal-ink bg-tone-success-bg',
  warning: 'border border-tone-warning-line text-tone-warning-ink bg-tone-warning-bg font-bold',
  neutral: 'border border-line text-ink-2 bg-sunken',
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
  /** The kind of the bike under audit; a mountain bike has a flat bar and its own rules (KB 11.2). */
  bikeKind?: RidingDiscipline;
  mtbStyle?: MtbStyle;
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

/** A flat bar: the target of KB 11.2 (the stock bar is not known, the rider reads it from the bike page). */
function flatBarRow(t: VerdictTexts, rider: VerdictRider): VerdictRow {
  const { targetMm, offsetMm } = flatBarTarget({ acromionWidthMm: rider.acromionWidthMm, mtbStyle: rider.mtbStyle });
  return {
    component: t.tableHandlebar,
    stock: <>{t.mtbBarStock}</>,
    recommended: `${targetMm} mm (${t.acromionMeasuredLabel} ${rider.acromionWidthMm} + ${offsetMm} mm)`,
    tone: 'neutral',
    verdict: t.mtbBarVerdict,
  };
}

function stemRow(t: VerdictTexts): VerdictRow {
  return { component: t.tableStem, stock: <>{t.mtbStemStock}</>, recommended: `${MTB_RULES.stemRangeMm.min}–${MTB_RULES.stemRangeMm.max} mm`, tone: 'neutral', verdict: t.mtbStemVerdict };
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
  if (rider.bikeKind === 'xc_mtb') return [flatBarRow(t, rider), stemRow(t), crankRow(t, rider), reachRow(t, reach)];
  return [handlebarRow(t, rider), crankRow(t, rider), reachRow(t, reach)];
}

export const VerdictTable: React.FC<{ t: Translations; rows: VerdictRow[] }> = ({ t, rows }) => (
  <div className="overflow-x-auto rounded-xl border border-line bg-sunken p-4">
    <table className="w-full text-left font-mono text-xs">
      <thead>
        <tr className="border-b border-line text-ink-3">
          <th className="pb-3">{t.prePurchaseAudit.tableHeaderComponent}</th>
          <th className="pb-3">{t.prePurchaseAudit.tableHeaderStock}</th>
          <th className="pb-3">{t.prePurchaseAudit.tableHeaderRecommended}</th>
          <th className="pb-3">{t.prePurchaseAudit.tableHeaderVerdict}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {rows.map((row) => (
          <tr key={row.component}>
            <td className="py-3 font-semibold text-ink">{row.component}</td>
            <td className="py-3 text-ink-2">{row.stock}</td>
            <td className="py-3 text-accent-ink font-bold">{row.recommended}</td>
            <td className="py-3">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] ${TONE_CLASS[row.tone]}`}>{row.verdict}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
