'use client';

import React, { useState } from 'react';
import { Pencil } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';
import { useEscape } from '@/lib/hooks/useEscape';
import { MAX_BIKE_NAME_LENGTH } from '@/lib/passport/garage';
import type { BikeProfile } from '@/lib/passport/types';
import { loadBook, saveBook } from '@/lib/service/bookStore';
import type { BikeCare } from '@/types/maintain';
import type { BikeIdentity } from '@/types/service';
import type { RidingDiscipline } from '@/types/baikfit';
import { IdentityFields } from '@/components/maintain/BikePassportCard';
import { KindPicker, NameField, TrainerField } from './AddBikeForm';
import { CHIP_OFF } from '@/components/primitives/fieldStyles';

const PILL = 'h-12 px-6 rounded-full text-sm font-semibold transition-colors';

export interface BikeEditProps {
  t: Translations;
  /** The bike that is edited: the active bike of the garage (the identity is kept in the book of this bike). */
  bike: BikeProfile;
  care: BikeCare;
  onRename: (bikeId: string, name: string) => boolean;
  onDiscipline: (discipline: RidingDiscipline) => void;
  onCare: (patch: Partial<BikeCare>) => void;
  /** Opens the setup guide at the step of the bike. */
  onEditSetup: () => void;
  /** Called after a successful save, so that the pages that hold the book of the bike read it again. */
  onSaved: () => void;
  onClose: () => void;
}

interface Draft {
  name: string;
  discipline: RidingDiscipline;
  trainer: boolean;
  identity: BikeIdentity;
}

/** Writes what changed; false when the name was refused or the browser did not keep the book. */
function saveDraft(props: BikeEditProps, draft: Draft): boolean {
  const { bike, care } = props;
  const name = draft.name.trim();
  if (name !== '' && name !== (bike.name ?? '') && !props.onRename(bike.id, name)) return false;
  if (draft.discipline !== bike.discipline) props.onDiscipline(draft.discipline);
  if (draft.trainer !== care.trainer) props.onCare({ trainer: draft.trainer });
  return saveBook(bike.id, { ...loadBook(bike.id), identity: draft.identity });
}

/** The setup numbers are not edited here: the guide holds them, and the report and the studio are calculated from them. */
const SetupLink: React.FC<{ t: Translations; onEditSetup: () => void }> = ({ t, onEditSetup }) => (
  <div className="rounded-xl border border-field-line bg-sunken p-4 space-y-2" data-testid="edit-setup">
    <h3 className="text-sm font-bold text-ink">{t.bikeEdit.setupTitle}</h3>
    <p className="text-xs text-ink-2">{t.bikeEdit.setupHint}</p>
    <button type="button" onClick={onEditSetup} data-testid="edit-setup-button" className={cx(PILL, CHIP_OFF, 'text-accent-ink')}>{t.bikeEdit.setupButton}</button>
  </div>
);

interface SectionProps {
  t: Translations;
  draft: Draft;
  setDraft: (draft: Draft) => void;
}

/** The name, the kind and the trainer flag. */
const Basics: React.FC<SectionProps> = ({ t, draft, setDraft }) => (
  <section className="space-y-3" aria-label={t.bikeEdit.basics}>
    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-2">{t.bikeEdit.basics}</h3>
    <NameField label={t.profile.garage.nameLabel} value={draft.name} placeholder={t.profile.garage.namePlaceholder} onChange={(name) => setDraft({ ...draft, name: name.slice(0, MAX_BIKE_NAME_LENGTH) })} />
    <KindPicker t={t} value={draft.discipline} onChange={(discipline) => setDraft({ ...draft, discipline })} />
    <TrainerField t={t} checked={draft.trainer} onChange={(trainer) => setDraft({ ...draft, trainer })} />
  </section>
);

/** Make, model, year, serial, insurance and the photo. */
const Identity: React.FC<SectionProps> = ({ t, draft, setDraft }) => (
  <section className="space-y-3" aria-label={t.bikeEdit.identity}>
    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-2">{t.bikeEdit.identity}</h3>
    <IdentityFields t={t} identity={draft.identity} onChange={(patch) => setDraft({ ...draft, identity: { ...draft.identity, ...patch } })} />
  </section>
);

/**
 * "Edit bike": the name, the kind, the trainer flag and the identity of the active bike in one dialog, opened from the garage and from the choice of the bike.
 * The changes are kept in a draft and written together with Save.
 */
export const BikeEditDialog: React.FC<BikeEditProps> = (props) => {
  const { t, bike, care, onClose, onSaved } = props;
  const [draft, setDraft] = useState<Draft>(() => ({ name: bike.name ?? '', discipline: bike.discipline, trainer: care.trainer, identity: loadBook(bike.id).identity }));
  const [failed, setFailed] = useState(false);
  useEscape(onClose);
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const done = saveDraft(props, draft);
    setFailed(!done);
    if (done) { onSaved(); onClose(); }
  };
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="bike-edit-title" data-testid="bike-edit-dialog" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <form onSubmit={submit} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-line bg-surface p-6 shadow-xl space-y-5">
        <div>
          <h2 id="bike-edit-title" className="text-lg font-bold text-ink tracking-tight flex items-center gap-2"><Pencil aria-hidden="true" className="w-4 h-4" />{t.bikeEdit.title}</h2>
          <p className="text-sm text-ink mt-1">{t.bikeEdit.intro}</p>
        </div>
        <Basics t={t} draft={draft} setDraft={setDraft} />
        <Identity t={t} draft={draft} setDraft={setDraft} />
        <SetupLink t={t} onEditSetup={props.onEditSetup} />
        {failed && <p role="alert" data-testid="bike-edit-failed" className="text-sm text-tone-danger-ink">{t.bikeEdit.failed}</p>}
        <div className="flex flex-wrap gap-2">
          <button type="submit" data-testid="bike-edit-save" className={cx(PILL, 'border border-blue-600 bg-blue-600 text-slate-50 hover:bg-blue-700')}>{t.bikeEdit.save}</button>
          <button type="button" onClick={onClose} data-testid="bike-edit-cancel" className={cx(PILL, CHIP_OFF, 'text-ink')}>{t.bikeEdit.cancel}</button>
        </div>
      </form>
    </div>
  );
};
