/** The five nodes of the M-Check, in the order of the letter M (KB bAIkcare 1.2). */
export const MCHECK_NODES = [1, 2, 3, 4, 5] as const;

export type MCheckNodeId = (typeof MCHECK_NODES)[number];

/** What the rider found at a node; `unchecked` until the rider has gone through its steps. */
export const NODE_STATUSES = ['unchecked', 'pass', 'warn', 'fail'] as const;

export type NodeStatus = (typeof NODE_STATUSES)[number];

/** The chain gauge reads differently for 8 to 10 and for 11 to 12 speeds (KB bAIkcare 2.2). */
export const DRIVETRAIN_SPEEDS = ['8-10', '11-12'] as const;

export type DrivetrainSpeeds = (typeof DRIVETRAIN_SPEEDS)[number];

/** The care of one bike (Epics 35 and 37): the M-Check, the chain gauge, the indoor trainer and the tubeless sealant; kept with the bike in the passport. */
export interface BikeCare {
  nodes: Record<MCheckNodeId, NodeStatus>;
  /** Day of the last M-Check inspection, `YYYY-MM-DD`; null before the first one. */
  inspectedAt: string | null;
  /** The elongation read from the chain gauge in percent; null when not measured. */
  chainWearPct: number | null;
  drivetrain: DrivetrainSpeeds;
  /** The bike is ridden on an indoor trainer (sweat reaches the bars). */
  trainer: boolean;
  /** Day the handlebar tape was fitted, `YYYY-MM-DD`; null when unknown. */
  barTapeAt: string | null;
  /** The tyres are tubeless (they need sealant); false for tyres with inner tubes (Epic 37). */
  tubeless: boolean;
  /** Day the tubeless sealant was last topped up, `YYYY-MM-DD`; null when unknown. */
  sealantAt: string | null;
}

export const DEFAULT_CARE: BikeCare = {
  nodes: { 1: 'unchecked', 2: 'unchecked', 3: 'unchecked', 4: 'unchecked', 5: 'unchecked' },
  inspectedAt: null,
  chainWearPct: null,
  drivetrain: '11-12',
  trainer: false,
  barTapeAt: null,
  tubeless: false,
  sealantAt: null,
};
