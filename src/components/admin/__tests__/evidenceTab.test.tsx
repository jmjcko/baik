import { describe, it, expect } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { setup } from './adminFixtures';

const topic = (id: string, over: Record<string, unknown> = {}) => ({ topic_id: id, title: `Title ${id}`, proposed: false, kb_claims: 4, video_claims: 0, agreeing_channels: 0, conflicts: 0, to_review: 0, ready: false, ...over });
const source = { id: 'src1', youtube_id: 'dQw4w9WgXcQ', title: 'Saddle height', channel: 'Bike Lab', url: 'https://evil.example/x' };
const claim = (over: Record<string, unknown> = {}) => ({ id: 'c1', topic_id: 'baikfit-3', origin: 'video', claim: 'Heel method gives 109 percent', value: 109, unit: '%', source_id: 'src1', at_seconds: 228, relation: 'agrees', status: 'approved', ...over });

async function open(locale: Locale, tables: { topics?: unknown[]; claims?: unknown[]; sources?: unknown[] }) {
  const fake = await setup(locale);
  fake.database.tables.kb_topic_status = (tables.topics ?? []) as Array<Record<string, unknown>>;
  fake.database.tables.kb_claims = (tables.claims ?? []) as Array<Record<string, unknown>>;
  fake.database.tables.kb_sources = (tables.sources ?? []) as Array<Record<string, unknown>>;
  fireEvent.click(await screen.findByRole('tab', { name: translations[locale].admin.tabs.evidence }));
}

describe.each(['en', 'cs'] as Locale[])('evidence tab (%s)', (locale) => {
  const a = translations[locale].admin;

  it('should say so when the evidence base is empty or not set up', async () => {
    await open(locale, {});
    expect(await screen.findByTestId('evidence-empty')).toHaveTextContent(a.evidence.empty);
  });

  it('should list new topics first and mark ready, conflicting and empty topics', async () => {
    await open(locale, { topics: [topic('baikfit-1'), topic('baikfit-3', { video_claims: 3, agreeing_channels: 3, ready: true }), topic('baikfit-5', { video_claims: 2, conflicts: 1 }), topic('new-1', { proposed: true, kb_claims: 0 })], claims: [claim()], sources: [source] });
    const rows = await screen.findAllByTestId('evidence-topic');
    expect(rows[0]).toHaveTextContent(a.evidence.status.newTopic);
    expect(rows.map((r) => r.textContent).join('|')).toContain(a.evidence.status.ready);
    expect(rows.map((r) => r.textContent).join('|')).toContain(a.evidence.status.conflict);
    expect(rows[3]).toHaveTextContent(a.evidence.status.none);
  });

  it('should link a claim to the second of the video, rebuilt from the id and never from the stored address', async () => {
    await open(locale, { topics: [topic('baikfit-3', { video_claims: 1 })], claims: [claim()], sources: [source] });
    const row = (await screen.findAllByTestId('evidence-claim'))[0];
    const link = within(row).getByRole('link', { name: 'Bike Lab' });
    expect(link).toHaveAttribute('href', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=228s');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    expect(row).toHaveTextContent(a.evidence.watch.replace('{time}', '3:48'));
    expect(row).toHaveTextContent(a.evidence.relations.agrees);
  });

  it('should ignore a claim whose source is unknown or whose video id is malformed', async () => {
    await open(locale, { topics: [topic('baikfit-3')], claims: [claim({ id: 'x1', source_id: 'nope' }), claim({ id: 'x2', source_id: 'bad' })], sources: [{ ...source, id: 'bad', youtube_id: 'javascript:1' }] });
    await screen.findAllByTestId('evidence-topic');
    expect(screen.queryAllByTestId('evidence-claim')).toHaveLength(0);
  });

  it('should show no emoji', async () => {
    await open(locale, { topics: [topic('new-1', { proposed: true })] });
    expect((await screen.findByTestId('evidence-tab')).textContent).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});
