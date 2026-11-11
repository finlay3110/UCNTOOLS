#!/usr/bin/env node
/* ============================================================
   SONG SUBMISSIONS

   Turns a "Submit a song" issue (.github/ISSUE_TEMPLATE/submit-a-song.yml)
   into a song file, for .github/workflows/songbook-submission.yml.

   Run:  node tools/submission.mjs <event.json> <out-dir>

   Reads the issue from the GitHub event, tidies and checks the song, and
   writes to <out-dir>: comment.md (the reply on the issue) and pr.md (the
   pull request's description). When the song passes, its file goes into
   songs/ (with no id: the deploy numbers it on merge). The step outputs
   ok, file and title go to $GITHUB_OUTPUT.

   Whoever opened the issue wrote everything in it, so it is only ever
   data: fields are flattened to one line and capped, and anything echoed
   back on GitHub sits inside a code fence, where it can't mention anyone
   or render links.
   ============================================================ */

import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SONGS_DIR, CATEGORIES, readSongs, checkSongs, tidyLyrics, preview, outline, formatSong, newFileName } from './songs-lib.mjs';

// The form's fields, by the heading GitHub writes above each answer.
export const FIELDS = [
  ['title', 'Song title'], ['category', 'Category'], ['words', 'Words by'], ['tune', 'Tune'],
  ['lyrics', 'Lyrics'], ['source_book', 'Source book'], ['source_page', 'Source page'],
];

export function readForm(body) {
  const text = String(body ?? '').replace(/\r\n?/g, '\n');
  const form = {};
  FIELDS.forEach(([key, label], i) => {
    const at = text.indexOf(`### ${label}\n`);
    if (at < 0) { form[key] = ''; return; }
    const from = at + label.length + 5;
    let end = text.length;
    for (const [, next] of FIELDS.slice(i + 1)) {
      const n = text.indexOf(`\n### ${next}\n`, from);
      if (n >= 0) { end = n; break; }
    }
    const value = text.slice(from, end).replace(/^\n+/, '').replace(/\s+$/, '');
    form[key] = value === '_No response_' ? '' : value;
  });
  return form;
}

const oneLine = (s, max) => String(s ?? '').replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

// The song the form describes, tidied, and any answers that can't be used.
export function makeSong(form) {
  const problems = [];
  const song = {
    title: oneLine(form.title, 100),
    category: oneLine(form.category, 60),
    words: oneLine(form.words, 120),
    tune: oneLine(form.tune, 120),
  };
  if (song.category && !CATEGORIES.includes(song.category)) problems.push(`"${song.category}" isn't one of the songbook's categories`);
  const book = oneLine(form.source_book, 80), page = oneLine(form.source_page, 10);
  if (book) song.source_book = book;
  if (page) {
    if (/^\d+$/.test(page)) song.source_page = Number(page);
    else problems.push('the source page must be a page number');
  }
  const raw = String(form.lyrics ?? '').replace(/\t/g, '  ').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');
  if (raw.length > 20000) problems.push('the lyrics are longer than 20,000 characters');
  song.lyrics = tidyLyrics(raw.slice(0, 20000));
  const tidied = song.lyrics !== raw.replace(/\r\n?/g, '\n').trim();
  return { song, problems, tidied };
}

// A code fence that the text inside can't close early.
function fenced(text) {
  const fence = '~'.repeat(Math.max(3, ...[...text.matchAll(/~+/g)].map((m) => m[0].length + 1)));
  return `${fence}text\n${text}\n${fence}`;
}

export function submission(issue, existing) {
  const { song, problems, tidied } = makeSong(readForm(issue.body));
  const file = newFileName(song.title || 'song', existing.map((e) => e.file));
  const { errors, warnings } = checkSongs([...existing, { file, song }]);
  const prefix = `${file} (${JSON.stringify(song.title)}): `;
  const mine = (list) => list.filter((m) => m.startsWith(prefix)).map((m) => m.slice(prefix.length));
  const errs = [...problems, ...mine(errors)], warns = mine(warnings);
  const ok = errs.length === 0;

  const read = song.lyrics ? `${outline(song.lyrics)}\n\n${song.title}\nWords: ${song.words}  ·  Tune: ${song.tune}\n\n${preview(song.lyrics)}` : '(no lyrics)';
  const comment = ['<!-- songbook-submission -->'];
  if (ok) {
    comment.push('### ✅ Your song passed its checks', '',
      'A pull request adds it to the songbook. Once it is merged, the song goes live and gets its number automatically.');
  } else {
    comment.push('### ❌ Your song needs a fix before it can be added', '', fenced(errs.map((e) => `- ${e}`).join('\n')), '',
      'Edit this issue to fix it, and it will be checked again.');
  }
  if (warns.length) comment.push('', 'Worth a look:', '', fenced(warns.map((w) => `- ${w}`).join('\n')));
  comment.push('', `Here's how it will read in the songbook: chorus lines are marked │ and repeats ↻.${tidied ? ' Chorus and repeat markers were tidied into the songbook\'s format.' : ''} If anything isn't right, edit this issue.`, '', fenced(read));

  const login = /^[A-Za-z0-9-]{1,39}$/.test(issue.user?.login ?? '') ? issue.user.login : 'a contributor';
  const pr = [`Adds a song submitted in #${issue.number} by @${login}, through the Submit a song form.`, '',
    `Closes #${issue.number}`, '',
    'It passed the songbook\'s checks in the submission job. The deploy gives it its number when this is merged.', '',
    fenced(read)].join('\n');

  return { ok, file, song, comment: comment.join('\n') + '\n', pr: pr + '\n' };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [eventPath, outDir] = process.argv.slice(2);
  const { issue } = JSON.parse(readFileSync(eventPath, 'utf8'));
  const result = submission(issue, readSongs());
  writeFileSync(join(outDir, 'comment.md'), result.comment);
  writeFileSync(join(outDir, 'pr.md'), result.pr);
  if (result.ok) writeFileSync(join(SONGS_DIR, result.file), formatSong(result.song));
  const outputs = `ok=${result.ok}\nfile=${result.file}\ntitle=${result.song.title}\n`;
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, outputs);
  else process.stdout.write(outputs);
  console.error(result.ok ? `ok: ${result.file}` : 'needs a fix');
}
