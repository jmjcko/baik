import React, { useState } from 'react';
import { MeasurementGuideModal } from '@/components/baikfit/MeasurementGuideModal';
import type { GuideType } from '@/components/baikfit/guides';
import { resolveStockBike } from '@/lib/bikes/resolve';
import type { StockSelection } from '@/lib/bikes/types';
import type { MtbSetup } from '@/lib/engines/baikfit/mtb';
import type { RidingDiscipline } from '@/types/baikfit';
import { MtbSetupFields } from './MtbSetupFields';
import { CurrentSetupFields, type CurrentSetupProps } from './CurrentSetupFields';
import { StockBikePicker } from './stock/StockBikePicker';
import { StepHeading } from './WizardChrome';
import { CustomSetupFields } from './custom/CustomSetupFields';
import { SetupModeSwitch } from './custom/SetupModeSwitch';
import type { CustomSetup, SetupMode } from '@/lib/engines/baikfit/customSetup';

type CurrentBikeStepProps = Omit<CurrentSetupProps, 'onOpenGuide'> & {
  stockBike: StockSelection | null;
  setStockBike: (selection: StockSelection | null) => void;
  discipline?: RidingDiscipline;
  /** The garage bike of the wizard: another bike starts the factory setup picker afresh (it keeps its own state while it is shown). */
  activeBikeId?: string;
  /** The name of the active garage bike and the way to add one: they let the picker offer a new bike before it replaces the factory setup of the active one. */
  activeBikeName?: string | null;
  onAddBike?: (name: string) => boolean;
  mtb?: MtbSetup;
  setMtb?: (patch: Partial<MtbSetup>) => void;
  /** Series bike (factory setup) or modified bike (numbers measured by the rider), Epic 34. */
  setupMode?: SetupMode;
  setSetupMode?: (mode: SetupMode) => void;
  custom?: CustomSetup;
  setCustom?: (patch: Partial<CustomSetup>) => void;
};

/** Wizard step 4: the factory setup of the bike (optional), the rider's current crank length, saddle height and handlebar width with their guides. */
export const CurrentBikeStep: React.FC<CurrentBikeStepProps> = (props) => {
  const [activeGuide, setActiveGuide] = useState<GuideType | null>(null);
  /* With the factory setup known, the handlebar and the cranks are the ones of the maker (when it publishes them), so the audit is unambiguous. */
  const factory = resolveStockBike(props.stockBike, 'road')?.spec;
  const isMtb = props.discipline === 'xc_mtb';
  return (
    <div className="space-y-6" data-testid="current-bike-step">
      <StepHeading title={props.t.wizard.bikeTitle} subtitle={props.t.wizard.bikeSubtitle} />
      {props.setSetupMode && <SetupModeSwitch texts={props.t.customSetup} mode={props.setupMode ?? 'stock'} onChange={props.setSetupMode} />}
      {props.setupMode === 'custom' && props.custom && props.setCustom ? (
        <>
          {isMtb && props.mtb && props.setMtb && <MtbSetupFields t={props.t} mtb={props.mtb} setMtb={props.setMtb} />}
          <CustomSetupFields {...props} custom={props.custom} setCustom={props.setCustom} flatBar={isMtb} />
        </>
      ) : (
        <>
          <StockBikePicker key={props.activeBikeId} t={props.t} stockBike={props.stockBike} setStockBike={props.setStockBike} setCurrentBarWidthMm={props.setCurrentBarWidthMm} setCrankLengthMm={props.setCrankLengthMm} activeBikeName={props.activeBikeName} onAddBike={props.onAddBike} />
          {isMtb && props.mtb && props.setMtb && <MtbSetupFields t={props.t} mtb={props.mtb} setMtb={props.setMtb} />}
          <CurrentSetupFields {...props} flatBar={isMtb} lockedBar={factory?.stockHandlebarMm != null} lockedCrank={factory?.stockCrankMm != null} onOpenGuide={setActiveGuide} />
        </>
      )}
      <MeasurementGuideModal isOpen={activeGuide !== null} onClose={() => setActiveGuide(null)} guideType={activeGuide} t={props.t} />
    </div>
  );
};
