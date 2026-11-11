#!/usr/bin/env node
// Checks the song files tooling. Run: node tools/test.mjs (CI runs it on every change).
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CATEGORIES, parseSong, formatSong, readSongs, numberSongs, buildSongs, checkSongs, tidyLyrics, outline, preview, newFileName, slugify } from './songs-lib.mjs';
import { readForm, makeSong, submission } from './submission.mjs';

// ── Song files: what's written reads back exactly, edge newlines included.
const song = { id: 7, title: 'Test', category: 'Crew Ballads', words: 'Me', tune: 'Trad', lyrics: 'a\nb\n\nChorus:\nc\n', source_book: 'UCN Songbook', source_page: 3 };
assert.deepEqual(parseSong(formatSong(song)), song);
assert.deepEqual(parseSong(formatSong(song).replace(/\n/g, '\r\n')), song, 'Windows line endings');
assert.equal(parseSong('title: T\n---\nonly line').lyrics, 'only line', 'no final newline');
assert.equal(parseSong('title: T\n---\nx\n---\ny\n').lyrics, 'x\n---\ny', 'a "---" in the lyrics stays a lyric');
assert.throws(() => parseSong('title: T\nno divider'), /---/);
assert.throws(() => parseSong('title: T\ncolour: red\n---\nx'), /unknown field "colour"/);
assert.throws(() => parseSong('title: T\ntitle: U\n---\nx'), /appears twice/);
assert.throws(() => parseSong('id: seven\n---\nx'), /whole number/);
assert.ok(!formatSong({ ...song, id: undefined, source_book: null, source_page: null }).match(/^(id|source)/m), 'empty fields are left out');
assert.equal(slugify("Barrett's Privateers!"), 'barrett-s-privateers');
assert.equal(slugify('Ça Ira'), 'ca-ira');
assert.equal(newFileName('Test', ['test.txt', 'test-2.txt']), 'test-3.txt');

// ── Numbering: new songs get the next numbers in file name order; numbered ones keep theirs.
{
  const dir = mkdtempSync(join(tmpdir(), 'songs-'));
  const put = (f, s) => writeFileSync(join(dir, f), formatSong(s));
  put('a.txt', { ...song, id: 4 });
  put('b.txt', { ...song, id: 9 });
  put('d-new.txt', { ...song, id: undefined, title: 'D' });
  put('c-new.txt', { ...song, id: undefined, title: 'C' });
  assert.deepEqual(numberSongs(dir), [['c-new.txt', 10], ['d-new.txt', 11]]);
  assert.deepEqual(numberSongs(dir), [], 'nothing left to number');
  const entries = readSongs(dir);
  assert.deepEqual(buildSongs(entries).map((s) => s.id), [4, 9, 10, 11], 'songs.json is in id order');
  assert.deepEqual(Object.keys(buildSongs(entries)[0]), ['id', 'title', 'category', 'words', 'tune', 'lyrics', 'source_book', 'source_page']);
  rmSync(dir, { recursive: true });
}

// ── Checks.
{
  const e = (file, s) => ({ file, song: { ...song, ...s } });
  const { errors } = checkSongs([e('a.txt', {}), e('b.txt', {}), e('c.txt', { id: undefined }), e('d.txt', { lyrics: 'a\n[Chorus]\nb' }), { file: 'e.txt', error: 'broken' }]);
  assert.ok(errors.some((m) => m.startsWith('b.txt') && /id 7 is already used/.test(m)));
  assert.ok(!errors.some((m) => m.startsWith('c.txt')), 'a song with no id yet is fine');
  assert.ok(errors.some((m) => m.startsWith('d.txt') && /needs a blank line above it/.test(m)));
  assert.ok(errors.includes('e.txt: broken'));
}
// The real songs pass.
assert.deepEqual(checkSongs(readSongs()).errors, []);

// ── Tidying: the ways people write choruses become the songbook's markers.
const cases = [
  ['Verse a\nVerse b\nChorus\nC one\nC two\n\nVerse c\n(Chorus)', 'Verse a\nVerse b\n\nChorus:\nC one\nC two\n\nVerse c\n\nRepeat chorus'],
  ['CHORUS x2\nC one', 'Chorus (x2):\nC one'],
  ['[chorus 2]\nC one\n\nRepeat the Chorus 2.', 'Chorus 2:\nC one\n\nRepeat chorus 2'],
  ['a\n[Verse 2]\nb\n(Bridge)\nc', 'a\n\n[Verse 2]\nb\n\n[Bridge]\nc'],
  ['a\nRepeat chorus\nb', 'a\n\nRepeat chorus\n\nb'],
  ['  a  \r\n\r\n\r\n\r\nb\t\n', '  a\n\nb'],
  ['Chorus of angels singing\nRepeat after me', 'Chorus of angels singing\nRepeat after me'],
];
for (const [raw, want] of cases) assert.equal(tidyLyrics(raw), want, JSON.stringify(raw));
assert.equal(tidyLyrics(cases[0][1]), cases[0][1], 'tidying is stable');
assert.equal(outline(tidyLyrics(cases[0][0])), 'Verse (2 lines) · CHORUS (2 lines) · Verse (1 line) · ↻ Repeat chorus');
assert.match(preview('Chorus:\nhey'), /^CHORUS\n  │ hey$/);

// ── Submissions: read from the form GitHub writes, tidied and checked.
const body = (lyrics, extra = {}) => [
  ['Song title', extra.title ?? 'The Good Ship'], ['Category', extra.category ?? 'Crew Ballads'], ['Words by', '@someone\nand friends'],
  ['Tune', 'Trad'], ['Lyrics', lyrics], ['Source book', '_No response_'], ['Source page', extra.page ?? '_No response_'],
].map(([h, v]) => `### ${h}\n\n${v}`).join('\n\n').replace(/\n/g, '\r\n');
{
  const form = readForm(body('Verse a\nVerse b\n\nChorus\nC one\n\n### not a field\nx'));
  assert.equal(form.title, 'The Good Ship');
  assert.equal(form.source_book, '');
  assert.equal(form.lyrics, 'Verse a\nVerse b\n\nChorus\nC one\n\n### not a field\nx', 'lyrics run up to the next field, whatever they contain');
  const { song: s, problems, tidied } = makeSong(form);
  assert.equal(s.words, '@someone and friends', 'one line');
  assert.ok(tidied && s.lyrics.includes('Chorus:\nC one'));
  assert.deepEqual(problems, []);
  assert.equal(s.id, undefined, 'no id until merged');
}
const existing = readSongs();
{
  const r = submission({ number: 5, body: body('Verse a\n\nChorus\nC one\n\n(Chorus)'), user: { login: 'finlay3110' } }, existing);
  assert.ok(r.ok);
  assert.equal(r.file, 'the-good-ship.txt');
  assert.match(r.comment, /passed its checks/);
  assert.match(r.pr, /Closes #5/);
  assert.match(r.pr, /@finlay3110/);
  // The submitter's text only appears inside a fence, so "@someone" mentions nobody.
  const outside = r.comment.replace(/(~{3,})text\n[\s\S]*?\n\1/g, '');
  assert.ok(!outside.includes('@someone') && !outside.includes('The Good Ship'));
}
{
  const r = submission({ number: 6, body: body('a\n\nRepeat chorus', { page: 'twelve' }), user: { login: 'x' } }, existing);
  assert.ok(!r.ok);
  assert.match(r.comment, /needs a fix/);
  assert.match(r.comment, /page number/);
}
{
  const taken = existing[0].song.title;
  const r = submission({ number: 7, body: body('a', { title: taken }), user: { login: 'x' } }, existing);
  assert.ok(r.ok && r.file !== existing[0].file && /same title/.test(r.comment), 'a repeat title is flagged, not lost');
  // Lyrics with their own ~~~ can't end the preview box early: its fence is longer.
  const c = submission({ number: 8, body: body('a ~~~ b\n~~~~\nc'), user: { login: 'x' } }, existing).comment;
  assert.match(c, /\n~{5}text\n/);
}

// ── The form offers exactly the songbook's categories.
const form = readFileSync(new URL('../../.github/ISSUE_TEMPLATE/submit-a-song.yml', import.meta.url), 'utf8');
const options = form.slice(form.indexOf('options:'), form.indexOf('validations:', form.indexOf('options:')));
assert.deepEqual([...options.matchAll(/^ {8}- (.+)$/gm)].map((m) => m[1]), CATEGORIES);

console.log('songbook tools: all checks passed');
