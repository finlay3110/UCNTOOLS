#!/usr/bin/env node
/* ============================================================
   SONG VALIDATOR

   Checks every song file in songs/ before it ships. The app trusts the
   songs completely, so this catches the things that have actually gone
   wrong or would break it (see checkSongs in songs-lib.mjs):

     - each file reads: a header, a "---" line, then the lyrics
     - required fields present and not empty; ids, where given, unique
     - categories are known AND have an icon mapped in app.js
     - source_book / source_page agree with each other
     - no chorus or verse heading stuck in the middle of a block, where
       it would show as a lyric instead of a heading

   New songs have no id yet: the deploy numbers them on merge.

   Run:  node tools/validate-songs.mjs
   Exits non-zero on errors; warnings alone do not fail the build.
   ============================================================ */

import { readSongs, checkSongs } from './songs-lib.mjs';

const entries = readSongs();
if (!entries.length) {
  console.error('songs/ has no song files.');
  process.exit(1);
}
const { errors, warnings } = checkSongs(entries);
for (const w of warnings) console.warn(`warning: ${w}`);
for (const e of errors) console.error(`error:   ${e}`);

const songs = entries.filter((e) => e.song).map((e) => e.song);
const counts = `${entries.length} songs, ${new Set(songs.map((s) => s.category)).size} categories`;
if (errors.length) {
  console.error(`\nSongs FAILED validation — ${errors.length} error(s), ${warnings.length} warning(s). (${counts})`);
  process.exit(1);
}
console.log(`Songs OK — ${counts}, ${warnings.length} warning(s).`);
