'use client';

import React, { useEffect, useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { ADMIN_MAX_BYTES } from '@/lib/bikes/adminExtraction';
import type { BikeTable } from '@/lib/bikes/tableExtraction';
import type { CatalogRow } from '@/lib/catalog/types';
import type { AdminActions } from './useAdminData';
import { FIELD, PILL_PRIMARY } from './AdminParts';
import type { UploadPreset } from './MissingBikes';
import { TableDropZone } from './TableDropZone';
import { UploadReview, type SaveResult } from './UploadReview';

type ErrorCode = keyof Translations['admin']['upload']['errors'];
type Reading = { status: 'idle' | 'working' } | { status: 'error'; error: ErrorCode } | { status: 'review'; table: BikeTable };

const CODES: ErrorCode[] = ['forbidden', 'invalid_input', 'not_configured', 'rate_limited', 'unavailable', 'unreadable'];

/** The answer of the upload route: every size that was read, or a fixed code (anything else counts as unavailable). */
async function readFiles(files: File[], name: string): Promise<Reading> {
  const form = new FormData();
  for (const file of files) form.append('files', file);
  form.append('name', name);
  try {
    const answer = (await (await fetch('/api/admin/extract', { method: 'POST', body: form })).json()) as { success?: boolean; table?: BikeTable; error?: string };
    if (answer.success && answer.table) return { status: 'review', table: answer.table };
    return { status: 'error', error: CODES.includes(answer.error as ErrorCode) ? (answer.error as ErrorCode) : 'unavailable' };
  } catch {
    return { status: 'error', error: 'unavailable' };
  }
}

interface FormProps {
  t: Translations;
  files: File[];
  name: string;
  reading: Reading;
  onFiles: (files: File[]) => void;
  onName: (name: string) => void;
  onRead: () => void;
}

/** The tables and the name of the bike; "Read all sizes" sends them to the owner's upload route. */
const UploadForm: React.FC<FormProps> = ({ t, files, name, reading, onFiles, onName, onRead }) => {
  const u = t.admin.upload;
  const [tried, setTried] = useState(false);
  const total = files.reduce((sum, file) => sum + file.size, 0);
  const incomplete = files.length === 0 || name.trim() === '' || total > ADMIN_MAX_BYTES;
  return (
    <form onSubmit={(e) => { e.preventDefault(); setTried(true); if (!incomplete) onRead(); }} className="space-y-3">
      <TableDropZone texts={u} files={files} onFiles={onFiles} />
      <label className="block space-y-1 max-w-md"><span className="text-xs font-semibold text-ink-2">{u.nameLabel}</span><input type="text" maxLength={80} placeholder={u.namePlaceholder} value={name} onChange={(e) => onName(e.target.value)} className={FIELD} /></label>
      {(reading.status === 'error' || (tried && incomplete)) && <p role="alert" className="text-sm text-tone-danger-ink">{u.errors[tried && incomplete ? 'invalid_input' : (reading as { error: ErrorCode }).error]}</p>}
      <button type="submit" disabled={reading.status === 'working'} className={PILL_PRIMARY}>{reading.status === 'working' ? u.reading : u.read}</button>
    </form>
  );
};

/** What the tab holds: the files, the name, the reading and the result of the last save. */
function useUploadState(preset: UploadPreset | null, onPresetUsed: () => void) {
  const [files, setFiles] = useState<File[]>(preset?.files ?? []);
  const [name, setName] = useState(preset?.name ?? '');
  const [reading, setReading] = useState<Reading>({ status: preset ? 'working' : 'idle' });
  const [result, setResult] = useState<SaveResult | null>(null);
  const read = async () => {
    setResult(null);
    setReading({ status: 'working' });
    setReading(await readFiles(files, name.trim()));
  };
  useEffect(() => {
    if (!preset) return;
    onPresetUsed();
    void readFiles(preset.files, preset.name).then(setReading);
  // The preset is read once, when the tab opens with it.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const done = (outcome: SaveResult | null) => {
    setResult(outcome);
    setReading({ status: 'idle' });
    if (outcome && outcome.saved === outcome.total) {
      setFiles([]);
      setName('');
    }
  };
  return { files, setFiles, name, setName, reading, result, read, done };
}

const Result: React.FC<{ u: Translations['admin']['upload']; result: SaveResult }> = ({ u, result }) =>
  result.saved === result.total ? (
    <div className="space-y-1">
      <p role="status" className="text-sm text-tone-success-ink">{fill(u.saved, { count: result.saved })}</p>
      {result.seed === 'saved' && <p role="status" className="text-sm text-tone-success-ink">{u.seedDisk.saved}</p>}
      {result.seed === 'failed' && <p role="alert" className="text-sm text-tone-danger-ink">{u.seedDisk.failed}</p>}
    </div>
  ) : (
    <p role="alert" className="text-sm text-tone-danger-ink">{fill(u.partlySaved, { saved: result.saved, count: result.total })}</p>
  );

/** The owner's own entries: the tables of a bike (pictures or PDFs) are read for every size at once, checked and saved as verified. */
export const UploadTab: React.FC<{ t: Translations; catalog: CatalogRow[]; actions: AdminActions; preset?: UploadPreset | null; onPresetUsed?: () => void }> = ({ t, catalog, actions, preset = null, onPresetUsed = () => undefined }) => {
  const u = t.admin.upload;
  const s = useUploadState(preset, onPresetUsed);
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-ink">{u.title}</h3>
        <p className="text-sm text-ink-2 leading-relaxed mt-1 max-w-3xl">{u.hint}</p>
      </div>
      {s.reading.status === 'review' ? (
        <UploadReview t={t} table={s.reading.table} name={s.name} catalog={catalog} actions={actions} onDone={s.done} />
      ) : (
        <UploadForm t={t} files={s.files} name={s.name} reading={s.reading} onFiles={s.setFiles} onName={s.setName} onRead={() => void s.read()} />
      )}
      {s.result && <Result u={u} result={s.result} />}
    </div>
  );
};
