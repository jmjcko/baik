'use client';

import React, { useMemo, useState } from 'react';
import { Translations } from '@/lib/i18n/translations';
import { MeasurementGuideModal } from '@/components/baikfit/MeasurementGuideModal';
import type { GuideType } from '@/components/baikfit/guides';
import type { PrePurchaseGeometry, RiderPainType, RidingDiscipline, RidingStyle } from '@/types/baikfit';
import type { MtbStyle } from '@/lib/engines/baikfit/mtbRules';
import {
  toRiderProfile,
  useAuditRun,
  type CurrentSetup,
  useRiderIntake,
  type AuditProfileChange,
  type AuditStep,
} from './auditState';
import { SignInOffer } from '@/components/auth/SignInOffer';
import { IntakeStep } from './IntakeStep';
import { ReportStep } from './ReportStep';
import { SearchStep } from './SearchStep';
import { GeometryPanel } from './GeometryPanel';
import { auditGeometryOf, type SuppliedFor } from './auditGeometry';
import { mergeBikes } from '@/lib/catalog/catalogBikes';
import { useCatalogBikes } from '@/lib/catalog/hooks';
import { BikeFinder } from '@/components/finder/BikeFinder';
import { SearchModeSwitch, type SearchMode } from './SearchModeSwitch';

export type { AuditProfileChange } from './auditState';

interface PrePurchaseAuditViewProps {
  t: Translations;
  locale?: 'en' | 'cs';
  inseamMm: number;
  acromionWidthMm: number;
  heightCm: number;
  torsoLengthMm?: number;
  armLengthMm?: number;
  riderWeightKg?: number;
  /** Rider's current bike (entered in the wizard): used in the request and shown in the summary */
  crankLengthMm?: number;
  currentSaddleHeightMm?: number | null;
  currentBarWidthMm?: number | null;
  ridingStyle: RidingStyle;
  /** The kind of the active garage bike and its mountain bike setup: where the kind of the bike under audit starts. */
  discipline?: RidingDiscipline;
  mtb?: { style: MtbStyle };
  currentPains: RiderPainType[];
  onBackToEntry: () => void;
  /** Reports edited morphology so the app can persist the shared rider profile */
  onProfileChange?: (profile: AuditProfileChange) => void;
}

const AuditHeader: React.FC<{ t: Translations; step: AuditStep; finding: boolean; onBack: () => void }> = ({ t, step, finding, onBack }) => {
  const a = t.prePurchaseAudit;
  const titles = { 1: a.step1Title, 2: finding ? t.finder.title : a.step2Title, 3: a.step3Title };
  const subtitles = { 1: a.step1Subtitle, 2: finding ? t.finder.intro : a.step2Subtitle, 3: a.step3Subtitle };
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-line pb-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-xs uppercase px-2.5 py-0.5 rounded-full bg-tone-info-bg border border-tone-info-line text-tone-info-ink font-semibold">
            {a.pathBadge}
          </span>
          <span className="font-mono text-xs text-ink-3">{a.stepProgress.replace('{step}', String(step))}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">{titles[step]}</h1>
        <p className="text-ink-3 text-xs sm:text-sm mt-1">{subtitles[step]}</p>
      </div>
      <button
        type="button"
        onClick={onBack}
        className="px-4 py-2 rounded-full font-mono text-xs text-ink-2 border border-line hover:bg-sunken bg-surface transition-colors shadow-sm"
      >
        {a.backToModeSelect}
      </button>
    </div>
  );
};

type ViewProps = PrePurchaseAuditViewProps;

function currentSetupOf(props: ViewProps): CurrentSetup {
  return {
    currentCrankLengthMm: props.crankLengthMm,
    currentSaddleHeightMm: props.currentSaddleHeightMm,
    currentBarWidthMm: props.currentBarWidthMm,
  };
}

/** The bikes of the catalog (seed and community) and the geometry of the typed bike among them or in the rider's table. */
function useAuditBikes(bikeModel: string, supplied: SuppliedFor | null) {
  const catalog = useCatalogBikes();
  const bikes = useMemo(() => mergeBikes(catalog.bikes), [catalog]);
  return { bikes, found: auditGeometryOf(bikeModel, bikes, supplied) };
}

/** What the audit is run for: the bike's name and its geometry (the typed bike, or a bike that the finder suggested). */
interface AuditTarget {
  name: string;
  geometry: PrePurchaseGeometry;
}

/** Step machine, search inputs and audit run shared by the three steps. */
function useAuditFlow(props: ViewProps) {
  const { t, locale = 'en', currentPains } = props;
  const [step, setStep] = useState<AuditStep>(1);
  const [bikeModel, setBikeModel] = useState('');
  const [supplied, setSupplied] = useState<SuppliedFor | null>(null);
  const [mode, setMode] = useState<SearchMode>('known');
  const intake = useRiderIntake(props, props.onProfileChange);
  const audit = useAuditRun();
  const { bikes, found } = useAuditBikes(bikeModel, supplied);

  const runAudit = async (e?: React.FormEvent, target?: AuditTarget) => {
    e?.preventDefault();
    const named = target ?? (found ? { name: bikeModel, geometry: found.geometry } : null);
    if (!named || !named.name.trim()) return;
    await audit.run({
      bikeModelName: named.name,
      geometry: named.geometry,
      riderProfile: toRiderProfile(intake.values, currentPains, currentSetupOf(props)),
      locale,
      t,
      onSuccess: () => setStep(3),
    });
  };

  /** A bike that the finder suggested goes straight into the audit with the geometry that the finder holds for it. */
  const auditSuggested = (name: string, geometry: PrePurchaseGeometry) => {
    setBikeModel(name);
    setMode('known');
    void runAudit(undefined, { name, geometry });
  };

  return { step, setStep, bikeModel, setBikeModel, bikes, found, setSupplied, mode, setMode, intake, audit, runAudit, auditSuggested };
}

type Flow = ReturnType<typeof useAuditFlow>;

const SearchSection: React.FC<{ t: Translations; locale: 'en' | 'cs'; flow: Flow; props: ViewProps }> = ({ t, locale, flow, props }) => (
  <div className="space-y-6">
    <SearchModeSwitch t={t} mode={flow.mode} onChange={flow.setMode} />
    {flow.mode === 'finder' ? (
      <BikeFinder t={t} locale={locale} rider={toRiderProfile(flow.intake.values, props.currentPains, currentSetupOf(props))} onAudit={flow.auditSuggested} />
    ) : (
      <SearchStep
        t={t}
        values={flow.intake.values}
        setup={currentSetupOf(props)}
        bikeModel={flow.bikeModel}
        setBikeModel={flow.setBikeModel}
        bikes={flow.bikes}
        geometrySlot={<GeometryPanel t={t} bikeModel={flow.bikeModel} found={flow.found} bikes={flow.bikes} onPickName={flow.setBikeModel} onSupplied={(bike) => flow.setSupplied({ name: flow.bikeModel, bike })} onClear={() => flow.setSupplied(null)} />}
        hasGeometry={flow.found !== null}
        error={flow.audit.error}
        isAnalyzing={flow.audit.isAnalyzing}
        onSubmit={flow.runAudit}
        onBack={() => flow.setStep(1)}
      />
    )}
  </div>
);

const ReportSection: React.FC<{ t: Translations; locale: 'en' | 'cs'; flow: Flow; onBackToEntry: () => void }> = ({ t, locale, flow, onBackToEntry }) =>
  flow.audit.result && (
    <ReportStep
      t={t}
      locale={locale}
      analysis={flow.audit.result}
      bikeModel={flow.bikeModel}
      values={flow.intake.values}
      onEditSearch={() => flow.setStep(2)}
      onEditMorphology={() => flow.setStep(1)}
      onBackToEntry={onBackToEntry}
    />
  );

export const PrePurchaseAuditView: React.FC<ViewProps> = (props) => {
  const { t, locale = 'en', onBackToEntry } = props;
  const [activeGuide, setActiveGuide] = useState<GuideType | null>(null);
  const flow = useAuditFlow(props);
  const { values, update, changeHeight } = flow.intake;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      <AuditHeader t={t} step={flow.step} finding={flow.mode === 'finder'} onBack={onBackToEntry} />
      {flow.step === 1 && <SignInOffer t={t} variant="pathB" />}
      {flow.step === 1 && (
        <IntakeStep t={t} values={values} update={update} changeHeight={changeHeight} onOpenGuide={setActiveGuide} onNext={() => flow.setStep(2)} />
      )}
      {flow.step === 2 && <SearchSection t={t} locale={locale} flow={flow} props={props} />}
      {flow.step === 3 && <ReportSection t={t} locale={locale} flow={flow} onBackToEntry={onBackToEntry} />}
      <MeasurementGuideModal isOpen={activeGuide !== null} onClose={() => setActiveGuide(null)} guideType={activeGuide} t={t} />
    </div>
  );
};
