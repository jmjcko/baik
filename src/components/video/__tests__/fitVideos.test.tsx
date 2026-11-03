import React from 'react';
import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { FIT_VIDEO_GUIDES, type FitVideoId } from '@/lib/fit/fitVideoGuides';
import { formatTimestamp } from '@/lib/video/videoGuide';
import { MeasurementGuideModal } from '@/components/baikfit/MeasurementGuideModal';
import { MiniTests } from '@/components/wizard/MiniTests';
import { ActionPlan } from '@/components/report/ActionPlan';
import type { ActionStep } from '@/components/report/buildActionPlan';
import { DiagnosisPanel } from '@/components/report/ReportParts';
import { FitVideoButton, FitVideoRow } from '../FitVideoButton';

/** The accessible name of a video button (a screen reader and the browser collapse the double space that the title of one video has). */
const name = (t: (typeof translations)['en'], id: FitVideoId) => fill(t.video.buttonLabel, { title: FIT_VIDEO_GUIDES[id].title, time: formatTimestamp(FIT_VIDEO_GUIDES[id].timestampSec) }).replace(/\s+/g, ' ');
const step = (id: ActionStep['id']): ActionStep => ({ id, title: `Title ${id}`, body: 'Body', reason: 'Reason', hasDetail: false });

describe.each(['en', 'cs'] as Locale[])('the video buttons of bAIkfit (%s)', (locale) => {
  const t = translations[locale];

  it('should say "Video (MM:SS)" with a play icon hidden from screen readers, and name the video for a screen reader', () => {
    render(<FitVideoButton t={t} id="saddle-height" />);
    const button = screen.getByRole('button', { name: name(t, 'saddle-height') });
    expect(button).toHaveTextContent(fill(t.video.button, { time: '02:14' }));
    expect(button.textContent).toBe('Video (02:14)');
    expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(button.textContent).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  it('should open the player at the second of the place, in the privacy-enhanced domain, and close it with Escape', () => {
    render(<FitVideoButton t={t} id="bar-width" />);
    fireEvent.click(screen.getByTestId('video-step-button'));
    expect(screen.getByTestId('video-frame')).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/hdNrJkeGgAI?start=22&autoplay=1&rel=0');
    expect(screen.getByTestId('video-dialog')).toHaveTextContent(FIT_VIDEO_GUIDES['bar-width'].channelName);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId('video-dialog')).toBeNull();
  });

  it('should show the medical note once under the buttons of a pain card, and not without the flag', () => {
    const { rerender } = render(<FitVideoRow t={t} ids={['pain-numb-hands', 'pain-nerve-glides']} medical />);
    expect(screen.getAllByTestId('video-step-button')).toHaveLength(2);
    expect(screen.getAllByTestId('video-medical-note')).toHaveLength(1);
    expect(screen.getByTestId('video-medical-note')).toHaveTextContent(t.video.medicalNote);
    rerender(<FitVideoRow t={t} ids={['pain-neck']} />);
    expect(screen.queryByTestId('video-medical-note')).toBeNull();
    expect(screen.getByTestId('fit-video-row').className).toContain('print:hidden');
  });

  it('should show the video of the acromion in the guide of the shoulder measurement, and in no other guide', () => {
    const { rerender } = render(<MeasurementGuideModal isOpen onClose={() => undefined} guideType="acromion" t={t} />);
    expect(within(screen.getByTestId('measurement-guide-modal')).getByRole('button', { name: name(t, 'body-acromion') })).toBeInTheDocument();
    rerender(<MeasurementGuideModal isOpen onClose={() => undefined} guideType="inseam" t={t} />);
    expect(screen.queryByTestId('video-step-button')).toBeNull();
  });

  it('should put the video of each mobility test on its own card (step 3)', () => {
    render(<MiniTests t={t} hamstringTest={null} setHamstringTest={() => undefined} releaseTest={null} setReleaseTest={() => undefined} />);
    expect(within(screen.getByTestId('hamstring-test')).getByRole('button', { name: name(t, 'test-hamstring') })).toBeInTheDocument();
    expect(within(screen.getByTestId('release-test')).getByRole('button', { name: name(t, 'test-release') })).toBeInTheDocument();
  });

  it('should put the videos on the steps of the plan that have one: saddle, setback, handlebar, reach and drop, and not on the crank, the pitch or the cleats', () => {
    const ids: ActionStep['id'][] = ['saddle', 'setback', 'handlebar', 'reach', 'drop', 'crank', 'pitch', 'cleat'];
    render(<ActionPlan t={t} steps={ids.map(step)} onShowDetail={() => undefined} />);
    const has = (id: ActionStep['id']) => within(screen.getByTestId(`action-step-${id}`)).queryByTestId('video-step-button') !== null;
    expect(ids.filter(has)).toEqual(['saddle', 'setback', 'handlebar', 'reach', 'drop']);
    expect(within(screen.getByTestId('action-step-saddle')).getByRole('button', { name: name(t, 'saddle-height') })).toBeInTheDocument();
    expect(within(screen.getByTestId('action-step-setback')).getByRole('button', { name: name(t, 'saddle-setback') })).toBeInTheDocument();
    expect(within(screen.getByTestId('action-step-handlebar')).getByRole('button', { name: name(t, 'bar-width') })).toBeInTheDocument();
    expect(within(screen.getByTestId('action-step-reach')).getByRole('button', { name: name(t, 'reach-drop') })).toBeInTheDocument();
    expect(within(screen.getByTestId('action-step-drop')).getByRole('button', { name: name(t, 'reach-drop') })).toBeInTheDocument();
  });

  it('should put the videos and the medical note on the pain cards of the numbness, the front of the knee and the neck only', () => {
    render(<DiagnosisPanel t={t} ids={['ulnar', 'median', 'anteriorKnee', 'neck', 'posteriorKnee', 'lowerBack']} onLearnMore={() => undefined} expanded />);
    const buttons = (id: string) => within(screen.getByTestId(`diagnosis-${id}`)).queryAllByTestId('video-step-button');
    expect(buttons('ulnar')).toHaveLength(2);
    expect(buttons('median')).toHaveLength(2);
    expect(buttons('anteriorKnee')).toHaveLength(1);
    expect(buttons('neck')).toHaveLength(1);
    expect(buttons('posteriorKnee')).toHaveLength(0);
    expect(buttons('lowerBack')).toHaveLength(0);
    expect(within(screen.getByTestId('diagnosis-anteriorKnee')).getByRole('button', { name: name(t, 'pain-front-knee') })).toBeInTheDocument();
    expect(within(screen.getByTestId('diagnosis-neck')).getByTestId('video-medical-note')).toHaveTextContent(t.video.medicalNote);
    expect(within(screen.getByTestId('diagnosis-lowerBack')).queryByTestId('video-medical-note')).toBeNull();
  });
});
