import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { assessBar } from '@/lib/engines/baikfit/advice';
import { buildHowTo } from '../buildHowTo';
import { HowToGuide } from '../HowToGuide';
import { StepIllustration, type StepKind } from '../StepIllustration';
import { PitchCleatSchematic } from '../schematics/PitchCleatSchematic';
import { SaddleSchematic } from '../schematics/SaddleSchematic';
import type { FindingInput } from '../reportFindings';

const INPUT: FindingInput = { inseamMm: 850, acromionWidthMm: 380, crankLengthMm: 172.5, saddleHeightMm: 751, currentBarWidthMm: 420, currentSaddleHeightMm: 720 };

describe.each(['en', 'cs'] as Locale[])('recognizable saddle and shoe (%s)', (locale) => {
  const t = translations[locale];
  const s = t.diagnosticReport.schematics;

  it('should draw the shoe from below with the cleat plate, three bolts, the joint callout and the ruler', () => {
    const { container } = render(<PitchCleatSchematic t={s} />);
    expect(container.querySelector('path[fill="var(--schematic-body)"]')).not.toBeNull();
    expect(container.querySelectorAll('circle[fill="var(--schematic-line)"]')).toHaveLength(3);
    expect(screen.getByText(s.jointLabel)).toBeInTheDocument();
    expect(screen.getByText('10–17 mm')).toBeInTheDocument();
    expect(screen.getByText(s.axleLabel)).toBeInTheDocument();
  });

  it('should explain in the caption where the 1st metatarsal joint is and that the sole is seen from below', () => {
    render(<PitchCleatSchematic t={s} />);
    expect(screen.getByText(s.pitchCleatCaption.replace('{cleatMin}', '10').replace('{cleatMax}', '17').replace('{pitch}', '2'))).toBeInTheDocument();
    expect(s.pitchCleatCaption).toMatch(/metatars|metatarz/i);
  });

  it('should be taller than the standard frame and show the saddle with the spirit level and the maximum tilt', () => {
    const { container } = render(<PitchCleatSchematic t={s} />);
    expect(container.querySelector('svg')!.getAttribute('viewBox')).toBe('0 0 260 232');
    expect(screen.getByText(s.pitchLevelLabel)).toBeInTheDocument();
    expect(screen.getByText(s.pitchMaxLabel.replace('{pitch}', '2'))).toBeInTheDocument();
    expect(container.querySelector('path[stroke-dasharray="4 3"]')).not.toBeNull();
  });

  it('should use the same saddle shell in the pitch schematic and in the saddle height schematic', () => {
    const pitch = render(<PitchCleatSchematic t={s} />).container.querySelector('path[fill="var(--schematic-line)"][stroke="var(--schematic-pill)"]');
    const height = render(<SaddleSchematic t={s} targetMm={751} currentMm={720} />).container.querySelector('path[fill="var(--schematic-line)"][stroke="var(--schematic-pill)"]');
    expect(pitch?.getAttribute('d')).toBeTruthy();
    expect(pitch?.getAttribute('d')).toBe(height?.getAttribute('d'));
  });
});

describe('illustrated steps in the how-to guide', () => {
  const t = translations.en;

  it.each(['level', 'clamp', 'mark', 'cleat', 'ride'] as StepKind[])('should draw the %s step as a decorative drawing without text', (kind) => {
    const { container } = render(<StepIllustration kind={kind} />);
    const svg = screen.getByTestId(`step-illustration-${kind}`);
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('text')).toBeNull();
  });

  it('should give the pitch and cleats guide five drawings in step order and the other guides none', () => {
    expect(buildHowTo(t, 'pitchCleat', INPUT).stepKinds).toEqual(['level', 'clamp', 'mark', 'cleat', 'ride']);
    expect(buildHowTo(t, 'pitchCleat', INPUT).stepKinds).toHaveLength(buildHowTo(t, 'pitchCleat', INPUT).steps.length);
    for (const id of ['saddle', 'handlebar', 'crank'] as const) expect(buildHowTo(t, id, INPUT).stepKinds).toBeUndefined();
  });

  it('should show numbered badges with a drawing per step in the pitch guide and plain numbered steps elsewhere', () => {
    const pitch = render(<HowToGuide t={t} id="pitchCleat" guide={buildHowTo(t, 'pitchCleat', INPUT)} />);
    fireEvent.click(screen.getByText(t.diagnosticReport.howTo.title));
    const items = within(screen.getByTestId('howto-pitchCleat')).getAllByRole('listitem').filter((li) => li.querySelector('svg[data-testid^="step-illustration"]'));
    expect(items).toHaveLength(5);
    expect(items[0]).toHaveTextContent('1');
    pitch.unmount();
    render(<HowToGuide t={t} id="saddle" guide={buildHowTo(t, 'saddle', INPUT)} />);
    expect(screen.queryByTestId(/^step-illustration/)).not.toBeInTheDocument();
    expect(assessBar(420, 380).tooWide).toBe(true);
  });
});
