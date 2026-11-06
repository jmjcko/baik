'use client';

import { fitSummary, knownFromBike } from '@/lib/service/fitSummary';
import React, { useState } from 'react';
import type { Locale, Translations } from '@/lib/i18n/translations';
import type { AppMode } from '@/components/navigation/appMode';
import { MeasurementWizard } from '@/components/wizard/MeasurementWizard';
import { DiagnosticReport } from '@/components/report/DiagnosticReport';
import { CadStudioView } from '@/components/studio/CadStudioView';
import { PrePurchaseAuditView } from '@/components/prepurchasing/PrePurchaseAuditView';
import { ProfileMode } from '@/components/profile/ProfileMode';
import type { ProfileViewProps } from '@/components/profile/ProfileView';
import { bikeTitle } from '@/components/profile/BikeRow';
import { AdminCatalog } from '@/components/admin/AdminCatalog';
import { GearView } from '@/components/gear/GearView';
import { EduView } from '@/components/edu/EduView';
import { CapabilitiesView } from '@/components/capabilities/CapabilitiesView';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { RiderLine } from '@/components/riders/RiderLine';
import { FittingBar } from '@/components/riders/FittingBar';
import { FitGateDialog } from '@/components/wizard/FitGateDialog';
import { KindChangeDialog } from '@/components/wizard/KindChangeDialog';
import { hasBikeSetup, useFitGate } from './fitGuards';
import type { RidingDiscipline } from '@/types/baikfit';
import { riderName } from '@/components/riders/riderName';
import { FitHub } from '@/components/fit/FitHub';
import { MaintainView } from '@/components/maintain/MaintainView';
import type { useRiderProfile } from '@/lib/hooks/useRiderProfile';
import { useStudioDraft } from '@/lib/hooks/useStudioDraft';
import { useAuth } from '@/lib/auth/AuthContext';
import type { Journey } from '@/lib/hooks/useJourney';

type Profile = ReturnType<typeof useRiderProfile>;
type FitGate = ReturnType<typeof useFitGate>;

interface ModeViewProps {
  t: Translations;
  locale: Locale;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  profile: Profile;
  journey: Journey;
  /** Opens the "which bike" popup (switch or add a bike) over the current page. */
  onOpenBikes: () => void;
  /** Opens the "Edit bike" dialog for the active bike, and the counter that goes up after a save (the garage reads the book of the bike again). */
  onEditBike: () => void;
  bookTick: number;
  /** A bike was picked in "Riding now": the care page opens on its Garage tab, and tells the app when it did. */
  garageRequested: boolean;
  onGarageShown: () => void;
  /** The theme and the way to change the language and the theme (the profile page offers them next to the account). */
  settings: ProfileViewProps['settings'];
}

/** What the wizard asks before it changes a bike: which bike is fitted (on entering, with several bikes) and whether the kind of a set up bike may change. */
const WizardGuards: React.FC<{ t: Translations; gate: FitGate; profile: Profile; pendingKind: RidingDiscipline | null; onKind: (confirmed: boolean) => void; onSwitch: () => void; onBack: () => void }> = ({ t, gate, profile, pendingKind, onKind, onSwitch, onBack }) => {
  const bike = profile.garage()?.bikes.find((one) => one.isActive);
  if (!bike) return null;
  const title = bikeTitle(t.profile.garage, bike);
  return (
    <>
      {gate.open && <FitGateDialog t={t} bike={title} rider={riderLabel(profile, t, bike.riderId)} onContinue={gate.confirm} onSwitch={onSwitch} onCancel={onBack} />}
      {pendingKind && <KindChangeDialog t={t} bike={title} from={profile.values.discipline} to={pendingKind} onConfirm={() => onKind(true)} onCancel={() => onKind(false)} />}
    </>
  );
};

type ScreenProps = ModeViewProps & { gate: FitGate };

/** The wizard; opened from "My profile" it offers the way back and returns there when it is finished or left. */
const WizardMode: React.FC<Omit<ScreenProps, 'mode' | 'locale'>> = ({ t, setMode, profile, journey, onOpenBikes, gate }) => {
  const signedIn = useAuth().status === 'authenticated';
  const toProfile = journey.fromProfile && signedIn;
  const activeBike = profile.garage()?.bikes.find((bike) => bike.isActive);
  const [pendingKind, setPendingKind] = useState<RidingDiscipline | null>(null);
  const requestKind = (next: RidingDiscipline) => (next !== profile.values.discipline && hasBikeSetup(activeBike, profile.values) ? setPendingKind(next) : profile.setters.setDiscipline(next));
  const answerKind = (confirmed: boolean) => { if (confirmed && pendingKind) profile.setters.setDiscipline(pendingKind); setPendingKind(null); };
  return (
    <>
      {toProfile && (
        <button type="button" onClick={() => setMode('profile')} className="mb-4 h-10 px-4 rounded-full border border-line bg-surface text-xs font-semibold text-ink hover:bg-sunken">{t.profile.backToProfile}</button>
      )}
      <MeasurementWizard
        t={t}
        {...profile.values}
        {...profile.setters}
        setDiscipline={requestKind}
        activeBikeName={activeBike ? bikeTitle(t.profile.garage, activeBike) : null}
        activeBikeId={activeBike?.id}
        onAddBike={profile.addBike}
        step={journey.wizardStep}
        onStepChange={journey.setWizardStep}
        onCompleteWizard={() => setMode(toProfile ? 'profile' : 'report')}
        onCancel={() => setMode(toProfile ? 'profile' : 'entry')}
      />
      <WizardGuards t={t} gate={gate} profile={profile} pendingKind={pendingKind} onKind={answerKind} onSwitch={onOpenBikes} onBack={() => setMode('entry')} />
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

/** The name of a rider for a label, only when the account has two or more riders. */
function riderLabel(profile: Profile, t: Translations, riderId: string | undefined): string | undefined {
  const list = profile.riders()?.riders ?? [];
  const rider = list.length > 1 ? list.find((candidate) => candidate.id === riderId) : undefined;
  return rider ? riderName(t, rider.name) : undefined;
}

/** The bAIkcare workshop: the care of the active bike (M-Check, chain gauge, indoor trainer) is kept with the bike in the passport. */
const CareMode: React.FC<Pick<ModeViewProps, 't' | 'locale' | 'profile' | 'onEditBike' | 'bookTick' | 'garageRequested' | 'onGarageShown'>> = ({ t, locale, profile, onEditBike, bookTick, garageRequested, onGarageShown }) => {
  const activeBike = profile.garage()?.bikes.find((bike) => bike.isActive);
  return (
    <MaintainView
      t={t}
      locale={locale}
      fit={fitSummary(profile.coordinates, profile.values)}
      known={knownFromBike(activeBike)}
      bikeId={activeBike?.id ?? 'current'}
      bikeName={activeBike ? bikeTitle(t.profile.garage, activeBike) : null}
      bikes={profile.garage()?.bikes.map((bike) => ({ id: bike.id, name: bikeTitle(t.profile.garage, bike), rider: riderLabel(profile, t, bike.riderId) }))}
      onSwitchBike={profile.switchBike}
      kind={profile.values.discipline === 'xc_mtb' ? 'mtb' : 'road'}
      discipline={profile.values.discipline}
      riderWeightKg={profile.values.riderWeightKg}
      care={profile.values.care}
      onCareChange={profile.setters.setCare}
      onEditBike={onEditBike}
      riderId={activeBike?.riderId}
      riderBikeIds={profile.garage()?.bikes.filter((bike) => bike.riderId === activeBike?.riderId).map((bike) => bike.id)}
      riderName={riderLabel(profile, t, activeBike?.riderId)}
      bookTick={bookTick}
      garageRequested={garageRequested}
      onGarageShown={onGarageShown}
    />
  );
};

/** The bAIkgear advisor: the survey wizard and the master prompt for the rider's own AI chatbot. */
const GearMode: React.FC<Pick<ModeViewProps, 't' | 'locale' | 'profile'>> = ({ t, locale, profile }) => {
  const riders = profile.riders();
  const active = riders && riders.riders.length > 1 ? riders.riders.find((rider) => rider.id === riders.activeRiderId) : undefined;
  const bikeId = profile.garage()?.bikes.find((bike) => bike.isActive)?.id;
  return <GearView t={t} locale={locale} values={profile.values} riderLabel={active ? riderName(t, active.name) : undefined} bikeId={bikeId} />;
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
    onOpenCare={() => setMode('care')}
    onOpenGear={() => setMode('gear')}
    onOpenStudio={() => setMode('studio')}
  />
);

/** The screens that show or change the numbers of one rider (the others are about the account or the catalog). */
const RIDER_MODES: AppMode[] = ['wizard', 'report', 'studio', 'prepurchasing', 'care', 'gear'];

/** The screen of the current app mode. */
const Screen: React.FC<ScreenProps> = ({ mode, ...rest }) => {
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
      return <CareMode t={rest.t} locale={rest.locale} profile={rest.profile} onEditBike={rest.onEditBike} bookTick={rest.bookTick} garageRequested={rest.garageRequested} onGarageShown={rest.onGarageShown} />;
    case 'gear':
      return <GearMode t={rest.t} locale={rest.locale} profile={rest.profile} />;
    case 'edu':
      return <EduView t={rest.t} onOpenTool={rest.setMode} />;
    case 'admin':
      return <AdminCatalog t={rest.t} locale={rest.locale} />;
    case 'capabilities':
      return <CapabilitiesView t={rest.t} onTakeTests={() => rest.journey.goTo('posture')} />;
    case 'profile':
      return <ProfileMode t={rest.t} locale={rest.locale} profile={rest.profile} journey={rest.journey} setMode={rest.setMode} settings={rest.settings} />;
    default:
      return <DashboardMode {...rest} />;
  }
};

/** The screens that change the numbers of the active bike: they say which bike it is (the other screens only name the rider). */
const FIT_MODES: AppMode[] = ['wizard', 'report', 'studio', 'prepurchasing'];

/** The line over a screen: "You are changing the settings of: bike" for the fitting screens, else whose numbers the screen shows. */
const ContextLine: React.FC<Pick<ModeViewProps, 't' | 'mode' | 'profile' | 'onOpenBikes'>> = ({ t, mode, profile, onOpenBikes }) => {
  const bike = profile.garage()?.bikes.find((one) => one.isActive);
  if (FIT_MODES.includes(mode) && bike) return <FittingBar t={t} bike={bikeTitle(t.profile.garage, bike)} rider={riderLabel(profile, t, bike.riderId)} onChange={onOpenBikes} />;
  return <RiderLine t={t} riders={profile.riders()} />;
};

/** Renders the screen of the current app mode (entry, wizard, report, studio, pre-purchase audit, my profile); the screens of one rider's numbers say whose they are and which bike is changed. */
export const ModeView: React.FC<ModeViewProps> = (props) => {
  const garage = props.profile.garage();
  const gate = useFitGate(props.mode, garage?.bikes.find((bike) => bike.isActive)?.id, garage?.bikes.length ?? 0, props.journey.fromProfile);
  return (
    <>
      {RIDER_MODES.includes(props.mode) && <ContextLine t={props.t} mode={props.mode} profile={props.profile} onOpenBikes={props.onOpenBikes} />}
      <Screen {...props} gate={gate} />
    </>
  );
};
