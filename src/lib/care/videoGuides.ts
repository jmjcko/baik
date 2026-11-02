import type { VideoGuide, VideoGuideId } from '@/types/maintain';

/**
 * The videos of the guides, by guide and by step (the M-Check by node number, the others by step counted from 0).
 * Only entries with a checked id belong here: an entry that does not pass `isPlayable` is never shown.
 * Titles and channels are as YouTube's oEmbed returned them on 2026-11-02 (the registered-mark sign is written as an escape so that the source stays free of pictographs); the start seconds are the chapters the authors wrote into the descriptions.
 */
export const VIDEO_GUIDES: Record<VideoGuideId, Partial<Record<number, VideoGuide>>> = {
  mcheck: {
    1: { youtubeId: 'BJBqoA2dXIE', timestampSec: 103, title: '5 Minutes To Save Your Bike (AND YOU)', channelName: 'GMBN Tech' },
    2: { youtubeId: 'BJBqoA2dXIE', timestampSec: 203, title: '5 Minutes To Save Your Bike (AND YOU)', channelName: 'GMBN Tech' },
    3: { youtubeId: 'BJBqoA2dXIE', timestampSec: 309, title: '5 Minutes To Save Your Bike (AND YOU)', channelName: 'GMBN Tech' },
    4: { youtubeId: 'BJBqoA2dXIE', timestampSec: 438, title: '5 Minutes To Save Your Bike (AND YOU)', channelName: 'GMBN Tech' },
    5: { youtubeId: 'BJBqoA2dXIE', timestampSec: 484, title: '5 Minutes To Save Your Bike (AND YOU)', channelName: 'GMBN Tech' },
  },
  bleed: {
    0: { youtubeId: 'Hhoi3E4B0J0', timestampSec: 114, title: 'How to Bleed Hydraulic Brakes - Shimano\u00AE Reservoir Style', channelName: 'Park Tool' },
    1: { youtubeId: 'Hhoi3E4B0J0', timestampSec: 171, title: 'How to Bleed Hydraulic Brakes - Shimano\u00AE Reservoir Style', channelName: 'Park Tool' },
    2: { youtubeId: 'Hhoi3E4B0J0', timestampSec: 219, title: 'How to Bleed Hydraulic Brakes - Shimano\u00AE Reservoir Style', channelName: 'Park Tool' },
    3: { youtubeId: 'Hhoi3E4B0J0', timestampSec: 369, title: 'How to Bleed Hydraulic Brakes - Shimano\u00AE Reservoir Style', channelName: 'Park Tool' },
  },
  wash: {
    0: { youtubeId: 'z-a2XXjx5rg', timestampSec: 64, title: 'How to Clean Your Bike at Home | Easy Step-by-Step Guide', channelName: 'ReCycle Bicycle Sales' },
    1: { youtubeId: 'z-a2XXjx5rg', timestampSec: 217, title: 'How to Clean Your Bike at Home | Easy Step-by-Step Guide', channelName: 'ReCycle Bicycle Sales' },
    2: { youtubeId: 'z-a2XXjx5rg', timestampSec: 469, title: 'How to Clean Your Bike at Home | Easy Step-by-Step Guide', channelName: 'ReCycle Bicycle Sales' },
    3: { youtubeId: 'oIBjeEHT7mY', timestampSec: 193, title: 'How to Wash Your Bike Like a Pro | Essential Bike Cleaning & Maintenance Tips', channelName: 'Jasper Tan' },
  },
  derailleur: {
    0: { youtubeId: '8FVUkto4RHE', timestampSec: 45, title: 'How To Set Up And Adjust Your Rear Mech | Gear Indexing Basics', channelName: 'GMBN Tech' },
    1: { youtubeId: '8FVUkto4RHE', timestampSec: 82, title: 'How To Set Up And Adjust Your Rear Mech | Gear Indexing Basics', channelName: 'GMBN Tech' },
    2: { youtubeId: '8FVUkto4RHE', timestampSec: 255, title: 'How To Set Up And Adjust Your Rear Mech | Gear Indexing Basics', channelName: 'GMBN Tech' },
    3: { youtubeId: '8FVUkto4RHE', timestampSec: 361, title: 'How To Set Up And Adjust Your Rear Mech | Gear Indexing Basics', channelName: 'GMBN Tech' },
  },
};

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

/** The id is exactly what YouTube issues and the start is a whole number of seconds: nothing else goes into a URL. */
export function isPlayable(video: VideoGuide): boolean {
  return YOUTUBE_ID.test(video.youtubeId) && Number.isInteger(video.timestampSec) && video.timestampSec >= 0 && video.title.trim() !== '' && video.channelName.trim() !== '';
}

/** The video of a step, or null when there is none or it is not playable. */
export function videoFor(guide: VideoGuideId, step: number, table: typeof VIDEO_GUIDES = VIDEO_GUIDES): VideoGuide | null {
  const video = table[guide][step];
  return video && isPlayable(video) ? video : null;
}

/** Seconds as `MM:SS` (minutes go past 59 instead of turning into hours). */
export function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

/** The player address: the privacy-enhanced YouTube domain, the start second, no related videos. */
export function embedUrl(video: VideoGuide): string {
  return `https://www.youtube-nocookie.com/embed/${video.youtubeId}?start=${video.timestampSec}&autoplay=1&rel=0`;
}

/** The same moment on youtube.com, for the rider who prefers to watch there. */
export function watchUrl(video: VideoGuide): string {
  return `https://www.youtube.com/watch?v=${video.youtubeId}&t=${video.timestampSec}s`;
}
