import type { FlatScenarioId } from '@/lib/engines/baikcare/flatRepair';
import type { TyreCategory } from '@/lib/engines/baikcare/tyrePressure';
import type { WizardStepTexts } from './workshop';

export interface FlatScenarioTexts {
  name: string;
  summary: string;
  diagramLabel: string;
  steps: WizardStepTexts[];
}

/** The wheels and tyres card of bAIkcare (Epic 37): the tyre system and the sealant, the pressure, the wear checks and the flat repair guide. */
export interface WheelsTexts {
  title: string;
  intro: string;
  back: string;
  setup: { label: string; tube: string; tubeless: string };
  sealant: {
    title: string;
    dateLabel: string;
    hint: string;
    unknown: string;
    fresh: string;
    topUp: string;
    overdue: string;
    off: string;
    window: string;
  };
  pressure: {
    title: string;
    intro: string;
    reference: string;
    categories: Record<TyreCategory, string>;
    range: string;
    yours: string;
    weightNote: string;
    otherWidth: string;
  };
  wear: { title: string; intro: string; items: { title: string; body: string }[] };
  flat: {
    title: string;
    intro: string;
    open: string;
    openHint: string;
    pick: string;
    backToList: string;
    scenarios: Record<FlatScenarioId, FlatScenarioTexts>;
  };
}
