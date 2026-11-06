'use client';

import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { cx } from '@/lib/classNames';
import { EDU_ARTICLES, EDU_TAGS, filterArticles, type EduArticleId, type EduTag, type EduTool } from '@/lib/edu/articles';
import { ArticleCard } from './ArticleCard';
import { ArticleDetail } from './ArticleDetail';

interface EduViewProps {
  t: Translations;
  /** Opens the tool of an article: the bAIkcare workshop. */
  onOpenTool: (tool: EduTool) => void;
}

const CHIP = 'h-10 px-4 rounded-full text-xs font-mono font-semibold border transition-colors';

/** The filter chips: all topics, then one per topic (the chosen one is pressed). */
const Filters: React.FC<{ t: Translations; tag: EduTag | null; onChange: (tag: EduTag | null) => void }> = ({ t, tag, onChange }) => (
  <div role="group" aria-label={t.edu.filtersLabel} className="flex flex-wrap gap-2">
    {[null, ...EDU_TAGS].map((one) => (
      <button key={one ?? 'all'} type="button" aria-pressed={tag === one} onClick={() => onChange(one)} data-testid={`edu-filter-${one ?? 'all'}`} className={cx(CHIP, tag === one ? 'bg-blue-600 border-blue-600 text-slate-50' : 'border-line bg-surface text-ink-2 hover:bg-sunken')}>
        {one ? t.edu.tags[one] : t.edu.all}
      </button>
    ))}
  </div>
);

/** The academy: the topic filters, the search and the feed of the micro articles; one article opens in place of the feed. */
export const EduView: React.FC<EduViewProps> = ({ t, onOpenTool }) => {
  const [tag, setTag] = useState<EduTag | null>(null);
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<EduArticleId | null>(null);
  const items = useMemo(() => EDU_ARTICLES.map((article) => ({ article, title: t.edu.articles[article.id].title, teaser: t.edu.articles[article.id].teaser, tags: article.tags.map((one) => t.edu.tags[one]).join(' '), body: t.edu.articles[article.id].points.join(' ') })), [t]);
  const shown = filterArticles(items, tag, query);
  const open = EDU_ARTICLES.find((article) => article.id === openId);
  if (open) return <ArticleDetail t={t} article={open} onBack={() => setOpenId(null)} onOpenTool={onOpenTool} />;
  return (
    <section data-testid="edu-view" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink tracking-tight">{t.edu.title}</h2>
        <p className="text-sm text-ink-2 leading-relaxed mt-1 max-w-2xl">{t.edu.intro}</p>
      </div>
      <Filters t={t} tag={tag} onChange={setTag} />
      <label className="relative block max-w-md">
        <span className="sr-only">{t.edu.searchLabel}</span>
        <Search aria-hidden="true" className="w-4 h-4 text-ink-3 absolute left-4 top-1/2 -translate-y-1/2" />
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.edu.searchPlaceholder} data-testid="edu-search" className="h-12 w-full rounded-full border-2 border-field-line bg-field pl-11 pr-4 text-sm text-ink placeholder:text-ink-2 focus:border-field-focus focus:outline-none" />
      </label>
      <p role="status" className="text-xs font-mono text-ink-3" data-testid="edu-count">{fill(t.edu.count, { n: shown.length })}</p>
      {shown.length === 0 ? <p className="text-sm text-ink-2" data-testid="edu-empty">{t.edu.empty}</p> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((item) => <ArticleCard key={item.article.id} t={t} article={item.article} onRead={() => setOpenId(item.article.id)} />)}
        </div>
      )}
    </section>
  );
};
