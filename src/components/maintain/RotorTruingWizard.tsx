import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { RotorDiagram } from './RotorDiagram';
import { WizardShell } from './WizardShell';

/** Centring the caliper and straightening a locally bent rotor (the bolts at 6 Nm, the truing fork). */
export const RotorTruingWizard: React.FC<{ t: Translations; onClose: () => void }> = ({ t, onClose }) => {
  const g = t.workshop.rotor;
  const { back, next, previous, finish, stepOf } = t.workshop;
  return (
    <WizardShell
      testId="rotor-wizard"
      title={g.title}
      intro={g.intro}
      steps={g.steps}
      labels={{ back, next, previous, finish, stepOf }}
      diagram={(step) => <RotorDiagram step={step} label={g.diagramLabel} />}
      onClose={onClose}
    />
  );
};
