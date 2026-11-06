// Scans /pdfs, treating each subfolder as a category, and writes manifest.json.
// Runs automatically on every deploy (see .github/workflows/deploy.yml) — so dropping a
// new PDF into a category folder and pushing to git is all that's needed for
// it to appear on the site. No manual editing of index.html required.

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PDFS_DIR = path.join(ROOT, 'pdfs');
const OUT_FILE = path.join(ROOT, 'manifest.json');

// The ship maps are kept once, in the Engineering tool, and copied in here so
// the two tools can never show different maps. The copies are not committed.
const SHIP_MAPS = [
  ['HAVOCK_SHIP_MAP.pdf', 'havock-ship-map.pdf'],
  ['Takanami_Ship_Map.pdf', 'takanami-ship-map.pdf'],
];
function copyShipMaps() {
  const from = path.join(ROOT, '..', 'engineering', 'ship-maps');
  const to = path.join(PDFS_DIR, 'SHIP LAYOUTS');
  if (!fs.existsSync(from)) return;   // this folder used on its own
  fs.mkdirSync(to, { recursive: true });
  for (const [src, dest] of SHIP_MAPS) fs.copyFileSync(path.join(from, src), path.join(to, dest));
}

function titleCase(str) {
  return str
    .replace(/[-_]/g, ' ')
    // Only capitalise at a real word start — not after an apostrophe, which
    // would turn "Ship's Manifest" into "Ship'S Manifest".
    .replace(/(^|[^A-Za-z'])(\w)/g, (m, before, c) => before + c.toUpperCase());
}

function buildManifest() {
  copyShipMaps();
  const manifest = {
    generated: new Date().toISOString(),
    categories: [],
  };

  if (!fs.existsSync(PDFS_DIR)) {
    console.warn(`No pdfs/ folder found at ${PDFS_DIR} — writing empty manifest.`);
    fs.writeFileSync(OUT_FILE, JSON.stringify(manifest, null, 2));
    return;
  }

  const categoryDirs = fs
    .readdirSync(PDFS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  const skipped = [];

  for (const dir of categoryDirs) {
    const categoryPath = path.join(PDFS_DIR, dir.name);
    const entries = fs.readdirSync(categoryPath, { withFileTypes: true });

    // Anything that is not a top-level .pdf is invisible to the site. Say so,
    // rather than letting a misfiled PDF disappear without explanation.
    for (const entry of entries) {
      const rel = `pdfs/${dir.name}/${entry.name}`;
      if (entry.isDirectory()) {
        skipped.push(`${rel}/ — nested folders are not scanned; move the PDFs up one level or make it its own category`);
      } else if (!entry.name.toLowerCase().endsWith('.pdf') && entry.name !== '.gitkeep') {
        skipped.push(`${rel} — not a .pdf`);
      }
    }

    const files = entries
      .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.pdf'))
      .map((e) => e.name)
      .sort((a, b) => a.localeCompare(b));

    manifest.categories.push({
      id: dir.name,
      label: titleCase(dir.name),
      files: files.map((filename) => {
        const stat = fs.statSync(path.join(categoryPath, filename));
        return {
          name: titleCase(filename.replace(/\.pdf$/i, '')),
          filename,
          path: `pdfs/${dir.name}/${filename}`,
          size: stat.size,
          modified: stat.mtime.toISOString(),
        };
      }),
    });
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(manifest, null, 2));

  const totalFiles = manifest.categories.reduce((n, c) => n + c.files.length, 0);
  console.log(
    `manifest.json built: ${manifest.categories.length} categories, ${totalFiles} PDFs.`
  );

  if (skipped.length) {
    console.warn(`\n${skipped.length} item(s) skipped and will NOT appear on the site:`);
    for (const line of skipped) console.warn(`  - ${line}`);
  }
}

buildManifest();
