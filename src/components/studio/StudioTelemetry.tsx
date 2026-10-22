import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { MetricTile } from '@/components/primitives/MetricTile';
import { ActionButton } from '@/components/primitives/ActionButton';
import type { BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { KB_RULES, barExcessMm, ulnarRisk, type UlnarRisk } from '@/lib/engines/baikfit/kbRules';
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
  currentPains: RiderPainType[];
  onSaveProfile: () => void;
}

const MetricList: React.FC<{ t: Translations; coordinates: BikeFitCoordinates }> = ({ t, coordinates }) => {
  const hint = (key: keyof Translations['studio']['tips']) => ({ id: `tip-${key}`, text: t.studio.tips[key] });
  return (
    <>
      <MetricTile label={t.studio.saddleY} hint={hint('saddleY')} value={coordinates.saddle.heightAlongTubeMm} unit="mm" statusVariant="cyan" />
      <MetricTile label={t.studio.saddleX} hint={hint('saddleX')} value={coordinates.saddle.setbackXMm} unit="mm" statusVariant="cyan" />
      <MetricTile label={t.studio.stack} hint={hint('stack')} value={coordinates.cockpit.stackYMm} unit="mm" statusVariant="neutral" />
      <MetricTile label={t.studio.reach} hint={hint('reach')} value={coordinates.cockpit.reachXMm} unit="mm" statusVariant="neutral" />
    </>
  );
};

/** Telemetry column: coordinates, estimate note, diagnosis, ulnar risk and the save button. */
export const StudioTelemetry: React.FC<StudioTelemetryProps> = (props) => {
  const { t } = props;
  return (
    <div className="space-y-3">
      <MetricList t={t} coordinates={props.coordinates} />
      <p className="text-sm text-ink-3 leading-snug">{t.studio.estimateNote}</p>
      <StudioDiagnosis t={t} pains={props.currentPains} />
      <UlnarIndicator t={t} acromionWidthMm={props.acromionWidthMm} />
      <ActionButton label={t.studio.saveButton} onClick={props.onSaveProfile} variant="primary" className="w-full" />
    </div>
  );
};
