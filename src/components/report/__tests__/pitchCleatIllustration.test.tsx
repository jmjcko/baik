import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { assessBar } from '@/lib/engines/baikfit/advice';
import { buildHowTo } from '../buildHowTo';
import { HowToGuide } from '../HowToGuide';
import { StepIllustration, type StepKind } from '../StepIllustration';
import { PitchSchematic } from '../schematics/PitchSchematic';
import { SaddleSchematic } from '../schematics/SaddleSchematic';
import type { FindingInput } from '../reportFindings';

const INPUT: FindingInput = { inseamMm: 850, acromionWidthMm: 380, crankLengthMm: 172.5, saddleHeightMm: 751, currentBarWidthMm: 420, currentSaddleHeightMm: 720 };

describe.each(['en', 'cs'] as Locale[])('shared saddle artwork (%s)', (locale) => {
  const s = translations[locale].diagnosticReport.schematics;

  it('should use the same saddle artwork in the pitch schematic and in the saddle height schematic', () => {
    const pitch = render(<PitchSchematic t={s} />).container.querySelector('image');
    const height = render(<SaddleSchematic t={s} targetMm={751} currentMm={720} />).container.querySelector('image');
    expect(pitch?.getAttribute('href')).toBe(height?.getAttribute('href'));
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

  it('should give the pitch guide and the cleat guide three drawings each in step order and the other guides none', () => {
    expect(buildHowTo(t, 'pitch', INPUT).stepKinds).toEqual(['level', 'clamp', 'ride']);
    expect(buildHowTo(t, 'cleat', INPUT).stepKinds).toEqual(['mark', 'cleat', 'ride']);
    for (const id of ['pitch', 'cleat'] as const) expect(buildHowTo(t, id, INPUT).stepKinds).toHaveLength(buildHowTo(t, id, INPUT).steps.length);
    for (const id of ['saddle', 'handlebar', 'crank'] as const) expect(buildHowTo(t, id, INPUT).stepKinds).toBeUndefined();
  });

  it('should show numbered badges with a drawing per step in the pitch guide and plain numbered steps elsewhere', () => {
    const pitch = render(<HowToGuide t={t} id="pitch" guide={buildHowTo(t, 'pitch', INPUT)} />);
    fireEvent.click(screen.getByText(t.diagnosticReport.howTo.title));
    const items = within(screen.getByTestId('howto-pitch')).getAllByRole('listitem').filter((li) => li.querySelector('svg[data-testid^="step-illustration"]'));
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('1');
    pitch.unmount();
    render(<HowToGuide t={t} id="saddle" guide={buildHowTo(t, 'saddle', INPUT)} />);
    expect(screen.queryByTestId(/^step-illustration/)).not.toBeInTheDocument();
    expect(assessBar(420, 380).tooWide).toBe(true);
  });
});
