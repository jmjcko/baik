import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { translations } from '@/lib/i18n/translations';
import { assessBar, assessCrank } from '@/lib/engines/baikfit/advice';
import { DimLine, Joint, Limb, PillBadge } from '../schematics/blueprint';
import { BarSchematic } from '../schematics/BarSchematic';
import { CrankSchematic } from '../schematics/CrankSchematic';
import { CleatSchematic } from '../schematics/CleatSchematic';
import { PitchSchematic } from '../schematics/PitchSchematic';
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

describe('figure look of every schematic', () => {
  it('should draw the bar schematic on the guide figure (white panel, own colors) instead of the blueprint grid', () => {
    const { container } = render(<BarSchematic t={t} acromionMm={380} bar={assessBar(420, 380)} />);
    expect(container.querySelector('image')).not.toBeNull();
    expect(container.querySelector('pattern')).toBeNull();
    expect(container.querySelector('div.bg-white')).not.toBeNull();
  });

  it.each([
    ['saddle', <SaddleSchematic key="s" t={t} targetMm={751} currentMm={720} />],
    ['pitch', <PitchSchematic key="p" t={t} />],
    ['cleats', <CleatSchematic key="c" t={t} />],
  ] as Array<[string, React.ReactElement]>)('should draw the %s schematic on guide artwork with its own colors instead of the blueprint grid', (_name, element) => {
    const { container } = render(element);
    expect(container.querySelector('image')).not.toBeNull();
    expect(container.querySelector('pattern')).toBeNull();
    expect(container.querySelector('div.bg-white')).not.toBeNull();
  });

  it('should draw the crank schematic on the guide figure with knee and BB reference points', () => {
    const { container } = render(<CrankSchematic t={t} crank={assessCrank(172.5)} />);
    expect(container.querySelector('image')).not.toBeNull();
    expect(container.querySelector('pattern')).toBeNull();
    for (const text of [t.kneeLabel, t.bbLabel]) expect(screen.getByText(text)).toBeInTheDocument();
  });
});

