import { DEFAULT_PROFILE } from '@/lib/profile/values';
import { passportToProfile } from './mappers';
import type { RiderPassport } from './types';

/** JSON with sorted keys, so that two objects with the same content compare equal whatever the order of their keys. */
function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

/** The part of a passport that the rider entered: the wizard values, optional measurements, gear and candidate bikes (not the calculated targets). */
function dataOf(passport: RiderPassport): string {
  const { targets: _targets, bikes, ...rest } = passport;
  void _targets;
  return stable({ ...rest, profile: passportToProfile(passport), others: bikes.filter((bike) => bike.kind !== 'current') });
}

/** True when the passport holds only what a new guest starts with, so there is nothing to keep. */
export function isEmptyPassport(passport: RiderPassport): boolean {
  const { anatomy, gear, bikes } = passport;
  const extras = Object.keys(anatomy).length > 6 || Object.keys(gear).length > 0 || bikes.some((bike) => bike.kind !== 'current');
  return !extras && stable(passportToProfile(passport)) === stable(DEFAULT_PROFILE);
}

export const samePassportData = (a: RiderPassport, b: RiderPassport): boolean => dataOf(a) === dataOf(b);

export type MergeDecision = 'nothing' | 'upload-device' | 'use-account' | 'ask';

/**
 * What to do at the first sign in on a device: take over the device data when the account has none, use the account
 * when the device has nothing (or the same), and ask only when both hold different data.
 */
export function decideMerge(device: RiderPassport | null, account: RiderPassport | null): MergeDecision {
  const deviceHasData = device !== null && !isEmptyPassport(device);
  if (!account) return deviceHasData ? 'upload-device' : 'nothing';
  if (!deviceHasData || samePassportData(device, account)) return 'use-account';
  return 'ask';
}
