'use client';

import React, { useMemo, useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { INSEAM_LIMITS, computeBikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { BikeCadWireframe } from '@/components/studio/BikeCadWireframe';
import { StudioTelemetry } from '@/components/studio/StudioTelemetry';
import { RangeSlider } from '@/components/primitives/RangeSlider';
import { SurfaceCard } from '@/components/primitives/SurfaceCard';
import { Toast } from '@/components/primitives/Toast';
import { Case, SectionFrame } from '../ShowcaseCase';

const noop = () => undefined;

const Toasts: React.FC<{ t: Translations; detail: string }> = ({ t, detail }) => (
  <div className="grid gap-4 md:grid-cols-2">
    <Case label="Success toast (inline)">
      <Toast inline tone="success" title={t.studio.savedToProfile} detail={detail} dismissLabel={t.studio.toastDismiss} onDismiss={noop} />
    </Case>
    <Case label="Error toast (inline)">
      <Toast inline tone="danger" title={t.studio.saveFailed} dismissLabel={t.studio.toastDismiss} onDismiss={noop} />
    </Case>
  </div>
);

/** CAD studio preview: the live wireframe driven by an inseam slider, the telemetry panel with tooltips and the save toasts. */
export const StudioSection: React.FC<{ t: Translations }> = ({ t }) => {
  const [inseamMm, setInseamMm] = useState(850);
  const coordinates = useMemo(() => computeBikeFitCoordinates({ inseamMm, ridingDiscipline: 'road' }), [inseamMm]);
  const detail = fill(t.studio.toastDetail, {
    height: coordinates.saddle.heightAlongTubeMm,
    setback: coordinates.saddle.setbackXMm,
    stack: coordinates.cockpit.stackYMm,
    reach: coordinates.cockpit.reachXMm,
  });
  return (
    <SectionFrame id="studio" title="CAD studio preview" hint="Move the inseam slider: the wireframe and the telemetry redraw live. The theme switch above applies here too.">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <SurfaceCard className="space-y-4">
          <RangeSlider id="showcase-inseam" label={t.studio.inseamLabel} value={inseamMm} min={INSEAM_LIMITS.MIN_MM} max={INSEAM_LIMITS.MAX_MM} step={5} unit="mm" onChange={setInseamMm} />
          <BikeCadWireframe coordinates={coordinates} t={t.studio} />
        </SurfaceCard>
        <SurfaceCard>
          <StudioTelemetry t={t} coordinates={coordinates} acromionWidthMm={380} currentPains={['numb_hands']} onSaveProfile={noop} />
        </SurfaceCard>
      </div>
      <Toasts t={t} detail={detail} />
    </SectionFrame>
  );
};
