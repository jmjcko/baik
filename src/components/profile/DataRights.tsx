'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { buildExport, downloadExport, type ExportAccount } from '@/lib/passport/exportFile';
import type { SubmissionRow } from '@/lib/catalog/types';
import type { RemoteRecord } from '@/lib/passport/remoteStore';
import { riderName } from '@/components/riders/riderName';
import { ConfirmAction } from './ConfirmAction';
import { Block, Card, PILL_OUTLINE } from './ProfileParts';

interface DataRightsProps {
  t: Translations;
  /** The stored row, or null when nothing is stored (nothing to download). */
  record: RemoteRecord | null;
  account: ExportAccount;
  /** The bikes that the rider shared with the catalog, for the export. */
  loadShared?: () => Promise<SubmissionRow[]>;
  onErase: () => Promise<boolean>;
  onDeleteAccount: () => Promise<boolean>;
}

/** Which riders go into the file (a check box each); shown only when the account has two or more riders. */
const RiderPick: React.FC<{ t: Translations; record: RemoteRecord; chosen: string[]; onChange: (ids: string[]) => void }> = ({ t, record, chosen, onChange }) => {
  if (record.passport.riders.length < 2) return null;
  const toggle = (id: string) => onChange(chosen.includes(id) ? chosen.filter((other) => other !== id) : [...chosen, id]);
  return (
    <fieldset className="space-y-1" data-testid="export-riders">
      <legend className="text-xs font-semibold text-ink-2">{t.riders.exportPick}</legend>
      {record.passport.riders.map((rider) => (
        <label key={rider.id} className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={chosen.includes(rider.id)} onChange={() => toggle(rider.id)} className="h-4 w-4 accent-blue-600" />
          {riderName(t, rider.name)}
        </label>
      ))}
      {chosen.length === 0 && <p role="alert" className="text-xs text-tone-danger-ink">{t.riders.exportNone}</p>}
    </fieldset>
  );
};

const DownloadMyData: React.FC<{ t: Translations; record: RemoteRecord | null; account: ExportAccount; loadShared?: () => Promise<SubmissionRow[]> }> = ({ t, record, account, loadShared }) => {
  const texts = t.profile.rights.export;
  const [failed, setFailed] = useState(false);
  const [picked, setPicked] = useState<string[] | null>(null);
  const chosen = picked ?? record?.passport.riders.map((rider) => rider.id) ?? [];
  const download = async () => {
    if (!record) return;
    try {
      const now = new Date();
      downloadExport(buildExport(record, account, now, loadShared ? await loadShared() : [], chosen), now);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  };
  return (
    <div className="space-y-2">
      <p className="text-xs text-ink-3 leading-relaxed">{record ? texts.hint : texts.empty}</p>
      {record && <RiderPick t={t} record={record} chosen={chosen} onChange={setPicked} />}
      <button type="button" disabled={!record || chosen.length === 0} onClick={() => void download()} className={PILL_OUTLINE}>{texts.button}</button>
      {failed && <p role="alert" className="text-sm text-tone-danger-ink">{texts.error}</p>}
    </div>
  );
};

/** The rider's rights over the stored data: download everything, delete the stored profile, delete the account. */
export const DataRights: React.FC<DataRightsProps> = ({ t, record, account, loadShared, onErase, onDeleteAccount }) => {
  const r = t.profile.rights;
  return (
    <Block id="profile-rights" title={r.title} intro={r.intro}>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><DownloadMyData t={t} record={record} account={account} loadShared={loadShared} /></Card>
        <Card><ConfirmAction texts={r.erase} doneText={r.erase.done} onConfirm={onErase} /></Card>
        <Card><ConfirmAction texts={r.deleteAccount} onConfirm={onDeleteAccount} /></Card>
      </div>
    </Block>
  );
};
