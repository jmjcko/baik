import React, { useState } from 'react';
import { Search } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';
import { QUERY_LENGTH } from '@/lib/gear/research';
import { GEAR_GROUPS, type GearCategoryId } from '@/types/gearTypes';
import { POPULAR_CATEGORIES, categoriesOf } from '@/types/gearTaxonomy';
import { HowItWorks } from './HowItWorks';
import { CHIP_OFF, FIELD_FIT } from '@/components/primitives/fieldStyles';

interface ProductStepProps {
  t: Translations;
  query: string;
  onQuery: (query: string) => void;
  /** Starts the research for the typed text, or for a category that was chosen from the lists. */
  onFind: (category?: GearCategoryId) => void;
}

const CHIP = `min-h-10 px-4 py-2 rounded-full text-sm font-medium text-ink transition-colors text-left ${CHIP_OFF}`;

/** The browsable list of all categories in their groups. */
const AllCategories: React.FC<{ t: Translations; onPick: (id: GearCategoryId) => void }> = ({ t, onPick }) => (
  <div className="space-y-4" data-testid="all-categories">
    <p className="text-xs text-ink-2">{t.gear.categoryIntro}</p>
    {GEAR_GROUPS.map((group) => (
      <div key={group} role="group" aria-label={t.gear.groups[group]} className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-ink-2">{t.gear.groups[group]}</p>
        <div className="flex flex-wrap gap-2">
          {categoriesOf(group).map(({ id }) => <button key={id} type="button" onClick={() => onPick(id)} data-testid={`category-${id}`} className={CHIP}>{t.gear.categories[id]}</button>)}
        </div>
      </div>
    ))}
  </div>
);

/** The field for the product and the button that prepares the questions; it sits inside the "Your turn" box of the first step. */
export const ProductForm: React.FC<Pick<ProductStepProps, 't' | 'query' | 'onQuery'> & { onSubmit: () => void }> = ({ t, query, onQuery, onSubmit }) => {
  const p = t.gear.product;
  const valid = query.trim().length >= QUERY_LENGTH.min;
  return (
    <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (valid) onSubmit(); }}>
      <label className="block space-y-1.5">
        <span className="text-base font-bold text-ink">{p.label}</span>
        <span className="flex gap-2">
          <input type="text" value={query} maxLength={QUERY_LENGTH.max} placeholder={p.placeholder} onChange={(e) => onQuery(e.target.value)} data-testid="product-input" className={cx(FIELD_FIT, 'flex-1')} />
          <button type="submit" disabled={!valid} data-testid="product-find" className="h-12 px-5 rounded-full bg-blue-600 text-slate-50 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"><Search aria-hidden="true" className="w-4 h-4" />{p.find}</button>
        </span>
      </label>
      {!valid && query.length > 0 && <p className="text-xs text-tone-warning-ink" role="status">{p.tooShort}</p>}
      <p className="text-xs text-ink-2" data-testid="product-ai-note">{p.aiNote}</p>
    </form>
  );
};

/** Step 1: the popular choices (the field of the product is in the box above), the list of all categories and the folded explanation of what bAIkgear is. */
export const ProductStep: React.FC<Pick<ProductStepProps, 't' | 'onFind'>> = ({ t, onFind }) => {
  const [browse, setBrowse] = useState(false);
  const p = t.gear.product;
  return (
    <div className="space-y-6" data-testid="gear-product-step">
      <div className="space-y-2">
        <p className="text-sm font-bold text-ink">{p.orPick}</p>
        <div className="flex flex-wrap gap-2">
          {POPULAR_CATEGORIES.map((id) => <button key={id} type="button" onClick={() => onFind(id)} data-testid={`popular-${id}`} className={CHIP}>{t.gear.categories[id]}</button>)}
        </div>
      </div>
      <div className="space-y-3">
        <button type="button" aria-expanded={browse} onClick={() => setBrowse(!browse)} data-testid="browse-toggle" className={cx(CHIP, 'font-semibold text-accent-ink')}>{browse ? p.hideBrowse : p.browse}</button>
        {browse && <AllCategories t={t} onPick={onFind} />}
      </div>
      <HowItWorks t={t} />
    </div>
  );
};
