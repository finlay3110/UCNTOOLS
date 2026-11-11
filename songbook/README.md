# UCN Songbook

A fan-made digital songbook for the **United Confederation Navy (UCN)** community — a Bridge Command LARP group. Browse, search, and export the full songbook as a print-ready PDF, right from your phone or desktop.

🔗 **Live app:** [finlay3110.github.io/UCNTOOLS/songbook](https://finlay3110.github.io/UCNTOOLS/songbook/)

> **Disclaimer:** This is a fan-made project and is not approved by or affiliated with Bridge Command / The London Space Elevator Limited. The UCN logo is the property of Bridge Command / The London Space Elevator Limited. Song lyrics are the property of their respective copyright holders; UCN-themed songs are reproduced here as original fan parodies.

---

## Features

- 🔍 **Search** by title, tune, author **or lyrics** — punctuation- and accent-insensitive, with matches highlighted and a snippet shown for lyric matches
- 🗂️ **Category filters** (Patriotic, Bar/Drinking, Traditional, Improvised, and more)
- ⭐ **Favourites** with a dedicated filter tab
- 📋 **Set lists** — line songs up in the order you'll sing them (the list button on any song), reorder them, step through with "Next in the set", and share the whole set as one link (`#/set/12,4,31`) that the other person can save as theirs
- 🎨 **Chorus highlighting**, adjustable text size, light/dark/auto themes, and a dyslexia-friendly font option
- 🔗 **Shareable links** — every song has its own URL (`#/song/45`), and the back button works the way you expect
- 📖 **Source book & page references** for songs from the physical booklets
- 🎵 **Auto-scroll** and **keep-screen-awake** for singing hands-free
- 📄 **PDF export** — the whole songbook, the current filter, or just your favourites, with cover page, table of contents, per-section divider pages and a corner-frame design on every page
- 📱 **Installable and fully offline** — add it to your home screen and it works with no signal at all

---

## File structure

```
├── index.html                 # Markup, the SVG icon sprite, and PWA wiring
├── styles.css                 # All styling, including the light/dark themes
├── app.js                     # App logic — search, filtering, routing, settings
├── lyrics.js                  # Shared lyric parser (used by the app AND the PDF)
├── songs/                     # One .txt file per song — add or edit songs here
├── pdf-export.js              # PDF export engine (jsPDF + fonts + logo/QR assets)
│                              # Lazily loaded only when someone exports,
│                              # so normal browsing never downloads it
├── sw.js                      # Service worker — precaches the app for offline use
├── manifest.webmanifest       # Makes the app installable to a home screen
├── fonts/                     # Self-hosted Exo 2 + OpenDyslexic (OFL, see LICENSE.md)
├── icons/                     # App icons for install / home screen / favicon
└── tools/
    ├── songs-lib.mjs           # Reads, checks, numbers and tidies the song files
    ├── validate-songs.mjs      # Checks every song (CI runs it on each change)
    ├── number-songs.mjs        # Gives new songs their id (the deploy runs it)
    ├── build-songs.mjs         # Builds songs.json from songs/ (the deploy runs it)
    ├── submission.mjs          # Turns a "Submit a song" issue into a song file
    └── test.mjs                # Tests for all of the above
```

The app fetches one `songs.json` at runtime. That file is **built, not edited**: the deploy combines the files in `songs/` into it (`node tools/build-songs.mjs` does the same locally). The `tools/` folder has no effect on the live app.

Apart from that one step, plain HTML, CSS and JavaScript, edited and deployed as-is.

---

## Adding a new song

**The easy way:** fill in the [Submit a song](https://github.com/finlay3110/UCNTOOLS/issues/new?template=submit-a-song.yml) form (also linked from the app's About sheet). A bot tidies the chorus and repeat markers, checks the song, and replies with a preview of how it will read. If it passes, the bot opens a pull request; if not, it says what to fix, and editing the issue checks it again. Merge the pull request and the song goes live.

> The bot can only open pull requests once **Settings → Actions → General → Allow GitHub Actions to create and approve pull requests** is switched on.

**By hand:** add a file to `songs/`, run `node tools/validate-songs.mjs`, and open a pull request. The validator also runs automatically on every pull request (`.github/workflows/songbook-validate.yml` at the repo root).

**Leave the `id` out of a new song.** When the change reaches `main`, the deploy gives each new song the next free number and saves it back to its file, one deploy at a time, so two songs merged together never clash. Never change an existing song's id: favourites, set lists and shared links all point at it.

### Song file format

`songs/song-title.txt`:

```text
id: 75
title: Song Title
category: Bar/Drinking Songs
words: Author Name
tune: Original Tune; Composer
source_book: UCN Songbook
source_page: 12
---
Verse one line one
Verse one line two

Chorus:
Chorus line one
Chorus line two

Repeat chorus
```

Details above the `---`, lyrics below it, written exactly as they should appear.

**Field reference:**

| Field | Description |
|---|---|
| `id` | Unique number. Leave it out of a new song: it's added on merge |
| `title` | Song title as shown in the app |
| `category` | Must exactly match one of the categories listed below |
| `words` | Lyric author / credit |
| `tune` | Original tune the song is sung to |
| lyrics | Everything below the `---` (see formatting rules below) |
| `source_book` | Name of the physical booklet. Optional |
| `source_page` | Page number in that booklet (a whole number). Optional |

**Valid categories:**
`Patriotic Songs` · `Bar/Drinking Songs` · `Crew Ballads` · `Accompanied Songs` · `Songs About Us` · `Fragments and Works in Progress` · `Traditional Songs` · `Movie/TV` · `Improvised Songs` · `Folk & Other`

Adding a brand-new category also needs an icon adding to `CAT_ICON_NAMES` in `app.js` — the validator will tell you if you forget.

### Lyrics formatting

Blocks are separated by a **blank line**. The first line of a block can be a heading:

| Syntax | Result |
|---|---|
| `Chorus:` | Highlighted chorus box |
| `[Chorus]`, `[Chorus 1:]`, `[Second Chorus]`, `[Refrain]` | Also a chorus box, labelled with whatever you wrote |
| `Repeat chorus` alone on a line | Italic repeat marker |
| `[Repeat Chorus 2]` | Repeat marker pointing at a specific chorus |
| `[Verse 2]`, `[Bridge]`, `[Outro]` | Small labelled section heading — the lines under it stay ordinary lyrics |

A heading only works as the **first line of a block**, so always leave a blank line above it. The validator catches it when you forget, and the submission form's bot fixes it for you.

---

## Offline & installing

The app registers a service worker (`sw.js`) that precaches the shell — HTML, CSS, JS, fonts, icons and `songs.json` — so it opens with no connection at all. On a phone, use "Add to Home Screen" and it behaves like an app.

iOS gives web pages no way to trigger an install, so the app shows a dismissible hint on
iPhone and iPad pointing at the Share button. It appears only when the app is not already
installed, and stays gone once dismissed; the same instructions live permanently in the
About sheet.

- `songs.json` is fetched network-first, so song edits appear as soon as there is a connection, falling back to the cached copy.
- `pdf-export.js` (~900KB) is deliberately **not** precached. It is cached the first time someone exports, and works offline after that.

> **When you change `index.html`, `app.js`, `lyrics.js` or `styles.css`, bump `VERSION` at the top of `sw.js`.** Otherwise returning visitors keep the old cached copy.

---

## PDF Export

The export button offers three scopes — the whole songbook, the current filter, or just your favourites — and generates:

- Cover page with logo and a QR code linking back to the live app
- Table of contents with clickable links and real page numbers
- A dedicated divider page per category, each with its own mini table of contents
- Every song on its own page, with automatic page-break handling for long songs
- Custom embedded fonts (Exo 2 + Orbitron), with automatic fallback to a standard font if embedding fails
- Built entirely with [jsPDF](https://github.com/parallax/jsPDF) (MIT licensed, embedded directly — no external CDN calls)

---

## Notes for maintainers

**Lyric parsing lives in one place.** `lyrics.js` turns a song's `lyrics` string into typed blocks (`verse`, `chorus`, `label`, `repeat`), and both the app and the PDF exporter render from that. The two used to carry separate copies of this logic, which drifted — a chorus-detection bug had to be found and fixed in both, and it wasn't. If you change how lyrics are interpreted, change it in `lyrics.js` only.

**Keyboard shortcuts:** `/` focuses search, `r` opens a random song, `Space` toggles auto-scroll in a song, `Esc` backs out.

---

## Credits

- **Made by:** Sub Lt Tetra — Discord: `finlay3110`
- **Original Songbook:** Compiled by Lt. Cmdr. Jim — Ship's Councillor
- **Traditional Songs booklet:** Lt. Dorward
- **Fonts:** Exo 2 and OpenDyslexic, both SIL Open Font License 1.1 — see [`fonts/LICENSE.md`](fonts/LICENSE.md)

## Requesting updates or reporting an issue

Post in the `#songbook` channel on the BC Discord server, or DM Tetra directly.
