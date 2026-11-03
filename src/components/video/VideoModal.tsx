'use client';

import React, { useEffect, useRef } from 'react';
import { ExternalLink, X } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { embedUrl, formatTimestamp, watchUrl } from '@/lib/care/videoGuides';
import type { VideoGuide } from '@/types/maintain';

interface ModalProps {
  t: Translations;
  video: VideoGuide;
  onClose: () => void;
}

/** Escape closes only this dialog: a capturing listener runs before the one of a dialog underneath (the node of the M-Check). */
function useTopEscape(onClose: () => void): void {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      onClose();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);
}

const Header: React.FC<ModalProps & { closeRef: React.RefObject<HTMLButtonElement | null> }> = ({ t, video, onClose, closeRef }) => {
  const v = t.care.video;
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 id="video-title" className="text-lg font-bold text-ink tracking-tight">{video.title}</h2>
        <p className="text-sm text-ink-2 mt-1">{fill(v.channel, { channel: video.channelName })} <span className="mono-chip text-xs text-ink-3">{fill(v.startsAt, { time: formatTimestamp(video.timestampSec) })}</span></p>
      </div>
      <button ref={closeRef} type="button" onClick={onClose} aria-label={v.close} data-testid="video-close" className="h-10 w-10 shrink-0 rounded-full border border-line bg-surface text-ink-2 hover:bg-sunken inline-flex items-center justify-center">
        <X aria-hidden="true" className="w-4 h-4" />
      </button>
    </div>
  );
};

/** The player: sandboxed, from the privacy-enhanced domain, with a title for screen readers. */
const Player: React.FC<Pick<ModalProps, 't' | 'video'>> = ({ t, video }) => (
  <div className="aspect-video w-full overflow-hidden rounded-xl border border-line bg-sunken">
    <iframe
      src={embedUrl(video)}
      title={fill(t.care.video.frameTitle, { title: video.title })}
      data-testid="video-frame"
      className="h-full w-full"
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
    />
  </div>
);

/** The video of a step in a dialog: the YouTube player from the second of the step, who made the video and a link to YouTube. The player exists only while the dialog is open. */
export const VideoModal: React.FC<ModalProps> = ({ t, video, onClose }) => {
  const closeRef = useRef<HTMLButtonElement>(null);
  useTopEscape(onClose);
  useEffect(() => closeRef.current?.focus(), []);
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="video-title" data-testid="video-dialog" className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-line bg-surface p-6 shadow-xl space-y-4">
        <Header t={t} video={video} onClose={onClose} closeRef={closeRef} />
        <Player t={t} video={video} />
        <p className="text-xs text-ink-3">{t.care.video.privacy}</p>
        <a href={watchUrl(video)} target="_blank" rel="noopener noreferrer" data-testid="video-external" className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold text-accent-ink hover:bg-sunken">
          <ExternalLink aria-hidden="true" className="w-4 h-4" />
          {t.care.video.openOnYoutube}
        </a>
      </div>
    </div>
  );
};
