import { describe, it, expect } from 'vitest';
import { ALL_SYMPTOMS, SYMPTOM_GROUPS, WIZARD_IDS, groupOf, targetsFor } from '../troubleshooting';

describe('the troubleshooting tree', () => {
  it('should hold the eight symptoms in three groups', () => {
    expect(SYMPTOM_GROUPS.map((group) => group.id)).toEqual(['drivetrain', 'brakes', 'movement']);
    expect(ALL_SYMPTOMS).toHaveLength(8);
    expect(new Set(ALL_SYMPTOMS).size).toBe(8);
  });

  it('should give every symptom at least one target, and only real guides and nodes', () => {
    for (const symptom of ALL_SYMPTOMS) {
      const targets = targetsFor(symptom);
      expect(targets.length).toBeGreaterThan(0);
      for (const target of targets) {
        if (target.kind === 'wizard') expect(WIZARD_IDS).toContain(target.wizard);
        if (target.kind === 'node') expect([1, 2, 3, 4, 5]).toContain(target.node);
      }
    }
  });

  it.each([
    ['chainSkips', 'chain'], ['chainDrops', 'wizard'], ['spongyLever', 'wizard'], ['rotorRub', 'wizard'], ['bottomBracketCreak', 'node'],
  ] as const)('should lead %s first to a %s', (symptom, kind) => {
    expect(targetsFor(symptom)[0].kind).toBe(kind);
  });

  it('should send the brake symptoms to the right guides and the play to the nodes of the M-Check', () => {
    expect(targetsFor('spongyLever')).toEqual([{ kind: 'wizard', wizard: 'bleed' }]);
    expect(targetsFor('rotorRub')[0]).toEqual({ kind: 'wizard', wizard: 'rotor' });
    expect(targetsFor('chainDrops')[0]).toEqual({ kind: 'wizard', wizard: 'derailleur' });
    expect(targetsFor('playLooseness')).toEqual([{ kind: 'node', node: 2 }, { kind: 'node', node: 1 }, { kind: 'node', node: 5 }]);
  });

  it('should find the group of a symptom', () => {
    expect(groupOf('weakBraking')).toBe('brakes');
    expect(groupOf('noisyDrive')).toBe('drivetrain');
    expect(groupOf('bottomBracketCreak')).toBe('movement');
  });
});
