import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';
import { GEAR_GROUPS, type GearCategoryId } from '@/types/gearTypes';
import { categoriesOf } from '@/types/gearTaxonomy';

interface CategoryStepProps {
  t: Translations;
  category: GearCategoryId | null;
  onPick: (category: GearCategoryId) => void;
}

/** Step 1: the thirty categories in five groups; one card is pressed. */
export const CategoryStep: React.FC<CategoryStepProps> = ({ t, category, onPick }) => (
  <div className="space-y-5" data-testid="gear-category-step">
    <p className="text-sm text-ink-2">{t.gear.categoryIntro}</p>
    {GEAR_GROUPS.map((group) => (
      <div key={group} role="group" aria-label={t.gear.groups[group]} className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-ink-3">{t.gear.groups[group]}</p>
        <div className="flex flex-wrap gap-2">
          {categoriesOf(group).map(({ id }) => (
            <button key={id} type="button" aria-pressed={category === id} onClick={() => onPick(id)} data-testid={`category-${id}`} className={cx('min-h-10 px-4 py-2 rounded-full text-sm font-medium border transition-colors text-left', category === id ? 'bg-blue-600 border-blue-600 text-slate-50' : 'border-line bg-surface text-ink-2 hover:bg-sunken')}>
              {t.gear.categories[id]}
            </button>
          ))}
        </div>
      </div>
    ))}
  </div>
);
