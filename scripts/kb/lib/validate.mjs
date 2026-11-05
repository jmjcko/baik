/**
 * The input of `npm run kb:add`: one source (a YouTube video) and the claims learnt from it. Everything is checked before anything is written; pure.
 * Input shape: { source: { url, title, channel }, newTopics?: [{ id, title, section? }], claims: [{ topic, claim, value?, unit?, at?, relation, note? }] }
 */

export const RELATIONS = ['agrees', 'conflicts', 'new', 'unclear'];
const LIMITS = { claim: 1500, note: 500, title: 300, channel: 200, unit: 20, topicId: 80, claims: 200 };

/** The 11 character id of a YouTube link (watch, short link, shorts or embed); null for anything else. */
export function youtubeIdOf(url) {
  const match = /^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[&?#/].*)?$/.exec(String(url).trim());
  return match ? match[1] : null;
}

/** "3:48", "03:48" or "1:02:03" or a number of seconds; null for nothing, NaN-safe. */
export function secondsOf(at) {
  if (at === undefined || at === null || at === '') return null;
  if (typeof at === 'number') return Number.isInteger(at) && at >= 0 ? at : Number.NaN;
  const parts = String(at).trim().split(':').map(Number);
  if (parts.length < 1 || parts.length > 3 || parts.some((p) => !Number.isInteger(p) || p < 0)) return Number.NaN;
  return parts.reduce((total, part) => total * 60 + part, 0);
}

const text = (value, max) => typeof value === 'string' && value.trim() !== '' && value.trim().length <= max;

function checkClaim(raw, index, topicIds) {
  const where = `claims[${index}]`;
  const errors = [];
  if (typeof raw !== 'object' || raw === null) return { errors: [`${where}: not an object`] };
  if (!text(raw.topic, LIMITS.topicId) || !topicIds.has(raw.topic)) errors.push(`${where}: unknown topic "${raw.topic}" (add it under newTopics)`);
  if (!text(raw.claim, LIMITS.claim)) errors.push(`${where}: claim is empty or longer than ${LIMITS.claim}`);
  if (!RELATIONS.includes(raw.relation)) errors.push(`${where}: relation must be one of ${RELATIONS.join(', ')}`);
  if (raw.value !== undefined && raw.value !== null && !Number.isFinite(raw.value)) errors.push(`${where}: value is not a number`);
  if (raw.unit !== undefined && raw.unit !== null && !text(raw.unit, LIMITS.unit)) errors.push(`${where}: unit is too long`);
  if (raw.note !== undefined && raw.note !== null && !text(raw.note, LIMITS.note)) errors.push(`${where}: note is too long`);
  const at = secondsOf(raw.at);
  if (Number.isNaN(at)) errors.push(`${where}: "at" is not a time (mm:ss or seconds)`);
  if (typeof raw.value === 'number' && at === null) errors.push(`${where}: a claim with a number needs the time in the video ("at")`);
  return { errors, row: { topic_id: raw.topic, origin: 'video', claim: String(raw.claim ?? '').trim(), value: raw.value ?? null, unit: raw.unit ?? null, at_seconds: at, relation: raw.relation, status: 'proposed', note: raw.note ?? null } };
}

/** The rows to write, or the list of problems; `existingTopics` are the ids the database already has. */
export function validateAdd(input, existingTopics) {
  const errors = [];
  const source = input?.source;
  const youtubeId = youtubeIdOf(source?.url);
  if (!youtubeId) errors.push('source.url is not a YouTube link');
  if (!text(source?.title, LIMITS.title)) errors.push('source.title is missing');
  if (!text(source?.channel, LIMITS.channel)) errors.push('source.channel is missing');
  const newTopics = Array.isArray(input?.newTopics) ? input.newTopics : [];
  const topicIds = new Set([...existingTopics, ...newTopics.map((topic) => topic?.id)]);
  for (const [i, topic] of newTopics.entries()) if (!text(topic?.id, LIMITS.topicId) || !text(topic?.title, 200)) errors.push(`newTopics[${i}]: id and title are needed`);
  const claims = Array.isArray(input?.claims) ? input.claims : [];
  if (claims.length === 0 || claims.length > LIMITS.claims) errors.push(`claims: between 1 and ${LIMITS.claims} are needed`);
  const checked = claims.map((claim, i) => checkClaim(claim, i, topicIds));
  for (const result of checked) errors.push(...result.errors);
  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    source: { youtube_id: youtubeId, url: `https://www.youtube.com/watch?v=${youtubeId}`, title: source.title.trim(), channel: source.channel.trim() },
    topics: newTopics.filter((topic) => !existingTopics.has(topic.id)).map((topic) => ({ id: topic.id, file: 'proposed', section: topic.section ?? '-', title: topic.title.trim(), proposed: true })),
    claims: checked.map((result) => result.row),
  };
}
