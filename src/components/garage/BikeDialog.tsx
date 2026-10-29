'use client';

import React, { useEffect } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';
import { MAX_GARAGE_BIKES } from '@/lib/passport/garage';
import type { BikeProfile } from '@/lib/passport/types';
import type { RidingDiscipline } from '@/types/baikfit';
import { bikeTitle } from '@/components/profile/GarageSection';
import { AddBikeForm } from './AddBikeForm';
import { shortKind } from './bikeLabels';

const PILL = 'h-12 px-6 rounded-full text-sm font-semibold transition-colors border border-line bg-surface text-ink hover:bg-sunken';

interface BikeDialogProps {
  t: Translations;
  garage: { bikes: BikeProfile[]; activeBikeId: string } | null;
  /** Make a bike active; false when it could not be done. */
  onSwitch: (bikeId: string) => boolean;
  /** Add an empty bike that becomes the active one; false when it could not be done. */
  onAdd: (name: string, discipline: RidingDiscipline) => boolean;
  onClose: () => void;
}

/** Closes on Escape, as a dialog should. */
function useEscape(onClose: () => void) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
}

const BikeList: React.FC<{ t: Translations; bikes: BikeProfile[]; onSwitch: (bikeId: string) => boolean; onClose: () => void }> = ({ t, bikes, onSwitch, onClose }) => {
  const g = t.profile.garage;
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-3">{g.dialogYourBikes}</h3>
      <ul className="space-y-2">
        {bikes.map((bike) => (
          <li key={bike.id}>
            <button type="button" aria-current={bike.isActive ? 'true' : undefined} onClick={() => { if (onSwitch(bike.id)) onClose(); }} className={cx('w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors', bike.isActive ? 'border-tone-info-line bg-tone-info-bg text-ink font-semibold' : 'border-line bg-surface text-ink hover:bg-sunken')}>
              <span className="block">{bikeTitle(g, bike)}</span>
              <span className="block text-[11px] font-mono uppercase text-ink-3">{shortKind(t, bike.discipline)}{bike.isActive ? ` · ${g.active}` : ''}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * "Which bike are you fitting?": the bikes of the garage to choose from and a form to add a new one, in one popup that opens from the
 * wizard, the sidebar and the page where the assessment starts, so that nobody is sent to the profile page to add a bike.
 */
export const BikeDialog: React.FC<BikeDialogProps> = ({ t, garage, onSwitch, onAdd, onClose }) => {
  const g = t.profile.garage;
  useEscape(onClose);
  const bikes = garage?.bikes ?? [];
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="bike-dialog-title" data-testid="bike-dialog" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-line bg-surface p-6 shadow-xl space-y-5">
        <div>
          <h2 id="bike-dialog-title" className="text-lg font-bold text-ink tracking-tight">{g.dialogTitle}</h2>
          <p className="text-sm text-ink-2 leading-relaxed mt-1">{g.dialogIntro}</p>
        </div>
        {bikes.length > 0 && <BikeList t={t} bikes={bikes} onSwitch={onSwitch} onClose={onClose} />}
        <div className="space-y-3 border-t border-line pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-3">{g.dialogAddTitle}</h3>
          {bikes.length >= MAX_GARAGE_BIKES ? <p className="text-sm text-ink-2">{g.full}</p> : <AddBikeForm t={t} onAdd={onAdd} onAdded={onClose} />}
        </div>
        <button type="button" onClick={onClose} className={PILL}>{g.dialogClose}</button>
      </div>
    </div>
  );
};
