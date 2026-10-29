import type { MCheckNodeId } from '@/types/maintain';

/** The step-by-step guides of the workshop. */
export const WIZARD_IDS = ['bleed', 'derailleur', 'rotor'] as const;
export type WizardId = (typeof WIZARD_IDS)[number];

export const SYMPTOM_GROUPS = [
  { id: 'drivetrain', symptoms: ['chainSkips', 'chainDrops', 'noisyDrive'] },
  { id: 'brakes', symptoms: ['spongyLever', 'rotorRub', 'weakBraking'] },
  { id: 'movement', symptoms: ['playLooseness', 'bottomBracketCreak'] },
] as const;

export type SymptomGroupId = (typeof SYMPTOM_GROUPS)[number]['id'];
export type SymptomId = (typeof SYMPTOM_GROUPS)[number]['symptoms'][number];

/** Where a symptom sends the rider: a guide of the workshop, a node of the M-Check or the chain gauge. */
export type SymptomTarget = { kind: 'wizard'; wizard: WizardId } | { kind: 'node'; node: MCheckNodeId } | { kind: 'chain' };

const TARGETS: Record<SymptomId, SymptomTarget[]> = {
  chainSkips: [{ kind: 'chain' }, { kind: 'wizard', wizard: 'derailleur' }],
  chainDrops: [{ kind: 'wizard', wizard: 'derailleur' }, { kind: 'chain' }],
  noisyDrive: [{ kind: 'chain' }, { kind: 'wizard', wizard: 'derailleur' }],
  spongyLever: [{ kind: 'wizard', wizard: 'bleed' }],
  rotorRub: [{ kind: 'wizard', wizard: 'rotor' }, { kind: 'node', node: 1 }],
  weakBraking: [{ kind: 'wizard', wizard: 'bleed' }, { kind: 'node', node: 1 }],
  playLooseness: [{ kind: 'node', node: 2 }, { kind: 'node', node: 1 }, { kind: 'node', node: 5 }],
  bottomBracketCreak: [{ kind: 'node', node: 3 }],
};

export const ALL_SYMPTOMS: SymptomId[] = SYMPTOM_GROUPS.flatMap((group) => [...group.symptoms]);

/** The guides and checks that a symptom points to, the most likely first. */
export function targetsFor(symptom: SymptomId): SymptomTarget[] {
  return TARGETS[symptom];
}

/** The group a symptom belongs to. */
export function groupOf(symptom: SymptomId): SymptomGroupId {
  return SYMPTOM_GROUPS.find((group) => (group.symptoms as readonly string[]).includes(symptom))!.id;
}
