# UCN Tactical Aids Archive

A self-updating library site for tactical aid PDFs, grouped by category and
hosted on GitHub Pages as part of the UCN tools site.

## How it works

- Each folder inside `/pdfs/` is a **category** and becomes a tab on the site.
- Every `.pdf` file inside a category folder is automatically listed —
  no need to touch `index.html`.
- On every deploy (`.github/workflows/deploy.yml` at the repo root), `build-manifest.js` scans `/pdfs/` and regenerates
  `manifest.json`, which the page reads to build its tabs, search, and cards.

## Adding a new PDF

1. Drop the PDF into the right category folder, e.g. `pdfs/medical/burns-triage.pdf`
2. Commit and push to git.
3. GitHub Actions rebuilds automatically → the new PDF appears on the site within
   a minute or two. Nothing else to edit.

File and category names are auto-titled for display, e.g.
`reactor-shutdown-sequence.pdf` → "Reactor Shutdown Sequence".
Use hyphens or underscores in filenames/folder names; they're converted to
spaces automatically.

Only `.pdf` files sitting **directly** inside a category folder are picked up.
Nested folders and non-PDF files are skipped, and `build-manifest.js` prints a
warning naming each one it ignored — so if something doesn't show up on the
site, check the build log first.

## Adding a new category

Just create a new folder under `/pdfs/`, e.g. `pdfs/communications/`, and add
PDFs to it. It'll show up as a new tab automatically on next deploy.

To keep a category visible while it's still empty, put a `.gitkeep` file in it
— git won't track an otherwise empty folder, so the tab would vanish.

## Working on the site locally

`fetch()` is blocked on `file://`, so opening `index.html` directly won't load
the manifest. Serve the folder instead:

```sh
node build-manifest.js   # build manifest.json (and copy in the ship maps)
npx serve .              # or: python3 -m http.server
```

`manifest.json` is not committed: the deploy builds it from `pdfs/` every time,
so there is nothing to keep in step by hand. The **SHIP LAYOUTS** maps come from
`engineering/ship-maps/`, copied in by the same script, so update them there.

## Sharing links

The active category, search term and open document are kept in the URL, so a
link like `…/#cat=navigation` or `…/#doc=pdfs/engineering/warp-guide.pdf` opens
straight to that view.

## Offline use

`sw.js` is a service worker that caches the site shell and every PDF you open,
so previously-viewed aids stay available with no signal. The PDF list itself is
fetched network-first, so newly deployed aids appear as soon as you're online.
The site can also be installed to a phone home screen via `app.webmanifest`.

If you change caching behaviour, bump `CACHE_VERSION` in `sw.js` to push
clients onto a fresh cache.
