'use client';

import React from 'react';
import { Translations } from '@/lib/i18n/translations';
import { BikeCadWireframe } from '@/components/studio/BikeCadWireframe';
import { SurfaceCard } from '@/components/primitives/SurfaceCard';
import { BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { StudioHeader } from './StudioHeader';
import { StudioInputs, type StudioInputActions, type StudioInputState } from './StudioInputs';
import { StudioTelemetry } from './StudioTelemetry';

interface CadStudioViewProps extends StudioInputState, StudioInputActions {
  t: Translations;
  coordinates: BikeFitCoordinates;
  onSaveProfile: () => void;
  saveStatus: string | null;
  onBackToReport: () => void;
  onBackToEntry: () => void;
}

const PanelHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-sm font-mono uppercase tracking-wider text-slate-400 mb-3">{children}</h2>
);

const CanvasColumn: React.FC<{ t: Translations; coordinates: BikeFitCoordinates }> = ({ t, coordinates }) => (
  <div className="lg:col-span-6 space-y-4">
    <SurfaceCard>
      <PanelHeading>{t.studio.cadHeader}</PanelHeading>
      <div className="space-y-3">
        <BikeCadWireframe coordinates={coordinates} t={t.studio} />
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-400 px-2 gap-2">
          <span>{t.studio.datumTitle}</span>
          <span className="text-cyan-400">{t.studio.saddle70mmNote}</span>
        </div>
      </div>
    </SurfaceCard>
  </div>
);

export const CadStudioView: React.FC<CadStudioViewProps> = (props) => {
  const { t, coordinates } = props;
  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      <StudioHeader t={t} onBackToReport={props.onBackToReport} onBackToEntry={props.onBackToEntry} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-3 space-y-5">
          <SurfaceCard>
            <PanelHeading>{t.studio.precisionInputHeader}</PanelHeading>
            <StudioInputs t={t} state={props} actions={props} />
          </SurfaceCard>
        </div>
        <CanvasColumn t={t} coordinates={coordinates} />
        <div className="lg:col-span-3 space-y-5">
          <SurfaceCard>
            <PanelHeading>{t.studio.telemetryHeader}</PanelHeading>
            <StudioTelemetry t={t} coordinates={coordinates} acromionWidthMm={props.acromionWidthMm} currentPains={props.currentPains} saveStatus={props.saveStatus} onSaveProfile={props.onSaveProfile} />
          </SurfaceCard>
        </div>
      </div>
    </div>
  );
};
