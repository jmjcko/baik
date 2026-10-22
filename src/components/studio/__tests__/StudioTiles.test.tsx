import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { computeBikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { buildTargets } from '@/components/report/buildTargets';
import { StudioTiles } from '../StudioTiles';
import { formatDelta, studioDeltas, type StudioSnapshot } from '../studioDeltas';
import { BikeCadWireframe } from '../BikeCadWireframe';
import { computeWireframeGeometry } from '../wireframe/geometry';

const snapshot = (inseamMm: number, acromionWidthMm: number, crankLengthMm: number, discipline: 'road' | 'gravel' = 'road'): StudioSnapshot => ({
  coordinates: computeBikeFitCoordinates({ inseamMm, ridingDiscipline: discipline }), acromionWidthMm, crankLengthMm,
});

describe('studioDeltas and formatDelta', () => {
  it('should measure every live number against the profile', () => {
    const deltas = studioDeltas(snapshot(900, 380, 165), snapshot(850, 380, 172.5));
    expect(deltas).toEqual({ saddle: 795 - 751, setback: -225 + 213, stack: 608 - 574, reach: 411 - 388, crank: -7.5 });
  });

  it('should write a signed change with the suffix and nothing when the value did not move', () => {
    expect(formatDelta(11, 'vs report')).toBe('+11 mm vs report');
    expect(formatDelta(-7.5, 'proti reportu')).toBe('−7.5 mm proti reportu');
    expect(formatDelta(0, 'vs report')).toBeNull();
    expect(formatDelta(0.04, 'vs report')).toBeNull();
  });
});

describe.each(['en', 'cs'] as Locale[])('StudioTiles (%s)', (locale) => {
  const t = translations[locale];

  it('should show the same handlebar and saddle numbers as the report for the same input', () => {
    const now = snapshot(850, 380, 172.5);
    render(<StudioTiles t={t} now={now} reference={now} />);
    const input = { inseamMm: 850, acromionWidthMm: 380, crankLengthMm: 172.5, saddleHeightMm: now.coordinates.saddle.heightAlongTubeMm, currentBarWidthMm: null, currentSaddleHeightMm: null };
    const report = buildTargets(t, input, now.coordinates, 'road');
    const tile = (label: string) => screen.getByText(label).closest('div.flex-col') as HTMLElement;
    expect(tile(t.diagnosticReport.targets.handlebarLabel)).toHaveTextContent(report.find((x) => x.key === 'handlebar')!.value.replace(' mm', ''));
    expect(tile(t.studio.saddleY)).toHaveTextContent(report.find((x) => x.key === 'saddle')!.value.replace(' mm', ''));
  });

  it('should show no change badge while the simulator equals the profile', () => {
    const now = snapshot(850, 380, 172.5);
    render(<StudioTiles t={t} now={now} reference={now} />);
    expect(screen.queryByText(new RegExp(t.studio.vsReport))).not.toBeInTheDocument();
  });

  it('should show badges only on the values that moved: shoulders change the bar, the crank changes the crank tile', () => {
    render(<StudioTiles t={t} now={snapshot(850, 430, 165)} reference={snapshot(850, 380, 172.5)} />);
    expect(screen.getByText(`+40 mm ${t.studio.vsReport}`)).toBeInTheDocument();
    expect(screen.getByText(`−7.5 mm ${t.studio.vsReport}`)).toBeInTheDocument();
    expect(screen.getAllByText(new RegExp(t.studio.vsReport))).toHaveLength(2);
  });

  it('should explain the knee rise for a crank above 165 mm and show the recommended range otherwise', () => {
    const { unmount } = render(<StudioTiles t={t} now={snapshot(850, 380, 172.5)} reference={snapshot(850, 380, 172.5)} />);
    expect(screen.getByText(t.studio.crankKnee.replace('{delta}', '7.5').replace('{max}', '165'))).toBeInTheDocument();
    unmount();
    render(<StudioTiles t={t} now={snapshot(850, 380, 160)} reference={snapshot(850, 380, 160)} />);
    expect(screen.queryByText(/7\.5/)).not.toBeInTheDocument();
    expect(screen.getByText(t.diagnosticReport.targets.crankNote.replace('{range}', '160–165 mm'))).toBeInTheDocument();
  });

  it('should move the discipline dependent numbers when the discipline changes', () => {
    render(<StudioTiles t={t} now={snapshot(850, 380, 170, 'gravel')} reference={snapshot(850, 380, 170, 'road')} />);
    expect(screen.getAllByText(new RegExp(t.studio.vsReport)).length).toBeGreaterThan(0);
  });
});

describe('crank arm of the wireframe is drawn to scale', () => {
  const coordinates = computeBikeFitCoordinates({ inseamMm: 850, ridingDiscipline: 'road' });
  const length = (mm: number) => {
    const g = computeWireframeGeometry(coordinates, mm);
    return Math.hypot(g.crankTipX - g.bbX, g.crankTipY - g.bbY);
  };

  it('should draw a 172.5 mm crank longer than a 165 mm crank in proportion to the mm difference', () => {
    expect(length(172.5)).toBeGreaterThan(length(165));
    expect(length(172.5) / length(165)).toBeCloseTo(172.5 / 165, 2);
  });

  it('should label the crank with its length and default to 170 mm', () => {
    const t = translations.en;
    const { rerender, container } = render(<BikeCadWireframe coordinates={coordinates} crankLengthMm={165} t={t.studio} />);
    expect(container.querySelector('#drivetrain')).toHaveTextContent('165 mm');
    rerender(<BikeCadWireframe coordinates={coordinates} t={t.studio} />);
    expect(container.querySelector('#drivetrain')).toHaveTextContent('170 mm');
  });
});
