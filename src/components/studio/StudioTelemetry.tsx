import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { MetricTile } from '@/components/primitives/MetricTile';
import { ActionButton } from '@/components/primitives/ActionButton';
import type { BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { KB_RULES, barExcessMm, ulnarRisk, type UlnarRisk } from '@/lib/engines/baikfit/kbRules';
import type { RiderPainType } from '@/types/baikfit';
import { StudioDiagnosis } from './StudioDiagnosis';

const RISK_STYLES: Record<UlnarRisk, string> = {
  HIGH: 'border-rose-500/50 bg-rose-950/40 text-rose-300',
  MODERATE: 'border-amber-500/50 bg-amber-950/40 text-amber-300',
  LOW: 'border-teal-500/50 bg-teal-950/40 text-teal-300',
};

const UlnarIndicator: React.FC<{ t: Translations; acromionWidthMm: number }> = ({ t, acromionWidthMm }) => {
  const risk = ulnarRisk(KB_RULES.factoryBarWidthMm, acromionWidthMm);
  const labels: Record<UlnarRisk, string> = {
    HIGH: t.studio.ulnarRiskHigh,
    MODERATE: t.studio.ulnarRiskModerate,
    LOW: t.studio.ulnarRiskLow,
  };
  return (
    <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/90 space-y-1">
      <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">{t.studio.ulnarRisk}</span>
      <div className="flex items-center justify-between">
        <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${RISK_STYLES[risk]}`}>{labels[risk]}</span>
        <span className="text-[11px] font-mono text-slate-400">Δ {barExcessMm(KB_RULES.factoryBarWidthMm, acromionWidthMm)}mm</span>
      </div>
    </div>
  );
};

interface StudioTelemetryProps {
  t: Translations;
  coordinates: BikeFitCoordinates;
  acromionWidthMm: number;
  currentPains: RiderPainType[];
  saveStatus: string | null;
  onSaveProfile: () => void;
}

const MetricList: React.FC<{ t: Translations; coordinates: BikeFitCoordinates }> = ({ t, coordinates }) => (
  <>
    <MetricTile label={t.studio.saddleY} value={coordinates.saddle.heightAlongTubeMm} unit="mm" statusVariant="cyan" />
    <MetricTile label={t.studio.saddleX} value={coordinates.saddle.setbackXMm} unit="mm" statusVariant="cyan" />
    <MetricTile label={t.studio.stack} value={coordinates.cockpit.stackYMm} unit="mm" statusVariant="neutral" />
    <MetricTile label={t.studio.reach} value={coordinates.cockpit.reachXMm} unit="mm" statusVariant="neutral" />
  </>
);

/** Telemetry column: coordinates, estimate note, diagnosis, ulnar risk and the save button. */
export const StudioTelemetry: React.FC<StudioTelemetryProps> = (props) => {
  const { t, saveStatus } = props;
  return (
    <div className="space-y-3">
      <MetricList t={t} coordinates={props.coordinates} />
      <p className="text-[11px] text-slate-500 leading-snug">{t.studio.estimateNote}</p>
      <StudioDiagnosis t={t} pains={props.currentPains} />
      <UlnarIndicator t={t} acromionWidthMm={props.acromionWidthMm} />
      <ActionButton label={t.studio.saveButton} onClick={props.onSaveProfile} variant="primary" className="w-full" />
      {saveStatus && <p className="text-xs font-mono text-teal-400 text-center animate-fade-in">{saveStatus}</p>}
    </div>
  );
};
