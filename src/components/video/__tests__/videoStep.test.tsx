import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { translations } from '@/lib/i18n/translations';
import type { VideoGuide } from '@/types/maintain';
import { VideoStepButton } from '../VideoStepButton';

const VIDEO: VideoGuide = { youtubeId: 'dQw4w9WgXcQ', timestampSec: 85, title: 'Piston spacer', channelName: 'Workshop' };

describe.each(['en', 'cs'] as const)('VideoStepButton (%s)', (locale) => {
  const t = translations[locale];

  it('should draw nothing without a playable video', () => {
    const { container, rerender } = render(<VideoStepButton t={t} video={null} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<VideoStepButton t={t} video={{ ...VIDEO, youtubeId: 'nope' }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should show the time on the button and open the player only on click', () => {
    render(<VideoStepButton t={t} video={VIDEO} />);
    expect(screen.getByTestId('video-step-button').textContent).toContain('01:25');
    expect(screen.queryByTestId('video-frame')).toBeNull();
    fireEvent.click(screen.getByTestId('video-step-button'));
    const frame = screen.getByTestId('video-frame') as HTMLIFrameElement;
    expect(frame.src).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?start=85&autoplay=1&rel=0');
    expect(frame.title).toContain('Piston spacer');
    expect(screen.getByRole('dialog', { name: 'Piston spacer' })).toBeTruthy();
    expect((screen.getByTestId('video-external') as HTMLAnchorElement).href).toContain('t=85s');
  });

  it('should close with the button and with Escape, and give the focus back', () => {
    render(<VideoStepButton t={t} video={VIDEO} />);
    const open = screen.getByTestId('video-step-button');
    fireEvent.click(open);
    fireEvent.click(screen.getByTestId('video-close'));
    expect(screen.queryByTestId('video-dialog')).toBeNull();
    expect(document.activeElement).toBe(open);
    fireEvent.click(open);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId('video-dialog')).toBeNull();
  });
});
