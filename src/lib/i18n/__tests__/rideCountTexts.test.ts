import { describe, it, expect } from 'vitest';
import { translations, type Locale } from '../translations';
import { fill } from '../format';

describe.each(['en', 'cs'] as Locale[])('the texts that count rides (%s)', (locale) => {
  const logbook = translations[locale].service.logbook;
  const counted = {
    strava: logbook.strava.notices.synced,
    intervals: logbook.intervals.notices.synced,
    autoLoad: logbook.intervals.server.autoLoaded,
  };

  it.each(Object.entries(counted))('should read well for one ride, with no plural noun after the number (%s)', (_name, text) => {
    const one = fill(text, { n: 1, source: 'Intervals.icu' });
    expect(one).toContain('1');
    expect(one).not.toMatch(/\b1 (new )?rides\b|\b1 (nových )?jízd\b/);
  });

  it('should say that the load also runs without the app open, not that it will later', () => {
    const stored = logbook.intervals.server.stored;
    expect(stored).toMatch(locale === 'en' ? /once a day/i : /jednou denně/i);
    expect(stored).not.toMatch(/\blater\b|později/i);
  });
});
