import React, { useState } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { FLAT_SCENARIOS, type FlatScenarioId } from '@/lib/engines/baikcare/flatRepair';
import { SurfaceCard } from '@/components/primitives/SurfaceCard';
import { FlatDiagram } from './FlatDiagram';
import { WizardShell } from './WizardShell';

interface FlatRepairWizardProps {
  t: Translations;
  onClose: () => void;
}

/** The list of the five jobs: each one is a button that opens its own steps. */
const ScenarioList: React.FC<{ t: Translations; onPick: (id: FlatScenarioId) => void; onClose: () => void }> = ({ t, onPick, onClose }) => {
  const f = t.wheels.flat;
  return (
    <SurfaceCard as="section" padding="lg" className="space-y-5" testId="flat-picker">
      <button type="button" onClick={onClose} data-testid="flat-close" className="inline-flex items-center gap-2 text-sm font-semibold text-accent-ink">
        <ArrowLeft aria-hidden="true" className="w-4 h-4" />
        {t.wheels.back}
      </button>
      <div>
        <h2 className="text-lg font-bold text-ink tracking-tight">{f.title}</h2>
        <p className="text-sm text-ink-2 leading-relaxed mt-1">{f.intro}</p>
      </div>
      <p className="text-sm font-semibold text-ink">{f.pick}</p>
      <div className="grid gap-3 md:grid-cols-2">
        {FLAT_SCENARIOS.map((id, index) => (
          <button key={id} type="button" onClick={() => onPick(id)} data-testid={`flat-scenario-${id}`} className="rounded-xl border border-line bg-surface p-4 text-left hover:bg-sunken transition-colors flex items-start justify-between gap-3">
            <span>
              <span className="block text-sm font-bold text-ink">{index + 1}. {f.scenarios[id].name}</span>
              <span className="block text-xs text-ink-2 mt-1">{f.scenarios[id].summary}</span>
            </span>
            <ChevronRight aria-hidden="true" className="w-4 h-4 shrink-0 mt-0.5 text-ink-3" />
          </button>
        ))}
      </div>
    </SurfaceCard>
  );
};

/** The flat repair guide: five jobs (tube, patch, tubeless plug, sealant, rim tape), each with its own steps and drawing. */
export const FlatRepairWizard: React.FC<FlatRepairWizardProps> = ({ t, onClose }) => {
  const [scenario, setScenario] = useState<FlatScenarioId | null>(null);
  if (!scenario) return <ScenarioList t={t} onPick={setScenario} onClose={onClose} />;
  const job = t.wheels.flat.scenarios[scenario];
  const { next, previous, finish, stepOf } = t.workshop;
  return (
    <WizardShell
      key={scenario}
      testId="flat-wizard"
      title={job.name}
      intro={job.summary}
      steps={job.steps}
      labels={{ back: t.wheels.flat.backToList, next, previous, finish, stepOf }}
      diagram={(step) => <FlatDiagram scenario={scenario} step={step} label={job.diagramLabel} />}
      onClose={() => setScenario(null)}
    />
  );
};
