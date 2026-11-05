/** Read side of the evidence base (Epic 50): the topics of the knowledge bases, the rules of the released files and what was learnt from videos. Written only by `npm run kb:*`. */

export interface EvidenceTopic {
  id: string;
  title: string;
  proposed: boolean;
  kbClaims: number;
  videoClaims: number;
  agreeingChannels: number;
  conflicts: number;
  toReview: number;
  ready: boolean;
}

export interface EvidenceClaim {
  id: string;
  topicId: string;
  claim: string;
  value: number | null;
  unit: string | null;
  atSeconds: number | null;
  relation: 'agrees' | 'conflicts' | 'new' | 'unclear';
  status: 'proposed' | 'approved' | 'rejected';
  channel: string;
  title: string;
  /** Link to the video at the second where the claim is made. */
  url: string;
}

export interface Evidence {
  topics: EvidenceTopic[];
  claims: EvidenceClaim[];
}

type Row = Record<string, unknown>;
type Answer = PromiseLike<{ data: unknown; error: { code?: string } | null }>;

/** The part of the Supabase client that the evidence page uses. */
export interface EvidenceDatabase {
  from: (table: 'kb_topic_status' | 'kb_claims' | 'kb_sources') => { select: (columns: '*') => Answer };
}

const RELATIONS = ['agrees', 'conflicts', 'new', 'unclear'];
const STATUSES = ['proposed', 'approved', 'rejected'];
const isRow = (value: unknown): value is Row => typeof value === 'object' && value !== null && !Array.isArray(value);
const str = (value: unknown): string | null => (typeof value === 'string' && value !== '' ? value : null);
const count = (value: unknown): number => (typeof value === 'number' && Number.isFinite(value) ? value : 0);
const num = (value: unknown): number | null => (typeof value === 'number' && Number.isFinite(value) ? value : null);

export function parseTopic(raw: unknown): EvidenceTopic | null {
  if (!isRow(raw)) return null;
  const id = str(raw.topic_id);
  const title = str(raw.title);
  if (!id || !title) return null;
  return { id, title, proposed: raw.proposed === true, kbClaims: count(raw.kb_claims), videoClaims: count(raw.video_claims), agreeingChannels: count(raw.agreeing_channels), conflicts: count(raw.conflicts), toReview: count(raw.to_review), ready: raw.ready === true };
}

/** The link to a video at a second: the address is rebuilt from the 11 character id, never taken from the row. */
export const videoLink = (youtubeId: string, seconds: number | null): string => `https://www.youtube.com/watch?v=${youtubeId}${seconds ? `&t=${seconds}s` : ''}`;

export function parseClaim(raw: unknown, sources: Map<string, Row>): EvidenceClaim | null {
  if (!isRow(raw) || raw.origin !== 'video') return null;
  const source = sources.get(String(raw.source_id));
  const id = str(raw.id);
  const topicId = str(raw.topic_id);
  const claim = str(raw.claim);
  const youtubeId = str(source?.youtube_id);
  const relation = RELATIONS.find((r) => r === raw.relation);
  const status = STATUSES.find((s) => s === raw.status);
  if (!id || !topicId || !claim || !youtubeId || !relation || !status || !/^[A-Za-z0-9_-]{11}$/.test(youtubeId)) return null;
  const atSeconds = num(raw.at_seconds);
  return { id, topicId, claim, value: num(raw.value), unit: str(raw.unit), atSeconds, relation: relation as EvidenceClaim['relation'], status: status as EvidenceClaim['status'], channel: str(source?.channel) ?? '', title: str(source?.title) ?? '', url: videoLink(youtubeId, atSeconds) };
}

/** Loads everything; null when the tables are not there (migration not run) or the user may not read them. */
export async function fetchEvidence(db: EvidenceDatabase): Promise<Evidence | null> {
  const [topics, claims, sources] = await Promise.all(['kb_topic_status', 'kb_claims', 'kb_sources'].map((table) => db.from(table as 'kb_claims').select('*')));
  if (topics.error || claims.error || sources.error || !Array.isArray(topics.data) || !Array.isArray(claims.data) || !Array.isArray(sources.data)) return null;
  const byId = new Map<string, Row>(sources.data.filter(isRow).map((row) => [String(row.id), row]));
  return {
    topics: topics.data.map(parseTopic).filter((topic): topic is EvidenceTopic => topic !== null),
    claims: claims.data.map((row) => parseClaim(row, byId)).filter((claim): claim is EvidenceClaim => claim !== null),
  };
}
