import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { mockPrePurchaseResponse } from '@/types/__tests__/baikfit.mock';
import { PROGRESS_KEY, emptyProgress } from '@/lib/finder/progress';
import { PrePurchaseAuditView } from '../PrePurchaseAuditView';

const analyzeMock = vi.fn();
vi.mock('@/app/actions/analyzeBikeGeometry', () => ({ analyzeBikeGeometry: (...args: unknown[]) => analyzeMock(...args) }));
vi.mock('@/app/actions/findBikes', () => ({ recommendBikes: vi.fn(), readGeometryTable: vi.fn() }));

function renderView(locale: Locale, discipline: 'road' | 'gravel' | 'xc_mtb' = 'road') {
  return render(
    <PrePurchaseAuditView
      t={translations[locale]} locale={locale} inseamMm={840} acromionWidthMm={390} heightCm={178}
      torsoLengthMm={600} armLengthMm={640} riderWeightKg={82} ridingStyle="endurance" discipline={discipline}
      currentPains={[]} onBackToEntry={vi.fn()}
    />
  );
}

describe.each(['en', 'cs'] as const)('Path B: the way to the bike finder (%s)', (locale) => {
  const t = translations[locale];

  beforeEach(() => {
    localStorage.clear();
    analyzeMock.mockReset();
    analyzeMock.mockResolvedValue({ success: true, data: mockPrePurchaseResponse });
  });

  it('should offer "I know the bike" first and "Help me choose" as the second way, in step 2 only', () => {
    renderView(locale);
    expect(screen.queryByRole('tab', { name: t.finder.modeFinder })).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(t.prePurchaseAudit.nextStepButton));
    expect(screen.getByRole('tab', { name: t.finder.modeKnown })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('tab', { name: t.finder.modeFinder }));
    expect(screen.getByTestId('bike-finder')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: t.finder.modeKnown }));
    expect(screen.getByLabelText(t.prePurchaseAudit.bikeModelLabel)).toBeInTheDocument();
  });

  it('should ask the questions of the kind of bike chosen in step 1', () => {
    renderView(locale, 'gravel');
    fireEvent.click(screen.getByText(t.prePurchaseAudit.nextStepButton));
    fireEvent.click(screen.getByRole('tab', { name: t.finder.modeFinder }));
    expect(screen.getByRole('heading', { name: t.finder.parameters.gravel_use.name })).toBeInTheDocument();
  });

  it('should run the audit of a suggested bike with its name and show the report', async () => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ ...emptyProgress('road'), candidates: [{ brand: 'Canyon', model: 'Endurace CF 8', year: 2024, reason: 'Comfortable.' }] }));
    renderView(locale);
    fireEvent.click(screen.getByText(t.prePurchaseAudit.nextStepButton));
    fireEvent.click(screen.getByRole('tab', { name: t.finder.modeFinder }));
    fireEvent.click(await screen.findByRole('button', { name: t.finder.card.auditButton }));
    await waitFor(() => expect(screen.getByText(mockPrePurchaseResponse.recommendedFrameSize)).toBeInTheDocument());
    expect(analyzeMock).toHaveBeenCalledWith(expect.objectContaining({ bikeModelName: 'Canyon Endurace CF 8 2024', locale, geometry: expect.objectContaining({ source: 'catalog' }) }));
  });
});
