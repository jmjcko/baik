import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { SurfaceCard } from '@/components/primitives/SurfaceCard';
import type { WizardId } from '@/lib/engines/baikcare/troubleshooting';
import type { MCheckNodeId } from '@/types/maintain';
import { WorkshopTroubleshooter } from './WorkshopTroubleshooter';

interface WorkshopSectionProps {
  t: Translations;
  onOpenNode: (node: MCheckNodeId) => void;
  onGoToChain: () => void;
  onOpenWizard: (wizard: WizardId) => void;
}

/** The troubleshooter of bAIkcare: the symptom leads to a repair guide (the page opens it), a node or the chain gauge. */
export const WorkshopSection: React.FC<WorkshopSectionProps> = ({ t, onOpenNode, onGoToChain, onOpenWizard }) => {
  return (
    <SurfaceCard as="section" padding="lg" className="space-y-5" testId="workshop">
      <div>
        <h2 className="text-lg font-bold text-ink tracking-tight">{t.workshop.title}</h2>
        <p className="text-sm text-ink-2 leading-relaxed mt-1">{t.workshop.intro}</p>
      </div>
      <WorkshopTroubleshooter t={t} onOpenWizard={onOpenWizard} onOpenNode={onOpenNode} onGoToChain={onGoToChain} />
    </SurfaceCard>
  );
};
