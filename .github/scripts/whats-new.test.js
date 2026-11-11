// Checks whats-new.js. Run: node .github/scripts/whats-new.test.js
const assert = require('node:assert/strict');
const { entries, render, writeInto } = require('./whats-new.js');

const pr = (n, at, body, extra = {}) => ({ number: n, title: 'T', body, mergedAt: at, headRefName: 'x', ...extra });
assert.deepEqual(entries(pr(1, 'x', "Intro\n\nWhat's new: One thing.\nWhat's new:   Another.  \nnot What's new: this")), ['One thing.', 'Another.']);
assert.deepEqual(entries(pr(2, 'x', 'Nothing for players')), []);
assert.deepEqual(entries(pr(3, 'x', '', { headRefName: 'song-submission/32', title: 'Songbook: add Lowlands Away' })), ['New in the Shanty Songbook: Lowlands Away']);

const list = render([
  pr(1, '2026-11-09T10:00:00Z', "What's new: Older."),
  pr(2, '2026-11-11T10:00:00Z', "What's new: <b>Newest</b> & best."),
  pr(3, null, "What's new: Never merged."),
  ...Array.from({ length: 8 }, (_, i) => pr(10 + i, '2026-11-10T0' + i + ':00:00Z', "What's new: Middle " + i)),
]);
assert.equal(list.length, 6, 'only the newest six');
assert.equal(list[0], '<li><time datetime="2026-11-11">11 Nov</time> &lt;b&gt;Newest&lt;/b&gt; &amp; best.</li>', 'newest first, escaped');
assert.ok(!list.join().includes('Never merged') && !list.join().includes('Older'));

const page = '<ul>\n<!-- whats-new -->\n<li>placeholder</li>\n      <!-- /whats-new -->\n</ul>';
assert.equal(writeInto(page, ['<li>a</li>']), '<ul>\n<!-- whats-new -->\n        <li>a</li>\n      <!-- /whats-new -->\n</ul>');
assert.equal(writeInto(page, []), page, 'nothing to show keeps the placeholder');
assert.throws(() => writeInto('<ul></ul>', ['x']), /markers/);
console.log('whats-new: all checks passed');
