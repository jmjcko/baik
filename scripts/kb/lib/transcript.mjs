import { execFile } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { youtubeIdOf } from './validate.mjs';

const run = promisify(execFile);
/** Languages are asked one group at a time: asking for a language that does not exist makes YouTube answer 429. */
/** The first group of a language asks for both; when YouTube refuses it (an automatic translation answers 429), the original track and then the plain track are asked alone. */
const LANG_GROUPS = [['en', 'en-orig'], ['en-orig'], ['en'], ['cs', 'cs-orig'], ['cs-orig'], ['cs']];

const clock = (ms) => {
  const total = Math.floor(ms / 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return total >= 3600 ? `${Math.floor(total / 3600)}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}` : `${Math.floor(total / 60)}:${pad(total % 60)}`;
};

/** The json3 captions of YouTube as lines "m:ss text"; events without words (line breaks, windows) are skipped. Pure. */
export function fromJson3(json) {
  const lines = [];
  for (const event of json.events ?? []) {
    const text = (event.segs ?? []).map((seg) => seg.utf8 ?? '').join('').replace(/\s+/g, ' ').trim();
    if (text) lines.push(`${clock(event.tStartMs ?? 0)} ${text}`);
  }
  return lines.join('\n');
}

/**
 * Downloads the captions, title and channel of a video with yt-dlp (it must be installed: brew install yt-dlp).
 * The address is rebuilt from the 11 character id and passed as an argument, never through a shell.
 */
export async function fetchTranscript(link) {
  const id = youtubeIdOf(link);
  if (!id) throw new Error('Not a YouTube link');
  const url = `https://www.youtube.com/watch?v=${id}`;
  const dir = mkdtempSync(join(tmpdir(), 'kb-'));
  try {
    let info = '';
    for (const langs of LANG_GROUPS) {
      const found = readdirSync(dir).some((name) => name.endsWith('.json3'));
      if (found) break;
      const args = ['--skip-download', '--no-simulate', '--write-auto-subs', '--write-subs', '--sub-langs', langs.join(','), '--sub-format', 'json3', '--print', '%(title)s\n%(channel)s', '-o', join(dir, '%(id)s'), url];
      info = await run('yt-dlp', args, { maxBuffer: 10 * 1024 * 1024 }).then((r) => r.stdout, (e) => e.stdout ?? info);
    }
    const [title, channel] = info.split('\n');
    const files = readdirSync(dir).filter((name) => name.endsWith('.json3'));
    const file = files.find((name) => name.endsWith('.en.json3')) ?? files[0];
    if (!file) throw new Error('The video has no captions in English or Czech (or YouTube refused the request)');
    return { id, url, title, channel, transcript: fromJson3(JSON.parse(readFileSync(join(dir, file), 'utf8'))) };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
