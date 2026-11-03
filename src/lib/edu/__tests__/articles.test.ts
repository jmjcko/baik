import { describe, it, expect } from 'vitest';
import { translations, type Locale } from '@/lib/i18n/translations';
import { isPlayable } from '@/lib/video/videoGuide';
import { EDU_ARTICLES, EDU_ARTICLE_IDS, EDU_TAGS, filterArticles, normalise } from '../articles';

const EMOJI = /\p{Extended_Pictographic}/u;

describe('the articles of the academy', () => {
  it('should hold the eleven micro articles once each, every one with a topic, a reading time and no e-bike topic', () => {
    expect(EDU_ARTICLES.map((a) => a.id).sort()).toEqual([...EDU_ARTICLE_IDS].sort());
    for (const article of EDU_ARTICLES) {
      expect(article.tags.length).toBeGreaterThan(0);
      expect(article.tags.every((tag) => EDU_TAGS.includes(tag))).toBe(true);
      expect(article.readMin).toBeGreaterThan(0);
    }
  });

  it('should send the articles to a tool of the app only where one fits: care for the M-Check and the tyres, none for the others (no bAIkfit button)', () => {
    const tool = (id: string) => EDU_ARTICLES.find((a) => a.id === id)?.tool;
    expect(tool('m-check')).toBe('care');
    expect(tool('tyre-science')).toBe('care');
    expect(tool('numb-hands')).toBeNull();
    expect(EDU_ARTICLES.filter((a) => a.tool !== null).map((a) => a.id).sort()).toEqual(['m-check', 'shifting-technique-drivetrain-care', 'tyre-science']);
    expect(tool('fuelling')).toBeNull();
  });

  it('should name at least one YouTube source video for every article, with a real id, a channel and a title', () => {
    for (const article of EDU_ARTICLES) {
      expect(article.sourceVideos.length).toBeGreaterThan(0);
      for (const video of article.sourceVideos) {
        expect(isPlayable(video)).toBe(true);
        expect(video.timestampSec).toBeGreaterThan(0);
      }
    }
    expect(EDU_ARTICLES.find((a) => a.id === 'tyre-science')?.sourceVideos[0]).toMatchObject({ youtubeId: 'AG4N5zeTSw4', channelName: 'The Aero Hour' });
    expect(EDU_ARTICLES.find((a) => a.id === 'fuelling')?.sourceVideos.map((v) => v.channelName)).toEqual(['tristantakevideo', 'tristantakevideo']);
  });

  it('should start every source video at the passage the product owner named', () => {
    const starts = Object.fromEntries(EDU_ARTICLES.flatMap((a) => a.sourceVideos.map((v) => [v.youtubeId, v.timestampSec])));
    expect(starts).toEqual({ M4HppXAlCgw: 135, AzL654c2mK4: 30, '71NFCzhdNWk': 240, 'dRjG6eYX-0g': 60, jtw6JiprhS4: 198, dl1ZJsoqvhY: 228, 'igMGzFkj_y4': 222, Iuy7wwMm6HY: 25, OdSrPA1Mh8U: 263, 'sJV4WS-5Q-M': 15, ywPhW7RC4L8: 145, CAyEzQdQV9I: 385, '0_qO8ki_PPg': 94, UHBOeddOzB4: 152, AG4N5zeTSw4: 40 });
  });

  it('should hold the shifting article: care topic, three minutes, the bAIkcare tool and the GCN video at 03:48 (t=228s), in EN and CS', () => {
    const article = EDU_ARTICLES.find((a) => a.id === 'shifting-technique-drivetrain-care');
    expect(article).toMatchObject({ tags: ['care'], readMin: 3, tool: 'care' });
    expect(article?.sourceVideos).toEqual([{ youtubeId: 'dl1ZJsoqvhY', timestampSec: 228, title: 'How To Shift Your Gears Correctly', channelName: 'Global Cycling Network' }]);
    for (const locale of ['en', 'cs'] as Locale[]) expect(translations[locale].edu.articles['shifting-technique-drivetrain-care'].points).toHaveLength(5);
  });

  it('should hold the bike types, pedalling and security articles with their videos, no tool button, and nothing about city bikes or e-bikes', () => {
    const byId = (id: string) => EDU_ARTICLES.find((a) => a.id === id);
    expect(byId('how-to-choose-bike-type-guide')).toMatchObject({ tags: ['gear'], readMin: 4, tool: null });
    expect(byId('pedalling-technique-myths-efficiency')).toMatchObject({ tags: ['bikefit'], readMin: 3, tool: null });
    expect(byId('bike-theft-prevention-locking-tricks')).toMatchObject({ tags: ['gear'], readMin: 4, tool: null });
    for (const locale of ['en', 'cs'] as Locale[]) expect(JSON.stringify(translations[locale].edu.articles['how-to-choose-bike-type-guide'])).not.toMatch(/hybrid|e-bike|městsk|urban|city|commut|dojíž/i);
  });

  it('should hold the radar lights article: gear topic, 4 minutes, no tool, the MozosBike video at 02:15, four key points and no price, in EN and CS', () => {
    const article = EDU_ARTICLES.find((a) => a.id === 'bike-radar-lights-comparison-2025');
    expect(article).toMatchObject({ tags: ['gear'], readMin: 4, tool: null });
    expect(article?.sourceVideos).toEqual([{ youtubeId: 'M4HppXAlCgw', timestampSec: 135, title: 'Comparativa 6 LUCES RADAR BICI del 2025', channelName: 'MozosBike' }]);
    for (const locale of ['en', 'cs'] as Locale[]) {
      const text = translations[locale].edu.articles['bike-radar-lights-comparison-2025'];
      expect(text.points).toHaveLength(4);
      expect(JSON.stringify(text)).not.toMatch(/€|\beur|\bkč/i);
    }
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
    expect(filterArticles(items, null, '')).toHaveLength(11);
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
