import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { RIDING_DISCIPLINES, type RidingDiscipline } from '@/types/baikfit';
import { ChoiceCard } from '@/components/baikfit/fields/ChoiceCard';
import { StepHeading } from './WizardChrome';

interface DisciplineStepProps {
  t: Translations;
  discipline: RidingDiscipline;
  setDiscipline: (value: RidingDiscipline) => void;
}

/** Wizard step 1: the riding discipline sets the baseline geometry rules. */
export const DisciplineStep: React.FC<DisciplineStepProps> = ({ t, discipline, setDiscipline }) => (
  <div className="space-y-6" data-testid="discipline-step">
    <StepHeading title={t.wizard.disciplineTitle} subtitle={t.wizard.disciplineSubtitle} />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {RIDING_DISCIPLINES.map((option) => (
        <ChoiceCard
          key={option}
          selected={discipline === option}
          title={t.studio.disciplines[option]}
          description={t.wizard.disciplineDescriptions[option]}
          onSelect={() => setDiscipline(option)}
        />
      ))}
    </div>
  </div>
);
