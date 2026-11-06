import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { rangeText } from '@/lib/engines/baikgear/format';
import type { UpgradeItem, UpgradeTier } from '@/lib/engines/baikgear/types';

const TONE: Record<UpgradeTier, string> = { high: 'bg-tone-success-bg text-tone-success-ink', low: 'bg-tone-warning-bg text-tone-warning-ink' };

const Item: React.FC<{ t: Translations; item: UpgradeItem }> = ({ t, item }) => {
  const text = t.upgrade.items[item.id];
  return (
    <li className="rounded-xl border border-field-line bg-sunken p-4" data-testid={`upgrade-${item.id}`}>
      <p className="font-bold text-ink">{text.title}</p>
      <p className="text-sm text-ink-2 leading-relaxed mt-1">{text.body}</p>
      {item.range && <p className="text-xs font-mono text-ink-2 mt-2" data-testid={`upgrade-range-${item.id}`}>{fill(t.upgrade.card.range, { range: rangeText(item.range) })}</p>}
      <p className="text-xs font-mono text-ink-2 mt-1">{fill(t.upgrade.card.source, { source: item.source })}</p>
    </li>
  );
};

const Tier: React.FC<{ t: Translations; tier: UpgradeTier; items: UpgradeItem[] }> = ({ t, tier, items }) => (
  <div className="space-y-2" data-testid={`upgrade-tier-${tier}`}>
    <p className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${TONE[tier]}`}>{t.upgrade.tiers[tier]}</p>
    <ul className="space-y-3">{items.map((item) => <Item key={item.id} t={t} item={item} />)}</ul>
  </div>
);

/** The Upgrade Matrix of step 3: the parameters that pay off first, then the ones with a low return (no products, no prices). */
export const UpgradeMatrixCard: React.FC<{ t: Translations; matrix: UpgradeItem[] }> = ({ t, matrix }) => (
  <section className="space-y-4 border-t border-field-line pt-5" data-testid="upgrade-matrix">
    <div>
      <h3 className="text-base font-bold text-ink">{t.upgrade.card.title}</h3>
      <p className="text-sm text-ink-2 mt-1">{t.upgrade.card.intro}</p>
    </div>
    {matrix.length === 0 && <p className="text-sm font-semibold text-ink" data-testid="upgrade-empty">{t.upgrade.card.empty}</p>}
    {(['high', 'low'] as const).map((tier) => {
      const items = matrix.filter((item) => item.tier === tier);
      return items.length > 0 ? <Tier key={tier} t={t} tier={tier} items={items} /> : null;
    })}
  </section>
);
