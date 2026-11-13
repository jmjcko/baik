'use client';

import React, { useRef, useState } from 'react';
import { Play } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { formatTimestamp, thumbnailUrl } from '@/lib/video/videoGuide';
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
      <ul data-testid="edu-sources" className="grid gap-3 sm:grid-cols-2">
        {videos.map((video) => (
          <li key={video.youtubeId}>
            <button type="button" onClick={(event) => { opener.current = event.currentTarget; setPlaying(video); }} data-testid="edu-source-video" className="w-full h-full overflow-hidden rounded-xl border border-line bg-surface text-left text-sm font-semibold text-ink hover:bg-sunken flex flex-col">
              <span className="relative block aspect-video w-full bg-sunken">
                {/* eslint-disable-next-line @next/next/no-img-element -- a small external preview, no optimiser needed */}
                <img data-testid="edu-source-thumb" src={thumbnailUrl(video)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                <span className="absolute inset-0 flex items-center justify-center"><span className="rounded-full bg-surface p-3 shadow-sm"><Play aria-hidden="true" className="w-5 h-5 text-tone-info-ink" /></span></span>
              </span>
              <span className="block px-4 py-3">{fill(t.edu.sourceVideo, { channel: video.channelName, title: video.title, time: formatTimestamp(video.timestampSec) })}</span>
            </button>
          </li>
        ))}
      </ul>
      <p data-testid="edu-sources-note" className="text-xs text-ink-3">{t.edu.sourcesNote}</p>
      {playing && <VideoModal t={t} video={playing} onClose={close} />}
    </section>
  );
};
