import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { mockPrePurchaseResponse } from '@/types/__tests__/baikfit.mock';
import type { RidingDiscipline } from '@/types/baikfit';
import { PrePurchaseAuditView } from '../PrePurchaseAuditView';
import { buildVerdictRows } from '../verdicts';

const analyzeMock = vi.fn();
vi.mock('@/app/actions/analyzeBikeGeometry', () => ({ analyzeBikeGeometry: (...args: unknown[]) => analyzeMock(...args) }));

function renderView(locale: Locale, discipline?: RidingDiscipline, style: 'xc' | 'trail' = 'xc') {
  return render(
    <PrePurchaseAuditView
      t={translations[locale]} locale={locale} inseamMm={840} acromionWidthMm={420} heightCm={178} torsoLengthMm={600} armLengthMm={640} riderWeightKg={75}
      ridingStyle="balanced" currentPains={[]} onBackToEntry={vi.fn()} discipline={discipline} mtb={{ style }}
    />
  );
}

describe.each(['en', 'cs'] as Locale[])('the pre-purchase audit of a mountain bike (%s)', (locale) => {
  const a = translations[locale].prePurchaseAudit;
  const wizard = translations[locale].wizard;
  /** The name box starts empty: the rider picks a bike of the catalog by typing it. */
  const typeBike = () => fireEvent.change(screen.getByLabelText(a.bikeModelLabel), { target: { value: 'Canyon Endurace CF 8 2024' } });

  beforeEach(() => {
    analyzeMock.mockReset();
    analyzeMock.mockResolvedValue({ success: true, data: mockPrePurchaseResponse });
  });

  it('should start from the kind of the bike of the garage, and let the rider choose another kind and XC or Trail', () => {
    renderView(locale, 'xc_mtb');
    const picker = screen.getByTestId('audit-kind');
    expect(within(picker).getByRole('button', { name: wizard.mtb.styles.xc })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(within(picker).getByRole('button', { name: wizard.mtb.styles.trail }));
    expect(within(picker).getByRole('button', { name: wizard.mtb.styles.trail })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(within(picker).getAllByRole('button')[0]);
    expect(within(picker).queryByRole('button', { name: wizard.mtb.styles.trail })).not.toBeInTheDocument();
  });

  it('should send the kind and the style of the bike with the request, and show the flat bar target and the stem range in the table', async () => {
    renderView(locale, 'road');
    fireEvent.click(within(screen.getByTestId('audit-kind')).getAllByRole('button')[2]);
    fireEvent.click(screen.getByRole('button', { name: wizard.mtb.styles.trail }));
    fireEvent.click(screen.getByText(a.nextStepButton));
    typeBike();
    fireEvent.click(screen.getByText(a.runAuditButton));
    await waitFor(() => expect(screen.getByText(mockPrePurchaseResponse.recommendedFrameSize)).toBeInTheDocument());
    expect(analyzeMock.mock.calls[0][0].riderProfile).toMatchObject({ bikeKind: 'xc_mtb', mtbStyle: 'trail' });
    expect(screen.getByText(a.mtbBarVerdict)).toBeInTheDocument();
    expect(screen.getByText(a.mtbStemVerdict)).toBeInTheDocument();
    expect(screen.getByText('35–50 mm')).toBeInTheDocument();
    expect(screen.getByText(/780 mm/)).toBeInTheDocument();
    expect(screen.getByTestId('mtb-geometry-note')).toHaveTextContent(a.mtbGeometryNote);
    expect(screen.queryByText(a.verdictTooWide)).not.toBeInTheDocument();
  });

  it('should keep the drop bar verdict and no mountain bike note for a road bike', async () => {
    renderView(locale, 'road');
    fireEvent.click(screen.getByText(a.nextStepButton));
    typeBike();
    fireEvent.click(screen.getByText(a.runAuditButton));
    await waitFor(() => expect(screen.getByText(mockPrePurchaseResponse.recommendedFrameSize)).toBeInTheDocument());
    expect(analyzeMock.mock.calls[0][0].riderProfile).toMatchObject({ bikeKind: 'road' });
    expect(screen.getAllByText(a.verdictOptimal).length).toBeGreaterThan(0);
    expect(screen.queryByTestId('mtb-geometry-note')).not.toBeInTheDocument();
    expect(screen.queryByText(a.mtbBarVerdict)).not.toBeInTheDocument();
  });

  it('should build the verdict rows of a mountain bike without the drop bar rule: bar target, stem range, cranks and reach', () => {
    const reach = { recommendedReachMm: 400, stockReachMm: 400, stemDeltaMm: 0 };
    const rows = buildVerdictRows(a, { acromionWidthMm: 420, flexibilityScore: 'moderate', riderWeightKg: 75, heightCm: 178, bikeKind: 'xc_mtb', mtbStyle: 'xc' }, reach);
    expect(rows.map((row) => row.component)).toEqual([a.tableHandlebar, a.tableStem, a.tableCrank, a.tableReach]);
    expect(rows[0].recommended).toContain('740 mm');
    expect(rows[0].tone).toBe('neutral');
    expect(buildVerdictRows(a, { acromionWidthMm: 420, flexibilityScore: 'moderate', riderWeightKg: 75 }, reach)).toHaveLength(3);
  });
});
