/** The inbox of the evidence base (Epic 50): the owner leaves a link and a transcript, the assistant processes it in the chat and deletes it. */

export interface InboxItem {
  id: string;
  youtubeId: string;
  title: string | null;
  channel: string | null;
  createdAt: string;
}

export interface InboxInput {
  url: string;
  title: string;
  channel: string;
  body: string;
}

export const INBOX_LIMITS = { title: 300, channel: 200, body: 300000, waiting: 20 };

type Answer<T = unknown> = PromiseLike<{ data: T; error: { code?: string } | null }>;

/** The part of the Supabase client that the inbox uses. */
export interface InboxDatabase {
  from: (table: 'kb_inbox') => {
    select: (columns: string) => Answer;
    insert: (row: Record<string, unknown>) => PromiseLike<{ error: { code?: string } | null }>;
    delete: () => { eq: (column: 'id', value: string) => PromiseLike<{ error: { code?: string } | null }> };
  };
}

export type InboxProblem = 'link' | 'body' | 'full';

/** The 11 character id of a YouTube link (watch, short link, shorts or embed); null for anything else. */
export function youtubeIdOf(url: string): string | null {
  const match = /^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[&?#/].*)?$/.exec(url.trim());
  return match ? match[1] : null;
}

/** Optional: empty is fine, too long is not. */
const within = (value: string, max: number): boolean => value.trim().length <= max;
const orNull = (value: string): string | null => value.trim() || null;

/** What is wrong with the input, or null when it can be saved. */
export function inboxProblem(input: InboxInput, waiting: number): InboxProblem | null {
  if (!youtubeIdOf(input.url)) return 'link';
  if (!within(input.title, INBOX_LIMITS.title) || !within(input.channel, INBOX_LIMITS.channel)) return 'link';
  if (!within(input.body, INBOX_LIMITS.body)) return 'body';
  return waiting >= INBOX_LIMITS.waiting ? 'full' : null;
}

export function parseInboxItem(raw: unknown): InboxItem | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const { id, youtube_id: youtubeId, title, channel, created_at: createdAt } = raw as Record<string, unknown>;
  if (typeof id !== 'string' || typeof youtubeId !== 'string' || typeof createdAt !== 'string') return null;
  return { id, youtubeId, title: typeof title === 'string' ? title : null, channel: typeof channel === 'string' ? channel : null, createdAt };
}

/** The waiting items, the oldest first; null when the table is missing or cannot be read. */
export async function fetchInbox(db: InboxDatabase): Promise<InboxItem[] | null> {
  const { data, error } = await db.from('kb_inbox').select('id, youtube_id, title, channel, created_at');
  if (error || !Array.isArray(data)) return null;
  return data.map(parseInboxItem).filter((item): item is InboxItem => item !== null).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function addToInbox(db: InboxDatabase, input: InboxInput): Promise<boolean> {
  const youtubeId = youtubeIdOf(input.url);
  if (!youtubeId) return false;
  const { error } = await db.from('kb_inbox').insert({ youtube_id: youtubeId, title: orNull(input.title), channel: orNull(input.channel), body: orNull(input.body) });
  return error === null;
}

export async function removeFromInbox(db: InboxDatabase, id: string): Promise<boolean> {
  const { error } = await db.from('kb_inbox').delete().eq('id', id);
  return error === null;
}
