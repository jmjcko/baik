import { isPlayable } from '@/lib/video/videoGuide';
import type { VideoGuide } from '@/types/video';

/** The places of bAIkfit that have a video demonstration: the measurement, the two mini-tests, the numbers of the plan and the pains. */
export type FitVideoId =
  | 'body-acromion' | 'test-hamstring' | 'test-release'
  | 'saddle-height' | 'saddle-setback' | 'bar-width' | 'reach-drop'
  | 'pain-numb-hands' | 'pain-nerve-glides' | 'pain-neck' | 'pain-front-knee'
  | 'pain-back-knee' | 'pain-lower-back' | 'pain-saddle-pressure' | 'pain-arm-pump';

/** The pains whose video card carries the note that the video is general information (health data stays out of any request). */
export const FIT_PAIN_VIDEOS: readonly FitVideoId[] = ['pain-numb-hands', 'pain-nerve-glides', 'pain-neck', 'pain-front-knee', 'pain-back-knee', 'pain-lower-back', 'pain-saddle-pressure', 'pain-arm-pump'];

/**
 * The videos of bAIkfit, one per place. Only entries with a checked id belong here: an entry that does not pass `isPlayable` is never shown,
 * and `npm run check:videos` asks YouTube (oEmbed) whether every id still exists and may be embedded.
 * Titles and channels are as YouTube's oEmbed returned them on 2026-11-03. The start seconds are the chapters of the video where it has them
 * (body-acromion, bar-width, reach-drop, pain-nerve-glides, pain-back-knee, pain-lower-back, pain-saddle-pressure, pain-arm-pump) and otherwise the moment in the captions where the subject begins; they were not watched.
 */
export const FIT_VIDEO_GUIDES: Record<FitVideoId, VideoGuide> = {
  'body-acromion': { youtubeId: 'txhL6uQntdk', timestampSec: 56, title: 'Find the Right Handlebar Width for Your Bike | Expert Tips from Toronto Bike Fit', channelName: 'Dr. Alex Ritza' },
  'test-hamstring': { youtubeId: 'NXH5sbKsbQQ', timestampSec: 54, title: 'Retül V8: Pre-fit Assessment Hamstring Flexibility', channelName: 'Specialized University' },
  'test-release': { youtubeId: 'OyE67jKp1To', timestampSec: 71, title: 'Test Your Cycling Balance', channelName: 'Bike Fit Adviser' },
  'saddle-height': { youtubeId: 'ZxRVphhR_Ww', timestampSec: 134, title: 'How To Find The Perfect Saddle Height On Your Bike', channelName: 'Global Cycling Network' },
  'saddle-setback': { youtubeId: 'v_anXhT2sg8', timestampSec: 4, title: 'Saddle Fore/Aft  Explained - How far back should your saddle be?', channelName: 'CADE Media' },
  'bar-width': { youtubeId: 'hdNrJkeGgAI', timestampSec: 22, title: '5 Simple Tips to Set Up Your Bicycle Handlebars Correctly', channelName: 'CADE Media' },
  'reach-drop': { youtubeId: 'hdNrJkeGgAI', timestampSec: 108, title: '5 Simple Tips to Set Up Your Bicycle Handlebars Correctly', channelName: 'CADE Media' },
  'pain-numb-hands': { youtubeId: '5CBnJkcjzL0', timestampSec: 14, title: '7 Causes Of Numb Hands While Cycling (and how to fix them...)', channelName: 'CADE Media' },
  'pain-nerve-glides': { youtubeId: 'ktOw-6irlYs', timestampSec: 76, title: 'Numb Hands or Tingling? 3 Nerve Glides That Fix Median, Ulnar & Radial Nerve Irritation', channelName: 'Rehab Science' },
  'pain-neck': { youtubeId: 'BCXc2xdKwok', timestampSec: 51, title: 'How to FIX Neck and Shoulder Pain on the Bike - BikeFitTuesdays', channelName: 'CADE Media' },
  'pain-back-knee': { youtubeId: 'Qz2MC6zFi5Q', timestampSec: 262, title: 'What Causes Cycling Knee Pain (with a bike fitting expert)', channelName: 'Road Cycling Academy' },
  'pain-lower-back': { youtubeId: 'cL4rN1oSCqk', timestampSec: 177, title: 'Stop Back Pain When Cycling With Expert Bike Fit Tips', channelName: 'Global Cycling Network' },
  'pain-saddle-pressure': { youtubeId: 'shC2QNKg-pE', timestampSec: 62, title: 'Numbness Up Front? Check This Before Buying A New Saddle', channelName: 'UK Bike Fit' },
  'pain-arm-pump': { youtubeId: 'IACwmynjlzQ', timestampSec: 118, title: 'How To Tackle Arm Pump!', channelName: 'Global Mountain Bike Network' },
  'pain-front-knee': { youtubeId: 'DRniqJXEeXw', timestampSec: 117, title: 'Bike Fit | Causes of Knee Pain and Solutions', channelName: 'Bike Fit Adviser' },
};

/** The video of a place, or null when it is not playable (the button is then not drawn). */
export function fitVideoFor(id: FitVideoId, table: Record<FitVideoId, VideoGuide> = FIT_VIDEO_GUIDES): VideoGuide | null {
  const video = table[id];
  return video && isPlayable(video) ? video : null;
}
