'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { buildExport, downloadExport, type ExportAccount } from '@/lib/passport/exportFile';
import type { SubmissionRow } from '@/lib/catalog/types';
import type { RemoteRecord } from '@/lib/passport/remoteStore';
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

const DownloadMyData: React.FC<{ texts: Translations['profile']['rights']['export']; record: RemoteRecord | null; account: ExportAccount; loadShared?: () => Promise<SubmissionRow[]> }> = ({ texts, record, account, loadShared }) => {
  const [failed, setFailed] = useState(false);
  const download = async () => {
    if (!record) return;
    try {
      const now = new Date();
      downloadExport(buildExport(record, account, now, loadShared ? await loadShared() : []), now);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  };
  return (
    <div className="space-y-2">
      <p className="text-xs text-ink-3 leading-relaxed">{record ? texts.hint : texts.empty}</p>
      <button type="button" disabled={!record} onClick={() => void download()} className={PILL_OUTLINE}>{texts.button}</button>
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
        <Card><DownloadMyData texts={r.export} record={record} account={account} loadShared={loadShared} /></Card>
        <Card><ConfirmAction texts={r.erase} doneText={r.erase.done} onConfirm={onErase} /></Card>
        <Card><ConfirmAction texts={r.deleteAccount} onConfirm={onDeleteAccount} /></Card>
      </div>
    </Block>
  );
};
