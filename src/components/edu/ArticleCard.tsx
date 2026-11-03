import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import type { EduArticle } from '@/lib/edu/articles';

/** The labels of the topics of an article, as monospace chips. */
export const TagChips: React.FC<{ t: Translations; article: EduArticle }> = ({ t, article }) => (
  <ul className="flex flex-wrap gap-1.5" aria-label={t.edu.filtersLabel}>
    {article.tags.map((tag) => <li key={tag} className="rounded-full bg-sunken px-2.5 py-0.5 text-xs font-mono font-semibold text-ink-2">{t.edu.tags[tag]}</li>)}
  </ul>
);

interface CardProps {
  t: Translations;
  article: EduArticle;
  onRead: () => void;
}

/** One article of the feed: the topics, the reading time, the title, the teaser and the button that opens it. */
export const ArticleCard: React.FC<CardProps> = ({ t, article, onRead }) => {
  const text = t.edu.articles[article.id];
  return (
    <article data-testid={`edu-card-${article.id}`} className="rounded-2xl border border-line bg-surface p-5 shadow-sm flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TagChips t={t} article={article} />
        <span className="text-xs font-mono text-ink-3">{fill(t.edu.readTime, { min: article.readMin })}</span>
      </div>
      <h3 className="text-base font-bold text-ink tracking-tight">{text.title}</h3>
      <p className="text-sm text-ink-2 leading-relaxed grow">{text.teaser}</p>
      <button type="button" onClick={onRead} aria-label={`${t.edu.read}: ${text.title}`} className="self-start h-12 px-6 rounded-full bg-blue-600 text-slate-50 text-sm font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
        {t.edu.read}
        <ArrowRight aria-hidden="true" className="w-4 h-4" />
      </button>
    </article>
  );
};
