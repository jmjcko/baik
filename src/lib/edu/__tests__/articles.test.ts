import { describe, it, expect } from 'vitest';
import { translations, type Locale } from '@/lib/i18n/translations';
import { isPlayable } from '@/lib/video/videoGuide';
import { EDU_ARTICLES, EDU_ARTICLE_IDS, EDU_TAGS, filterArticles, normalise } from '../articles';

const EMOJI = /\p{Extended_Pictographic}/u;

describe('the articles of the academy', () => {
  it('should hold the six micro articles once each, every one with a topic, a reading time and no e-bike topic', () => {
    expect(EDU_ARTICLES.map((a) => a.id).sort()).toEqual([...EDU_ARTICLE_IDS].sort());
    for (const article of EDU_ARTICLES) {
      expect(article.tags.length).toBeGreaterThan(0);
      expect(article.tags.every((tag) => EDU_TAGS.includes(tag))).toBe(true);
      expect(article.readMin).toBeGreaterThan(0);
    }
  });

  it('should send the articles to a tool of the app only where one fits: care for the M-Check and the tyres, none for the fuelling', () => {
    const tool = (id: string) => EDU_ARTICLES.find((a) => a.id === id)?.tool;
    expect(tool('m-check')).toBe('care');
    expect(tool('tyre-science')).toBe('care');
    expect(tool('numb-hands')).toBe('fit');
    expect(tool('fuelling')).toBeNull();
  });

  it('should name at least one YouTube source video for every article, with a real id, a channel and a title', () => {
    for (const article of EDU_ARTICLES) {
      expect(article.sourceVideos.length).toBeGreaterThan(0);
      for (const video of article.sourceVideos) {
        expect(isPlayable(video)).toBe(true);
        expect(video.timestampSec).toBe(0);
      }
    }
    expect(EDU_ARTICLES.find((a) => a.id === 'tyre-science')?.sourceVideos[0]).toMatchObject({ youtubeId: 'AG4N5zeTSw4', channelName: 'The Aero Hour' });
    expect(EDU_ARTICLES.find((a) => a.id === 'fuelling')?.sourceVideos.map((v) => v.channelName)).toEqual(['tristantakevideo', 'tristantakevideo']);
  });

  it('should ignore accents and case when it normalises text', () => {
    expect(normalise('Pláště A Tlak')).toBe('plaste a tlak');
  });
});

describe.each(['en', 'cs'] as Locale[])('the texts of the academy (%s)', (locale) => {
  const e = translations[locale].edu;
  const items = EDU_ARTICLES.map((article) => ({ article, title: e.articles[article.id].title, teaser: e.articles[article.id].teaser, tags: article.tags.map((tag) => e.tags[tag]).join(' '), body: e.articles[article.id].points.join(' ') }));

  it('should give every article a title, a teaser and key facts, and no emoji anywhere', () => {
    for (const article of EDU_ARTICLES) {
      const text = e.articles[article.id];
      expect(text.title && text.teaser).toBeTruthy();
      expect(text.points.length).toBeGreaterThanOrEqual(2);
    }
    expect(JSON.stringify(e)).not.toMatch(EMOJI);
  });

  it('should carry the medical note on the articles about the nerves and the fuelling only', () => {
    expect(EDU_ARTICLES.filter((a) => e.articles[a.id].note !== undefined).map((a) => a.id).sort()).toEqual(['fuelling', 'numb-hands']);
  });

  it('should filter by tag, by every word of the query, and by both together', () => {
    expect(filterArticles(items, null, '')).toHaveLength(6);
    expect(filterArticles(items, 'tyres', '').map((i) => i.article.id).sort()).toEqual(['bike-weight', 'tyre-science']);
    expect(filterArticles(items, 'nutrition', '').map((i) => i.article.id)).toEqual(['fuelling']);
    expect(filterArticles(items, null, 'm-check').map((i) => i.article.id)).toEqual(['m-check']);
    expect(filterArticles(items, 'tyres', locale === 'en' ? 'rule 105' : 'pravidlo 105').map((i) => i.article.id)).toEqual(['tyre-science']);
    expect(filterArticles(items, 'care', 'zzzz')).toEqual([]);
  });

  it('should find a Czech word without its accents', () => {
    if (locale === 'cs') expect(filterArticles(items, null, 'plaste').map((i) => i.article.id)).toContain('tyre-science');
    else expect(filterArticles(items, null, 'tyre').length).toBeGreaterThan(0);
  });
});
