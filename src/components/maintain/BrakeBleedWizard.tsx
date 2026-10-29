import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { cx } from '@/lib/classNames';
import { BleedDiagram } from './BleedDiagram';
import { WizardShell } from './WizardShell';

type Fluid = 'mineral' | 'dot';
const FLUIDS: Fluid[] = ['mineral', 'dot'];

interface FluidPickerProps {
  g: Translations['workshop']['bleed'];
  fluid: Fluid | null;
  onPick: (fluid: Fluid) => void;
}

/** The choice that has to be made before the brake is opened: mineral oil or DOT, with the ban on mixing them. */
const FluidPicker: React.FC<FluidPickerProps> = ({ g, fluid, onPick }) => (
  <div className="space-y-3" data-testid="fluid-picker">
    <p className="rounded-xl border-2 border-tone-danger-line bg-tone-danger-bg p-3 text-sm font-semibold text-tone-danger-ink flex gap-2" data-testid="fluid-rule">
      <ShieldAlert aria-hidden="true" className="w-4 h-4 shrink-0 mt-0.5" />
      {g.fluidRule}
    </p>
    <p className="text-sm font-semibold text-ink">{g.fluidQuestion}</p>
    <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label={g.fluidQuestion}>
      {FLUIDS.map((id) => (
        <button key={id} type="button" aria-pressed={fluid === id} onClick={() => onPick(id)} data-testid={`fluid-${id}`} className={cx('rounded-xl border p-3 text-left transition-colors', fluid === id ? 'border-blue-600 bg-tone-info-bg' : 'border-line bg-surface hover:bg-sunken')}>
          <span className="block text-sm font-bold text-ink">{g.fluids[id].name}</span>
          <span className="block text-xs text-ink-2 mt-0.5">{g.fluids[id].brands}</span>
        </button>
      ))}
    </div>
    <p className="text-xs text-ink-3">{g.fluidExamples}</p>
  </div>
);

/** What the rider chose, the ban on mixing and the pointer to the manual, shown on the steps after the choice. */
const FluidReminder: React.FC<{ g: Translations['workshop']['bleed']; fluid: Fluid | null }> = ({ g, fluid }) => (
  <div className="space-y-2 text-sm" data-testid="fluid-reminder">
    {fluid && <p className="font-semibold text-ink">{fill(g.chosen, { fluid: g.fluids[fluid].name })}</p>}
    <p className="font-semibold text-tone-danger-ink">{g.mixWarning}</p>
    <p className="text-ink-2">{g.manual}</p>
  </div>
);

/** Bleeding hydraulic brakes: the fluid has to be chosen first, then the guide goes through the protection, the pads, the filling from the bottom up and the cleaning. */
export const BrakeBleedWizard: React.FC<{ t: Translations; onClose: () => void }> = ({ t, onClose }) => {
  const [fluid, setFluid] = useState<Fluid | null>(null);
  const g = t.workshop.bleed;
  const { back, next, previous, finish, stepOf } = t.workshop;
  return (
    <WizardShell
      testId="bleed-wizard"
      title={g.title}
      intro={g.intro}
      steps={g.steps}
      labels={{ back, next, previous, finish, stepOf }}
      diagram={(step) => <BleedDiagram step={step} label={g.diagramLabel} />}
      extra={(step) => (step === 0 ? <FluidPicker g={g} fluid={fluid} onPick={setFluid} /> : <FluidReminder g={g} fluid={fluid} />)}
      blocker={(step) => (step === 0 && !fluid ? g.needFluid : null)}
      onClose={onClose}
    />
  );
};
