'use client';

import React, { useEffect, useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import type { CatalogRow } from '@/lib/catalog/types';
import { GeometryReader } from '@/components/geometry/GeometryReader';
import { adminReader } from '@/components/geometry/readers';
import { useGeometryReading } from '@/components/geometry/useGeometryReading';
import type { AdminActions } from './useAdminData';
import type { UploadPreset } from './MissingBikes';
import { UploadReview, type SaveResult } from './UploadReview';

/** What the tab holds: the files, the name, the reading and the result of the last save. */
function useUploadState(preset: UploadPreset | null, onPresetUsed: () => void) {
  const state = useGeometryReading(adminReader, preset?.name ?? '', { status: preset ? 'working' : 'idle' });
  const [result, setResult] = useState<SaveResult | null>(null);
  useEffect(() => {
    if (!preset) return;
    onPresetUsed();
    state.setFiles(preset.files);
    void adminReader(preset.files, preset.name).then(state.setReading);
  // The preset is read once, when the tab opens with it.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const done = (outcome: SaveResult | null) => {
    setResult(outcome);
    state.setReading({ status: 'idle' });
    if (outcome && outcome.saved === outcome.total) state.clear();
  };
  return { ...state, result, done, read: () => { setResult(null); return state.read(); } };
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
        <GeometryReader texts={u} files={s.files} onFiles={s.setFiles} reading={s.reading} onRead={() => void s.read()} name={{ value: s.name, onChange: s.setName }} />
      )}
      {s.result && <Result u={u} result={s.result} />}
    </div>
  );
};
