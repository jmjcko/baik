'use client';

import React, { useRef, useState } from 'react';
import { Play } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { formatTimestamp } from '@/lib/video/videoGuide';
import type { VideoGuide } from '@/types/video';
import { VideoModal } from '@/components/video/VideoModal';

/** The source videos of a tip, set apart under the key facts: each is a button that plays the video from its second in a popup window. */
export const SourceVideos: React.FC<{ t: Translations; videos: readonly VideoGuide[] }> = ({ t, videos }) => {
  const [playing, setPlaying] = useState<VideoGuide | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const close = () => { setPlaying(null); opener.current?.focus(); };
  return (
    <section aria-labelledby="edu-sources-title" className="rounded-2xl border border-tone-info-line bg-tone-info-bg p-5 space-y-3">
      <h3 id="edu-sources-title" className="text-xs font-bold uppercase tracking-wider text-tone-info-ink">{t.edu.sourcesTitle}</h3>
      <ul data-testid="edu-sources" className="space-y-2">
        {videos.map((video) => (
          <li key={video.youtubeId}>
            <button type="button" onClick={(event) => { opener.current = event.currentTarget; setPlaying(video); }} data-testid="edu-source-video" className="w-full min-h-11 rounded-xl border border-line bg-surface px-4 py-2 text-left text-sm font-semibold text-ink hover:bg-sunken inline-flex items-center gap-3">
              <Play aria-hidden="true" className="w-4 h-4 shrink-0 text-tone-info-ink" />
              <span>{fill(t.edu.sourceVideo, { channel: video.channelName, title: video.title, time: formatTimestamp(video.timestampSec) })}</span>
            </button>
          </li>
        ))}
      </ul>
      {playing && <VideoModal t={t} video={playing} onClose={close} />}
    </section>
  );
};
