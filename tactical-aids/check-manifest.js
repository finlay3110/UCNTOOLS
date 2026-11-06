// Verifies the committed manifest.json still matches what's on disk.
//
// It compares only the fields that are reproducible: a fresh git checkout gives
// every file a new mtime, so `generated` and `modified` are ignored — comparing
// them would make this fail on every run regardless of content.

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const MANIFEST = path.join(__dirname, 'manifest.json');

function stable(manifest) {
  return (manifest.categories || []).map((c) => ({
    id: c.id,
    label: c.label,
    files: (c.files || []).map((f) => ({
      name: f.name,
      filename: f.filename,
      path: f.path,
      size: f.size,
    })),
  }));
}

const committed = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const before = JSON.stringify(stable(committed), null, 2);

execFileSync(process.execPath, [path.join(__dirname, 'build-manifest.js')], { stdio: 'inherit' });

const rebuilt = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const after = JSON.stringify(stable(rebuilt), null, 2);

if (before !== after) {
  console.error('\nmanifest.json is out of date with the pdfs/ folder.');
  console.error('Run `node build-manifest.js` and commit the result.\n');
  console.error('Committed:\n' + before);
  console.error('\nExpected:\n' + after);
  process.exit(1);
}

console.log('manifest.json is up to date.');
