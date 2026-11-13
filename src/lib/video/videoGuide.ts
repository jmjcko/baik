import type { VideoGuide } from '@/types/video';

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

/** The id is exactly what YouTube issues and the start is a whole number of seconds: nothing else goes into a URL. */
export function isPlayable(video: VideoGuide): boolean {
  return YOUTUBE_ID.test(video.youtubeId) && Number.isInteger(video.timestampSec) && video.timestampSec >= 0 && video.title.trim() !== '' && video.channelName.trim() !== '';
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

/** The preview image of the video (YouTube's own, from the id only); loading it tells YouTube that the rider saw the tip. */
export function thumbnailUrl(video: VideoGuide): string {
  return `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`;
}

/** The same moment on youtube.com, for the rider who prefers to watch there. */
export function watchUrl(video: VideoGuide): string {
  return `https://www.youtube.com/watch?v=${video.youtubeId}&t=${video.timestampSec}s`;
}
