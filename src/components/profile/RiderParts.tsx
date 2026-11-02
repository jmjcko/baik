'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { MAX_RIDER_NAME_LENGTH } from '@/lib/passport/riders';
import type { RiderSummary } from '@/lib/passport/types';
import { riderName } from '@/components/riders/riderName';
import { PILL_DANGER, PILL_SECONDARY, PILL_SOLID } from './ProfileParts';

const FIELD = 'w-full h-12 rounded-xl border border-line bg-surface px-4 text-sm text-ink focus:outline-none focus:border-tone-info-line';

/** The name of the rider as a small form while it is changed. */
export const RenameRider: React.FC<{ t: Translations; rider: RiderSummary; onRename: (riderId: string, name: string) => boolean; onDone: () => void }> = ({ t, rider, onRename, onDone }) => {
  const [draft, setDraft] = useState(rider.name ?? '');
  const [failed, setFailed] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const done = onRename(rider.id, draft);
    setFailed(!done);
    if (done) onDone();
  };
  return (
    <form onSubmit={submit} className="space-y-2 w-full max-w-md" data-testid="rider-rename">
      <input type="text" aria-label={`${t.riders.nameLabel}: ${riderName(t, rider.name)}`} maxLength={MAX_RIDER_NAME_LENGTH} value={draft} onChange={(e) => setDraft(e.target.value)} className={FIELD} />
      {failed && <p role="alert" className="text-sm text-tone-danger-ink">{t.riders.nameInvalid}</p>}
      <div className="flex gap-2">
        <button type="submit" className={PILL_SOLID}>{t.riders.save}</button>
        <button type="button" onClick={onDone} className={PILL_SECONDARY}>{t.riders.cancel}</button>
      </div>
    </form>
  );
};

/** Removing a rider after the menu item was chosen: the choice of the rider who takes the bikes (when this rider has any) and a confirmation. */
export const RemoveRider: React.FC<{ t: Translations; rider: RiderSummary; others: RiderSummary[]; onRemove: (riderId: string, takeoverId: string) => boolean; onCancel: () => void }> = ({ t, rider, others, onRemove, onCancel }) => {
  const [takeover, setTakeover] = useState(others[0]?.id ?? '');
  const [failed, setFailed] = useState(false);
  return (
    <div className="space-y-2 max-w-md" data-testid="rider-remove">
      {rider.bikeIds.length > 0 && (
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-ink-2">{t.riders.takeoverLabel}</span>
          <select value={takeover} onChange={(e) => setTakeover(e.target.value)} className={FIELD} data-testid="rider-takeover">
            {others.map((other) => <option key={other.id} value={other.id}>{riderName(t, other.name)}</option>)}
          </select>
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setFailed(!onRemove(rider.id, takeover))} className={PILL_DANGER}>{t.riders.confirmRemove}</button>
        <button type="button" onClick={onCancel} className={PILL_SECONDARY}>{t.riders.cancel}</button>
      </div>
      {failed && <p role="alert" className="text-sm text-tone-danger-ink">{t.riders.failed}</p>}
    </div>
  );
};
