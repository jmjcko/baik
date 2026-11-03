import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { isPlayable } from '@/lib/video/videoGuide';
import { FIT_PAIN_VIDEOS, FIT_VIDEO_GUIDES, fitVideoFor, type FitVideoId } from '../fitVideoGuides';

const IDS = Object.keys(FIT_VIDEO_GUIDES) as FitVideoId[];

describe('the videos of bAIkfit', () => {
  it('should have a video for each of the eleven places, and no other', () => {
    expect(IDS.sort()).toEqual([
      'bar-width', 'body-acromion', 'pain-arm-pump', 'pain-back-knee', 'pain-front-knee', 'pain-lower-back', 'pain-neck', 'pain-nerve-glides', 'pain-numb-hands', 'pain-saddle-pressure', 'reach-drop', 'saddle-height', 'saddle-setback', 'test-hamstring', 'test-release',
    ]);
  });

  it.each(IDS)('should have a playable video for %s: an 11 character id, a whole start second, a title and a channel', (id) => {
    const video = FIT_VIDEO_GUIDES[id];
    expect(video.youtubeId).toMatch(/^[A-Za-z0-9_-]{11}$/);
    expect(Number.isInteger(video.timestampSec)).toBe(true);
    expect(isPlayable(video)).toBe(true);
    expect(fitVideoFor(id)).toBe(video);
  });

  it('should not look like an invented id: the placeholder names of the first draft are not in the table', () => {
    for (const video of Object.values(FIT_VIDEO_GUIDES)) {
      expect(video.youtubeId).not.toMatch(/5TipsPerfectBikeFit|PerfectBikeFit/i);
    }
  });

  it('should keep the source free of pictographs and keep the titles as YouTube gave them (no trailing space)', () => {
    const source = readFileSync('src/lib/fit/fitVideoGuides.ts', 'utf8');
    expect(source).not.toMatch(/\p{Extended_Pictographic}/u);
    for (const video of Object.values(FIT_VIDEO_GUIDES)) expect(video.title).toBe(video.title.trim());
  });

  it('should use two places in the same video only with different start seconds', () => {
    const seen = new Map<string, number[]>();
    for (const video of Object.values(FIT_VIDEO_GUIDES)) seen.set(video.youtubeId, [...(seen.get(video.youtubeId) ?? []), video.timestampSec]);
    for (const starts of seen.values()) expect(new Set(starts).size).toBe(starts.length);
  });

  it('should return nothing for a video that is not playable', () => {
    const broken = { ...FIT_VIDEO_GUIDES, 'test-release': { ...FIT_VIDEO_GUIDES['test-release'], youtubeId: 'HowToBalanceTest' } };
    expect(fitVideoFor('test-release', broken)).toBeNull();
    expect(fitVideoFor('test-hamstring', broken)).toBe(FIT_VIDEO_GUIDES['test-hamstring']);
  });

  it('should mark the eight pain videos for the medical note, and no other place', () => {
    expect([...FIT_PAIN_VIDEOS].sort()).toEqual(['pain-arm-pump', 'pain-back-knee', 'pain-front-knee', 'pain-lower-back', 'pain-neck', 'pain-nerve-glides', 'pain-numb-hands', 'pain-saddle-pressure']);
    expect(FIT_PAIN_VIDEOS.every((id) => id in FIT_VIDEO_GUIDES)).toBe(true);
  });
});
