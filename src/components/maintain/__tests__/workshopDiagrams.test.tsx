import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { translations } from '@/lib/i18n/translations';
import { BleedDiagram, BLEED_NAMES } from '../BleedDiagram';
import { DerailleurDiagram, DERAILLEUR_NAMES } from '../DerailleurDiagram';
import { NodeDiagram } from '../NodeDiagram';
import { RotorDiagram, ROTOR_NAMES } from '../RotorDiagram';
import type { NameSpec } from '../diagramNames';

const VIEW_BOX: Record<string, [number, number]> = { rotor: [0, 400], bleed: [-70, 370], derailleur: [-100, 340] };

/** The text of a name is about 6 units a character at the size of the drawing; it has to end inside the canvas. */
function extent(text: string, spec: NameSpec): [number, number] {
  const width = text.length * 6;
  if (spec.anchor === 'start') return [spec.x, spec.x + width];
  return spec.anchor === 'end' ? [spec.x - width, spec.x] : [spec.x - width / 2, spec.x + width / 2];
}

describe.each(['en', 'cs'] as const)('workshop drawings name their parts (%s)', (locale) => {
  const w = translations[locale].workshop;
  const cases = [
    { key: 'rotor', names: ROTOR_NAMES, parts: w.rotor.parts, steps: 4, draw: (step: number) => <RotorDiagram step={step} label="x" parts={w.rotor.parts} /> },
    { key: 'bleed', names: BLEED_NAMES, parts: w.bleed.parts, steps: 5, draw: (step: number) => <BleedDiagram step={step} label="x" parts={w.bleed.parts} /> },
    { key: 'derailleur', names: DERAILLEUR_NAMES, parts: w.derailleur.parts, steps: 4, draw: (step: number) => <DerailleurDiagram step={step} label="x" parts={w.derailleur.parts} /> },
  ];

  it.each(cases)('should write each name of the $key drawing in the language of the page and mark the part of the step', ({ key, parts, steps, draw }) => {
    let marked = 0;
    for (let step = 0; step < steps; step++) {
      const { unmount } = render(draw(step));
      for (const element of screen.getByTestId(`${key}-diagram`).querySelectorAll(`[data-testid^=${key}-label-]`)) {
        const id = element.getAttribute('data-testid')!.replace(`${key}-label-`, '') as keyof typeof parts;
        expect(element.textContent).toBe(parts[id]);
        if (element.getAttribute('data-active')) marked += 1;
      }
      unmount();
    }
    expect(marked).toBeGreaterThanOrEqual(steps);
  });

  it.each(cases)('should keep every name of the $key drawing inside the canvas', ({ key, names, parts }) => {
    const [from, to] = VIEW_BOX[key];
    for (const id of Object.keys(names) as Array<keyof typeof parts>) {
      const [a, b] = extent(parts[id], (names as Record<string, NameSpec>)[id]);
      expect(a, `${key} ${String(id)} left`).toBeGreaterThanOrEqual(from);
      expect(b, `${key} ${String(id)} right`).toBeLessThanOrEqual(to);
    }
  });

  it.each(['1', '2', '3', '4', '5'] as const)('should name the node %s under its ring in the node drawing', (node) => {
    const t = translations[locale];
    render(<NodeDiagram t={t} node={Number(node) as 1 | 2 | 3 | 4 | 5} kind="road" />);
    expect(screen.getByTestId(`node-diagram-name-${node}`).textContent).toBe(t.care.nodes[node].short);
  });
});
