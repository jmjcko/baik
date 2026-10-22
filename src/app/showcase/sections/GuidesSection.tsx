import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { HowToGuide } from '@/components/report/HowToGuide';
import { buildHowTo } from '@/components/report/buildHowTo';
import type { Finding } from '@/components/report/reportFindings';
import { Case, SectionFrame } from '../ShowcaseCase';
import { PETR } from '../fixtures';

const GUIDES: Array<{ id: Finding['id']; label: string }> = [
  { id: 'saddle', label: 'Saddle height guide' },
  { id: 'handlebar', label: 'Handlebar guide (with the lever tip)' },
  { id: 'crank', label: 'Crank guide' },
  { id: 'pitchCleat', label: 'Saddle pitch and cleats guide (illustrated steps)' },
];

/** The how-to accordions for saddle, handlebar, crank and cleats, opened. */
export const GuidesSection: React.FC<{ t: Translations }> = ({ t }) => (
  <SectionFrame id="guides" title="DIY guide accordions" hint="HowToGuide with tools, measuring point and safe procedure (Petr's inputs); click the title to close.">
    <div className="grid gap-6 xl:grid-cols-2">
      {GUIDES.map((guide) => (
        <Case key={guide.id} label={guide.label}>
          <HowToGuide t={t} id={guide.id} guide={buildHowTo(t, guide.id, PETR.input)} defaultOpen />
        </Case>
      ))}
    </div>
  </SectionFrame>
);
