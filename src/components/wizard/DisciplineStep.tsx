import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { RIDING_DISCIPLINES, type RidingDiscipline } from '@/types/baikfit';
import { DisciplineDiagram } from '@/components/baikfit/DisciplineDiagram';
import { ChoiceCard } from '@/components/baikfit/fields/ChoiceCard';
import { fill } from '@/lib/i18n/format';
import { StepHeading } from './WizardChrome';

interface DisciplineStepProps {
  t: Translations;
  discipline: RidingDiscipline;
  setDiscipline: (value: RidingDiscipline) => void;
  /** The bike of the garage that the wizard works with (the discipline belongs to it), and the way to switch or add a bike. */
  activeBikeName?: string | null;
  onManageBikes?: () => void;
}

/** Wizard step 1: the riding discipline sets the baseline geometry rules. */
export const DisciplineStep: React.FC<DisciplineStepProps> = ({ t, discipline, setDiscipline, activeBikeName, onManageBikes }) => (
  <div className="space-y-6" data-testid="discipline-step">
    <StepHeading title={t.wizard.disciplineTitle} subtitle={t.wizard.disciplineSubtitle} />
    {activeBikeName && (
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-sunken px-4 py-3" data-testid="wizard-active-bike">
        <p className="text-sm font-semibold text-ink">{fill(t.wizard.activeBike.label, { name: activeBikeName })}</p>
        {onManageBikes && <button type="button" onClick={onManageBikes} className="text-xs font-semibold text-accent-ink underline">{t.wizard.activeBike.manage}</button>}
      </div>
    )}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {RIDING_DISCIPLINES.map((option) => (
        <ChoiceCard
          key={option}
          selected={discipline === option}
          title={t.studio.disciplines[option]}
          description={t.wizard.disciplineDescriptions[option]}
          visual={<DisciplineDiagram discipline={option} />}
          visualPosition="bottom"
          titleSize="text-lg"
          onSelect={() => setDiscipline(option)}
        />
      ))}
    </div>
  </div>
);
