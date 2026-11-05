#!/usr/bin/env node
/**
 * Downloads the transcript, the title and the channel of a video (needs yt-dlp) into a file outside the repository, so that it can be analysed.
 * Usage: npm run kb:fetch -- <youtube link> <output file>
 */
import { writeFileSync } from 'node:fs';
import { fetchTranscript } from './lib/transcript.mjs';

const [link, file] = process.argv.slice(2);
if (!link || !file) {
  console.error('Usage: npm run kb:fetch -- <youtube link> <output file>');
  process.exit(1);
}
const { url, title, channel, transcript } = await fetchTranscript(link);
writeFileSync(file, `${url}\n${title}\n${channel}\n\n${transcript}\n`);
console.log(`${title} (${channel}): ${transcript.split('\n').length} lines written to ${file}`);
