import React from 'react';
import type { WashKitTexts } from '@/lib/i18n/types/care';
import type { Translations } from '@/lib/i18n/translations';

/** One group of the kit list: a heading and the pieces of kit with what each is for. */
const KitGroup: React.FC<{ title: string; items: WashKitTexts[] }> = ({ title, items }) => (
  <div>
    <p className="text-xs font-bold uppercase tracking-wider text-ink-3">{title}</p>
    <ul className="mt-2 space-y-2">
      {items.map((item) => (
        <li key={item.name} className="text-sm text-ink-2 leading-relaxed">
          <span className="font-semibold text-ink">{item.name}: </span>
          {item.text}
        </li>
      ))}
    </ul>
  </div>
);

/** The checklist of brushes, sponges and cleaners to lay out before the wash. */
export const WashEquipmentCard: React.FC<{ t: Translations }> = ({ t }) => {
  const e = t.care.wash.equipment;
  return (
    <div className="rounded-xl border border-line p-4 space-y-4" data-testid="wash-equipment">
      <div>
        <h3 className="font-bold text-ink">{e.title}</h3>
        <p className="text-sm text-ink-2 leading-relaxed mt-1">{e.intro}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <KitGroup title={e.brushesTitle} items={e.brushes} />
        <KitGroup title={e.chemistryTitle} items={e.chemistry} />
      </div>
    </div>
  );
};
