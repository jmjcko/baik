'use client';

import React, { useEffect, useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { cx } from '@/lib/classNames';
import { useCatalogDb } from '@/lib/catalog/hooks';
import { fetchEvidence, type Evidence, type EvidenceDatabase, type EvidenceTopic } from '@/lib/kb/evidence';
import { AdminTable, Fold } from './AdminTable';
import { EvidenceInbox } from './EvidenceInbox';

type Texts = Translations['admin']['evidence'];

const clock = (seconds: number | null): string => {
  const total = seconds ?? 0;
  const pad = (n: number) => String(n).padStart(2, '0');
  return total >= 3600 ? `${Math.floor(total / 3600)}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}` : `${Math.floor(total / 60)}:${pad(total % 60)}`;
};

/** New topics first, then the ones with video evidence, then the rest of the files. */
const rank = (topic: EvidenceTopic): number => (topic.proposed ? 0 : topic.videoClaims + topic.toReview > 0 ? 1 : 2);

function statusOf(topic: EvidenceTopic, s: Texts['status']): { label: string; tone: string } {
  if (topic.proposed) return { label: s.newTopic, tone: 'bg-tone-info-bg text-tone-info-ink' };
  if (topic.conflicts > 0) return { label: s.conflict, tone: 'bg-tone-danger-bg text-tone-danger-ink' };
  if (topic.ready) return { label: s.ready, tone: 'bg-tone-success-bg text-tone-success-ink' };
  if (topic.videoClaims + topic.toReview > 0) return { label: s.collecting, tone: 'bg-tone-warning-bg text-tone-warning-ink' };
  return { label: s.none, tone: 'bg-sunken text-ink-3' };
}

const TopicsTable: React.FC<{ texts: Texts; topics: EvidenceTopic[] }> = ({ texts, topics }) => {
  const c = texts.columns;
  const sorted = [...topics].sort((a, b) => rank(a) - rank(b) || a.id.localeCompare(b.id, 'en', { numeric: true }));
  return (
    <AdminTable heads={[c.topic, c.rules, c.videos, c.channels, c.conflicts, c.toReview, c.status]} wideOnly={[1, 2, 3, 4, 5]} testId="evidence-topics">
      {sorted.map((topic) => {
        const status = statusOf(topic, texts.status);
        return (
          <tr key={topic.id} data-testid="evidence-topic" className="border-t border-line">
            <td className="px-4 py-3 text-ink"><span className="font-mono text-xs text-ink-3">{topic.id}</span> {topic.title}</td>
            <td className="hidden md:table-cell px-4 py-3 text-ink-2">{topic.kbClaims}</td>
            <td className="hidden md:table-cell px-4 py-3 text-ink-2">{topic.videoClaims}</td>
            <td className="hidden md:table-cell px-4 py-3 text-ink-2">{topic.agreeingChannels}</td>
            <td className="hidden md:table-cell px-4 py-3 text-ink-2">{topic.conflicts}</td>
            <td className="hidden md:table-cell px-4 py-3 text-ink-2">{topic.toReview}</td>
            <td className="px-4 py-3"><span className={cx('inline-block rounded-full px-3 py-1 text-xs font-semibold', status.tone)}>{status.label}</span></td>
          </tr>
        );
      })}
    </AdminTable>
  );
};

const ClaimsTable: React.FC<{ texts: Texts; evidence: Evidence }> = ({ texts, evidence }) => {
  const c = texts.columns;
  const titles = new Map(evidence.topics.map((topic) => [topic.id, topic.title]));
  return (
    <AdminTable heads={[c.claim, c.number, c.topic, c.relation, c.source]} wideOnly={[1, 2]} testId="evidence-claims">
      {evidence.claims.map((claim) => (
        <tr key={claim.id} data-testid="evidence-claim" className="border-t border-line align-top">
          <td className="px-4 py-3 text-ink">{claim.claim}<span className="block text-xs text-ink-3">{texts.states[claim.status]}</span></td>
          <td className="hidden md:table-cell px-4 py-3 text-ink-2">{claim.value === null ? '' : `${claim.value}${claim.unit ? ` ${claim.unit}` : ''}`}</td>
          <td className="hidden md:table-cell px-4 py-3 text-ink-2">{titles.get(claim.topicId) ?? claim.topicId}</td>
          <td className="px-4 py-3 text-ink-2">{texts.relations[claim.relation]}</td>
          <td className="px-4 py-3">
            <a href={claim.url} target="_blank" rel="noopener noreferrer" className="text-accent-ink underline">{claim.channel || claim.title}</a>
            <span className="block text-xs text-ink-3">{fill(texts.watch, { time: clock(claim.atSeconds) })}</span>
          </td>
        </tr>
      ))}
    </AdminTable>
  );
};

/** The evidence, loaded once; undefined while loading, null when there is no database or the tables cannot be read. */
function useEvidence(): Evidence | null | undefined {
  const getDb = useCatalogDb();
  const [loaded, setLoaded] = useState<Evidence | null | undefined>(undefined);
  useEffect(() => {
    const db = getDb() as unknown as EvidenceDatabase | null;
    let cancelled = false;
    void (db ? fetchEvidence(db) : Promise.resolve(null)).then((evidence) => {
      if (!cancelled) setLoaded(evidence);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return loaded;
}

/** Read only view of the evidence base: which topics have video evidence, which are new, which are ready to be taken over into the file. */
export const EvidenceTab: React.FC<{ t: Translations }> = ({ t }) => {
  const texts = t.admin.evidence;
  const evidence = useEvidence();
  if (evidence === undefined) return <p role="status" className="text-sm text-ink-2">{t.admin.checking}</p>;
  if (evidence === null || evidence.topics.length === 0) return <p className="text-sm text-ink-2" data-testid="evidence-empty">{texts.empty}</p>;
  return (
    <div className="space-y-6" data-testid="evidence-tab">
      <p className="text-sm text-ink-2 max-w-3xl">{texts.hint}</p>
      <EvidenceInbox t={t} />
      <section className="space-y-3">
        <h2 className="text-base font-bold text-ink">{texts.topicsTitle} ({evidence.topics.length})</h2>
        <TopicsTable texts={texts} topics={evidence.topics} />
      </section>
      <Fold title={texts.claimsTitle} count={evidence.claims.length} hint={texts.claimsHint}>
        <ClaimsTable texts={texts} evidence={evidence} />
      </Fold>
    </div>
  );
};
