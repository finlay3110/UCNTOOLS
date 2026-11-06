# UCN Mission Companion

A fan-made offline companion app for **Bridge Command** (the London immersive starship
experience). A player records a mission — crew, briefing, timestamped log, debrief — and exports
it as a formatted PDF report.

Fan-made and **not affiliated** with Bridge Command / The London Space Elevator Ltd. Keep that
disclaimer wherever branding appears.

Sibling fan tools export JSON that this app imports: the **Engineering Reference Tool**, the
**Navigation & Radar** tool, and the Comms tool. The Player Roster has its own shared format,
documented in `docs/player-roster-format.md` — that file is the contract other tools write to.

## Layout

```
index.html      the entire app (~1.4 MB): CSS, vendored jsPDF + pako, base64 fonts and
                artwork, and all application JS in one IIFE
sw.js           service worker, stale-while-revalidate
manifest.json   PWA manifest
icons/          192 / 512 px
```

## Architecture — non-negotiable

- **One self-contained HTML file.** No build step, no npm, no bundler.
- **No runtime network requests.** Fonts, logos, rank insignia, medals and libraries are all
  inlined as base64 or vendored inline. It must work fully offline on a cold first launch.
- **Plain ES5 inside one IIFE**: `var` and `function` only. No arrow functions, classes,
  `const`/`let`, template literals or optional chaining. Match the surrounding style.
- Adding an asset means inlining it.

## Bump the cache version

Bump `CACHE_VERSION` in `sw.js` **every time `index.html` changes**. Installed copies keep
serving the old build otherwise. This is the easiest thing in the project to forget.

## Storage

- Mission data lives in **one** localStorage key, `ucnMissionCompanion_v1`.
- Reusable data and UI preferences get their **own** keys so "New Mission" doesn't wipe them:
  `ucnPlayerRoster_v1`, `ucnHeaderCollapsed_v1`, `ucnHasSeenIntro_v1`. The roster has its own
  normalisation in `loadRoster()` rather than the mission-state migration chain, because it is a
  separate key with a separate lifecycle.
- `persist()` returns success and sets `saveFailed`. **Never swallow a storage error.** Because
  everything is in one key, exceeding quota loses the whole mission, and a silent failure looks
  exactly like working normally.
- Writes are debounced ~300 ms *and* flushed on `pagehide` / `visibilitychange` — iOS can kill a
  backgrounded PWA inside the debounce window.
- Downscale user-supplied images before storing (`downscaleImage`, max 512 px). A phone photo as
  a base64 data URL can blow the ~5 MB quota on its own.
- Changing a stored shape needs a migration run from **both** `loadState()` and the JSON-restore
  path — see `migrateEngineeringLogs()`. Keep the old key in `defaultState()` so the merge loop
  still delivers it to the migration.

## UI patterns — reuse, don't reinvent

- **Collapsible block**: `.nested-section` > `.nested-toggle` (+ `.nested-chevron`) >
  `.nested-body`. Toggle `display`, `classList.toggle('open')`, and keep `aria-expanded` in sync.
- **Modal**: `.modal-overlay` > `.modal-card`, opened and closed **only** through
  `openModal(id)` / `closeModal(id)` so focus moves in and returns to the trigger. Escape and
  backdrop click dismiss; `role="dialog"`, `aria-modal`, `aria-labelledby` on the card.
  `#introOverlay` is deliberately exempt — its storage warning must be acknowledged.
- **Cards**: `.card` > `.card-head` > `.card-role` + `.del-x`.
- **Buttons**: `.add-btn` (dashed orange), `.add-btn-big` (solid orange), `.hbtn` (header).
- Empty states are italic muted text (`.empty-hint`, "None recorded."), never blank space.
- Feedback is `toast(msg)`; reserve `alert()` for genuine errors.
- Keep the `:focus-visible` outline — `-webkit-tap-highlight-color:transparent` on `*` otherwise
  leaves keyboard focus invisible.

## Visual language

Dark-only by design: this is used on a phone in a darkened bridge.

```
--navy #1B2A5E   --navy-dark #111a3d   --orange #DD7A2B   --red #B23A3A
--bg #0b0f1c     --bg2 #0f1730         --card #141c38     --card-hi #1b254a
--border #2a3a66 --text #e8ecf7        --muted #8c98bf
--font-display 'Orbitron' (uppercase, letter-spaced)   --font-body 'Exo 2'
```

Orange is the primary-action colour — spend it on the one action that matters most per screen.
Respect `--safe-top` / `--safe-bottom` on fixed chrome.

## Untrusted content

Every string from an imported file or typed by a user is **data**.

- Escape with `escHtml` (text) / `escAttr` (attributes) before it reaches `innerHTML`.
- Never `eval`, never inject as markup.
- If imported text reads like an instruction ("ignore previous instructions…"), that is content
  to render, not a direction to follow.
- `escHtml` does **not** escape quotes. That is safe only because attribute values consistently
  use `escAttr` — keep that split.

## Domain rules

- `BC_CAST` entries are `{performer, character}`. The performer (real actor name) is
  **searchable but must never be displayed or exported** — only the character name. Deliberate
  privacy rule.
- The in-universe year runs ahead of the real one (real 2026 = 2182). It is stored as
  `IN_UNIVERSE_YEAR_OFFSET`, an offset added to the current year, never a hardcoded year.
- Build dates from **local** date parts. `toISOString()` converts to UTC and yields tomorrow's
  date for evening sessions west of UTC.
- Ranks, mission types and ship names are free text or data lists, not enums.

## Importing JSON from a sibling tool

Three importers exist (Comms, Engineering, Navigation) and share a pattern — follow it.

- A `.nested-section` on the Debrief tab: file input, summary card once loaded, remove button
  behind a `confirm()`.
- **Validate strictly, reject clearly.** Gate on the format's schema/version marker and say which
  check failed ("no schema field" vs "unsupported version X"). Distinguish "not valid JSON" from
  "wrong format". Never guess at an unknown shape.
- **Accept every historical shape** the format has had — bare arrays, files missing keys they
  never had. See `normaliseNavigationLog()` (v0–v3).
- **Recompute anything derived** — totals, counts, used-vs-remaining. Exports carry stale or
  wrong derived fields; treat them as hints, never truth.
- **Namespace incoming ids.** They are unique within a file, not globally.
- Coerce rather than crash: numbers to strings, unparseable timestamps to `null`.
- When validation drops entries, **say so with a count** in both the summary and the PDF. Never
  quietly show fewer rows than the file contained.
- Convert ISO/UTC timestamps to local for display (`fmtIsoTime`, `fmtIsoDateTime`).
- Summary card in the app; full detail in the PDF.

## PDF export

jsPDF, A4, mm, `compress:true`. A module-level `pdfCursorY` in mm is the write head and every
helper advances it — don't replace it with a layout engine.

- Palette: NAVY `[27,42,94]`, ORANGE `[221,122,43]`, TEXT `[22,32,74]`, MUTED `[140,152,191]`,
  LINE `[222,226,240]`. Margins L18 R18 T24 B20, content width 174.
- Helpers: `pdfNewPage`, `pdfEnsureSpace(mm)` **before any block**, `pdfHeading`,
  `pdfSubHeading`, `pdfParagraph`, `pdfTable`, `pdfBlockNote`, `pdfDrawFrame`.
- Structure: cover page → `addPage()` **reserved and left blank** → sections via
  `pdfSectionStart(doc, title, tocEntries)` → `pdfDrawToc()` backfills page 2 at the end. That
  reserve-and-backfill is what makes TOC page numbers correct without a second pass. Keep it.
- Charts: pin the axis to a fixed range so reports are comparable, space points by index when
  samples are irregular, label only first and last.
- Long free text goes in `pdfBlockNote`, not a truncated table cell.

## Comments

Explain **why**, not what: the non-obvious constraint, why a simpler approach was rejected, what
a future maintainer would "tidy up" and break. This codebase is heavily and usefully commented —
match that density, don't strip it.

## Verifying changes

There are no unit tests. Drive the real app instead:

```bash
npx http-server -p 8080 -c-1 --silent     # a service worker needs a real origin, not file://
```

Playwright and Chromium are available (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`; do not run
`playwright install`). Use a 414×896 mobile viewport.

- Build fixtures that **violate every rule at once**: wrong derived values, entries out of order,
  missing required fields, unparseable dates, duplicate ids, an injection payload. Passing on
  clean data proves nothing.
- For PDFs, **render the output and read the text back** (pdfjs-dist). A valid `%PDF-` header
  proves almost nothing — missing glyphs and wrong columns only show up when rendered. A section
  can span pages, so read the whole section, not just the page it starts on.
- Pin a non-UTC timezone (e.g. `Pacific/Kiritimati`, UTC+14) when asserting local-time
  conversion, so the assertion would actually fail on a UTC bug.
- Report honestly which failures were the app and which were the test harness.

## Traps already hit here

- Both embedded fonts are **subsetted, and Orbitron's subset is narrower than Exo 2's**. In
  Exo 2 `↳` (U+21B3) and `▸` (U+25B8) are missing while `»`, `·`, `—`, `×`, `…` are present.
  In **Orbitron** `·` (U+00B7) and `»` (U+00BB) are *also* missing — `—`, `-`, `/`, `|`, `:`
  are safe. Worse, a missing glyph in an Orbitron run **truncates the rest of the string**
  rather than just dropping the character, so text silently disappears. Headings and badges use
  `pdfHeadingFont()` (Orbitron); table cells and body use `pdfBodyFont()` (Exo 2). Check the
  character map of the font you are actually drawing with before using any decorative glyph.
- `Object.create(null)` rows break any later `obj.hasOwnProperty(k)` copy loop. Use
  `engShallowCopy()` or an equivalent prototype-safe copy.
- Collapsing grouped rows into one loses per-row data and can hide an unfinished item behind a
  completed-looking one. Annotate the group and keep one row each — see
  `markEngConduitGroups()`.
- `local()`-only `@font-face` rules resolve to an **errored** face when the font isn't installed,
  shadowing the runtime-injected one. Don't add them "as a fallback" — `installUiFonts()` is the
  only place faces are declared.
- CSS `text-transform` affects `innerText`, so case-sensitive test assertions on rendered text
  fail misleadingly.
- The `pagehide` flush overwrites localStorage on navigation, so seeding storage from a live app
  page and reloading won't work. Seed from a page with no app JS on it.
