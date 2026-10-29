import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { cx } from '@/lib/classNames';
import { SYMPTOM_GROUPS, targetsFor, type SymptomId, type SymptomTarget, type WizardId } from '@/lib/engines/baikcare/troubleshooting';
import type { MCheckNodeId } from '@/types/maintain';

export interface TroubleshooterActions {
  onOpenWizard: (wizard: WizardId) => void;
  onOpenNode: (node: MCheckNodeId) => void;
  onGoToChain: () => void;
}

type Tx = Translations['workshop']['troubleshooter'];

/** The text of the button of one target. */
function targetLabel(tx: Tx, target: SymptomTarget): string {
  if (target.kind === 'wizard') return tx.wizardNames[target.wizard];
  if (target.kind === 'node') return fill(tx.openNode, { n: target.node });
  return tx.goToChain;
}

const TargetButton: React.FC<{ tx: Tx; target: SymptomTarget; actions: TroubleshooterActions }> = ({ tx, target, actions }) => {
  const run = () => (target.kind === 'wizard' ? actions.onOpenWizard(target.wizard) : target.kind === 'node' ? actions.onOpenNode(target.node) : actions.onGoToChain());
  return (
    <button type="button" onClick={run} data-testid={`symptom-target-${target.kind}`} className="min-h-12 px-5 py-2 rounded-full bg-blue-600 text-slate-50 text-sm font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2 text-left">
      {targetLabel(tx, target)}
      <ChevronRight aria-hidden="true" className="w-4 h-4 shrink-0" />
    </button>
  );
};

/** The cause, the first checks and the guides that a chosen symptom points to. */
const SymptomAdvice: React.FC<{ tx: Tx; symptom: SymptomId; actions: TroubleshooterActions }> = ({ tx, symptom, actions }) => {
  const texts = tx.symptoms[symptom];
  return (
    <div className="rounded-xl border border-line p-4 space-y-3" data-testid="symptom-advice">
      <h3 className="font-bold text-ink">{texts.label}</h3>
      <p className="text-sm text-ink-2 leading-relaxed"><span className="font-semibold text-ink">{tx.causeTitle}: </span>{texts.cause}</p>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-ink-3">{tx.checksTitle}</p>
        <ul className="mt-1 space-y-1 list-disc pl-5 text-sm text-ink leading-relaxed">{texts.checks.map((check) => <li key={check}>{check}</li>)}</ul>
      </div>
      <p className="text-xs font-bold uppercase tracking-wider text-ink-3">{tx.nextTitle}</p>
      <div className="flex flex-col items-start gap-2">
        {targetsFor(symptom).map((target) => <TargetButton key={JSON.stringify(target)} tx={tx} target={target} actions={actions} />)}
      </div>
    </div>
  );
};

/** The signpost of the workshop: the usual mechanical problems in three groups, each leading to a guide or a check. */
export const WorkshopTroubleshooter: React.FC<{ t: Translations } & TroubleshooterActions> = ({ t, ...actions }) => {
  const tx = t.workshop.troubleshooter;
  const [symptom, setSymptom] = useState<SymptomId | null>(null);
  return (
    <div className="space-y-5" data-testid="troubleshooter">
      <div>
        <h3 className="font-bold text-ink">{tx.title}</h3>
        <p className="text-sm text-ink-2 mt-1">{tx.intro}</p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {SYMPTOM_GROUPS.map((group) => (
          <div key={group.id} className="space-y-2" role="group" aria-label={tx.groups[group.id]}>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-3">{tx.groups[group.id]}</p>
            {group.symptoms.map((id) => (
              <button key={id} type="button" aria-pressed={symptom === id} onClick={() => setSymptom(id)} data-testid={`symptom-${id}`} className={cx('w-full min-h-12 rounded-xl border px-3 py-2 text-left text-sm font-medium transition-colors', symptom === id ? 'border-blue-600 bg-tone-info-bg text-ink' : 'border-line bg-surface text-ink-2 hover:bg-sunken')}>
                {tx.symptoms[id].label}
              </button>
            ))}
          </div>
        ))}
      </div>
      {symptom && <SymptomAdvice tx={tx} symptom={symptom} actions={actions} />}
    </div>
  );
};
