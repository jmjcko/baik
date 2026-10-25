import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { StudioTiles } from './StudioTiles';
import type { StudioSnapshot } from './studioDeltas';
import { ActionButton } from '@/components/primitives/ActionButton';
import type { BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { KB_RULES, barExcessMm, ulnarRisk, type UlnarRisk } from '@/lib/engines/baikfit/kbRules';
import type { MtbStyle } from '@/lib/engines/baikfit/mtbRules';
import type { RiderPainType } from '@/types/baikfit';
import { StudioDiagnosis } from './StudioDiagnosis';

const RISK_STYLES: Record<UlnarRisk, string> = {
  HIGH: 'border-tone-danger-line bg-tone-danger-badge text-tone-danger-ink',
  MODERATE: 'border-tone-warning-line bg-tone-warning-badge text-tone-warning-ink',
  LOW: 'border-tone-success-line bg-tone-success-badge text-tone-success-ink',
};

const UlnarIndicator: React.FC<{ t: Translations; acromionWidthMm: number }> = ({ t, acromionWidthMm }) => {
  const risk = ulnarRisk(KB_RULES.factoryBarWidthMm, acromionWidthMm);
  const labels: Record<UlnarRisk, string> = {
    HIGH: t.studio.ulnarRiskHigh,
    MODERATE: t.studio.ulnarRiskModerate,
    LOW: t.studio.ulnarRiskLow,
  };
  return (
    <div className="p-3 rounded-lg border border-line bg-surface space-y-1">
      <span className="text-sm font-mono text-ink-3 uppercase tracking-wider block">{t.studio.ulnarRisk}</span>
      <div className="flex items-center justify-between">
        <span className={`font-mono text-sm font-bold px-2 py-0.5 rounded border ${RISK_STYLES[risk]}`}>{labels[risk]}</span>
        <span className="text-sm font-mono text-ink-3">Δ {barExcessMm(KB_RULES.factoryBarWidthMm, acromionWidthMm)}mm</span>
      </div>
    </div>
  );
};

interface StudioTelemetryProps {
  t: Translations;
  coordinates: BikeFitCoordinates;
  acromionWidthMm: number;
  crankLengthMm: number;
  /** The rider's profile (the report): the live numbers show their change against it. */
  reference: StudioSnapshot;
  currentPains: RiderPainType[];
  changed: boolean;
  onApply: () => void;
  onRestore: () => void;
  /** The kind of flat bar when the bike is a mountain bike: the handlebar tile shows the flat bar target and the drop bar ulnar rule is left out. */
  flatBarStyle?: MtbStyle;
}

/** Telemetry column: live targets with their change against the report, estimate note, diagnosis, ulnar risk, and the buttons that apply or discard the simulator changes. */
export const StudioTelemetry: React.FC<StudioTelemetryProps> = (props) => {
  const { t } = props;
  return (
    <div className="space-y-3">
      <StudioTiles t={t} now={{ coordinates: props.coordinates, acromionWidthMm: props.acromionWidthMm, crankLengthMm: props.crankLengthMm }} reference={props.reference} flatBarStyle={props.flatBarStyle} />
      <p className="text-sm text-ink-3 leading-snug">{t.studio.estimateNote}</p>
      <StudioDiagnosis t={t} pains={props.currentPains} />
      {!props.flatBarStyle && <UlnarIndicator t={t} acromionWidthMm={props.acromionWidthMm} />}
      <ActionButton label={t.studio.saveButton} onClick={props.onApply} variant="primary" className="w-full" disabled={!props.changed} />
      <ActionButton label={t.studio.restoreButton} onClick={props.onRestore} variant="secondary" className="w-full" disabled={!props.changed} />
    </div>
  );
};
