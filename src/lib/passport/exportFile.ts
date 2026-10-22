import type { RemoteRecord } from './remoteStore';

/** Facts about the account that go into the export next to the passport. */
export interface ExportAccount {
  email: string | null;
  createdAt: string | null;
}

export interface PassportExport {
  exportedAt: string;
  account: ExportAccount;
  passportSavedAt: string | null;
  passport: RemoteRecord['passport'];
}

/** The document the rider downloads: everything stored about them, as plain JSON. */
export function buildExport(record: RemoteRecord, account: ExportAccount, now: Date): PassportExport {
  return { exportedAt: now.toISOString(), account, passportSavedAt: record.updatedAt, passport: record.passport };
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
