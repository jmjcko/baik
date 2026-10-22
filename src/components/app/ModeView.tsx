'use client';

import React from 'react';
import type { Locale, Translations } from '@/lib/i18n/translations';
import { ModeRouter, type AppMode } from '@/components/navigation/ModeRouter';
import { MeasurementWizard } from '@/components/wizard/MeasurementWizard';
import { DiagnosticReport } from '@/components/report/DiagnosticReport';
import { CadStudioView } from '@/components/studio/CadStudioView';
import { PrePurchaseAuditView } from '@/components/prepurchasing/PrePurchaseAuditView';
import { ProfileMode } from '@/components/profile/ProfileMode';
import type { useRiderProfile } from '@/lib/hooks/useRiderProfile';
import { useStudioDraft } from '@/lib/hooks/useStudioDraft';
import { useAuth } from '@/lib/auth/AuthContext';
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

/** The wizard; opened from "My profile" it offers the way back and returns there when it is finished or left. */
const WizardMode: React.FC<Omit<ModeViewProps, 'mode' | 'locale'>> = ({ t, setMode, profile, journey }) => {
  const signedIn = useAuth().status === 'authenticated';
  const toProfile = journey.fromProfile && signedIn;
  return (
    <>
      {toProfile && (
        <button
          type="button"
          onClick={() => setMode('profile')}
          className="mb-4 h-10 px-4 rounded-full border border-line bg-surface text-xs font-semibold text-ink hover:bg-sunken"
        >
          {t.profile.backToProfile}
        </button>
      )}
      <MeasurementWizard
        t={t}
        {...profile.values}
        {...profile.setters}
        step={journey.wizardStep}
        onStepChange={journey.setWizardStep}
        onCompleteWizard={() => setMode(toProfile ? 'profile' : 'report')}
        onCancel={() => setMode(toProfile ? 'profile' : 'entry')}
      />
    </>
  );
};

const ReportMode: React.FC<Omit<ModeViewProps, 'mode'>> = ({ t, locale, setMode, profile, journey }) => (
  <DiagnosticReport
    t={t}
    locale={locale}
    {...profile.values}
    coordinates={profile.coordinates}
    onOpenCadStudio={() => setMode('studio')}
    onEditMeasurements={() => journey.goTo('body')}
  />
);

/** The studio is a simulator: it works on a copy of the profile and only "Use in my profile" changes the real one. */
const StudioMode: React.FC<Omit<ModeViewProps, 'mode' | 'locale'>> = ({ t, setMode, profile }) => {
  const draft = useStudioDraft(profile.values, profile.applyValues);
  return (
    <CadStudioView
      t={t}
      {...draft.values}
      {...draft.setters}
      coordinates={draft.coordinates}
      reference={{ coordinates: profile.coordinates, acromionWidthMm: profile.values.acromionWidthMm, crankLengthMm: profile.values.crankLengthMm }}
      changed={draft.changed}
      onApply={draft.apply}
      onRestore={draft.restore}
      saveStatus={profile.saveStatus}
      onDismissSaveStatus={profile.dismissSaveStatus}
      onBackToReport={() => setMode('report')}
      onBackToEntry={() => setMode('entry')}
    />
  );
};

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

/** Renders the screen of the current app mode (entry, wizard, report, studio, pre-purchase audit, my profile). */
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
    case 'profile':
      return <ProfileMode t={rest.t} locale={rest.locale} profile={rest.profile} journey={rest.journey} setMode={rest.setMode} />;
    default:
      return <ModeRouter t={rest.t} currentMode={mode} onSelectMode={rest.setMode} />;
  }
};
