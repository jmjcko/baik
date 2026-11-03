import type { ChainVerdict } from '@/lib/engines/baikcare/chainWear';
import type { DrivetrainSpeeds, NodeStatus } from '@/types/maintain';

/** One node of the M-Check: its name, why it matters and the numbered checks (the numbers are from the bAIkcare knowledge base). */
export interface NodeTexts {
  name: string;
  short: string;
  intro: string;
  steps: string[];
}

export interface VerdictTexts {
  title: string;
  body: string;
}

export interface WashStepTexts {
  title: string;
  body: string;
  /** The expert micro tip that opens under the step. */
  tip: string;
}

/** One piece of kit and what it is for. */
export interface WashKitTexts {
  name: string;
  text: string;
}

/** The bAIkcare page (Epic 35): the M-Check on the side view of the bike, the chain gauge with the indoor trainer, and the 5-minute wash. */
export interface CareTexts {
  title: string;
  subtitle: string;
  bikeLabel: string;
  noBike: string;
  mcheck: {
    title: string;
    intro: string;
    hotspot: string;
    drawingLabel: string;
    lastInspection: string;
    neverInspected: string;
    summary: string;
    legendTitle: string;
    allClear: string;
    attention: string;
  };
  status: Record<NodeStatus, string>;
  verdictLabel: Record<Exclude<NodeStatus, 'unchecked'>, string>;
  node: {
    close: string;
    stepsTitle: string;
    setStatus: string;
    reset: string;
    diagramLabel: string;
  };
  nodes: Record<'1' | '2' | '3' | '4' | '5', NodeTexts>;
  chain: {
    title: string;
    intro: string;
    speedsLabel: string;
    speeds: Record<DrivetrainSpeeds, string>;
    readingLabel: string;
    readingHint: string;
    invalid: string;
    empty: string;
    clear: string;
    verdicts: Record<ChainVerdict, VerdictTexts>;
  };
  trainer: {
    title: string;
    intro: string;
    switchLabel: string;
    tapeLabel: string;
    tapeHint: string;
    due: string;
    unknown: string;
    fine: string;
    off: string;
  };
  wash: {
    title: string;
    intro: string;
    goldenRule: string;
    steps: [WashStepTexts, WashStepTexts, WashStepTexts, WashStepTexts];
    tipLabel: string;
    equipment: {
      title: string;
      intro: string;
      brushesTitle: string;
      brushes: [WashKitTexts, WashKitTexts, WashKitTexts];
      chemistryTitle: string;
      chemistry: [WashKitTexts, WashKitTexts, WashKitTexts];
    };
    pressure: { title: string; body: string; safeTitle: string; safe: string };
    prohibitionsTitle: string;
    prohibitions: [string, string, string];
    approvedTitle: string;
    approved: string;
  };
}
