import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { computeBikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { translations } from '@/lib/i18n/translations';
import { BikeCadWireframe } from '../BikeCadWireframe';

const CASES = [
  [700, 'road'], [840, 'road'], [1000, 'road'], [840, 'gravel'], [840, 'xc_mtb'], [560, 'gravel'],
] as const;

describe('BikeCadWireframe (characterization of the SVG output)', () => {
  it.each(CASES)('should render the wireframe for an inseam of %imm (%s)', (inseamMm, discipline) => {
    const coordinates = computeBikeFitCoordinates({ inseamMm, ridingDiscipline: discipline });
    const { asFragment } = render(<BikeCadWireframe coordinates={coordinates} t={translations.en.studio} className="probe" />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('should show the stack, reach, saddle height and setback values in the dimension badges', () => {
    const coordinates = computeBikeFitCoordinates({ inseamMm: 840 });
    const { container } = render(<BikeCadWireframe coordinates={coordinates} t={translations.en.studio} />);
    const text = container.textContent ?? '';
    expect(text).toContain(`Stack: ${coordinates.cockpit.stackYMm}mm`);
    expect(text).toContain(`Reach: ${coordinates.cockpit.reachXMm}mm`);
    expect(text).toContain(`Saddle: ${coordinates.saddle.heightAlongTubeMm} mm`);
    expect(text).toContain(`[${coordinates.saddle.setbackXMm}, ${coordinates.saddle.verticalYMm}] mm`);
  });

  it('should render spoke coordinates with at most two decimals so the server and the browser output match', () => {
    const coordinates = computeBikeFitCoordinates({ inseamMm: 840 });
    const { container } = render(<BikeCadWireframe coordinates={coordinates} t={translations.en.studio} />);
    const spokes = container.querySelectorAll('line[stroke-width="0.8"]');
    expect(spokes.length).toBeGreaterThan(0);
    for (const spoke of Array.from(spokes)) {
      for (const attribute of ['x2', 'y2']) expect(spoke.getAttribute(attribute)).toMatch(/^-?\d+(\.\d{1,2})?$/);
    }
  });
});
