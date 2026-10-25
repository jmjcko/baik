import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { computeBikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { DEFAULT_MTB_SETUP, type MtbSetup } from '@/lib/engines/baikfit/mtb';
import type { RiderPainType, RidingDiscipline } from '@/types/baikfit';
import { DiagnosticReport } from '../DiagnosticReport';

function renderReport(locale: Locale, over: { discipline?: RidingDiscipline; mtb?: MtbSetup; currentBarWidthMm?: number | null; currentPains?: RiderPainType[]; acromionWidthMm?: number } = {}) {
  const discipline = over.discipline ?? 'xc_mtb';
  const props = {
    t: translations[locale], inseamMm: 840, acromionWidthMm: over.acromionWidthMm ?? 420, crankLengthMm: 170, riderWeightKg: 75, discipline,
    mtb: over.mtb ?? DEFAULT_MTB_SETUP, currentPains: over.currentPains ?? [], currentSaddleHeightMm: null, currentBarWidthMm: over.currentBarWidthMm ?? null,
    coordinates: computeBikeFitCoordinates({ inseamMm: 840, ridingDiscipline: discipline }), onOpenCadStudio: vi.fn(), onEditMeasurements: vi.fn(),
  };
  return render(<DiagnosticReport {...props} />);
}

describe.each(['en', 'cs'] as Locale[])('the MTB part of the report (%s)', (locale) => {
  const t = translations[locale];
  const m = t.diagnosticReport.mtb;

  it('should show the XC hardtail: flat bar target, sag of a 100 mm fork and the saddle for the extended post', () => {
    renderReport(locale, { mtb: { ...DEFAULT_MTB_SETUP, travelMm: 100, dropperTravelMm: 125 }, currentBarWidthMm: 740 });
    expect(screen.getByTestId('mtb-report')).toBeInTheDocument();
    const bar = screen.getByTestId('mtb-bar');
    expect(bar).toHaveTextContent(m.bar.target.replace('{target}', '740'));
    expect(bar).toHaveTextContent(m.bar.same);
    const sag = screen.getByTestId('mtb-sag');
    expect(sag).toHaveTextContent(m.sag.value.replace('{sag}', '20').replace('{percent}', '20').replace('{travel}', '100'));
    expect(sag).toHaveTextContent(m.sag.hardtail.replace('{angle}', '1').replace('{min}', '5').replace('{max}', '8'));
    expect(within(sag).getByText(m.estimate)).toBeInTheDocument();
    expect(screen.getByTestId('mtb-dropper')).toHaveTextContent(m.dropper.extended.replace('{height}', '742'));
    expect(screen.getByTestId('mtb-dropper')).toHaveTextContent(m.dropper.lowered.replace('{travel}', '125').replace('{height}', '617'));
  });

  it('should show the Trail full suspension: a wider bar than the current one, a shorter stem, no change of the geometry', () => {
    renderReport(locale, { mtb: { style: 'trail', fullSuspension: true, travelMm: 140, sagPercent: null, dropperTravelMm: 150 }, currentBarWidthMm: 740 });
    const bar = screen.getByTestId('mtb-bar');
    expect(bar).toHaveTextContent(m.bar.target.replace('{target}', '780'));
    expect(bar).toHaveTextContent(m.bar.narrower.replace('{delta}', '40'));
    expect(bar).toHaveTextContent(m.bar.stemShorter.replace('{change}', '20'));
    const sag = screen.getByTestId('mtb-sag');
    expect(sag).toHaveTextContent(m.sag.value.replace('{sag}', '35').replace('{percent}', '25').replace('{travel}', '140'));
    expect(sag).toHaveTextContent(m.sag.full);
    expect(sag).not.toHaveTextContent(m.sag.hardtail.split('{')[0]);
  });

  it('should keep a wide target inside the range of the style for a narrow rider, and ask for what is missing', () => {
    renderReport(locale, { acromionWidthMm: 380 });
    expect(screen.getByTestId('mtb-bar')).toHaveTextContent(m.bar.target.replace('{target}', '720'));
    expect(screen.getByTestId('mtb-bar')).toHaveTextContent(m.bar.none);
    expect(screen.getByTestId('mtb-bar')).toHaveTextContent(m.bar.stemNone);
    expect(screen.getByTestId('mtb-sag')).toHaveTextContent(m.sag.none);
    expect(screen.getByTestId('mtb-dropper')).toHaveTextContent(m.dropper.none);
  });

  it('should not judge a flat bar with the drop bar rule, and show arm pump with its steps', () => {
    renderReport(locale, { currentBarWidthMm: 780, currentPains: ['arm_pump'] });
    expect(screen.queryByText(t.diagnosticReport.handlebarBadge)).not.toBeInTheDocument();
    expect(screen.getByTestId('diagnosis-armPump')).toHaveTextContent(t.diagnosis.items.armPump.rootCause);
    expect(screen.getByTestId('diagnosis-armPump')).toHaveTextContent('40°–45°');
  });

  it('should show nothing of it on a road bike, which keeps its drop bar finding', () => {
    renderReport(locale, { discipline: 'road', currentBarWidthMm: 440 });
    expect(screen.queryByTestId('mtb-report')).not.toBeInTheDocument();
    expect(screen.getByText(t.diagnosticReport.handlebarBadge)).toBeInTheDocument();
  });
});
