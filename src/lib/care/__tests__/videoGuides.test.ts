import { describe, expect, it } from 'vitest';
import type { VideoGuide } from '@/types/maintain';
import { VIDEO_GUIDES, embedUrl, formatTimestamp, isPlayable, videoFor, watchUrl } from '../videoGuides';

const VIDEO: VideoGuide = { youtubeId: 'dQw4w9WgXcQ', timestampSec: 85, title: 'Piston spacer', channelName: 'Workshop' };

describe('video guides', () => {
  it('should format seconds as MM:SS', () => {
    expect(formatTimestamp(60)).toBe('01:00');
    expect(formatTimestamp(85)).toBe('01:25');
    expect(formatTimestamp(290)).toBe('04:50');
    expect(formatTimestamp(0)).toBe('00:00');
    expect(formatTimestamp(3725)).toBe('62:05');
  });

  it('should build the privacy-enhanced embed address with the start second', () => {
    expect(embedUrl(VIDEO)).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?start=85&autoplay=1&rel=0');
    expect(watchUrl(VIDEO)).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=85s');
  });

  it.each([
    ['an id that is not 11 characters', { youtubeId: 'HowToBleedShimano' }],
    ['an id with a character outside the YouTube alphabet', { youtubeId: 'dQw4w9WgXc/' }],
    ['a start that is not a whole number', { timestampSec: 12.5 }],
    ['a negative start', { timestampSec: -1 }],
    ['an empty title', { title: ' ' }],
    ['an empty channel', { channelName: '' }],
  ])('should not play %s', (_name, patch) => {
    expect(isPlayable({ ...VIDEO, ...patch })).toBe(false);
  });

  it('should look a video up by guide and step, and skip an unplayable one', () => {
    const table = { mcheck: { 1: VIDEO }, bleed: { 0: { ...VIDEO, youtubeId: 'bad' } }, wash: {}, derailleur: { 3: VIDEO } };
    expect(videoFor('mcheck', 1, table)).toBe(VIDEO);
    expect(videoFor('mcheck', 2, table)).toBeNull();
    expect(videoFor('bleed', 0, table)).toBeNull();
    expect(videoFor('derailleur', 3, table)).toBe(VIDEO);
  });

  it('should have a video for every step of the four guides', () => {
    expect(Object.keys(VIDEO_GUIDES.mcheck).map(Number)).toEqual([1, 2, 3, 4, 5]);
    for (const guide of ['bleed', 'wash', 'derailleur'] as const) expect(Object.keys(VIDEO_GUIDES[guide]).map(Number)).toEqual([0, 1, 2, 3]);
  });

  it('should keep only playable entries in the real table', () => {
    const all = Object.values(VIDEO_GUIDES).flatMap((guide) => Object.values(guide));
    expect(all.filter((video) => video && !isPlayable(video))).toEqual([]);
  });
});
