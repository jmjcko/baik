/** A short video that shows one step of a guide, from a given second on (bAIkcare and bAIkfit share it). */
export interface VideoGuide {
  /** The 11 characters of a YouTube video id. */
  youtubeId: string;
  timestampSec: number;
  title: string;
  channelName: string;
}
