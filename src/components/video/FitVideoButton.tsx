'use client';

import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { fitVideoFor, type FitVideoId } from '@/lib/fit/fitVideoGuides';
import { formatTimestamp } from '@/lib/video/videoGuide';
import { VideoStepButton } from './VideoStepButton';

/** "Video (MM:SS)" for a place of bAIkfit: nothing is drawn when the place has no playable video. */
export const FitVideoButton: React.FC<{ t: Translations; id: FitVideoId }> = ({ t, id }) => {
  const video = fitVideoFor(id);
  if (!video) return null;
  const name = fill(t.video.buttonLabel, { title: video.title, time: formatTimestamp(video.timestampSec) });
  return <VideoStepButton t={t} video={video} accessibleName={name} />;
};

interface RowProps {
  t: Translations;
  ids: FitVideoId[];
  /** Adds the note that a video about a pain is general information (under the pain cards). */
  medical?: boolean;
}

/** The video buttons of one place in a row, with the medical note once under them; nothing at all when no video of the row is playable. */
export const FitVideoRow: React.FC<RowProps> = ({ t, ids, medical = false }) => {
  const playable = ids.filter((id) => fitVideoFor(id) !== null);
  if (playable.length === 0) return null;
  return (
    <div className="mt-2 space-y-1.5 print:hidden" data-testid="fit-video-row">
      <div className="flex flex-wrap gap-2">
        {playable.map((id) => <FitVideoButton key={id} t={t} id={id} />)}
      </div>
      {medical && <p className="text-xs text-ink-3" data-testid="video-medical-note">{t.video.medicalNote}</p>}
    </div>
  );
};
