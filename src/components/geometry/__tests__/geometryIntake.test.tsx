import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { fakeAuthClient, riderSession } from '@/test/fakeAuthClient';
import { GeometryIntake } from '../GeometryIntake';

const mockRead = vi.fn();
vi.mock('@/app/actions/findBikes', () => ({ readGeometryTable: (input: unknown) => mockRead(input) }));
vi.mock('@/lib/bikes/prepareImage', async (original) => ({ ...(await original<object>()), prepareGeometryImage: async () => ({ imageBase64: 'A'.repeat(200), mimeType: 'image/jpeg' }) }));

const sizeOf = (size: string, stack: number, reach: number) => ({ size, spec: { frameStackMm: stack, frameReachMm: reach, seatTubeAngleDeg: 73.5, stockStemMm: 100, stockHandlebarMm: 420, stockCrankMm: 172.5, stockSeatpostOffsetMm: null, stockSpacersMm: null } });
const table = { sizes: [sizeOf('S', 540, 372), sizeOf('M', 575, 385)], skipped: 0 };
const png = () => new File(['x'], 'table.png', { type: 'image/png' });

async function mount(locale: Locale, { signedIn, admin }: { signedIn: boolean; admin: boolean }) {
  const fake = fakeAuthClient();
  fake.database.rpcResults.is_admin = { data: admin };
  fake.database.tables.bike_catalog = [];
  fake.database.tables.bike_submissions = [];
  fake.database.tables.bike_misses = [];
  const onUse = vi.fn();
  const t = translations[locale];
  render(<AuthProvider client={fake.client}><GeometryIntake t={t} name="Acme Flyer X 2025" onUse={onUse} /></AuthProvider>);
  await act(async () => fake.emit('INITIAL_SESSION', null));
  if (signedIn) await act(async () => fake.emit('SIGNED_IN', riderSession));
  return { t, fake, onUse };
}

/** Choosing the picture is all that the rider does: it is read at once. */
const readTable = (t: typeof translations.en) => {
  fireEvent.change(screen.getByLabelText(t.admin.upload.dropChoose, { selector: 'input' }), { target: { files: [png()] } });
};

describe.each(['en', 'cs'] as const)('GeometryIntake (%s)', (locale) => {
  beforeEach(() => mockRead.mockReset());
  afterEach(() => vi.unstubAllGlobals());

  it('should let a guest check the sizes and use them, with no way to share and no pdf', async () => {
    mockRead.mockResolvedValue({ success: true, table });
    const { t, onUse } = await mount(locale, { signedIn: false, admin: false });
    expect(screen.getByLabelText(t.admin.upload.dropChoose, { selector: 'input' })).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp');
    expect(screen.queryByLabelText(t.admin.upload.nameLabel)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: t.admin.upload.read })).not.toBeInTheDocument();
    readTable(t);
    await screen.findByTestId('upload-review');
    expect(screen.getByTestId('review-summary')).toHaveTextContent('S, M');
    expect(screen.queryByTestId('sizes-table')).not.toBeInTheDocument();
    expect(mockRead).toHaveBeenCalledWith({ images: [{ imageBase64: 'A'.repeat(200), mimeType: 'image/jpeg' }], name: 'Acme Flyer X 2025' });
    expect(screen.queryByText(t.geometry.shareLabel)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: t.geometry.use }));
    expect(onUse).toHaveBeenCalledWith(expect.objectContaining({ brand: 'Acme', model: 'Flyer X', year: 2025, sizes: [expect.objectContaining({ size: 'S' }), expect.objectContaining({ size: 'M' })] }));
  });

  it('should share the sizes with the other riders when a signed in rider asks for it, one row per size', async () => {
    mockRead.mockResolvedValue({ success: true, table });
    const { t, fake, onUse } = await mount(locale, { signedIn: true, admin: false });
    readTable(t);
    await screen.findByTestId('upload-review');
    fireEvent.click(screen.getByLabelText(t.geometry.shareLabel));
    fireEvent.click(screen.getByRole('button', { name: t.geometry.use }));
    await waitFor(() => expect(onUse).toHaveBeenCalledTimes(1));
    expect(fake.database.submissionsUpsert).toHaveBeenCalledTimes(2);
    expect(await screen.findByText(t.geometry.shared)).toBeInTheDocument();
  });

  it('should not send anything to the community when the rider does not tick the box', async () => {
    mockRead.mockResolvedValue({ success: true, table });
    const { t, fake, onUse } = await mount(locale, { signedIn: true, admin: false });
    readTable(t);
    await screen.findByTestId('upload-review');
    fireEvent.click(screen.getByRole('button', { name: t.geometry.use }));
    expect(onUse).toHaveBeenCalledTimes(1);
    expect(fake.database.submissionsUpsert).not.toHaveBeenCalled();
  });

  it('should show the owner the same review as the catalog page: a name box, save as verified, or use without saving', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ json: async () => ({ success: true, table }) }) as unknown as Response));
    const { t, onUse } = await mount(locale, { signedIn: true, admin: true });
    await waitFor(() => expect(screen.getByLabelText(t.admin.upload.dropChoose, { selector: 'input' })).toHaveAttribute('accept', expect.stringContaining('application/pdf')));
    expect(screen.queryByLabelText(t.admin.upload.nameLabel)).not.toBeInTheDocument();
    readTable(t);
    await screen.findByTestId('upload-review');
    expect(mockRead).not.toHaveBeenCalled();
    expect(screen.getByLabelText(t.stockBike.picker.review.brand)).toHaveValue('Acme');
    expect(screen.getByText(t.admin.upload.columns.status)).toBeInTheDocument();
    expect(screen.queryByLabelText(t.admin.upload.seedDisk.label)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: t.geometry.useWithoutSaving }));
    expect(onUse).toHaveBeenCalledWith(expect.objectContaining({ brand: 'Acme' }));
  });

  it('should add the sizes to the catalog for the owner and then go on with them', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ json: async () => ({ success: true, table }) }) as unknown as Response));
    const { t, fake, onUse } = await mount(locale, { signedIn: true, admin: true });
    await waitFor(() => expect(screen.getByLabelText(t.admin.upload.dropChoose, { selector: 'input' })).toHaveAttribute('accept', expect.stringContaining('application/pdf')));
    readTable(t);
    await screen.findByTestId('upload-review');
    fireEvent.click(screen.getByRole('button', { name: t.admin.upload.save.replace('{count}', '2') }));
    await waitFor(() => expect(onUse).toHaveBeenCalledTimes(1));
    expect(fake.database.rpc).toHaveBeenCalledWith('admin_save_bike', expect.objectContaining({ p_brand: 'Acme', p_model: 'Flyer X', p_year: 2025 }));
    expect(fake.database.rpc.mock.calls.filter(([name]) => name === 'admin_save_bike')).toHaveLength(2);
  });
});
