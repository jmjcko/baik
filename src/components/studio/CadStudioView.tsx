'use client';

import React from 'react';
import { Translations } from '@/lib/i18n/translations';
import { BikeCadWireframe } from '@/components/studio/BikeCadWireframe';
import { SurfaceCard } from '@/components/primitives/SurfaceCard';
import { BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import type { SaveStatus } from '@/lib/hooks/useRiderProfile';
import type { MtbSetup } from '@/lib/engines/baikfit/mtb';
import { SaveToast } from './SaveToast';
import { StudioHeader } from './StudioHeader';
import { StudioInputs, type StudioInputActions, type StudioInputState } from './StudioInputs';
import { StudioTelemetry } from './StudioTelemetry';
import { StudioMeasured } from './StudioMeasured';
import type { CustomSetup, SetupMode } from '@/lib/engines/baikfit/customSetup';
import type { StudioSnapshot } from './studioDeltas';

interface CadStudioViewProps extends StudioInputState, StudioInputActions {
  t: Translations;
  /** The MTB setup of the profile (its kind decides the flat bar target). */
  mtb?: MtbSetup;
  /** A modified bike (Epic 34): its measured numbers are the starting point of the simulator. */
  setupMode?: SetupMode;
  custom?: CustomSetup;
  currentSaddleHeightMm?: number | null;
  currentBarWidthMm?: number | null;
  coordinates: BikeFitCoordinates;
  /** True when the simulator differs from the rider's profile. */
  /** The rider's profile (the report), against which the live numbers show their change. */
  reference: StudioSnapshot;
  changed: boolean;
  onApply: () => void;
  onRestore: () => void;
  saveStatus: SaveStatus | null;
  onDismissSaveStatus: () => void;
  onBackToReport: () => void;
  onBackToEntry: () => void;
}

const PanelHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-base font-mono font-semibold uppercase tracking-wider text-ink-2 mb-4">{children}</h2>
);

const CanvasColumn: React.FC<{ t: Translations; coordinates: BikeFitCoordinates; crankLengthMm: number; mtb: boolean }> = ({ t, coordinates, crankLengthMm, mtb }) => (
  <div className="space-y-4">
    <SurfaceCard>
      <PanelHeading>{t.studio.cadHeader}</PanelHeading>
      <div className="space-y-3">
        <BikeCadWireframe coordinates={coordinates} crankLengthMm={crankLengthMm} t={t.studio} mtb={mtb} />
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-ink-3 px-2 gap-2">
          <span>{t.studio.datumTitle}</span>
          <span className="text-accent-ink">{t.studio.saddle70mmNote}</span>
        </div>
      </div>
    </SurfaceCard>
  </div>
);

export const CadStudioView: React.FC<CadStudioViewProps> = (props) => {
  const { t, coordinates } = props;
  return (
    <div className="w-full py-2 space-y-6">
      <StudioHeader t={t} onBackToReport={props.onBackToReport} onBackToEntry={props.onBackToEntry} />
      <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)_340px] gap-6 items-start">
        <div className="space-y-5">
          <SurfaceCard>
            <PanelHeading>{t.studio.precisionInputHeader}</PanelHeading>
            <StudioInputs t={t} state={props} actions={props} />
          </SurfaceCard>
        </div>
        <CanvasColumn t={t} coordinates={coordinates} crankLengthMm={props.crankLengthMm} mtb={props.discipline === 'xc_mtb'} />
        <div className="space-y-5">
          <SurfaceCard>
            <PanelHeading>{t.studio.telemetryHeader}</PanelHeading>
            <StudioTelemetry t={t} flatBarStyle={props.discipline === 'xc_mtb' ? (props.mtb?.style ?? 'xc') : undefined} coordinates={coordinates} acromionWidthMm={props.acromionWidthMm} crankLengthMm={props.crankLengthMm} reference={props.reference} currentPains={props.currentPains} changed={props.changed} onApply={props.onApply} onRestore={props.onRestore} />
          </SurfaceCard>
          {props.setupMode === 'custom' && props.custom && (
            <SurfaceCard>
              <PanelHeading>{t.customSetup.studio.title}</PanelHeading>
              <StudioMeasured t={t} coordinates={coordinates} saddleHeightMm={props.currentSaddleHeightMm ?? null} barWidthMm={props.currentBarWidthMm ?? null} crankLengthMm={props.crankLengthMm} custom={props.custom} />
            </SurfaceCard>
          )}
        </div>
      </div>
      <SaveToast t={t} status={props.saveStatus} coordinates={coordinates} onDismiss={props.onDismissSaveStatus} />
    </div>
  );
};
