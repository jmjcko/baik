import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { catalogRow, setup, spec } from './adminFixtures';

describe.each(['en', 'cs'] as Locale[])('seed catalog tools of the admin (%s)', (locale) => {
  const a = translations[locale].admin;

  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  describe('the catalog tab', () => {
    it('should list the missing key models without a year, show the known years, and open the reading with the name filled in', async () => {
      const fetchMock = vi.fn().mockResolvedValue({ json: async () => ({ success: false, error: 'unreadable' }) });
      vi.stubGlobal('fetch', fetchMock);
      await setup(locale, { catalog: [catalogRow({ brand: 'Cube', model: 'Attain', year: 2025 })] });
      fireEvent.click(await screen.findByRole('tab', { name: new RegExp(a.tabs.catalog) }));
      const cards = screen.getAllByTestId('missing-bike');
      expect(cards).toHaveLength(10);
      expect(cards.every((card) => within(card).getAllByRole('button').length === 1)).toBe(true);
      expect(cards.find((card) => card.textContent?.includes('Cube Attain'))).toHaveTextContent(a.missing.inCatalog.replace('{years}', '2025'));
      expect(cards.find((card) => card.textContent?.includes('Specialized Tarmac SL8'))).toHaveTextContent(a.missing.inSeed.replace('{years}', '2026, 2024'));
      const orca = cards.find((card) => card.textContent?.includes('Orbea Orca'))!;
      expect(orca).not.toHaveTextContent(/20\d\d/);
      expect(within(orca).getByRole('link')).toHaveAttribute('href', 'https://www.orbea.com');
      const file = new File(['png'], 'geometry.png', { type: 'image/png' });
      fireEvent.change(within(orca).getByLabelText(a.missing.upload.replace('{bike}', 'Orbea Orca')), { target: { files: [file] } });
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
      expect((fetchMock.mock.calls[0][1].body as FormData).get('name')).toBe('Orbea Orca');
      expect(screen.getByRole('tab', { name: a.tabs.upload })).toHaveAttribute('aria-selected', 'true');
      expect(await screen.findByDisplayValue('Orbea Orca')).toBeInTheDocument();
    });

    it('should list the most wanted bikes, leave out the ones already listed, open the upload with the name, and let the owner clear one', async () => {
      const fetchMock = vi.fn().mockResolvedValue({ json: async () => ({ success: false, error: 'unreadable' }) });
      vi.stubGlobal('fetch', fetchMock);
      const miss = (key: string, brand: string, model: string, year: number, times: number) => ({ key, brand, model, year, times });
      const fake = await setup(locale, {
        catalog: [catalogRow({ brand: 'Ridley', model: 'Fenix', year: 2025 })],
        misses: [miss('a', 'Cervelo', 'Caledonia', 2025, 3), miss('b', 'BMC', 'Roadmachine', 2025, 9), miss('c', 'Ridley', 'Fenix', 2025, 12), miss('d', 'Specialized', 'Tarmac SL8', 2024, 7)],
      });
      fireEvent.click(await screen.findByRole('tab', { name: new RegExp(a.tabs.catalog) }));
      const cards = screen.getAllByTestId('wanted-bike');
      expect(cards.map((card) => card.querySelector('h4')?.textContent)).toEqual(['BMC Roadmachine 2025', 'Cervelo Caledonia 2025']);
      expect(cards[0]).toHaveTextContent(a.wanted.times.replace('{n}', '9'));
      fireEvent.click(within(cards[1]).getByRole('button', { name: a.wanted.clear }));
      await waitFor(() => expect(fake.database.rpc).toHaveBeenCalledWith('admin_clear_bike_miss', { p_key: 'a' }));
      fireEvent.change(within(cards[0]).getByLabelText(a.missing.upload.replace('{bike}', 'BMC Roadmachine 2025')), { target: { files: [new File(['x'], 'g.png', { type: 'image/png' })] } });
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
      expect(await screen.findByDisplayValue('BMC Roadmachine 2025')).toBeInTheDocument();
    });

    it('should say that nothing is wanted when every miss is already listed, and mark an automatically approved bike', async () => {
      await setup(locale, {
        catalog: [catalogRow({ brand: 'Ridley', model: 'Fenix', year: 2025, auto_approved: true, origin: 'community', confirmations: 2 })],
        misses: [{ key: 'c', brand: 'Ridley', model: 'Fenix', year: 2025, times: 12 }],
      });
      fireEvent.click(await screen.findByRole('tab', { name: new RegExp(a.tabs.catalog) }));
      expect(screen.queryByTestId('wanted-bike')).not.toBeInTheDocument();
      expect(screen.getByText(a.wanted.empty)).toBeInTheDocument();
      expect(screen.getByTestId('catalog-row')).toHaveTextContent(a.catalog.autoBadge);
    });

    it('should export an owner bike to the seed file with an address that is optional, refuse one that is not https, and not offer it for community bikes', async () => {
      const download = vi.fn();
      vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:seed'), revokeObjectURL: vi.fn() }));
      vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(download);
      await setup(locale, { catalog: [catalogRow({ brand: 'Ridley', model: 'Fenix' }), catalogRow({ id: 'c2', brand: 'Foo', origin: 'community', key: 'k2' })] });
      fireEvent.click(await screen.findByRole('tab', { name: new RegExp(a.tabs.catalog) }));
      const card = screen.getByTestId('seed-export-row');
      expect(screen.getAllByTestId('seed-export-row')).toHaveLength(1);
      fireEvent.change(within(card).getByPlaceholderText(a.catalog.export.sourcePlaceholder), { target: { value: 'ftp://ridley.example/fenix' } });
      fireEvent.click(within(card).getByRole('button'));
      expect(within(card).getByRole('status')).toHaveTextContent(a.catalog.export.invalid.split('{')[0]);
      expect(download).not.toHaveBeenCalled();
      fireEvent.change(within(card).getByPlaceholderText(a.catalog.export.sourcePlaceholder), { target: { value: '' } });
      fireEvent.click(within(card).getByRole('button'));
      expect(within(card).getByRole('status')).toHaveTextContent(a.catalog.export.done);
      expect(download).toHaveBeenCalledTimes(1);
    });
  });

  describe('writing to seedBikes.json from the upload', () => {
    const openUpload = async () => {
      await screen.findByTestId('queue-empty');
      fireEvent.click(screen.getByRole('tab', { name: a.tabs.upload }));
    };
    const png = () => new File(['x'], 'geometry.png', { type: 'image/png' });
    const choose = (name: string) => {
      fireEvent.change(screen.getByLabelText(a.upload.dropChoose, { selector: 'input' }), { target: { files: [png()] } });
      fireEvent.change(screen.getByLabelText(a.upload.nameLabel), { target: { value: name } });
    };
    const sizeOf = (label: string, stack: number) => ({ size: label, spec: { ...spec, frameStackMm: stack, frameReachMm: 365, seatTubeAngleDeg: 74.6, stockStemMm: 80, stockHandlebarMm: 380, stockCrankMm: 165 } });
    const table = { success: true, table: { sizes: [sizeOf('47', 525), sizeOf('50', 538), sizeOf('53', 561)], skipped: 0 } };
    const read = async () => {
      fireEvent.click(screen.getByRole('button', { name: a.upload.read }));
      return screen.findByTestId('upload-review');
    };
    const seedApi = () => {
      const calls: Array<{ entry: { id: string; source: { url: string } } }> = [];
      vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
        if (url === '/api/admin/seed-bikes') { calls.push(JSON.parse(String(init?.body))); return { ok: true, json: async () => ({ success: true }) } as unknown as Response; }
        return { json: async () => table } as unknown as Response;
      }));
      return calls;
    };
    const save = (review: HTMLElement) => fireEvent.click(within(review).getByRole('button', { name: a.upload.save.replace('{count}', '3') }));

    it('should write the saved sizes to the seed file when asked, take an address only when the owner types one, and refuse one that is not https', async () => {
      const calls = seedApi();
      await setup(locale);
      await openUpload();
      choose('Ridley Fenix 2027');
      const review = await read();
      fireEvent.click(within(review).getByLabelText(a.upload.seedDisk.label));
      fireEvent.change(within(review).getByPlaceholderText(a.catalog.export.sourcePlaceholder), { target: { value: 'http://ridley.example/fenix' } });
      save(review);
      expect(await within(review).findByRole('alert')).toHaveTextContent(a.upload.seedDisk.invalid);
      expect(calls).toHaveLength(0);
      fireEvent.change(within(review).getByPlaceholderText(a.catalog.export.sourcePlaceholder), { target: { value: 'https://www.ridley-bikes.com/fenix' } });
      save(review);
      await waitFor(() => expect(screen.getAllByRole('status').map((node) => node.textContent)).toContain(a.upload.seedDisk.saved));
      expect(calls).toHaveLength(1);
      expect(calls[0].entry).toMatchObject({ id: 'ridley-fenix-2027', source: { url: 'https://www.ridley-bikes.com/fenix' } });
    });

    it('should save to the seed file without any address: a search for the table is the source', async () => {
      const calls = seedApi();
      await setup(locale);
      await openUpload();
      choose('Ridley Fenix 2027');
      const review = await read();
      fireEvent.click(within(review).getByLabelText(a.upload.seedDisk.label));
      save(review);
      await waitFor(() => expect(calls).toHaveLength(1));
      expect(calls[0].entry.source.url).toBe('https://www.google.com/search?q=Ridley%20Fenix%202027%20geometry');
    });

    it('should not ask for an address when the brand has an official site, and use that site as the source', async () => {
      const calls = seedApi();
      await setup(locale);
      await openUpload();
      choose('Trek Domane SL 2026');
      const review = await read();
      fireEvent.click(within(review).getByLabelText(a.upload.seedDisk.label));
      expect(within(review).queryByPlaceholderText(a.catalog.export.sourcePlaceholder)).not.toBeInTheDocument();
      save(review);
      await waitFor(() => expect(calls).toHaveLength(1));
      expect(calls[0].entry.source.url).toBe('https://www.trekbikes.com');
    });
  });
});
