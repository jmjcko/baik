import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { computeBikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { translations, type Locale } from '@/lib/i18n/translations';
import { BikeCadWireframe } from '../BikeCadWireframe';
import { StudioTelemetry } from '../StudioTelemetry';
import { computeWireframeGeometry } from '../wireframe/geometry';

const mtbCoordinates = computeBikeFitCoordinates({ inseamMm: 840, ridingDiscipline: 'xc_mtb' });
const roadCoordinates = computeBikeFitCoordinates({ inseamMm: 840, ridingDiscipline: 'road' });

describe('geometry of the mountain bike drawing', () => {
  const g = computeWireframeGeometry(mtbCoordinates, 170, 'mtb');
  const road = computeWireframeGeometry(roadCoordinates, 170, 'road');

  it('should put the bottom bracket datum where the road bike has it, so the dimension lines keep their meaning', () => {
    expect([g.bbX, g.bbY]).toEqual([road.bbX, road.bbY]);
    expect(g.saddleSvgX).toBe(370 + mtbCoordinates.saddle.setbackXMm * 0.32);
    expect(g.barSvgY).toBe(356 - mtbCoordinates.cockpit.stackYMm * 0.32);
  });

  it('should draw 29 inch wheels with a wide tyre, a slack head angle and a longer wheelbase than the road bike', () => {
    expect(g.wheelRadius).toBeGreaterThan(road.wheelRadius);
    expect(g.tireStroke).toBeGreaterThan(road.tireStroke * 2);
    expect(g.forkAngleRad * (180 / Math.PI)).toBe(66);
    expect(g.frontAxleX - g.rearAxleX).toBeGreaterThan(road.frontAxleX - road.rearAxleX);
  });

  it('should set the axles above the bottom bracket and both wheels on the ground', () => {
    expect(g.axleY).toBeLessThan(g.bbY);
    expect(g.groundY).toBeCloseTo(g.axleY + g.wheelRadius, 5);
    expect(g.tireRadius + g.tireStroke / 2).toBeCloseTo(g.wheelRadius, 5);
  });

  it('should keep the road drawing as it was', () => {
    expect(road.kind).toBe('road');
    expect(road.tireRadius).toBe(road.wheelRadius);
    expect(road.tireStroke).toBe(7);
  });
});

describe.each(['en', 'cs'] as Locale[])('the mountain bike wireframe (%s)', (locale) => {
  const t = translations[locale].studio;

  it('should draw a suspension fork and a flat bar with a brake lever, and no drop bars', () => {
    const { container } = render(<BikeCadWireframe coordinates={mtbCoordinates} t={t} mtb />);
    expect(container.querySelector('#mtb-frame')).not.toBeNull();
    expect(container.querySelector('#mtb-flat-bar')).not.toBeNull();
    expect(container.querySelector('#aero-frame')).toBeNull();
    expect(container.textContent).toContain(t.wireframeMtbGeometryTag);
    expect(container.textContent).not.toContain(t.wireframeGeometryTag);
  });

  it('should keep every dimension of the datum: saddle height and setback, stack, reach and the saddle-to-bar drop', () => {
    const { container } = render(<BikeCadWireframe coordinates={mtbCoordinates} t={t} mtb />);
    const text = container.textContent ?? '';
    expect(text).toContain(t.wireframeDatum);
    expect(text).toContain(t.wireframeSaddle.replace('{value}', String(mtbCoordinates.saddle.heightAlongTubeMm)));
    expect(text).toContain(t.wireframeSetback.replace('{value}', String(mtbCoordinates.saddle.setbackXMm)));
    expect(text).toContain(t.wireframeStack.replace('{value}', String(mtbCoordinates.cockpit.stackYMm)));
    expect(text).toContain(t.wireframeReach.replace('{value}', String(mtbCoordinates.cockpit.reachXMm)));
    expect(text).toContain(t.wireframeDrop.replace('{value}', String(mtbCoordinates.saddle.verticalYMm - mtbCoordinates.cockpit.stackYMm)));
  });

  it('should still draw the road bike with drop bars when it is not a mountain bike', () => {
    const { container } = render(<BikeCadWireframe coordinates={roadCoordinates} t={t} />);
    expect(container.querySelector('#aero-frame')).not.toBeNull();
    expect(container.querySelector('#mtb-frame')).toBeNull();
    expect(container.querySelector('#mtb-flat-bar')).toBeNull();
    expect(container.querySelector('#dynamic-cockpit path[stroke="#00b4d8"]')).not.toBeNull();
  });

  it('should show the drop of a road bike too', () => {
    const { container } = render(<BikeCadWireframe coordinates={roadCoordinates} t={t} />);
    expect(container.textContent).toContain(t.wireframeDrop.replace('{value}', String(roadCoordinates.saddle.verticalYMm - roadCoordinates.cockpit.stackYMm)));
  });
});

describe.each(['en', 'cs'] as Locale[])('the studio of a mountain bike (%s)', (locale) => {
  const t = translations[locale];

  it('should show the flat bar target and no drop bar ulnar rule in the telemetry', () => {
    const { container } = render(
      <StudioTelemetry t={t} coordinates={mtbCoordinates} acromionWidthMm={420} crankLengthMm={170} reference={{ coordinates: mtbCoordinates, acromionWidthMm: 420, crankLengthMm: 170 }}
        currentPains={[]} changed={false} onApply={() => undefined} onRestore={() => undefined} flatBarStyle="trail" />
    );
    expect(container.textContent).toContain('780');
    expect(container.textContent).toContain(t.studio.flatBarNote.replace('{acromion}', '420').replace('{offset}', '360'));
    expect(container.textContent).not.toContain(t.studio.ulnarRisk);
  });

  it('should keep the drop bar rule for a road bike', () => {
    const { container } = render(
      <StudioTelemetry t={t} coordinates={roadCoordinates} acromionWidthMm={420} crankLengthMm={170} reference={{ coordinates: roadCoordinates, acromionWidthMm: 420, crankLengthMm: 170 }}
        currentPains={[]} changed={false} onApply={() => undefined} onRestore={() => undefined} />
    );
    expect(container.textContent).toContain(t.studio.ulnarRisk);
    expect(container.textContent).not.toContain('780');
  });
});
