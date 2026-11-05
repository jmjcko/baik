'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { useCatalogDb } from '@/lib/catalog/hooks';
import { addToInbox, fetchInbox, inboxProblem, removeFromInbox, type InboxDatabase, type InboxInput, type InboxItem, type InboxProblem } from '@/lib/kb/inbox';
import { videoLink } from '@/lib/kb/evidence';
import { Card, FIELD, PILL_OUTLINE, PILL_PRIMARY } from './AdminParts';

const EMPTY: InboxInput = { url: '', title: '', channel: '', body: '' };

/** The items waiting for the assistant, loaded once and after every change; null while loading or when the table is missing. */
function useInbox() {
  const getDb = useCatalogDb();
  const [items, setItems] = useState<InboxItem[] | null>(null);
  const db = () => getDb() as unknown as InboxDatabase | null;
  const load = useCallback(async () => {
    const current = getDb() as unknown as InboxDatabase | null;
    setItems(current ? await fetchInbox(current) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    let cancelled = false;
    const current = getDb() as unknown as InboxDatabase | null;
    void (current ? fetchInbox(current) : Promise.resolve(null)).then((loaded) => {
      if (!cancelled) setItems(loaded);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { items, db, load };
}

type FormState = 'idle' | 'saving' | 'saved' | 'failed' | InboxProblem;

/** The form: the input, its state and the save; a problem is reported before anything is written. */
function useInboxForm(inbox: ReturnType<typeof useInbox>) {
  const [input, setInput] = useState<InboxInput>(EMPTY);
  const [state, setState] = useState<FormState>('idle');
  const set = (patch: Partial<InboxInput>) => setInput((prev) => ({ ...prev, ...patch }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const problem = inboxProblem(input, inbox.items?.length ?? 0);
    const database = inbox.db();
    if (problem || !database) return setState(problem ?? 'failed');
    setState('saving');
    const ok = await addToInbox(database, input);
    if (ok) setInput(EMPTY);
    setState(ok ? 'saved' : 'failed');
    if (ok) await inbox.load();
  };
  return { input, state, set, submit };
}

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block space-y-1">
    <span className="text-xs font-semibold text-ink-3">{label}</span>
    {children}
  </label>
);

const Waiting: React.FC<{ texts: Translations['admin']['evidence']['inbox']; items: InboxItem[]; onRemove: (id: string) => void }> = ({ texts, items, onRemove }) => (
  <div className="space-y-2">
    <h3 className="text-sm font-bold text-ink">{texts.waitingTitle} ({items.length})</h3>
    {items.length === 0 && <p className="text-sm text-ink-2">{texts.waitingEmpty}</p>}
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id} data-testid="inbox-item" className="flex items-center justify-between gap-3 text-sm text-ink">
          <span className="min-w-0"><a href={videoLink(item.youtubeId, null)} target="_blank" rel="noopener noreferrer" className="text-accent-ink underline">{item.title ?? item.youtubeId}</a>{item.channel && <span className="text-ink-3"> · {item.channel}</span>}</span>
          <button type="button" className={PILL_OUTLINE} aria-label={fill(texts.remove, { title: item.title ?? item.youtubeId })} onClick={() => onRemove(item.id)}>×</button>
        </li>
      ))}
    </ul>
  </div>
);

/** A form that leaves a link and a transcript for the assistant, and the list of what still waits. */
export const EvidenceInbox: React.FC<{ t: Translations }> = ({ t }) => {
  const texts = t.admin.evidence.inbox;
  const inbox = useInbox();
  const { input, state, set, submit } = useInboxForm(inbox);
  const remove = async (id: string) => {
    const database = inbox.db();
    if (database && (await removeFromInbox(database, id))) await inbox.load();
  };
  const message = state === 'saved' ? texts.saved : state === 'failed' ? texts.failed : state in texts.problems ? texts.problems[state as InboxProblem] : null;
  return (
    <Card testId="evidence-inbox">
      <h2 className="text-base font-bold text-ink">{texts.title}</h2>
      <p className="text-sm text-ink-2 max-w-3xl">{texts.hint}</p>
      <form onSubmit={(event) => void submit(event)} className="space-y-3">
        <Field label={texts.linkLabel}><input className={FIELD} value={input.url} onChange={(e) => set({ url: e.target.value })} placeholder="https://www.youtube.com/watch?v=" /></Field>
        <Field label={texts.bodyLabel}><textarea className={`${FIELD} h-40 py-2`} value={input.body} onChange={(e) => set({ body: e.target.value })} /></Field>
        <p className="text-xs text-ink-3">{texts.bodyHint}</p>
        <button type="submit" disabled={state === 'saving'} className={PILL_PRIMARY}>{state === 'saving' ? texts.saving : texts.add}</button>
        {message && <p role={state === 'saved' ? 'status' : 'alert'} className={state === 'saved' ? 'text-sm text-ink-2' : 'text-sm text-tone-danger-ink'}>{message}</p>}
      </form>
      {inbox.items && <Waiting texts={texts} items={inbox.items} onRemove={(id) => void remove(id)} />}
    </Card>
  );
};
