// "What's new" for the homepage, written in at deploy from merged pull
// requests: each "What's new: …" line in a pull request's description, and
// every song added through the Submit a song form. Nothing is committed.
//   node .github/scripts/whats-new.js            writes the list into index.html
//   node .github/scripts/whats-new.js --discord  prints the Discord message for
//                                                the pull request being deployed
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const SHOWN = 6;
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// What a merged pull request tells players, as plain lines of text.
function entries(pr) {
  if ((pr.headRefName || '').startsWith('song-submission/')) {
    const title = pr.title.replace(/^Songbook: add\s+/, '').trim();
    return title ? ['New in the Shanty Songbook: ' + title] : [];
  }
  return [...(pr.body || '').matchAll(/^What's new:[ \t]*(.+?)\s*$/gm)].map(m => m[1]);
}

// The newest entries first, as list items with their date.
function render(prs, now = new Date()) {
  const items = prs.filter(pr => pr.mergedAt).sort((a, b) => b.mergedAt.localeCompare(a.mergedAt))
    .flatMap(pr => entries(pr).map(text => ({ text, at: pr.mergedAt.slice(0, 10) }))).slice(0, SHOWN);
  const day = iso => new Date(iso + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  return items.map(i => `<li><time datetime="${i.at}">${day(i.at)}</time> ${esc(i.text)}</li>`);
}

function writeInto(html, lines) {
  const re = /(<!-- whats-new -->\n)[\s\S]*?(\n[ \t]*<!-- \/whats-new -->)/;
  if (!re.test(html)) throw new Error('index.html: the whats-new markers are missing');
  return lines.length ? html.replace(re, (_, a, b) => a + lines.map(l => '        ' + l).join('\n') + b) : html;
}

module.exports = { entries, render, writeInto };

if (require.main === module) {
  const prs = JSON.parse(execFileSync('gh', ['pr', 'list', '--state', 'merged', '--base', 'main', '--limit', '60',
    '--json', 'number,title,body,mergedAt,headRefName'], { encoding: 'utf8' }));
  if (process.argv.includes('--discord')) {
    // A deploy of a merge commit is that pull request going live.
    const m = execFileSync('git', ['log', '-1', '--format=%s', process.env.GITHUB_SHA || 'HEAD'], { encoding: 'utf8' }).match(/^Merge pull request #(\d+)/);
    const pr = m && prs.find(p => p.number === +m[1]);
    const lines = pr ? entries(pr) : [];
    if (lines.length) {
      const content = ['**UCN tools update**', ...lines.map(l => '• ' + l), '<https://finlay3110.github.io/UCNTOOLS/>'].join('\n').slice(0, 1900);
      // No @everyone or other mentions, whatever the text says.
      process.stdout.write(JSON.stringify({ content, allowed_mentions: { parse: [] } }));
    }
  } else {
    const file = path.join(__dirname, '..', '..', 'index.html');
    fs.writeFileSync(file, writeInto(fs.readFileSync(file, 'utf8'), render(prs)));
    console.log('whats-new: ' + render(prs).length + ' entries');
  }
}
