'use client';

import React, { useRef, useState } from 'react';
import { Play } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { formatTimestamp, isPlayable } from '@/lib/video/videoGuide';
import type { VideoGuide } from '@/types/video';
import { VideoModal } from './VideoModal';

interface ButtonProps {
  t: Translations;
  /** The video of the step; the button is not drawn without a playable one. */
  video: VideoGuide | null;
  /** A name for the screen reader when several buttons of the same text are on one page. */
  accessibleName?: string;
}

/** "Video demo (MM:SS)": opens the video of a step in a dialog and gives the focus back to the button when it closes. */
export const VideoStepButton: React.FC<ButtonProps> = ({ t, video, accessibleName }) => {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  if (!video || !isPlayable(video)) return null;
  const close = () => { setOpen(false); button.current?.focus(); };
  return (
    <>
      <button ref={button} type="button" onClick={() => setOpen(true)} aria-label={accessibleName} data-testid="video-step-button" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-tone-info-line bg-tone-info-bg px-4 text-sm font-semibold text-tone-info-ink hover:bg-sunken transition-colors">
        <Play aria-hidden="true" className="w-4 h-4" />
        {fill(t.video.button, { time: formatTimestamp(video.timestampSec) })}
      </button>
      {open && <VideoModal t={t} video={video} onClose={close} />}
    </>
  );
};
