import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { DEFAULT_CARE } from '@/types/maintain';
import { translations } from '@/lib/i18n/translations';
import type { VideoGuide } from '@/types/maintain';
import { BrakeBleedWizard } from '../BrakeBleedWizard';
import { ChainTracker } from '../ChainTracker';
import { DerailleurAdjustmentWizard } from '../DerailleurAdjustmentWizard';
import { FlatRepairWizard } from '../FlatRepairWizard';
import { RotorTruingWizard } from '../RotorTruingWizard';
import { WashProtocol } from '../WashProtocol';

const VIDEO: VideoGuide = { youtubeId: 'dQw4w9WgXcQ', timestampSec: 130, title: 'Hanger and cable', channelName: 'Workshop' };

vi.mock('@/lib/care/videoGuides', async (original) => ({
  ...(await original<typeof import('@/lib/care/videoGuides')>()),
  videoFor: (guide: string, step: number) => (step === 0 && guide !== 'mcheck' ? VIDEO : null),
}));

describe.each(['en', 'cs'] as const)('guides with a video on the first step (%s)', (locale) => {
  const t = translations[locale];

  it.each([
    ['derailleur', <DerailleurAdjustmentWizard key="d" t={translations.en} onClose={() => {}} />],
    ['bleed', <BrakeBleedWizard key="b" t={translations.en} onClose={() => {}} />],
    ['rotor', <RotorTruingWizard key="r" t={translations.en} onClose={() => {}} />],
  ])('should show the video button in the %s guide', (_name, element) => {
    render(React.cloneElement(element, { t }));
    expect(screen.getAllByTestId('video-step-button')).toHaveLength(1);
  });

  it('should show the video button only on the first step of the wash', () => {
    render(<WashProtocol t={t} />);
    expect(screen.getAllByTestId('video-step-button')).toHaveLength(1);
  });

  it('should show the video button in a job of the flat repair guide', () => {
    render(<FlatRepairWizard t={t} onClose={() => {}} />);
    fireEvent.click(screen.getByTestId('flat-scenario-tube'));
    expect(screen.getAllByTestId('video-step-button')).toHaveLength(1);
  });

  it('should show the video button on the chain gauge', () => {
    render(<ChainTracker t={t} care={DEFAULT_CARE} onChange={() => {}} />);
    expect(screen.getAllByTestId('video-step-button')).toHaveLength(1);
  });
});
