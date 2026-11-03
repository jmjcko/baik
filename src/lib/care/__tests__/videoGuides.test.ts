import { describe, expect, it } from 'vitest';
import type { VideoGuide } from '@/types/video';
import { isPlayable } from '@/lib/video/videoGuide';
import { VIDEO_GUIDES, flatGuide, videoFor } from '../videoGuides';

const VIDEO: VideoGuide = { youtubeId: 'dQw4w9WgXcQ', timestampSec: 85, title: 'Piston spacer', channelName: 'Workshop' };

describe('video guides', () => {
  it('should look a video up by guide and step, and skip an unplayable one', () => {
    const table = { mcheck: { 1: VIDEO }, bleed: { 0: { ...VIDEO, youtubeId: 'bad' } }, wash: {}, derailleur: { 3: VIDEO }, rotor: {}, chain: {}, 'flat-tube': {}, 'flat-patch': {}, 'flat-plug': {}, 'flat-sealant': {}, 'flat-tape': {} };
    expect(videoFor('mcheck', 1, table)).toBe(VIDEO);
    expect(videoFor('mcheck', 2, table)).toBeNull();
    expect(videoFor('bleed', 0, table)).toBeNull();
    expect(videoFor('derailleur', 3, table)).toBe(VIDEO);
  });

  it('should have the videos where the guides have them', () => {
    const steps = (guide: keyof typeof VIDEO_GUIDES) => Object.keys(VIDEO_GUIDES[guide]).map(Number);
    expect(steps('mcheck')).toEqual([1, 2, 3, 4, 5]);
    expect(steps('wash')).toEqual([0, 1, 2, 3]);
    expect(steps('derailleur')).toEqual([0, 1, 2, 3]);
    expect(steps('bleed')).toEqual([1, 2, 3, 4]);
    expect(steps('rotor')).toEqual([3]);
    expect(steps('chain')).toEqual([0]);
    expect(steps('flat-tube')).toEqual([0, 1, 2, 3]);
    expect(steps('flat-patch')).toEqual([0, 1, 2]);
    expect(steps('flat-plug')).toEqual([0, 1, 2, 3]);
    expect(steps('flat-sealant')).toEqual([2, 3]);
    expect(steps('flat-tape')).toEqual([1, 2]);
  });

  it('should name the table key of every job of the flat repair guide', () => {
    for (const scenario of ['tube', 'patch', 'plug', 'sealant', 'tape'] as const) expect(VIDEO_GUIDES[flatGuide(scenario)]).toBeDefined();
  });

  it('should keep only playable entries in the real table', () => {
    const all = Object.values(VIDEO_GUIDES).flatMap((guide) => Object.values(guide));
    expect(all.filter((video) => video && !isPlayable(video))).toEqual([]);
  });
});
