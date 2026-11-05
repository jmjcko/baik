import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { INBOX_LIMITS, inboxProblem, youtubeIdOf } from '@/lib/kb/inbox';

const state = vi.hoisted(() => ({ rows: [] as Array<Record<string, unknown>>, inserted: [] as Array<Record<string, unknown>>, fail: false }));
vi.mock('@/lib/catalog/hooks', () => ({
  useCatalogDb: () => () => ({
    from: () => ({
      select: async () => ({ data: state.rows, error: null }),
      insert: async (row: Record<string, unknown>) => {
        if (state.fail) return { error: { code: '42P01' } };
        state.inserted.push(row);
        state.rows.push({ id: `i${state.rows.length}`, created_at: '2026-11-05T10:00:00Z', ...row });
        return { error: null };
      },
      delete: () => ({ eq: async (_c: string, id: string) => { state.rows = state.rows.filter((r) => r.id !== id); return { error: null }; } }),
    }),
  }),
}));

const { EvidenceInbox } = await import('../EvidenceInbox');

describe('inbox rules', () => {
  const ok = { url: 'https://youtu.be/dQw4w9WgXcQ', title: 'T', channel: 'C', body: 'text' };
  it('should accept YouTube links only and limit the sizes and the queue', () => {
    expect(youtubeIdOf('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(youtubeIdOf('https://evil.example/watch?v=dQw4w9WgXcQ')).toBeNull();
    expect(inboxProblem(ok, 0)).toBeNull();
    expect(inboxProblem({ ...ok, url: 'x' }, 0)).toBe('link');
    expect(inboxProblem({ ...ok, title: '', channel: '' }, 0)).toBeNull();
    expect(inboxProblem({ ...ok, body: '' }, 0)).toBeNull();
    expect(inboxProblem({ ...ok, body: 'a'.repeat(INBOX_LIMITS.body + 1) }, 0)).toBe('body');
    expect(inboxProblem(ok, INBOX_LIMITS.waiting)).toBe('full');
  });
});

describe.each(['en', 'cs'] as Locale[])('evidence inbox (%s)', (locale) => {
  const t = translations[locale];
  const a = t.admin.evidence.inbox;
  const fillForm = (over: Partial<Record<'link' | 'body', string>> = {}) => {
    const v = { link: 'https://youtu.be/dQw4w9WgXcQ?t=5', body: '0:01 hello', ...over };
    fireEvent.change(screen.getByLabelText(a.linkLabel), { target: { value: v.link } });
    fireEvent.change(screen.getByLabelText(a.bodyLabel), { target: { value: v.body } });
  };

  beforeEach(() => { state.rows = []; state.inserted = []; state.fail = false; });

  it('should save the link by its id with the transcript, list it, and remove it again', async () => {
    render(<EvidenceInbox t={t} />);
    expect(await screen.findByText(a.waitingEmpty)).toBeInTheDocument();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: a.add }));
    expect(await screen.findByText(a.saved)).toBeInTheDocument();
    expect(state.inserted[0]).toMatchObject({ youtube_id: 'dQw4w9WgXcQ', title: null, channel: null, body: '0:01 hello' });
    expect(await screen.findByTestId('inbox-item')).toHaveTextContent('dQw4w9WgXcQ');
    expect(screen.getByLabelText(a.bodyLabel)).toHaveValue('');
    fireEvent.click(screen.getByRole('button', { name: a.remove.replace('{title}', 'dQw4w9WgXcQ') }));
    await waitFor(() => expect(screen.queryByTestId('inbox-item')).not.toBeInTheDocument());
  });

  it('should save a link alone, without a transcript', async () => {
    render(<EvidenceInbox t={t} />);
    await screen.findByText(a.waitingEmpty);
    fillForm({ body: '' });
    fireEvent.click(screen.getByRole('button', { name: a.add }));
    expect(await screen.findByText(a.saved)).toBeInTheDocument();
    expect(state.inserted[0]).toMatchObject({ youtube_id: 'dQw4w9WgXcQ', body: null });
  });

  it('should say what is wrong and write nothing', async () => {
    render(<EvidenceInbox t={t} />);
    await screen.findByText(a.waitingEmpty);
    fillForm({ link: 'https://example.com/x' });
    fireEvent.click(screen.getByRole('button', { name: a.add }));
    expect(await screen.findByRole('alert')).toHaveTextContent(a.problems.link);
    expect(state.inserted).toHaveLength(0);
  });

  it('should say so when the table is missing', async () => {
    state.fail = true;
    render(<EvidenceInbox t={t} />);
    await screen.findByText(a.waitingEmpty);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: a.add }));
    expect(await screen.findByRole('alert')).toHaveTextContent(a.failed);
  });
});
