import React from 'react';
import { ImageUp, PencilLine } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';
import { CHIP_OFF } from '@/components/primitives/fieldStyles';

interface NotListedProps {
  texts: Translations['stockBike']['picker'];
  /** A brand is already chosen: the rider is working through the list, so the card is stressed. */
  stressed: boolean;
  onReadImage: () => void;
  /** Switches to the setup typed by hand; the button is left out when the page cannot. */
  onManual?: () => void;
}

/** What to do when the bike is not in the list: read the numbers from a picture of the geometry table, or type them. A card of its own, not a link. */
export const NotListedCard: React.FC<NotListedProps> = ({ texts: p, stressed, onReadImage, onManual }) => (
  <section aria-label={p.notListedTitle} data-testid="not-listed" data-stressed={stressed ? 'true' : 'false'} className={cx('rounded-xl border-2 border-dashed p-4 space-y-3', stressed ? 'border-tone-info-line bg-tone-info-bg' : 'border-field-line bg-surface')}>
    <div>
      <h3 className="text-sm font-bold text-ink">{p.notListedTitle}</h3>
      <p className="text-xs text-ink mt-0.5">{p.notListedBody}</p>
    </div>
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={onReadImage} data-testid="not-listed-read" className="h-11 px-5 rounded-full border border-blue-600 bg-blue-600 text-slate-50 text-sm font-semibold hover:bg-blue-700 inline-flex items-center gap-2"><ImageUp aria-hidden="true" className="w-4 h-4" />{p.readFromImage}</button>
      {onManual && <button type="button" onClick={onManual} data-testid="not-listed-manual" className={cx(CHIP_OFF, 'h-11 px-5 rounded-full text-sm font-semibold text-ink inline-flex items-center gap-2')}><PencilLine aria-hidden="true" className="w-4 h-4" />{p.enterByHand}</button>}
    </div>
  </section>
);
