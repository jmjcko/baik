import type { VideoGuide } from '@/types/video';

/** The topics of the academy: the filter labels. */
export const EDU_TAGS = ['bikefit', 'care', 'gear', 'nutrition', 'tyres'] as const;
export type EduTag = (typeof EDU_TAGS)[number];

export const EDU_ARTICLE_IDS = ['bike-weight', 'm-check', 'numb-hands', 'cleats', 'fuelling', 'tyre-science'] as const;
export type EduArticleId = (typeof EDU_ARTICLE_IDS)[number];

/** The tool of the app that an article leads to: the bAIkcare workshop or the bAIkfit start page. */
export type EduTool = 'care' | 'fit';

export interface EduArticle {
  id: EduArticleId;
  tags: readonly EduTag[];
  /** Estimated reading time in minutes. */
  readMin: number;
  tool: EduTool | null;
  /** The YouTube videos the article rests on (start 0: they are only named and linked, not played in the app). */
  sourceVideos: readonly VideoGuide[];
}

/** The micro articles of the academy (the texts are in `lib/i18n/{en,cs}/edu.ts`, the sources in `docs/knowledge/baikedu_kb_v1.0.0.md`). */
export const EDU_ARTICLES: readonly EduArticle[] = [
  { id: 'bike-weight', tags: ['gear', 'tyres', 'bikefit'], readMin: 2, tool: 'fit', sourceVideos: [
      { youtubeId: 'jtw6JiprhS4', timestampSec: 0, title: '10 Things I Wish I Knew When I Started Cycling', channelName: 'CADE Media' },
      { youtubeId: 'igMGzFkj_y4', timestampSec: 0, title: '10 Years of Bike Maintenance Knowledge In 5 Minutes', channelName: 'GCN Tech' },
    ] },
  { id: 'm-check', tags: ['care'], readMin: 2, tool: 'care', sourceVideos: [
      { youtubeId: 'Iuy7wwMm6HY', timestampSec: 0, title: 'Do it yourself bicycle service | What you need to know | Cycling Weekly', channelName: 'Cycling Weekly' },
    ] },
  { id: 'numb-hands', tags: ['bikefit'], readMin: 2, tool: 'fit', sourceVideos: [
      { youtubeId: 'OdSrPA1Mh8U', timestampSec: 0, title: 'Stop Numb Hands While Cycling With This Quick Fix', channelName: 'SEMIPRO CYCLING' },
      { youtubeId: 'sJV4WS-5Q-M', timestampSec: 0, title: '8 reasons you get NUMB HANDS when cycling', channelName: 'Bikefit James' },
    ] },
  { id: 'cleats', tags: ['bikefit', 'gear'], readMin: 2, tool: 'fit', sourceVideos: [
      { youtubeId: 'ywPhW7RC4L8', timestampSec: 0, title: '10 Easy Fixes for a Perfect Bike Fit (You Can Do At Home)', channelName: 'David Arthur - Just Ride Bikes' },
      { youtubeId: 'CAyEzQdQV9I', timestampSec: 0, title: '5 Tips For The Perfect Bike Fit', channelName: 'CADE Media' },
    ] },
  { id: 'fuelling', tags: ['nutrition'], readMin: 2, tool: null, sourceVideos: [
      { youtubeId: '0_qO8ki_PPg', timestampSec: 0, title: '20 Things I WISH I Knew as a Beginner Road Cyclist', channelName: 'tristantakevideo' },
      { youtubeId: 'UHBOeddOzB4', timestampSec: 0, title: 'BEGINNER CYCLIST to INTERMEDIATE: 8 Tips to ride FASTER, for LONGER', channelName: 'tristantakevideo' },
    ] },
  { id: 'tyre-science', tags: ['tyres', 'care'], readMin: 3, tool: 'care', sourceVideos: [
      { youtubeId: 'AG4N5zeTSw4', timestampSec: 0, title: 'Wider Tyres Aren\'t Faster. Here\'s What Is.', channelName: 'The Aero Hour' },
    ] },
];

/** Lower case without accents, so "plaste" finds "pláště". */
export const normalise = (text: string): string => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export interface EduSearchable {
  title: string;
  teaser: string;
  tags: string;
  /** The key facts of the article, joined. */
  body: string;
}

/** The articles that carry the tag (all of them for no tag) and contain every word of the query in the title, the teaser, the key facts or the tag labels. */
export function filterArticles<T extends { article: EduArticle } & EduSearchable>(items: readonly T[], tag: EduTag | null, query: string): T[] {
  const words = normalise(query).split(/\s+/).filter(Boolean);
  return items.filter((item) => {
    if (tag && !item.article.tags.includes(tag)) return false;
    const haystack = normalise(`${item.title} ${item.teaser} ${item.tags} ${item.body}`);
    return words.every((word) => haystack.includes(word));
  });
}
