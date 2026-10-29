import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { DerailleurDiagram } from './DerailleurDiagram';
import { WizardShell } from './WizardShell';

/** The four steps of adjusting the rear derailleur: the hanger and the cable, the limit screws, the indexing and the B-gap. */
export const DerailleurAdjustmentWizard: React.FC<{ t: Translations; onClose: () => void }> = ({ t, onClose }) => {
  const g = t.workshop.derailleur;
  const { back, next, previous, finish, stepOf } = t.workshop;
  return (
    <WizardShell
      testId="derailleur-wizard"
      title={g.title}
      intro={g.intro}
      steps={g.steps}
      labels={{ back, next, previous, finish, stepOf }}
      diagram={(step) => <DerailleurDiagram step={step} label={g.diagramLabel} />}
      onClose={onClose}
    />
  );
};
