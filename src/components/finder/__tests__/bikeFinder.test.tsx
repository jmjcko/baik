import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { CATEGORY_PARAMETERS } from '@/lib/finder/parameters';
import { PROGRESS_KEY, candidateKey, emptyProgress } from '@/lib/finder/progress';
import type { RiderProfile } from '@/types/baikfit';
import { BikeFinder } from '../BikeFinder';

const mockRecommend = vi.fn();
const mockRead = vi.fn();
vi.mock('@/app/actions/findBikes', () => ({ recommendBikes: (input: unknown) => mockRecommend(input), readGeometryTable: (input: unknown) => mockRead(input) }));
vi.mock('@/lib/bikes/prepareImage', async (original) => ({ ...(await original<object>()), prepareGeometryImage: async () => ({ imageBase64: 'A'.repeat(200), mimeType: 'image/jpeg' }) }));

const rider: RiderProfile = { heightCm: 178, inseamMm: 840, torsoLengthMm: 620, armLengthMm: 620, acromionWidthMm: 380, riderWeightKg: 75, flexibilityScore: 'moderate', ridingStyle: 'balanced', currentPains: [], bikeKind: 'road' };
const known = { brand: 'Canyon', model: 'Endurace CF 8', year: 2024, reason: 'Comfortable with electronic shifting.' };
const unknown = { brand: 'Acme', model: 'Flyer X', year: 2025, reason: 'Light and fast.' };
const sizeRow = (size: string, stack: number, reach: number) => ({ size, spec: { frameStackMm: stack, frameReachMm: reach, seatTubeAngleDeg: 73.5, stockStemMm: 100, stockHandlebarMm: 420, stockCrankMm: 172.5, stockSeatpostOffsetMm: null, stockSpacersMm: null } });
const table = { sizes: [sizeRow('S', 540, 372), sizeRow('M', 575, 385), sizeRow('L', 610, 400)], skipped: 0 };

function mount(locale: Locale, onAudit = vi.fn(), over: Partial<RiderProfile> = {}) {
  const t = translations[locale];
  const utils = render(<BikeFinder t={t} locale={locale} rider={{ ...rider, ...over }} onAudit={onAudit} />);
  return { t, onAudit, ...utils };
}

/** Progress that stands at the last question, so that the suggestion can be asked at once. */
function seedLastQuestion(category: 'road' | 'gravel' | 'mtb' = 'road') {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify({ ...emptyProgress(category), answers: { shifting: ['electronic'] }, step: CATEGORY_PARAMETERS[category].length - 1 }));
}

describe.each(['en', 'cs'] as const)('BikeFinder (%s)', (locale) => {
  beforeEach(() => {
    localStorage.clear();
    mockRecommend.mockReset();
    mockRead.mockReset();
  });

  it('should ask one question at a time, keep the answer and let the rider skip', async () => {
    const { t } = mount(locale);
    const q = t.finder.parameters;
    expect(screen.getByText(fill(t.finder.progress, { n: 1, total: CATEGORY_PARAMETERS.road.length }))).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: q.road_type.name })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: q.road_type.options.endurance }));
    expect(screen.getByRole('button', { name: q.road_type.options.endurance })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: t.finder.next }));
    expect(screen.getByRole('heading', { name: q.shifting.name })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: t.finder.skip }));
    await waitFor(() => expect(JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '{}')).toMatchObject({ step: 2, answers: { road_type: ['endurance'] } }));
    fireEvent.click(screen.getByRole('button', { name: t.finder.back }));
    expect(screen.getByRole('heading', { name: q.shifting.name })).toBeInTheDocument();
  });

  it('should ask the questions of the kind of bike of the rider', () => {
    mount(locale, vi.fn(), { bikeKind: 'xc_mtb' });
    expect(screen.getByRole('heading', { name: translations[locale].finder.parameters.mtb_type.name })).toBeInTheDocument();
    expect(screen.getByText(fill(translations[locale].finder.progress, { n: 1, total: CATEGORY_PARAMETERS.mtb.length }))).toBeInTheDocument();
  });

  it('should send the answers and the rider, then show the three suggestions with their state', async () => {
    seedLastQuestion();
    mockRecommend.mockResolvedValue({ success: true, candidates: [known, unknown] });
    const { t } = mount(locale);
    await waitFor(() => expect(screen.getByRole('button', { name: t.finder.seeResults })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: t.finder.seeResults }));
    await screen.findByTestId('finder-results');
    expect(mockRecommend).toHaveBeenCalledWith(expect.objectContaining({ category: 'road', locale, answers: { shifting: ['electronic'] }, rider: expect.objectContaining({ heightCm: 178 }) }));
    const [catalog, missing] = screen.getAllByTestId('finder-candidate');
    expect(catalog).toHaveAttribute('data-source', 'catalog');
    expect(within(catalog).getByText(t.finder.card.geometryCatalog)).toBeInTheDocument();
    expect(within(catalog).getByTestId('candidate-assessment')).toBeInTheDocument();
    expect(within(catalog).getByText(known.reason, { exact: false })).toBeInTheDocument();
    expect(missing).toHaveAttribute('data-source', 'missing');
    expect(within(missing).queryByTestId('candidate-assessment')).not.toBeInTheDocument();
    expect(screen.getByText(t.finder.disclaimer)).toBeInTheDocument();
  });

  it('should show the fixed message of an error and stay on the questions', async () => {
    seedLastQuestion();
    mockRecommend.mockResolvedValue({ success: false, error: 'rate_limited' });
    const { t } = mount(locale);
    await waitFor(() => screen.getByRole('button', { name: t.finder.seeResults }));
    fireEvent.click(screen.getByRole('button', { name: t.finder.seeResults }));
    expect(await screen.findByRole('alert')).toHaveTextContent(t.finder.errors.rate_limited);
    expect(screen.queryByTestId('finder-results')).not.toBeInTheDocument();
  });

  /** The rider gives the picture of the table of the candidate that has no geometry, and reads it. */
  function supplyPicture(t: typeof translations.en, card: HTMLElement) {
    fireEvent.click(within(card).getByRole('button', { name: t.finder.card.supplyTitle }));
    fireEvent.change(within(card).getByLabelText(t.admin.upload.dropChoose), { target: { files: [new File(['x'], 'table.png', { type: 'image/png' })] } });
  }

  it('should read the table that the rider supplies, let the rider check it and then give the size and the verdict', async () => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ ...emptyProgress('road'), candidates: [unknown] }));
    mockRead.mockResolvedValue({ success: true, table });
    const { t } = mount(locale);
    const card = await screen.findByTestId('finder-candidate');
    supplyPicture(t, card);
    expect(await within(card).findByTestId('upload-review')).toBeInTheDocument();
    expect(mockRead).toHaveBeenCalledWith({ images: [{ imageBase64: 'A'.repeat(200), mimeType: 'image/jpeg' }], name: 'Acme Flyer X 2025' });
    expect(within(card).getByTestId('review-summary')).toHaveTextContent('S, M, L');
    expect(card).toHaveAttribute('data-source', 'missing');
    fireEvent.click(within(card).getByRole('button', { name: t.geometry.use }));
    await waitFor(() => expect(card).toHaveAttribute('data-source', 'yours'));
    expect(within(card).getByTestId('candidate-assessment')).toHaveTextContent(/S, M, L/);
    const stored = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '{}').tables[candidateKey(unknown)];
    expect(stored.sizes).toHaveLength(3);
    expect(stored).toMatchObject({ brand: 'Acme', model: 'Flyer X', year: 2025 });
  });

  it('should let the rider correct a number before using the table', async () => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ ...emptyProgress('road'), candidates: [unknown] }));
    mockRead.mockResolvedValue({ success: true, table });
    const { t } = mount(locale);
    const card = await screen.findByTestId('finder-candidate');
    supplyPicture(t, card);
    await within(card).findByTestId('upload-review');
    fireEvent.click(within(card).getByRole('button', { name: t.geometry.check }));
    expect(within(card).queryByText(t.admin.upload.columns.status)).not.toBeInTheDocument();
    fireEvent.change(within(card).getByLabelText(`${t.admin.upload.columns.stack} M`), { target: { value: '580' } });
    fireEvent.click(within(card).getByRole('button', { name: t.geometry.use }));
    await waitFor(() => expect(card).toHaveAttribute('data-source', 'yours'));
    expect(JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '{}').tables[candidateKey(unknown)].sizes.find((row: { size: string }) => row.size === 'M').spec.frameStackMm).toBe(580);
  });

  it('should say why a picture could not be read and keep asking for it', async () => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ ...emptyProgress('road'), candidates: [unknown] }));
    mockRead.mockResolvedValue({ success: false, error: 'unreadable' });
    const { t } = mount(locale);
    const card = await screen.findByTestId('finder-candidate');
    supplyPicture(t, card);
    expect(await within(card).findByRole('alert')).toHaveTextContent(t.admin.upload.errors.unreadable);
    expect(card).toHaveAttribute('data-source', 'missing');
  });

  it('should offer no audit for a bike without geometry: the model does not know the numbers', async () => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ ...emptyProgress('road'), candidates: [unknown] }));
    const { t } = mount(locale);
    const card = await screen.findByTestId('finder-candidate');
    expect(within(card).queryByRole('button', { name: t.finder.card.auditButton })).not.toBeInTheDocument();
  });

  it('should come back to the same answers and suggestions after the page was left', async () => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ ...emptyProgress('road'), answers: { shifting: ['electronic'] }, candidates: [known], tables: {} }));
    const { t } = mount(locale);
    await screen.findByTestId('finder-results');
    expect(screen.getByText(t.finder.resumed)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: t.finder.editAnswers }));
    expect(screen.getByTestId('finder-question')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '{}').candidates).toHaveLength(1);
  });

  it('should forget everything on a new start', async () => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ ...emptyProgress('road'), answers: { shifting: ['electronic'] }, candidates: [known] }));
    const { t } = mount(locale);
    await screen.findByTestId('finder-results');
    fireEvent.click(screen.getByRole('button', { name: t.finder.startOver }));
    expect(screen.getByTestId('finder-question')).toBeInTheDocument();
    expect(localStorage.getItem(PROGRESS_KEY)).toBeNull();
  });

  it('should open the audit of a suggested bike by its name', async () => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ ...emptyProgress('road'), candidates: [known] }));
    const { t, onAudit } = mount(locale);
    fireEvent.click(await screen.findByRole('button', { name: t.finder.card.auditButton }));
    expect(onAudit).toHaveBeenCalledWith('Canyon Endurace CF 8 2024', expect.objectContaining({ source: 'catalog' }));
  });
});
