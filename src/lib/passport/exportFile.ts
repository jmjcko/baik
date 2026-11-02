import type { SubmissionRow } from '@/lib/catalog/types';
import type { RemoteRecord } from './remoteStore';
import type { RiderPassport } from './types';

/** Facts about the account that go into the export next to the passport. */
export interface ExportAccount {
  email: string | null;
  createdAt: string | null;
}

export interface SharedBikeExport {
  brand: string;
  model: string;
  year: number;
  size: string;
  status: SubmissionRow['status'];
  sharedAt: string;
  spec: SubmissionRow['spec'];
}

export interface PassportExport {
  exportedAt: string;
  account: ExportAccount;
  passportSavedAt: string | null;
  passport: RemoteRecord['passport'];
  /** The bike numbers that the rider shared with the community catalog. */
  sharedBikes: SharedBikeExport[];
}

/** The passport with only the chosen riders and their bikes (a candidate bike has no rider and stays); the active bike moves to a bike that is left. */
export function onlyRiders(passport: RiderPassport, riderIds: string[]): RiderPassport {
  const riders = passport.riders.filter((rider) => riderIds.includes(rider.id));
  const bikes = passport.bikes.filter((bike) => bike.kind === 'candidate' || riderIds.includes(bike.primaryRiderId ?? passport.riders[0].id));
  const active = bikes.some((bike) => bike.id === passport.activeBikeId) ? passport.activeBikeId : (bikes.find((bike) => bike.kind === 'current')?.id ?? passport.activeBikeId);
  return { ...passport, riders, bikes, activeBikeId: active };
}

/** The document the rider downloads: everything stored about them, as plain JSON; with `riderIds` only those riders and their bikes. */
export function buildExport(record: RemoteRecord, account: ExportAccount, now: Date, shared: SubmissionRow[] = [], riderIds?: string[]): PassportExport {
  const passport = riderIds ? onlyRiders(record.passport, riderIds) : record.passport;
  const sharedBikes = shared.map((bike) => ({ brand: bike.brand, model: bike.model, year: bike.year, size: bike.size, status: bike.status, sharedAt: bike.createdAt, spec: bike.spec }));
  return { exportedAt: now.toISOString(), account, passportSavedAt: record.updatedAt, passport, sharedBikes };
}

export const exportFileName = (now: Date): string => `baik-my-data-${now.toISOString().slice(0, 10)}.json`;

/** Hands the document to the browser as a file download; nothing is sent anywhere. */
export function downloadExport(data: PassportExport, now: Date): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = exportFileName(now);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
