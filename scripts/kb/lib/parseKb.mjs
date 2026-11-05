/**
 * Splits a knowledge base file (docs/knowledge/*.md) into topics and claims for the evidence base.
 * A topic is a numbered heading ("## 2. ...", "### 2.1 ..."); a claim is a line of the file under it (a bullet, a numbered item, a table row or a paragraph), word for word.
 * Fenced code (the JSON data model of the bAIkcare file), blockquotes and rules are not claims. Pure: no file and no network.
 */

const HEADING = /^(#{2,4})\s+(\d+[a-z]?(?:\.\d+)*)\.?\s+(.+?)\s*$/;
const MAX_CLAIM = 1500;

/** The id prefix of a file: "baikfit_kb_v1.5.0.md" gives "baikfit", so the topics keep their ids when the version changes. */
export const prefixOf = (file) => file.replace(/^.*\//, '').split('_')[0];

/** A line that is a claim, cleaned of its list marker or table frame; null for a line that is not one. */
function claimOf(line) {
  const text = line.trim();
  if (text === '' || text.startsWith('>') || /^[-*_]{3,}$/.test(text) || /^\|[\s:|-]+\|?$/.test(text)) return null;
  if (text.startsWith('|')) return text.replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim()).filter(Boolean).join(' | ');
  return text.replace(/^(?:[*-]|\d+\.)\s+/, '');
}

/** A claim longer than the limit is cut at sentence ends, so that no number is lost. */
function pieces(claim) {
  if (claim.length <= MAX_CLAIM) return [claim];
  const out = [];
  let current = '';
  for (const sentence of claim.split(/(?<=[.;])\s+/)) {
    if (current && `${current} ${sentence}`.length > MAX_CLAIM) { out.push(current); current = sentence; } else current = current ? `${current} ${sentence}` : sentence;
  }
  if (current) out.push(current);
  return out.flatMap((piece) => (piece.length <= MAX_CLAIM ? [piece] : piece.match(new RegExp(`.{1,${MAX_CLAIM}}`, 'g'))));
}

export function parseKb(markdown, file) {
  const prefix = prefixOf(file);
  const topics = [];
  const claims = [];
  let topic = null;
  let fenced = false;
  for (const line of markdown.split('\n')) {
    if (line.trim().startsWith('```')) { fenced = !fenced; continue; }
    if (fenced) continue;
    const heading = HEADING.exec(line);
    if (heading) {
      topic = { id: `${prefix}-${heading[2].replace(/\./g, '-')}`, file, section: heading[2], title: heading[3].replace(/\*\*/g, '') };
      topics.push(topic);
      continue;
    }
    if (!topic || line.startsWith('#')) continue;
    const claim = claimOf(line);
    if (claim) for (const piece of pieces(claim)) claims.push({ topicId: topic.id, kbRef: `${file} §${topic.section}`, claim: piece });
  }
  return { topics, claims };
}
