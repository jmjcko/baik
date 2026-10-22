import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { computeBikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { TargetNumbers } from '../TargetNumbers';
import type { FindingInput } from '../reportFindings';

const INPUT: FindingInput = {
  inseamMm: 850, acromionWidthMm: 380, crankLengthMm: 172.5, saddleHeightMm: 751,
  currentBarWidthMm: 420, currentSaddleHeightMm: 720,
};

describe.each(['en', 'cs'] as Locale[])('TargetNumbers (%s)', (locale) => {
  const t = translations[locale];
  const r = t.diagnosticReport;
  const coordinates = computeBikeFitCoordinates({ inseamMm: 850, ridingDiscipline: 'road' });

  function renderTargets() {
    return render(<TargetNumbers t={t} coordinates={coordinates} input={INPUT} discipline="road" />);
  }

  it('should show the four target cards and the cockpit estimates strip with Estimate chips', () => {
    renderTargets();
    for (const key of ['saddle', 'handlebar', 'crank', 'setback']) expect(screen.getByTestId(`target-${key}`)).toBeInTheDocument();
    expect(within(screen.getByTestId('target-saddle')).getByText('751 mm')).toBeInTheDocument();
    expect(within(screen.getByTestId('target-handlebar')).getByText('380 mm')).toBeInTheDocument();
    expect(within(screen.getByTestId('target-crank')).getByText('165 mm')).toBeInTheDocument();
    expect(screen.getByText(r.targets.cockpitTitle)).toBeInTheDocument();
    expect(screen.getByText(`${coordinates.cockpit.stackYMm} mm`)).toBeInTheDocument();
    expect(screen.getByText(`${coordinates.cockpit.reachXMm} mm`)).toBeInTheDocument();
    expect(screen.getAllByText(r.estimateChip)).toHaveLength(2);
  });

  it('should open the saddle height explanation by default with the three blocks and the formula', () => {
    renderTargets();
    const panel = screen.getByRole('region', { name: t.studio.saddleY });
    for (const label of [r.targets.whatLabel, r.targets.originLabel, r.targets.impactLabel]) expect(panel).toHaveTextContent(label);
    expect(panel).toHaveTextContent('850');
    expect(panel).toHaveTextContent('0.883');
    expect(panel).toHaveTextContent('750.55');
    expect(screen.getByRole('button', { name: r.targets.hideButton })).toHaveAttribute('aria-expanded', 'true');
  });

  it('should switch the one open panel when another number is explained and close it on a second click', () => {
    renderTargets();
    const handlebarCard = screen.getByTestId('target-handlebar');
    fireEvent.click(within(handlebarCard).getByRole('button', { name: r.targets.explainButton }));
    expect(screen.getAllByRole('region')).toHaveLength(1);
    expect(screen.getByRole('region', { name: r.targets.handlebarLabel })).toHaveTextContent('1:1');
    expect(within(screen.getByTestId('target-saddle')).getByRole('button')).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(within(handlebarCard).getByRole('button', { name: r.targets.hideButton }));
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });
});
