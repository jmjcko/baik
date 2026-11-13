import { describe, expect, it } from 'vitest';
import type { VideoGuide } from '@/types/video';
import { embedUrl, formatTimestamp, isPlayable, thumbnailUrl, watchUrl } from '../videoGuide';

const VIDEO: VideoGuide = { youtubeId: 'dQw4w9WgXcQ', timestampSec: 85, title: 'Piston spacer', channelName: 'Workshop' };

describe('video guide functions', () => {
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

  it('should build the address of the preview image from the id only', () => {
    expect(thumbnailUrl(VIDEO)).toBe('https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
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
});
