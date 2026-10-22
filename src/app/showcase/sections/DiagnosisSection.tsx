import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { DIAGNOSIS_IDS } from '@/lib/engines/baikfit/diagnostics';
import { DiagnosisPanel } from '@/components/report/ReportParts';
import { Case, SectionFrame } from '../ShowcaseCase';

const noop = () => undefined;

/** Clinical diagnosis cards of the KB decision tree (front and back knee, ulnar, median, lower back, neck, saddle pressure) and the empty state. */
export const DiagnosisSection: React.FC<{ t: Translations }> = ({ t }) => (
  <SectionFrame id="diagnosis" title="Clinical diagnosis cards" hint="DiagnosisPanel with every card of the KB section 6 tree opened, and without symptoms.">
    <div className="grid gap-8 xl:grid-cols-2">
      <Case label="All symptoms">
        <DiagnosisPanel t={t} ids={[...DIAGNOSIS_IDS]} onLearnMore={noop} expanded />
      </Case>
      <Case label="Empty state (no symptoms reported)">
        <DiagnosisPanel t={t} ids={[]} onLearnMore={noop} />
      </Case>
    </div>
  </SectionFrame>
);
