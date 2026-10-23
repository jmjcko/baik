import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { FindingCard } from '@/components/report/ReportParts';
import { buildFindings, type Finding, type FindingInput } from '@/components/report/reportFindings';
import { schematicFor } from '@/components/report/schematics';
import { Case, SectionFrame } from '../ShowcaseCase';
import { BAR_STATES, CRANK_STATES, PETR, SADDLE_STATES, withInput } from '../fixtures';

const noop = () => undefined;

interface FindingCaseProps {
  t: Translations;
  id: Finding['id'];
  input: FindingInput;
  label: string;
}

/** The finding card of a state with its schematic; when the report shows no finding (value is fine) only the schematic is drawn. */
const FindingCase: React.FC<FindingCaseProps> = ({ t, id, input, label }) => {
  const finding = buildFindings(t, input).find((f) => f.id === id);
  const schematic = schematicFor(id, t, input);
  return (
    <Case label={label} note={finding ? undefined : 'No finding in the report: the value is fine, only the schematic is shown.'}>
      {finding ? <FindingCard finding={finding} learnMore={t.diagnosticReport.learnMoreButton} whyLabel={t.diagnosticReport.reasons.label} onLearnMore={noop} schematic={schematic} /> : schematic}
    </Case>
  );
};

/** All four blueprint schematics in their states, inside the real finding cards where the report shows them. */
export const SchematicsSection: React.FC<{ t: Translations }> = ({ t }) => (
  <SectionFrame id="schematics" title="Schematics and finding cards" hint="Saddle height, handlebar width, crank length and pitch with cleats, in the states of the report.">
    <div className="grid gap-8">
      {SADDLE_STATES.map((state) => (
        <FindingCase key={state.id} t={t} id="saddle" label={`Saddle height: ${state.label}`} input={withInput(PETR.input, { currentSaddleHeightMm: state.currentMm })} />
      ))}
      {BAR_STATES.map((state) => (
        <FindingCase key={state.id} t={t} id="handlebar" label={`Handlebar width: ${state.label}`} input={withInput(PETR.input, { currentBarWidthMm: state.barMm })} />
      ))}
      {CRANK_STATES.map((state) => (
        <FindingCase key={state.id} t={t} id="crank" label={`Crank length: ${state.label}`} input={withInput(PETR.input, { crankLengthMm: state.crankMm })} />
      ))}
      <FindingCase t={t} id="pitch" label="Saddle pitch" input={PETR.input} />
      <FindingCase t={t} id="cleat" label="Cleat position" input={PETR.input} />
    </div>
  </SectionFrame>
);
