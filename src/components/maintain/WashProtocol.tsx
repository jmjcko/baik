import React from 'react';
import { Ban } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { SurfaceCard } from '@/components/primitives/SurfaceCard';
import { WashEquipmentCard } from './WashEquipmentCard';
import { PressureWarning } from './PressureWarning';
import { WashStepAccordion } from './WashStepAccordion';

type Wash = Translations['care']['wash'];

/** What never to do near the bearings and the brakes (KB bAIkcare 3.1). */
const Prohibitions: React.FC<{ w: Wash }> = ({ w }) => (
  <div className="rounded-xl border-2 border-tone-danger-line bg-tone-danger-bg p-4 space-y-2" data-testid="wash-prohibitions">
    <p className="font-bold text-tone-danger-ink">{w.prohibitionsTitle}</p>
    <ul className="space-y-2">
      {w.prohibitions.map((rule) => (
        <li key={rule} className="flex gap-2 text-sm text-tone-danger-ink leading-relaxed">
          <Ban aria-hidden="true" className="w-4 h-4 shrink-0 mt-0.5" />
          {rule}
        </li>
      ))}
    </ul>
  </div>
);

/** The 5-minute wash in the golden order (frame and cockpit, wheels, drivetrain, dry and lubricate) with the prohibitions of the knowledge base. */
export const WashProtocol: React.FC<{ t: Translations }> = ({ t }) => {
  const w = t.care.wash;
  return (
    <SurfaceCard as="section" className="space-y-5" testId="wash-protocol">
      <div>
        <h2 className="text-lg font-bold text-ink tracking-tight">{w.title}</h2>
        <p className="text-sm text-ink-2 leading-relaxed mt-1">{w.intro}</p>
        <p className="mt-3 text-sm font-semibold text-tone-info-ink bg-tone-info-bg border border-tone-info-line rounded-xl px-4 py-3">{w.goldenRule}</p>
      </div>
      <WashEquipmentCard t={t} />
      <PressureWarning t={t} />
      <ol className="space-y-3" data-testid="wash-steps">
        {w.steps.map((step, index) => (
          <WashStepAccordion key={step.title} step={step} tipLabel={w.tipLabel} index={index} />
        ))}
      </ol>
      <Prohibitions w={w} />
      <p className="text-sm text-ink-2"><span className="font-semibold text-ink">{w.approvedTitle}: </span>{w.approved}</p>
    </SurfaceCard>
  );
};
