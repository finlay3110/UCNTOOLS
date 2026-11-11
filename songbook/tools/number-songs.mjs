#!/usr/bin/env node
/* Gives each new song (a file in songs/ with no id) the next free number.
   The deploy runs this on main, one deploy at a time, and saves the result,
   so songs merged close together still get different numbers.
   Run:  node tools/number-songs.mjs */
import { numberSongs } from './songs-lib.mjs';

const given = numberSongs();
for (const [file, id] of given) console.log(`${file}: id ${id}`);
console.log(given.length ? `${given.length} new song(s) numbered` : 'no new songs to number');
