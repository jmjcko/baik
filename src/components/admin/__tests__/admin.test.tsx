import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { STOCK_BIKE_SPECS } from '@/lib/bikes';
import { catalogRow, setup, spec, submission } from './adminFixtures';

describe.each(['en', 'cs'] as Locale[])('catalog admin (%s)', (locale) => {
  const a = translations[locale].admin;
  const review = translations[locale].stockBike.picker.review;
  const box = (card: HTMLElement, label: string) => within(card).getByLabelText(new RegExp(`^${label}`));

  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  describe('access', () => {
    it('should refuse a guest and a signed in user who is not an admin, and show nothing of the catalog', async () => {
      await setup(locale, { signedIn: false });
      expect(screen.getByRole('alert')).toHaveTextContent(a.denied);
      expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    });

    it('should refuse a signed in user who is not in the admin table', async () => {
      await setup(locale, { admin: false, pending: [submission('s1', 'u2')] });
      expect(await screen.findByRole('alert')).toHaveTextContent(a.denied);
      expect(screen.queryByTestId('submission')).not.toBeInTheDocument();
    });

    it('should show the three tabs with the counts to an admin', async () => {
      await setup(locale, { pending: [submission('s1', 'u2')], catalog: [catalogRow()] });
      expect(await screen.findByRole('tab', { name: `${a.tabs.queue} (1)` })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tab', { name: a.tabs.upload })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: `${a.tabs.catalog} (1)` })).toBeInTheDocument();
    });

    it('should say when the data cannot be loaded, and load again on request', async () => {
      const fake = await setup(locale, { broken: true, pending: [submission('s1', 'u2')] });
      expect(await screen.findByText(a.loadError)).toBeInTheDocument();
      fake.database.tableError.current = null;
      fireEvent.click(screen.getByRole('button', { name: a.reload }));
      expect(await screen.findByTestId('submission')).toBeInTheDocument();
    });
  });

  describe('queue', () => {
    it('should say when nothing waits', async () => {
      await setup(locale);
      expect(await screen.findByTestId('queue-empty')).toHaveTextContent(a.queue.empty);
    });

    it('should group the submissions of a bike size and show how many riders agree', async () => {
      await setup(locale, { pending: [submission('s1', 'u2'), submission('s2', 'u3'), submission('s3', 'u4', { size: '56', key: 'cube|attaingtc|2024|56' })] });
      const groups = await screen.findAllByTestId('group');
      expect(groups).toHaveLength(2);
      expect(within(groups[0]).getByRole('heading', { level: 3 })).toHaveTextContent('Cube Attain GTC 2024, 54');
      expect(groups[0]).toHaveTextContent(a.queue.group.replace('{count}', '2').replace('{riders}', '2'));
      expect(groups[0]).toHaveTextContent(a.queue.agreeing.replace('{n}', '2'));
      expect(within(groups[0]).getAllByTestId('submission')).toHaveLength(2);
    });

    it('should approve a submission with the numbers as the owner corrected them, and the note', async () => {
      const fake = await setup(locale, { pending: [submission('s1', 'u2')] });
      const card = await screen.findByTestId('submission');
      fireEvent.change(box(card, review.model), { target: { value: 'Attain GTC SLX' } });
      fireEvent.change(box(card, review.stack), { target: { value: '576' } });
      fireEvent.change(within(card).getByLabelText(a.queue.noteLabel), { target: { value: 'cube.eu table' } });
      fireEvent.click(within(card).getByRole('button', { name: a.queue.approve }));
      await waitFor(() => expect(fake.database.rpc).toHaveBeenCalledWith('approve_submission', expect.objectContaining({ p_submission: 's1', p_brand: 'Cube', p_model: 'Attain GTC SLX', p_year: 2024, p_size: '54', p_spec: { ...spec, frameStackMm: 576 }, p_note: 'cube.eu table' })));
    });

    it('should not approve while a box is empty or out of range', async () => {
      const fake = await setup(locale, { pending: [submission('s1', 'u2')] });
      const card = await screen.findByTestId('submission');
      fireEvent.change(box(card, review.brand), { target: { value: '' } });
      fireEvent.click(within(card).getByRole('button', { name: a.queue.approve }));
      expect(within(card).getByRole('alert')).toHaveTextContent(review.invalid);
      expect(fake.database.rpc).not.toHaveBeenCalledWith('approve_submission', expect.anything());
    });

    it('should reject a submission with the reason, and say so when the change cannot be saved', async () => {
      const fake = await setup(locale, { pending: [submission('s1', 'u2')] });
      fake.database.rpcResults.reject_submission = { error: { code: '500' } };
      const card = await screen.findByTestId('submission');
      fireEvent.change(within(card).getByLabelText(a.queue.noteLabel), { target: { value: 'not a road bike' } });
      fireEvent.click(within(card).getByRole('button', { name: a.queue.reject }));
      expect(await within(card).findByText(a.queue.failed)).toBeInTheDocument();
      expect(fake.database.rpc).toHaveBeenCalledWith('reject_submission', { p_submission: 's1', p_note: 'not a road bike' });
    });

    it('should show what is already known: the same bike, a similar name and the same numbers, with the merge into a catalog entry', async () => {
      const same = catalogRow({ id: 'same', brand: 'Cube', model: 'Attain GTC', year: 2024, size: '54', key: 'cube|attaingtc|2024|54', spec: { ...spec, frameStackMm: 580 } });
      const similar = catalogRow({ id: 'sim', brand: 'Cube', model: 'Attain GTC SLX', year: 2024, size: '54', key: 'x', spec: { ...spec, frameStackMm: 581 } });
      const fake = await setup(locale, { pending: [submission('s1', 'u2')], catalog: [same, similar] });
      const card = await screen.findByTestId('submission');
      const items = within(card).getAllByTestId('duplicate');
      expect(items[0]).toHaveTextContent(a.duplicate.sameKey);
      expect(items[1]).toHaveTextContent(a.duplicate.similarName);
      fireEvent.click(within(items[0]).getByRole('button', { name: a.queue.merge }));
      await waitFor(() => expect(fake.database.rpc).toHaveBeenCalledWith('merge_submission', { p_submission: 's1', p_catalog: 'same' }));
    });

    it('should show a duplicate of the verified table without a merge button, and say when nothing is known', async () => {
      await setup(locale, { pending: [submission('s1', 'u2', { brand: 'Canyon', model: 'Endurace CF 8', size: 'M', key: 'canyon|endurancecf8|2024|m' })] });
      const card = await screen.findByTestId('submission');
      expect(within(card).getByTestId('duplicate')).toHaveTextContent(a.duplicate.inSeed);
      expect(within(card).queryByRole('button', { name: a.queue.merge })).not.toBeInTheDocument();
    });

    it('should say that no similar bike is known', async () => {
      await setup(locale, { pending: [submission('s1', 'u2', { brand: 'Zed', model: 'Unique', spec: { ...spec, frameStackMm: 650, frameReachMm: 400 }, key: 'zed|unique|2024|54' })] });
      expect(await screen.findByText(a.queue.noDuplicates)).toBeInTheDocument();
    });

    it('should show an anonymous submission (the account was deleted)', async () => {
      await setup(locale, { pending: [submission('s1', null)] });
      expect(await screen.findByTestId('submission')).toHaveTextContent(a.queue.anonymous);
    });
  });

  describe('the owner\'s upload', () => {
    const openUpload = async () => {
      await screen.findByTestId('queue-empty');
      fireEvent.click(screen.getByRole('tab', { name: a.tabs.upload }));
    };
    const png = (name = 'geometry.png') => new File(['x'], name, { type: 'image/png' });
    const choose = (files: File[], name = 'Cube Attain 2027') => {
      fireEvent.change(screen.getByLabelText(a.upload.dropChoose, { selector: 'input' }), { target: { files } });
      fireEvent.change(screen.getByLabelText(a.upload.nameLabel), { target: { value: name } });
    };
    const answer = (body: unknown) => vi.fn(async () => ({ json: async () => body }) as unknown as Response);
    const sizeOf = (label: string, over: Record<string, unknown> = {}) => ({ size: label, spec: { ...spec, frameStackMm: 525, frameReachMm: 365, seatTubeAngleDeg: 74.6, stockStemMm: 80, stockHandlebarMm: 380, stockCrankMm: 165, ...over } });
    const table = (sizes = [sizeOf('47'), sizeOf('50', { frameStackMm: 538 }), sizeOf('53', { frameStackMm: 561, stockCrankMm: null })], skipped = 0) => ({ success: true, table: { sizes, skipped } });
    const read = async () => {
      fireEvent.click(screen.getByRole('button', { name: a.upload.read }));
      return screen.findByTestId('upload-review');
    };
    const cell = (column: string, size: string) => screen.getByLabelText(`${column} ${size}`);

    it('should show the drop zone with the way to add the files and the name field, and refuse to read without them', async () => {
      const fetchMock = answer({});
      vi.stubGlobal('fetch', fetchMock);
      await setup(locale);
      await openUpload();
      expect(screen.getByTestId('table-drop-zone')).toHaveTextContent(a.upload.dropTitle);
      expect(screen.getByTestId('table-drop-zone')).toHaveTextContent(a.upload.dropOr);
      fireEvent.click(screen.getByRole('button', { name: a.upload.read }));
      expect(screen.getByRole('alert')).toHaveTextContent(a.upload.errors.invalid_input);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should list the chosen files, take dropped and pasted ones, keep at most four and let the owner remove one', async () => {
      await setup(locale);
      await openUpload();
      choose([png('a.png'), png('b.png')]);
      const zone = screen.getByTestId('table-drop-zone');
      fireEvent.drop(zone, { dataTransfer: { files: [png('c.png')] } });
      expect(within(screen.getByTestId('table-files')).getAllByRole('listitem')).toHaveLength(3);
      const pasted = new Event('paste') as Event & { clipboardData: unknown };
      pasted.clipboardData = { items: [{ kind: 'file', type: 'image/png', getAsFile: () => png('shot.png') }] };
      act(() => { document.dispatchEvent(pasted); });
      expect(within(screen.getByTestId('table-files')).getAllByRole('listitem')).toHaveLength(4);
      fireEvent.drop(zone, { dataTransfer: { files: [png('e.png')] } });
      expect(within(screen.getByTestId('table-files')).getAllByRole('listitem')).toHaveLength(4);
      fireEvent.click(screen.getByRole('button', { name: a.upload.removeFile.replace('{name}', 'a.png') }));
      expect(screen.queryByText('a.png')).not.toBeInTheDocument();
      fireEvent.dragOver(zone);
      expect(zone).toHaveAttribute('data-dragging', 'true');
      fireEvent.dragLeave(zone);
      expect(zone).not.toHaveAttribute('data-dragging');
    });

    it('should send every file and the name in one request and show all sizes in one table with the name split', async () => {
      const fetchMock = answer(table());
      vi.stubGlobal('fetch', fetchMock);
      await setup(locale);
      await openUpload();
      choose([png('geometry.png'), new File(['x'], 'ergonomics.pdf', { type: 'application/pdf' })]);
      const review = await read();
      const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
      expect(url).toBe('/api/admin/extract');
      const form = init.body as FormData;
      expect([form.get('name'), form.getAll('files').map((item) => (item as File).name)]).toEqual(['Cube Attain 2027', ['geometry.png', 'ergonomics.pdf']]);
      expect(within(review).getAllByTestId('size-row')).toHaveLength(3);
      expect(within(review).getByLabelText(translations[locale].stockBike.picker.review.brand)).toHaveValue('Cube');
      expect(within(review).getByLabelText(translations[locale].stockBike.picker.review.model)).toHaveValue('Attain');
      expect(within(review).getByLabelText(translations[locale].stockBike.picker.review.year)).toHaveValue('2027');
      expect(cell(a.upload.columns.stack, '50')).toHaveValue('538');
      expect(cell(a.upload.columns.crank, '53')).toHaveValue('');
      expect(cell(a.upload.columns.crank, '53')).toHaveAttribute('placeholder', a.upload.notStated);
      expect(within(review).getAllByText(a.upload.statusNew)).toHaveLength(3);
    });

    it('should save every ticked size as verified by the owner with the corrected numbers and the source, and say so', async () => {
      vi.stubGlobal('fetch', answer(table()));
      const fake = await setup(locale);
      await openUpload();
      choose([png()]);
      const review = await read();
      fireEvent.change(cell(a.upload.columns.crank, '53'), { target: { value: '170' } });
      fireEvent.click(within(review).getByLabelText(a.upload.include.replace('{size}', '50')));
      fireEvent.click(within(review).getByRole('button', { name: a.upload.save.replace('{count}', '2') }));
      expect(await screen.findByRole('status')).toHaveTextContent(a.upload.saved.replace('{count}', '2'));
      const saved = fake.database.rpc.mock.calls.filter(([name]) => name === 'admin_save_bike').map(([, args]) => args);
      expect(saved).toHaveLength(2);
      expect(saved[0]).toMatchObject({ p_brand: 'Cube', p_model: 'Attain', p_year: 2027, p_size: '47', p_note: null, p_spec: { frameStackMm: 525, stockCrankMm: 165, topTubeMm: spec.topTubeMm } });
      expect(saved[1]).toMatchObject({ p_size: '53', p_spec: { frameStackMm: 561, stockCrankMm: 170 } });
      expect(screen.queryByTestId('upload-review')).not.toBeInTheDocument();
      expect(screen.getByLabelText(a.upload.nameLabel)).toHaveValue('');
    });

    it('should let the owner correct the name and mark a number that cannot be used instead of saving', async () => {
      vi.stubGlobal('fetch', answer(table()));
      const fake = await setup(locale);
      await openUpload();
      choose([png()], 'Cube Attain');
      const review = await read();
      expect(within(review).getByLabelText(translations[locale].stockBike.picker.review.year)).toBeInvalid();
      fireEvent.change(cell(a.upload.columns.reach, '47'), { target: { value: '5' } });
      fireEvent.click(within(review).getByRole('button', { name: a.upload.save.replace('{count}', '3') }));
      expect(await within(review).findByRole('alert')).toHaveTextContent(a.upload.invalid);
      expect(cell(a.upload.columns.reach, '47')).toBeInvalid();
      expect(fake.database.rpc).not.toHaveBeenCalledWith('admin_save_bike', expect.anything());
      fireEvent.change(within(review).getByLabelText(translations[locale].stockBike.picker.review.year), { target: { value: '2027' } });
      fireEvent.change(cell(a.upload.columns.reach, '47'), { target: { value: '365' } });
      expect(within(review).queryByRole('alert')).not.toBeInTheDocument();
      fireEvent.click(within(review).getByRole('button', { name: a.upload.save.replace('{count}', '3') }));
      expect(await screen.findByRole('status')).toBeInTheDocument();
    });

    it('should not save when no size is ticked', async () => {
      vi.stubGlobal('fetch', answer(table([sizeOf('47')])));
      await setup(locale);
      await openUpload();
      choose([png()]);
      const review = await read();
      fireEvent.click(within(review).getByLabelText(a.upload.include.replace('{size}', '47')));
      expect(within(review).getByRole('button', { name: a.upload.save.replace('{count}', '0') })).toBeDisabled();
    });

    it('should say which sizes replace a catalog entry or are already in the verified table, and how many were left out', async () => {
      const seed = STOCK_BIKE_SPECS[0];
      const [first, second] = Object.keys(seed.sizes);
      vi.stubGlobal('fetch', answer(table([sizeOf('47'), sizeOf('50'), sizeOf(first), sizeOf(second)], 2)));
      await setup(locale, { catalog: [catalogRow({ brand: 'Cube', model: 'Attain', year: 2027, size: '47', key: 'cube|attain|2027|47' }), catalogRow({ id: 'c2', brand: seed.brand, model: seed.model, year: seed.years[0], size: second, key: `${seed.brand}|${seed.model}|${seed.years[0]}|${second}` })] });
      fireEvent.click(await screen.findByRole('tab', { name: a.tabs.upload }));
      choose([png()], `${seed.brand} ${seed.model} ${seed.years[0]}`);
      const review = await read();
      expect(review).toHaveTextContent(a.upload.skipped.replace('{count}', '2'));
      expect(within(review).getAllByText(a.upload.statusSeed).length).toBeGreaterThan(0);
    });

    it('should mark a size that replaces an entry of the catalog', async () => {
      vi.stubGlobal('fetch', answer(table([sizeOf('47'), sizeOf('50')])));
      await setup(locale, { catalog: [catalogRow({ brand: 'Cube', model: 'Attain', year: 2027, size: '47', key: 'cube|attain|2027|47' })] });
      fireEvent.click(await screen.findByRole('tab', { name: a.tabs.upload }));
      choose([png()]);
      const review = await read();
      expect(within(review).getAllByText(a.upload.statusReplaces)).toHaveLength(1);
      expect(within(review).getAllByText(a.upload.statusNew)).toHaveLength(1);
    });

    it('should say how many sizes were saved when some failed', async () => {
      vi.stubGlobal('fetch', answer(table()));
      const fake = await setup(locale);
      await openUpload();
      choose([png()]);
      const review = await read();
      fake.database.rpc.mockImplementation(async (name: string, args?: Record<string, unknown>) => (name === 'admin_save_bike' && args?.p_size === '50' ? { data: null, error: { code: '500' } } : { data: null, error: null }));
      fireEvent.click(within(review).getByRole('button', { name: a.upload.save.replace('{count}', '3') }));
      expect(await screen.findByRole('alert')).toHaveTextContent(a.upload.partlySaved.replace('{saved}', '2').replace('{count}', '3'));
      expect(screen.getByLabelText(a.upload.nameLabel)).toHaveValue('Cube Attain 2027');
    });

    it.each(['forbidden', 'invalid_input', 'not_configured', 'rate_limited', 'unavailable', 'unreadable'] as const)('should show the fixed text for the answer %s', async (error) => {
      vi.stubGlobal('fetch', answer({ success: false, error }));
      await setup(locale);
      await openUpload();
      choose([png()]);
      fireEvent.click(screen.getByRole('button', { name: a.upload.read }));
      expect(await screen.findByRole('alert')).toHaveTextContent(a.upload.errors[error]);
    });

    it('should say unavailable for an answer that is not understood or a request that fails', async () => {
      vi.stubGlobal('fetch', answer({ success: false, error: 'something else' }));
      await setup(locale);
      await openUpload();
      choose([png()]);
      fireEvent.click(screen.getByRole('button', { name: a.upload.read }));
      expect(await screen.findByRole('alert')).toHaveTextContent(a.upload.errors.unavailable);
      vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
      fireEvent.click(screen.getByRole('button', { name: a.upload.read }));
      await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(a.upload.errors.unavailable));
    });

    it('should refuse files that are too big together before anything is sent', async () => {
      const fetchMock = answer({});
      vi.stubGlobal('fetch', fetchMock);
      await setup(locale);
      await openUpload();
      const big = new File(['x'], 'big.pdf', { type: 'application/pdf' });
      Object.defineProperty(big, 'size', { value: 11 * 1024 * 1024 });
      choose([big]);
      fireEvent.click(screen.getByRole('button', { name: a.upload.read }));
      expect(screen.getByRole('alert')).toHaveTextContent(a.upload.errors.invalid_input);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should go back to the files when the owner discards the table', async () => {
      vi.stubGlobal('fetch', answer(table()));
      const fake = await setup(locale);
      await openUpload();
      choose([png()]);
      await read();
      fireEvent.click(await screen.findByRole('button', { name: a.upload.discard }));
      expect(screen.queryByTestId('upload-review')).not.toBeInTheDocument();
      expect(screen.getByTestId('table-files')).toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(fake.database.rpc).not.toHaveBeenCalledWith('admin_save_bike', expect.anything());
    });
  });

  describe('catalog', () => {
    it('should list the bikes of the seed and the catalog in one table, one row per bike with its sizes and its origin', async () => {
      await setup(locale, { catalog: [catalogRow(), catalogRow({ id: 'c2', size: '58', key: 'k58', spec: { ...spec, frameStackMm: 611 } }), catalogRow({ id: 'c3', brand: 'Cube', model: 'Attain', origin: 'community', confirmations: 3, note: null, size: '54', key: 'k3' })] });
      fireEvent.click(await screen.findByRole('tab', { name: new RegExp(a.tabs.catalog) }));
      const rows = screen.getAllByTestId('catalog-row');
      const trek = rows.find((row) => row.textContent?.includes('Domane') && row.textContent.includes(a.catalog.ownerBadge))!;
      expect(trek).toHaveTextContent('56 – 58 (2)');
      expect(rows.find((row) => row.textContent?.includes('Attain'))).toHaveTextContent(a.catalog.communityBadge.replace('{n}', '3'));
      expect(rows.some((row) => row.textContent?.includes(a.catalog.listing.sourceSeed))).toBe(true);
      expect(screen.getByRole('status')).toHaveTextContent(a.catalog.listing.count.replace('{n}', String(rows.length)));
    });

    it('should search by words, sort by a column and say when nothing matches', async () => {
      await setup(locale, { catalog: [catalogRow()] });
      fireEvent.click(await screen.findByRole('tab', { name: new RegExp(a.tabs.catalog) }));
      const names = () => screen.getAllByTestId('catalog-row').map((row) => row.querySelector('td')?.textContent);
      expect(names()).toEqual([...names()].sort((x, y) => (x ?? '').localeCompare(y ?? '')));
      fireEvent.click(screen.getByRole('button', { name: a.catalog.columns.brand }));
      expect(screen.getByRole('columnheader', { name: new RegExp(a.catalog.columns.brand) })).toHaveAttribute('aria-sort', 'descending');
      expect(names()[0]).toBe('Trek');
      fireEvent.change(screen.getByLabelText(a.catalog.listing.searchLabel), { target: { value: 'trek dom' } });
      expect(screen.getAllByTestId('catalog-row')).toHaveLength(2);
      fireEvent.change(screen.getByLabelText(a.catalog.listing.searchLabel), { target: { value: 'nothing like it' } });
      expect(screen.queryByTestId('catalog-row')).not.toBeInTheDocument();
      expect(screen.getByText(a.catalog.listing.noMatch)).toBeInTheDocument();
    });

    it('should open a row to show every size with its numbers and the note, and close it again', async () => {
      await setup(locale, { catalog: [catalogRow()] });
      fireEvent.click(await screen.findByRole('tab', { name: new RegExp(a.tabs.catalog) }));
      const row = screen.getAllByTestId('catalog-row').find((one) => one.textContent?.includes('Domane') && one.textContent.includes(a.catalog.ownerBadge))!;
      fireEvent.click(within(row).getByRole('button', { name: a.catalog.listing.detail }));
      expect(screen.getByText('trekbikes.com')).toBeInTheDocument();
      expect(screen.getByRole('rowheader', { name: '56' })).toBeInTheDocument();
      fireEvent.click(within(row).getByRole('button', { name: a.catalog.listing.hideDetail }));
      expect(screen.queryByText('trekbikes.com')).not.toBeInTheDocument();
    });

    it('should delete a bike with all its sizes only after a second click, keep it when cancelled, and not offer it for a seed bike', async () => {
      const fake = await setup(locale, { catalog: [catalogRow(), catalogRow({ id: 'c2', size: '58', key: 'k58', spec: { ...spec, frameStackMm: 611 } })] });
      fireEvent.click(await screen.findByRole('tab', { name: new RegExp(a.tabs.catalog) }));
      const rows = screen.getAllByTestId('catalog-row');
      expect(rows.filter((row) => within(row).queryByRole('button', { name: a.catalog.delete }))).toHaveLength(1);
      fireEvent.click(screen.getByRole('button', { name: a.catalog.delete }));
      expect(fake.database.rpc).not.toHaveBeenCalledWith('admin_delete_catalog_bike', expect.anything());
      fireEvent.click(screen.getByRole('button', { name: a.catalog.cancel }));
      expect(screen.getByRole('button', { name: a.catalog.delete })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: a.catalog.delete }));
      fireEvent.click(screen.getByRole('button', { name: a.catalog.confirmDelete }));
      await waitFor(() => expect(fake.database.rpc).toHaveBeenCalledWith('admin_delete_catalog_bike', { p_catalog: 'c1' }));
      await waitFor(() => expect(fake.database.rpc).toHaveBeenCalledWith('admin_delete_catalog_bike', { p_catalog: 'c2' }));
    });
  });
});
