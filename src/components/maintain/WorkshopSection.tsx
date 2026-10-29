import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { SurfaceCard } from '@/components/primitives/SurfaceCard';
import type { WizardId } from '@/lib/engines/baikcare/troubleshooting';
import type { MCheckNodeId } from '@/types/maintain';
import { BrakeBleedWizard } from './BrakeBleedWizard';
import { DerailleurAdjustmentWizard } from './DerailleurAdjustmentWizard';
import { RotorTruingWizard } from './RotorTruingWizard';
import { WorkshopTroubleshooter } from './WorkshopTroubleshooter';

interface WorkshopSectionProps {
  t: Translations;
  onOpenNode: (node: MCheckNodeId) => void;
  onGoToChain: () => void;
}

const WIZARDS: Record<WizardId, React.FC<{ t: Translations; onClose: () => void }>> = {
  bleed: BrakeBleedWizard,
  derailleur: DerailleurAdjustmentWizard,
  rotor: RotorTruingWizard,
};

/** The workshop of bAIkcare: the troubleshooter, which gives way to a repair guide while the rider is in one. */
export const WorkshopSection: React.FC<WorkshopSectionProps> = ({ t, onOpenNode, onGoToChain }) => {
  const [wizard, setWizard] = useState<WizardId | null>(null);
  if (wizard) {
    const Wizard = WIZARDS[wizard];
    return <Wizard t={t} onClose={() => setWizard(null)} />;
  }
  return (
    <SurfaceCard as="section" padding="lg" className="space-y-5" testId="workshop">
      <div>
        <h2 className="text-lg font-bold text-ink tracking-tight">{t.workshop.title}</h2>
        <p className="text-sm text-ink-2 leading-relaxed mt-1">{t.workshop.intro}</p>
      </div>
      <WorkshopTroubleshooter t={t} onOpenWizard={setWizard} onOpenNode={onOpenNode} onGoToChain={onGoToChain} />
    </SurfaceCard>
  );
};
