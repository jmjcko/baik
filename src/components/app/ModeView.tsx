'use client';

import React from 'react';
import type { Locale, Translations } from '@/lib/i18n/translations';
import type { AppMode } from '@/components/navigation/appMode';
import { MeasurementWizard } from '@/components/wizard/MeasurementWizard';
import { DiagnosticReport } from '@/components/report/DiagnosticReport';
import { CadStudioView } from '@/components/studio/CadStudioView';
import { PrePurchaseAuditView } from '@/components/prepurchasing/PrePurchaseAuditView';
import { ProfileMode } from '@/components/profile/ProfileMode';
import { bikeTitle } from '@/components/profile/GarageSection';
import { AdminCatalog } from '@/components/admin/AdminCatalog';
import { CapabilitiesView } from '@/components/capabilities/CapabilitiesView';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { FitHub } from '@/components/fit/FitHub';
import { MaintainView } from '@/components/maintain/MaintainView';
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
  /** Opens the "which bike" popup (switch or add a bike) over the current page. */
  onOpenBikes: () => void;
}

/** The wizard; opened from "My profile" it offers the way back and returns there when it is finished or left. */
const WizardMode: React.FC<Omit<ModeViewProps, 'mode' | 'locale'>> = ({ t, setMode, profile, journey, onOpenBikes }) => {
  const signedIn = useAuth().status === 'authenticated';
  const toProfile = journey.fromProfile && signedIn;
  const activeBike = profile.garage()?.bikes.find((bike) => bike.isActive);
  return (
    <>
      {toProfile && (
        <button type="button" onClick={() => setMode('profile')} className="mb-4 h-10 px-4 rounded-full border border-line bg-surface text-xs font-semibold text-ink hover:bg-sunken">{t.profile.backToProfile}</button>
      )}
      <MeasurementWizard
        t={t}
        {...profile.values}
        {...profile.setters}
        activeBikeName={activeBike ? bikeTitle(t.profile.garage, activeBike) : null}
        activeBikeId={activeBike?.id}
        onAddBike={profile.addBike}
        onManageBikes={onOpenBikes}
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
    onDiagnosis={profile.setters.setLastDiagnosis}
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

/** The bAIkcare workshop: the care of the active bike (M-Check, chain gauge, indoor trainer) is kept with the bike in the passport. */
const CareMode: React.FC<Pick<ModeViewProps, 't' | 'profile'>> = ({ t, profile }) => {
  const activeBike = profile.garage()?.bikes.find((bike) => bike.isActive);
  return (
    <MaintainView
      t={t}
      bikeId={activeBike?.id ?? 'current'}
      bikeName={activeBike ? bikeTitle(t.profile.garage, activeBike) : null}
      kind={profile.values.discipline === 'xc_mtb' ? 'mtb' : 'road'}
      discipline={profile.values.discipline}
      riderWeightKg={profile.values.riderWeightKg}
      care={profile.values.care}
      onCareChange={profile.setters.setCare}
    />
  );
};

/** The home page: the numbers of the active bike, the garage and the mobility tests; every button leads on to a real screen. */
const DashboardMode: React.FC<Omit<ModeViewProps, 'mode'>> = ({ t, locale, setMode, profile, journey }) => (
  <Dashboard
    t={t}
    locale={locale}
    values={profile.values}
    coordinates={profile.coordinates}
    garage={profile.garage()}
    setupDone={journey.unlocked}
    onSwitchBike={profile.switchBike}
    onStart={() => journey.goTo('discipline')}
    onCheckBike={() => setMode('prepurchasing')}
    onOpenProfile={() => setMode('profile')}
    onTakeTests={() => journey.goTo('posture')}
  />
);

/** Renders the screen of the current app mode (entry, wizard, report, studio, pre-purchase audit, my profile). */
export const ModeView: React.FC<ModeViewProps> = ({ mode, ...rest }) => {
  switch (mode) {
    case 'fit':
      return <FitHub t={rest.t} onTuneBike={() => rest.setMode('wizard')} onCheckBike={() => rest.setMode('prepurchasing')} />;
    case 'wizard':
      return <WizardMode {...rest} />;
    case 'report':
      return <ReportMode {...rest} />;
    case 'studio':
      return <StudioMode {...rest} />;
    case 'prepurchasing':
      return <PrePurchaseMode {...rest} />;
    case 'care':
      return <CareMode t={rest.t} profile={rest.profile} />;
    case 'admin':
      return <AdminCatalog t={rest.t} locale={rest.locale} />;
    case 'capabilities':
      return <CapabilitiesView t={rest.t} onTakeTests={() => rest.journey.goTo('posture')} />;
    case 'profile':
      return <ProfileMode t={rest.t} locale={rest.locale} profile={rest.profile} journey={rest.journey} setMode={rest.setMode} />;
    default:
      return <DashboardMode {...rest} />;
  }
};
