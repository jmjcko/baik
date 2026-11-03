import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import type { EduArticle, EduTool } from '@/lib/edu/articles';
import { formatTimestamp, watchUrl } from '@/lib/video/videoGuide';
import { TagChips } from './ArticleCard';

interface DetailProps {
  t: Translations;
  article: EduArticle;
  onBack: () => void;
  onOpenTool: (tool: EduTool) => void;
}

/** The key facts of an article with the note, when it has one. */
const KeyFacts: React.FC<{ t: Translations; text: Translations['edu']['articles'][EduArticle['id']] }> = ({ t, text }) => (
  <section className="rounded-2xl border border-line bg-surface p-5 space-y-3" aria-labelledby="edu-facts">
    <h3 id="edu-facts" className="text-xs font-bold uppercase tracking-wider text-ink-3">{t.edu.keyFacts}</h3>
    <ol className="list-decimal pl-5 space-y-2 text-sm text-ink leading-relaxed">
      {text.points.map((point) => <li key={point}>{point}</li>)}
    </ol>
    {text.note && <p data-testid="edu-note" className="text-sm font-semibold text-ink-2">{text.note}</p>}
  </section>
);

/** The sources under an article: one tinted line with a link per YouTube video, the knowledge base section, and the general note. */
const Sources: React.FC<{ t: Translations; article: EduArticle }> = ({ t, article }) => {
  const source = t.edu.articles[article.id].source;
  return (
    <footer className="space-y-2 text-xs text-ink-3">
      <ul data-testid="edu-sources" className="space-y-1.5">
        {article.sourceVideos.map((video) => (
          <li key={video.youtubeId} className="rounded-xl bg-sunken px-3 py-2 text-ink-2">
            <a href={watchUrl(video)} target="_blank" rel="noopener noreferrer" className="hover:underline">{fill(t.edu.sourceVideo, { channel: video.channelName, title: video.title, time: formatTimestamp(video.timestampSec) })}</a>
          </li>
        ))}
      </ul>
      {source && <p><span className="font-semibold">{t.edu.sourceLabel}: </span>{source}</p>}
      <p>{t.edu.general}</p>
    </footer>
  );
};

/** One article: the key facts, the note, the sources and the button to the tool it belongs to. */
export const ArticleDetail: React.FC<DetailProps> = ({ t, article, onBack, onOpenTool }) => {
  const text = t.edu.articles[article.id];
  return (
    <article data-testid="edu-detail" className="max-w-3xl space-y-5">
      <button type="button" onClick={onBack} data-testid="edu-back" className="h-10 px-4 rounded-full border border-line bg-surface text-sm font-semibold text-ink-2 hover:bg-sunken inline-flex items-center gap-2">
        <ArrowLeft aria-hidden="true" className="w-4 h-4" />
        {t.edu.back}
      </button>
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <TagChips t={t} article={article} />
          <span className="text-xs font-mono text-ink-3">{fill(t.edu.readTime, { min: article.readMin })}</span>
        </div>
        <h2 className="text-2xl font-bold text-ink tracking-tight">{text.title}</h2>
        <p className="text-base text-ink-2 leading-relaxed">{text.teaser}</p>
      </header>
      <KeyFacts t={t} text={text} />
      {article.tool && (
        <button type="button" onClick={() => onOpenTool(article.tool as EduTool)} data-testid="edu-open-tool" className="h-12 px-6 rounded-full bg-blue-600 text-slate-50 text-sm font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
          {t.edu.openTool[article.tool]}
          <ArrowRight aria-hidden="true" className="w-4 h-4" />
        </button>
      )}
      <Sources t={t} article={article} />
    </article>
  );
};
