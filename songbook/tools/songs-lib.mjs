/* ============================================================
   SONG FILES

   Each song lives in songs/ as its own small text file: a header, a
   "---" line, then the lyrics written out as they are sung.

     id: 12                      <- left out of new songs: given on merge
     title: Song Title
     category: Bar/Drinking Songs
     words: Author Name
     tune: Original Tune; Composer
     source_book: UCN Songbook   <- optional, with source_page
     source_page: 12
     ---
     First line of verse one
     ...

   The deploy numbers any new songs and combines the files into
   songs.json, the one file the app loads. Everything that reads, writes,
   checks, tidies or numbers song files is here, shared by the deploy,
   the validator and the submission bot.
   ============================================================ */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const SONGS_DIR = join(ROOT, 'songs');
const { parseLyrics } = createRequire(import.meta.url)(join(ROOT, 'lyrics.js'));

export const CATEGORIES = [
  'Patriotic Songs', 'Bar/Drinking Songs', 'Crew Ballads', 'Accompanied Songs',
  'Songs About Us', 'Fragments and Works in Progress', 'Traditional Songs',
  'Movie/TV', 'Improvised Songs', 'Folk & Other'
];
const HEADER = ['id', 'title', 'category', 'words', 'tune', 'source_book', 'source_page'];
const NUMBERS = ['id', 'source_page'];

/* ── Reading and writing ──────────────────────────────────── */

export function parseSong(text) {
  let t = String(text).replace(/\r\n?/g, '\n');
  if (!t.endsWith('\n')) t += '\n';
  const cut = t.indexOf('\n---\n');
  if (cut < 0) throw new Error('no "---" line between the header and the lyrics');
  const song = {};
  for (const line of t.slice(0, cut).split('\n')) {
    if (!line.trim()) continue;
    const m = line.match(/^([a-z_]+):[ \t]*(.*)$/);
    if (!m) throw new Error(`header line ${JSON.stringify(line)} is not "field: value"`);
    const key = m[1], value = m[2].trim();
    if (!HEADER.includes(key)) throw new Error(`unknown field "${key}" (fields: ${HEADER.join(', ')})`);
    if (key in song) throw new Error(`"${key}" appears twice`);
    if (NUMBERS.includes(key)) {
      if (!/^\d+$/.test(value)) throw new Error(`"${key}" must be a whole number`);
      song[key] = Number(value);
    } else song[key] = value;
  }
  // Everything after "---", less the file's final newline, exactly as written.
  song.lyrics = t.slice(cut + 5, -1);
  return song;
}

export function formatSong(song) {
  const head = HEADER.filter((k) => song[k] != null && song[k] !== '').map((k) => `${k}: ${song[k]}`);
  return head.join('\n') + '\n---\n' + song.lyrics + '\n';
}

// [{file, song}] or [{file, error}], in file name order.
export function readSongs(dir = SONGS_DIR) {
  return readdirSync(dir).filter((f) => f.endsWith('.txt')).sort().map((file) => {
    try { return { file, song: parseSong(readFileSync(join(dir, file), 'utf8')) }; }
    catch (e) { return { file, error: e.message }; }
  });
}

export function slugify(title) {
  return String(title).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60).replace(/-+$/, '') || 'song';
}

// A file name for a new song that no existing file already has.
export function newFileName(title, taken) {
  const base = slugify(title);
  for (let n = 1; ; n++) {
    const name = (n === 1 ? base : `${base}-${n}`) + '.txt';
    if (!taken.includes(name)) return name;
  }
}

/* ── Numbering and building ───────────────────────────────── */

// Gives each song without an id the next free number, in file name order,
// and saves it into the file. Returns [[file, id], ...].
export function numberSongs(dir = SONGS_DIR) {
  const entries = readSongs(dir);
  let next = Math.max(0, ...entries.filter((e) => e.song && Number.isInteger(e.song.id)).map((e) => e.song.id)) + 1;
  const given = [];
  for (const e of entries) {
    if (!e.song || e.song.id != null) continue;
    e.song.id = next++;
    writeFileSync(join(dir, e.file), formatSong(e.song));
    given.push([e.file, e.song.id]);
  }
  return given;
}

// The array songs.json holds: every song, by id, in the app's field order.
export function buildSongs(entries) {
  return entries.map(({ song }) => ({
    id: song.id, title: song.title, category: song.category, words: song.words, tune: song.tune,
    lyrics: song.lyrics, source_book: song.source_book ?? null, source_page: song.source_page ?? null,
  })).sort((a, b) => a.id - b.id);
}

/* ── Checking ─────────────────────────────────────────────── */

/* What has actually gone wrong or would break the app: missing or empty
   fields, clashing ids, unknown categories or ones with no icon, source
   book and page that disagree, and a heading left in the middle of a
   block, which shows "[Chorus 1:]" as a lyric instead of a chorus box.
   A missing id is fine: new songs are numbered on merge. */
const STRUCTURAL_HEADING = /^\[?\s*(pre-?chorus|chorus|refrain|verse|bridge|intro|outro|coda|spoken)\b/i;

export function checkSongs(entries) {
  const errors = [], warnings = [];
  const appSrc = readFileSync(join(ROOT, 'app.js'), 'utf8');
  const iconMap = appSrc.slice(appSrc.indexOf('var CAT_ICON_NAMES'), appSrc.indexOf('function catIconName'));
  const mapped = [...iconMap.matchAll(/'([^']+)'\s*:\s*'[^']+'/g)].map((m) => m[1]);
  const ids = new Map(), titles = new Map();

  for (const { file, song: s, error } of entries) {
    if (error) { errors.push(`${file}: ${error}`); continue; }
    const at = `${file} (${JSON.stringify(s.title ?? '')})`;
    const err = (m) => errors.push(`${at}: ${m}`), warn = (m) => warnings.push(`${at}: ${m}`);

    if (s.id != null) {
      if (ids.has(s.id)) err(`id ${s.id} is already used by ${ids.get(s.id)}`);
      else ids.set(s.id, file);
    }
    for (const field of ['title', 'category', 'words', 'tune', 'lyrics']) {
      if (typeof s[field] !== 'string' || !s[field].trim()) err(`"${field}" is missing or empty`);
    }
    if (s.title) {
      const key = s.title.trim().toLowerCase();
      if (titles.has(key)) warn(`same title as ${titles.get(key)}`);
      else titles.set(key, file);
    }
    if (s.category) {
      if (!CATEGORIES.includes(s.category)) err(`unknown category ${JSON.stringify(s.category)}. Valid: ${CATEGORIES.join(', ')}`);
      else if (!mapped.includes(s.category)) err(`category ${JSON.stringify(s.category)} has no icon in CAT_ICON_NAMES (app.js)`);
    }
    if (s.source_book && s.source_page == null) warn('has source_book but no source_page');
    if (s.source_page != null && !s.source_book) err('has source_page but no source_book, so the page number would not show');

    if (typeof s.lyrics === 'string' && s.lyrics.trim()) {
      const blocks = parseLyrics(s.lyrics);
      if (!blocks.length) err('lyrics read as nothing');
      for (const b of blocks) {
        if (b.type !== 'verse') continue;
        b.lines.forEach((line, li) => {
          const t = String(line).trim();
          const looksLikeHeading = /^\[.+\]$/.test(t) || /^[^:]{1,40}:$/.test(t);
          if (li > 0 && looksLikeHeading && STRUCTURAL_HEADING.test(t)) {
            err(`${JSON.stringify(t)} shows as a lyric, not a heading: it needs a blank line above it`);
          }
        });
      }
      const hasChorus = blocks.some((b) => b.type === 'chorus');
      if (!hasChorus && blocks.some((b) => b.type === 'repeat' && /chorus|refrain/i.test(b.text))) {
        warn('says "repeat chorus" but has no chorus marked');
      }
    }
  }
  return { errors, warnings };
}

/* ── Tidying submitted lyrics ─────────────────────────────── */

/* A line that only names the chorus: "Chorus", "(Chorus 2)", "[Refrain]",
   "CHORUS:", "Chorus x2", "Repeat the chorus". Returns its parts, or null. */
function chorusCue(line) {
  const bare = line.trim().replace(/^[[(]\s*/, '').replace(/\s*[\])]$/, '').replace(/[:.]+$/, '').trim();
  const m = bare.match(/^(repeat\s+(?:the\s+)?)?((?:chorus|refrain)(?:\s*\d+)?)\s*((?:x|×)\s*\d+|twice)?$/i);
  if (!m) return null;
  const name = m[2].replace(/\s+/g, ' ').toLowerCase();
  return { repeat: !!m[1], name, times: m[3] ? m[3].replace(/\s+/g, '').replace('×', 'x').toLowerCase() : '' };
}

// Another section heading written as a line of its own: "[Verse 2]", "(Bridge)", "Outro:".
function sectionHeading(line) {
  const t = line.trim();
  const m = t.match(/^[[(]\s*(.+?)\s*[\])]:?$/) || t.match(/^([^:]{1,40}):$/);
  return m && STRUCTURAL_HEADING.test(m[1]) ? `[${m[1]}]` : null;
}

const capital = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* Turns lyrics as people tend to type them into the songbook's own
   markers, so a chorus shows as a chorus and a repeat as a repeat:
   - a chorus line with lines under it becomes the heading "Chorus:"
   - a chorus line on its own (or "Repeat chorus") becomes "Repeat chorus"
   - any heading or repeat in the middle of a verse gets a blank line
     above it, which the app needs to see it as one
   - line endings, trailing spaces and runs of blank lines are cleaned up */
export function tidyLyrics(text) {
  const lines = String(text).replace(/\r\n?/g, '\n').split('\n').map((l) => l.replace(/\s+$/, ''));
  const blocks = [];
  let block = [];
  const close = () => { if (block.length) blocks.push(block); block = []; };

  lines.forEach((line, i) => {
    if (!line) { close(); return; }
    const cue = chorusCue(line);
    const hasBody = !!lines[i + 1];
    if (cue && (cue.repeat || !hasBody)) {
      close();
      blocks.push([`Repeat ${cue.name}${cue.times ? ' ' + cue.times : ''}`]);
      return;
    }
    if (cue) {
      close();
      block.push(`${capital(cue.name)}${cue.times ? ` (${cue.times})` : ''}:`);
      return;
    }
    const heading = sectionHeading(line);
    if (heading && block.length) close();
    block.push(heading || line);
  });
  close();
  return blocks.map((b) => b.join('\n')).join('\n\n');
}

/* ── Previewing ───────────────────────────────────────────── */

// The song as the app will lay it out, as plain text: chorus lines marked
// with a bar, repeats with ↻, headings in brackets.
export function preview(lyrics) {
  const out = [];
  for (const b of parseLyrics(lyrics)) {
    if (b.type === 'chorus') out.push(`${b.label.toUpperCase()}`, ...b.lines.map((l) => `  │ ${l}`));
    else if (b.type === 'repeat') out.push(`↻ ${b.text}`);
    else if (b.type === 'label') out.push(`[${b.text}]`);
    else out.push(...b.lines.map((l) => `  ${l}`));
    out.push('');
  }
  return out.join('\n').trimEnd();
}

// One line: Verse (4 lines) · CHORUS (4 lines) · ↻ Repeat chorus
export function outline(lyrics) {
  const n = (lines) => { const k = lines.filter((l) => String(l).trim()).length; return `${k} line${k === 1 ? '' : 's'}`; };
  return parseLyrics(lyrics).map((b) =>
    b.type === 'chorus' ? `${b.label.toUpperCase()} (${n(b.lines)})`
      : b.type === 'repeat' ? `↻ ${b.text}`
        : b.type === 'label' ? `[${b.text}]`
          : `Verse (${n(b.lines)})`).join(' · ');
}
