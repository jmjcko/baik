import type { SymptomGroupId, SymptomId, WizardId } from '@/lib/engines/baikcare/troubleshooting';

/** One step of a workshop guide: what to do, the points to follow and an optional warning. */
export interface WizardStepTexts {
  title: string;
  body: string;
  points: string[];
  warning?: string;
}

export interface SymptomTexts {
  label: string;
  /** What usually causes it. */
  cause: string;
  /** What to look at first. */
  checks: string[];
}

export interface FluidTexts {
  name: string;
  brands: string;
}

export interface GuideTexts {
  title: string;
  intro: string;
  diagramLabel: string;
  steps: WizardStepTexts[];
}

/** The workshop of bAIkcare (Epic 36): the troubleshooter and the three step-by-step repair guides. */
export interface WorkshopTexts {
  title: string;
  intro: string;
  back: string;
  next: string;
  previous: string;
  finish: string;
  stepOf: string;
  troubleshooter: {
    title: string;
    intro: string;
    groups: Record<SymptomGroupId, string>;
    symptoms: Record<SymptomId, SymptomTexts>;
    causeTitle: string;
    checksTitle: string;
    nextTitle: string;
    wizardNames: Record<WizardId, string>;
    openGuide: string;
    openNode: string;
    goToChain: string;
  };
  bleed: GuideTexts & {
    fluidRule: string;
    fluidQuestion: string;
    fluidExamples: string;
    fluids: { mineral: FluidTexts; dot: FluidTexts };
    mixWarning: string;
    chosen: string;
    needFluid: string;
    manual: string;
  };
  derailleur: GuideTexts;
  rotor: GuideTexts;
}
