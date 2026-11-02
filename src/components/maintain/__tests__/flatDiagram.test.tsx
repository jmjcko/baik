import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FLAT_SCENARIOS } from '@/lib/engines/baikcare/flatRepair';
import { translations } from '@/lib/i18n/translations';
import { FlatDiagram } from '../FlatDiagram';
import { LABELS } from '../flatDiagramLabels';

describe.each(['en', 'cs'] as const)('FlatDiagram names the parts (%s)', (locale) => {
  const w = translations[locale].wheels.flat;

  it.each(FLAT_SCENARIOS)('should write the name of every labelled part of "%s" in the language of the page', (scenario) => {
    for (const step of [0, 1, 2, 3]) {
      const { unmount } = render(<FlatDiagram scenario={scenario} step={step} label={w.scenarios[scenario].diagramLabel} parts={w.parts} />);
      for (const element of screen.getByTestId('flat-diagram').querySelectorAll('[data-testid^=flat-label-]')) {
        const id = element.getAttribute('data-testid')!.replace('flat-label-', '') as keyof typeof w.parts;
        expect(LABELS[scenario][id]).toBeDefined();
        expect(element.textContent).toBe(w.parts[id]);
      }
      unmount();
    }
  });

  it('should mark the name of the part of the current step', () => {
    render(<FlatDiagram scenario="tube" step={1} label="x" parts={w.parts} />);
    expect(screen.getByTestId('flat-label-lever')).toHaveAttribute('data-active', 'true');
    expect(screen.getByTestId('flat-label-rim')).not.toHaveAttribute('data-active');
  });

  it.each([
    ['tube', 0, 'lever', false],
    ['tube', 1, 'lever', true],
    ['tube', 2, 'tube', false],
    ['tube', 3, 'tube', true],
    ['patch', 1, 'patch', false],
    ['patch', 2, 'patch', true],
  ] as const)('should draw "%s" step %i with the part "%s": %s', (scenario, step, partId, drawn) => {
    render(<FlatDiagram scenario={scenario} step={step} label="x" parts={w.parts} />);
    expect(screen.queryByTestId(`flat-label-${partId}`) !== null).toBe(drawn);
  });
});
