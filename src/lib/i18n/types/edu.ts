import type { EduArticleId, EduTag, EduTool } from '@/lib/edu/articles';

/** The text of one micro article: a teaser, the key facts, an optional note, the sources and the button to the tool. */
export interface EduArticleText {
  title: string;
  teaser: string;
  points: string[];
  note?: string;
  /** The knowledge base section the article is grounded in, when it has one besides the videos. */
  source?: string;
}

/** The bAIkedu academy: micro articles from the knowledge base, with filters and a search. */
export interface EduTexts {
  title: string;
  intro: string;
  filtersLabel: string;
  all: string;
  tags: Record<EduTag, string>;
  searchLabel: string;
  searchPlaceholder: string;
  readTime: string;
  read: string;
  back: string;
  empty: string;
  count: string;
  keyFacts: string;
  sourceLabel: string;
  /** The line under an article for each source video: the channel and the title. */
  sourceVideo: string;
  /** The heading over the source videos of a tip. */
  sourcesTitle: string;
  /** The line under every article: a guide, not a medical or coaching advice. */
  general: string;
  openTool: Record<EduTool, string>;
  articles: Record<EduArticleId, EduArticleText>;
}
