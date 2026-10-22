'use client';

import React from 'react';
import type { Locale, Translations } from '@/lib/i18n/translations';
import { ModeRouter, type AppMode } from '@/components/navigation/ModeRouter';
import { MeasurementWizard } from '@/components/wizard/MeasurementWizard';
import { DiagnosticReport } from '@/components/report/DiagnosticReport';
import { CadStudioView } from '@/components/studio/CadStudioView';
import { PrePurchaseAuditView } from '@/components/prepurchasing/PrePurchaseAuditView';
import type { useRiderProfile } from '@/lib/hooks/useRiderProfile';
import type { Journey } from '@/lib/hooks/useJourney';

type Profile = ReturnType<typeof useRiderProfile>;

interface ModeViewProps {
  t: Translations;
  locale: Locale;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  profile: Profile;
  journey: Journey;
}

const WizardMode: React.FC<Omit<ModeViewProps, 'mode' | 'locale'>> = ({ t, setMode, profile, journey }) => (
  <MeasurementWizard
    t={t}
    {...profile.values}
    {...profile.setters}
    step={journey.wizardStep}
    onStepChange={journey.setWizardStep}
    onCompleteWizard={() => setMode('report')}
    onCancel={() => setMode('entry')}
  />
);

const ReportMode: React.FC<Omit<ModeViewProps, 'mode' | 'locale'>> = ({ t, setMode, profile, journey }) => (
  <DiagnosticReport
    t={t}
    {...profile.values}
    coordinates={profile.coordinates}
    onOpenCadStudio={() => setMode('studio')}
    onEditMeasurements={() => journey.goTo('body')}
  />
);

const StudioMode: React.FC<Omit<ModeViewProps, 'mode' | 'locale'>> = ({ t, setMode, profile }) => (
  <CadStudioView
    t={t}
    {...profile.values}
    {...profile.setters}
    coordinates={profile.coordinates}
    onSaveProfile={profile.save}
    saveStatus={profile.saveStatus}
    onDismissSaveStatus={profile.dismissSaveStatus}
    onBackToReport={() => setMode('report')}
    onBackToEntry={() => setMode('entry')}
  />
);

const PrePurchaseMode: React.FC<Omit<ModeViewProps, 'mode'>> = ({ t, locale, setMode, profile }) => (
  <PrePurchaseAuditView
    t={t}
    locale={locale}
    {...profile.values}
    onBackToEntry={() => setMode('entry')}
    onProfileChange={(change) => {
      const s = profile.setters;
      s.setInseamMm(change.inseamMm);
      s.setHeightCm(change.heightCm);
      s.setTorsoLengthMm(change.torsoLengthMm);
      s.setArmLengthMm(change.armLengthMm);
      s.setAcromionWidthMm(change.acromionWidthMm);
      s.setRiderWeightKg(change.riderWeightKg);
    }}
  />
);

/** Renders the screen of the current app mode (entry, wizard, report, studio, pre-purchase audit). */
export const ModeView: React.FC<ModeViewProps> = ({ mode, ...rest }) => {
  switch (mode) {
    case 'wizard':
      return <WizardMode {...rest} />;
    case 'report':
      return <ReportMode {...rest} />;
    case 'studio':
      return <StudioMode {...rest} />;
    case 'prepurchasing':
      return <PrePurchaseMode {...rest} />;
    default:
      return <ModeRouter t={rest.t} currentMode={mode} onSelectMode={rest.setMode} />;
  }
};
