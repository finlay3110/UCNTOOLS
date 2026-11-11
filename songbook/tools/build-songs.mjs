#!/usr/bin/env node
/* Builds songs.json, the file the app loads, from the song files in songs/.
   Runs on deploy after new songs are numbered, and stops the deploy if any
   song fails its checks, so a broken song never reaches the live site.
   Run:  node tools/build-songs.mjs */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, readSongs, checkSongs, buildSongs } from './songs-lib.mjs';

const entries = readSongs();
const { errors } = checkSongs(entries);
const unnumbered = entries.filter((e) => e.song && e.song.id == null).map((e) => e.file);
if (unnumbered.length) errors.push(`not numbered yet (run tools/number-songs.mjs): ${unnumbered.join(', ')}`);
if (errors.length) {
  for (const e of errors) console.error(`error:   ${e}`);
  process.exit(1);
}
writeFileSync(join(ROOT, 'songs.json'), JSON.stringify(buildSongs(entries), null, 2) + '\n');
console.log(`songs.json built: ${entries.length} songs`);
