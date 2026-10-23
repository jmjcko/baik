'use client';

import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { cx } from '@/lib/classNames';
import { LOW_HAMSTRING_STACK_MM, SLUMPING_SETBACK_MM, type HamstringLevel, type ReleaseResult } from '@/lib/engines/baikfit/mobility';
import { ExplainerImage } from '@/components/illustrations/ExplainerImage';

type Texts = Translations['miniTests'];

interface ChoiceProps<Answer extends string> {
  name: string;
  question: string;
  options: Record<Answer, { title: string; hint: string }>;
  value: Answer | null;
  onChange: (answer: Answer | null) => void;
}

/** One answer per test, as a group of radio buttons; choosing the chosen answer again clears it (the test is optional). */
function Choice<Answer extends string>({ name, question, options, value, onChange }: ChoiceProps<Answer>) {
  return (
    <div role="radiogroup" aria-label={question} data-testid={`${name}-choice`} className="grid gap-2 sm:grid-cols-3">
      {(Object.keys(options) as Answer[]).map((answer) => (
        <button
          key={answer}
          type="button"
          role="radio"
          aria-checked={value === answer}
          onClick={() => onChange(value === answer ? null : answer)}
          className={cx('p-3 rounded-xl border text-left transition-colors', value === answer ? 'border-blue-600 bg-tone-info-bg text-ink' : 'border-line bg-sunken text-ink-2 hover:border-line')}
        >
          <span className="block text-sm font-bold">{options[answer].title}</span>
          <span className="block text-xs text-ink-2 mt-0.5">{options[answer].hint}</span>
        </button>
      ))}
    </div>
  );
}

interface CardProps {
  testId: string;
  title: string;
  optional: string;
  steps: string[];
  diagram: React.ReactNode;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ testId, title, optional, steps, diagram, children }) => (
  <section data-testid={testId} className="p-5 rounded-xl border border-line bg-sunken space-y-4">
    <div className="flex flex-wrap items-center gap-2">
      <h3 className="text-sm font-bold text-ink">{title}</h3>
      <span className="text-[11px] font-mono uppercase tracking-wider text-ink-3">{optional}</span>
    </div>
    <div className="space-y-4">
      <ol className="space-y-2 text-sm text-ink-2 list-decimal pl-5">
        {steps.map((step) => <li key={step} className="leading-relaxed">{step}</li>)}
      </ol>
      {diagram}
    </div>
    {children}
  </section>
);

const Effect: React.FC<{ text: string | null }> = ({ text }) => (text ? <p role="status" className="text-xs text-ink-2 leading-relaxed p-3 rounded-lg border border-tone-info-line bg-tone-info-bg">{text}</p> : null);

interface MiniTestsProps {
  t: Translations;
  hamstringTest: HamstringLevel | null;
  setHamstringTest: (answer: HamstringLevel | null) => void;
  releaseTest: ReleaseResult | null;
  setReleaseTest: (answer: ReleaseResult | null) => void;
}

/** Wizard step 3: the two optional mobility tests. What the chosen answer changes is said under the answers. */
export const MiniTests: React.FC<MiniTestsProps> = ({ t, hamstringTest, setHamstringTest, releaseTest, setReleaseTest }) => {
  const m: Texts = t.miniTests;
  return (
    <div className="space-y-4" data-testid="mini-tests">
      <div>
        <h2 className="text-xs font-mono font-semibold text-ink-2 uppercase tracking-wide">{m.title}</h2>
        <p className="text-xs text-ink-2 mt-1">{m.intro}</p>
      </div>
      <Card testId="hamstring-test" title={m.hamstring.title} optional={m.optional} steps={m.hamstring.steps} diagram={<ExplainerImage id="hamstring" alt={m.hamstring.diagramLabel} caption={m.hamstring.diagramCaption} />}>
        <Choice name="hamstring" question={m.hamstring.question} options={m.hamstring.options} value={hamstringTest} onChange={setHamstringTest} />
        <Effect text={hamstringTest ? fill(m.hamstring.options[hamstringTest].effect, { stack: LOW_HAMSTRING_STACK_MM }) : null} />
      </Card>
      <Card testId="release-test" title={m.release.title} optional={m.optional} steps={m.release.steps} diagram={<ExplainerImage id="release" alt={m.release.diagramLabel} caption={m.release.diagramCaption} />}>
        <Choice name="release" question={m.release.question} options={m.release.options} value={releaseTest} onChange={setReleaseTest} />
        <Effect text={releaseTest ? fill(m.release.options[releaseTest].effect, { setback: SLUMPING_SETBACK_MM }) : null} />
      </Card>
    </div>
  );
};
