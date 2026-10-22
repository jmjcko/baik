import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { translations } from '@/lib/i18n/translations';
import { assessBar, assessCrank } from '@/lib/engines/baikfit/advice';
import { DimLine, Joint, Limb, PillBadge } from '../schematics/blueprint';
import { BarSchematic } from '../schematics/BarSchematic';
import { CrankSchematic } from '../schematics/CrankSchematic';
import { PitchCleatSchematic } from '../schematics/PitchCleatSchematic';
import { SaddleSchematic } from '../schematics/SaddleSchematic';

const t = translations.en.diagnosticReport.schematics;

describe('blueprint building blocks', () => {
  it('should draw a pill badge as a rounded rect with one text node and anchor it at the end', () => {
    const { container } = render(<svg><PillBadge x={100} y={20} text="742 mm" color="red" anchor="end" /></svg>);
    const rect = container.querySelector('rect')!;
    expect(rect.getAttribute('rx')).toBe('7.5');
    expect(Number(rect.getAttribute('x')) + Number(rect.getAttribute('width'))).toBeCloseTo(100);
    expect(screen.getByText('742 mm')).toBeInTheDocument();
  });

  it('should draw a limb as an edge stroke under a filled stroke with round caps, a joint with a center dot and a dimension line with end ticks', () => {
    const { container } = render(
      <svg>
        <Limb points={[{ x: 0, y: 0 }, { x: 10, y: 10 }]} width={8} />
        <Joint at={{ x: 5, y: 5 }} color="red" />
        <DimLine from={{ x: 0, y: 0 }} to={{ x: 20, y: 0 }} color="red" />
      </svg>
    );
    expect(container.querySelectorAll('path')).toHaveLength(2);
    expect(container.querySelector('g[stroke-linecap="round"]')).not.toBeNull();
    expect(container.querySelectorAll('circle')).toHaveLength(2);
    expect(container.querySelectorAll('line')).toHaveLength(3);
  });
});

describe('blueprint look of every schematic', () => {
  const schematics: Array<[string, React.ReactElement]> = [
    ['saddle', <SaddleSchematic key="s" t={t} targetMm={751} currentMm={720} />],
    ['bar', <BarSchematic key="b" t={t} acromionMm={380} bar={assessBar(420, 380)} />],
    ['crank', <CrankSchematic key="c" t={t} crank={assessCrank(172.5)} />],
    ['pitch and cleats', <PitchCleatSchematic key="p" t={t} />],
  ];

  it.each(schematics)('should show the measurement grid and pill badges in the %s schematic', (_name, element) => {
    const { container } = render(element);
    expect(container.querySelector('pattern#bp-minor')).not.toBeNull();
    expect(container.querySelector('pattern#bp-major')).not.toBeNull();
    expect(container.querySelectorAll('rect[rx="7.5"]').length).toBeGreaterThanOrEqual(2);
  });

  it.each(schematics)('should use theme variables only (no hard-coded colors) in the %s schematic', (_name, element) => {
    const { container } = render(element);
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });

  it('should draw the upper body of the bar schematic as a filled outline with a head, not as bare lines', () => {
    const { container } = render(<BarSchematic t={t} acromionMm={380} bar={assessBar(420, 380)} />);
    expect(container.querySelector('path[fill="var(--schematic-body)"]')).not.toBeNull();
    expect(container.querySelector('circle[fill="var(--schematic-body)"]')).not.toBeNull();
  });

  it('should label the anatomical reference points of the crank schematic: hip, knee and the BB datum', () => {
    render(<CrankSchematic t={t} crank={assessCrank(172.5)} />);
    for (const text of [t.hipLabel, t.kneeLabel, t.bbLabel]) expect(screen.getByText(text)).toBeInTheDocument();
  });
});
