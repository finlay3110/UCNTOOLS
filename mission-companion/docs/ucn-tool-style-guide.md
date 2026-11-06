# UCN tool style guide

The shared house style for the UCN fan tools for **Bridge Command** — the Mission Companion, the
Engineering Reference Tool, the Navigation & Radar tool, the Comms tool, and anything added later.

**Paste this whole file into an LLM** before asking it to build or change one of these tools. It is
written to be read cold, with no other context. `CLAUDE.md` in this repo is the Mission Companion's
own file; this is the suite-wide one.

Fan-made and **not affiliated** with Bridge Command / The London Space Elevator Limited. Keep that
disclaimer somewhere unobtrusive in every tool — a More menu, not the main screen.

---

## 1. Non-negotiable architecture

- **One self-contained HTML file per tool.** No build step, no npm, no bundler.
- **No runtime network requests of any kind.** Fonts, logos, insignia and libraries are inlined as
  base64 or vendored inline. Every tool must work fully offline on a cold first launch with no
  signal. No Google Fonts, no icon CDNs, no analytics.
- **Plain ES5 inside one IIFE:** `var` and `function` only. No arrow functions, classes,
  `const`/`let`, template literals or optional chaining. Match the surrounding style.
- **PWA:** link `manifest.json`, register `sw.js`, and skip registration on `file://` — service
  workers don't exist there and attempting it only logs an error.
- **Bump `CACHE_VERSION` in `sw.js` every time the HTML changes.** Installed copies keep serving
  the old build otherwise. This is the single easiest thing to forget.

## 2. The feel

A naval bridge console: dark, high-contrast, navy and amber. Used one-handed on a phone, in a
darkened room, mid-session, by someone who is also doing something else. Dense and functional, not
airy.

Mobile-first — design for ~414×896. Let the column centre with a `max-width` around 520px rather
than building a desktop layout.

**Dark only. Never add a light variant or a theme switch.**

## 3. Palette and type

```css
:root{
  color-scheme: dark;
  --navy:#1B2A5E;  --navy-dark:#111a3d;  --orange:#DD7A2B;  --red:#B23A3A;
  --white:#ffffff;
  --bg:#0b0f1c;    --bg2:#0f1730;
  --card:#141c38;  --card-hi:#1b254a;    --border:#2a3a66;
  --text:#e8ecf7;  --muted:#8c98bf;
  --font-display:'Orbitron', 'Exo 2', system-ui, sans-serif;
  --font-body:'Exo 2', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
}
```

**Orbitron** for structural text — app title, section headings, badges, nav labels, clocks. Always
uppercase, letter-spacing 0.04–0.10em. **Exo 2** for body text and inputs.

Small and dense: 9–10px uppercase labels, 13–14px body, 15px app title.

**Orange is the primary-action colour.** One solid orange call-to-action per screen, plus section
headings. If two things are orange, one of them is wrong. Red means destructive or critical and
nothing else.

Respect `--safe-top` / `--safe-bottom` on all fixed chrome.

## 4. Background — both layers required

```css
body{
  background:radial-gradient(ellipse at top, #101a38 0%, var(--bg) 55%);
  overscroll-behavior:none;
}
body::before{                       /* faint amber graph-paper grid */
  content:''; position:fixed; inset:0; pointer-events:none; z-index:0;
  background-image:
    linear-gradient(rgba(221,122,43,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(221,122,43,0.025) 1px, transparent 1px);
  background-size:28px 28px; opacity:0.5;
}
```

Content sits at `z-index:1`. These two layers do most of the "console" work. If a build feels off
despite matching colours, this is usually what's missing.

## 5. Layout shell

- **Fixed header** holding identity plus the metadata you set once per session, with a Hide toggle
  whose state is remembered. Publish its height as `--header-h`; `main` uses it as `padding-top`.
- **Fixed bottom nav**, 3–5 tabs. `main` reserves `padding-bottom: calc(84px + var(--safe-bottom))`.
- **Tab panels:** one visible at a time, `padding:12px 12px 24px`, 0.18s fade-up on switch.

## 6. Components

**Section heading**

```css
.section-title{
  font-family:var(--font-display); font-size:13px; letter-spacing:0.1em;
  text-transform:uppercase; color:var(--orange); font-weight:700;
  margin:18px 0 8px; padding-bottom:6px; border-bottom:1px solid var(--border);
}
.section-sub{ font-size:11px; color:var(--muted); margin:-4px 0 10px; }
```

Use the sub-line. It is where you say the thing the user would otherwise have to guess.

**Card** — the workhorse container

```css
.card{
  background:linear-gradient(160deg, var(--card) 0%, var(--card-hi) 100%);
  border:1px solid var(--border); border-radius:14px; padding:12px 12px 10px;
}
```

With a head row: a **role badge** left (Orbitron 12px uppercase, white on `--navy`, 1px orange
border, radius 7px, padding 4px 9px) and a **delete button** right — a 30px circle,
`rgba(178,58,58,0.18)` fill, 1px red border, `✕` in `#ff9d9d`.

**Field**

```css
label{ display:block; font-size:10px; text-transform:uppercase; letter-spacing:0.06em;
       color:var(--muted); font-weight:600; margin-bottom:3px; }
input, select, textarea{
  width:100%; background:rgba(255,255,255,0.05); border:1px solid var(--border);
  color:var(--text); border-radius:9px; padding:10px; font-size:14px;
  font-family:var(--font-body);
  transition:border-color .2s, background-color .2s;
}
input:focus, select:focus, textarea:focus{
  outline:none; border-color:var(--orange); background:rgba(221,122,43,0.08);
}
textarea{ resize:vertical; min-height:70px; line-height:1.5; }
select option{ color:#16204a; background:#ffffff; }
```

`select option` needs that explicit colour or options render unreadable on some platforms. Two
fields side by side go in a flex row with `gap:8px`, each `flex:1; min-width:0`.

**Buttons**

- Primary: solid orange, radius 16px, padding 22px 14px, 17px bold, soft orange glow. Deliberately
  tall — it must be hittable without looking.
- "Add another": full width, **dashed** 1.5px orange border on `rgba(221,122,43,0.12)`, radius
  12px, orange text, prefixed `＋`.
- Header: small, radius 9px, 11px uppercase bold, icon stacked over label.

Dashed-orange reads as the same family as the solid primary — "this also files a record" — while
keeping the hierarchy legible. Never promote a secondary action to solid orange.

**Collapsible section** — a muted full-width toggle row with a `▾` chevron that rotates 180° when
open, above a hidden body. Use it for anything optional so the main flow stays short.

**Bottom nav** — 20px emoji over a 9.5px uppercase label; inactive `rgba(255,255,255,0.55)`, active
white with a 3px orange marker across the top.

**Toast** — orange pill, `#241100` text, bottom-centre above the nav, radius 24px, fades up over
0.25s, gone after ~1.8s. `role="status"`, `aria-live="polite"`. Use instead of `alert()` for
anything that isn't an error. Put something useful in it: not "Saved" but "Logged at 21:14".

**Modal** — a **bottom sheet**, not a centred dialog: full width, `max-width:520px`,
`max-height:88vh`, `border-radius:18px 18px 0 0`, 2px orange top border, on an
`rgba(8,12,24,0.72)` scrim.

**Toggle switch** — 46×26 pill, white 20px knob, orange when on. Use a switch, not a bare
checkbox, for booleans in a form.

## 7. Interaction rules

- `*{ -webkit-tap-highlight-color:transparent }` kills the touch flash — but you **must** then add
  `:focus-visible{ outline:2px solid var(--orange); outline-offset:2px }` or keyboard focus
  becomes invisible.
- Modals close on Escape and backdrop click; move focus into the sheet on open and return it to the
  trigger on close. `role="dialog"`, `aria-modal`, `aria-labelledby`. The one exception is a
  first-run warning the user must acknowledge — exclude that from dismissal.
- Collapsible toggles carry `aria-expanded` / `aria-controls`, kept in sync.
- Empty states always say something in italic muted text ("None recorded."), never blank space. If
  a filter can hide everything, that is a *different* state and must read differently.
- Destructive actions confirm first, and the confirmation says what is lost.
- Honour `prefers-reduced-motion` by dropping transitions.
- Icons are emoji, deliberately: zero weight, render everywhere. Sparse and functional
  (📋 👥 🗒️ ⏱️ 🎖️ 🔧 🧭 ⚡ ☢️). Never where a word is clearer.

## 8. Shared data

Use these verbatim so every tool offers the same options. All dropdowns lead with a `— Select —`
option whose value is `""`.

```js
var RANKS = ['Cadet','Ensign','Sub Lt','Lieutenant','Lt Cmdr','Commander','Captain',
             'Commodore','Rear Admiral','Vice Admiral','Admiral','Admiral of the Fleet'];

var SHIPS = ['UCS Takanami','UCS Havock'];      // plus "Other…" revealing a text field

var MISSION_TYPES = ['Frontline','Diplomacy','Exploration','Intrigue','Military','Campaign'];

var AUTHORISATIONS = ['Diplomatic protocol','Engage with discretion','Seek and destroy'];

var THREAT_LEVELS = ['Monitor (Green)','Alert (Orange)','Active (Red)'];

var SHIP_ROLES = ['Captain','First Officer','Helm','Navigation','Comms','Power Management',
                  'Damage Control','Radar','Drone Operator','Beams','Missiles'];

var SHUTTLE_ROLES = ['Shuttle Helm','Shuttle Generalist','Shuttle Engineer'];

var PRONOUN_PRESETS = ['he/him','she/her','they/them','he/they','she/they'];
```

Rules:

- **Ranks, roles and ship names are data lists, not closed enums.** Offer an "Other…" option that
  reveals a free-text input and store the typed value, not the sentinel. A value arriving from
  another tool that isn't on the list is **kept verbatim**, not discarded.
- **Threat level is colour-coded** — tint the select's border/background green, orange or red to
  match.
- **"Campaign" mission type is special:** selecting it reveals extra fields (Campaign Mission name,
  Group Name, optional Group Logo) hidden for every other type.
- Briefing notes are **free text**, not a dropdown — a large textarea alongside the Authorisation
  and Threat Level selects.

## 9. The Setup tab

Every tool opens on a **Setup** tab holding who is logging and what the sortie is. First tab in the
bottom nav.

| Field | Control | Notes |
|---|---|---|
| Logged By | text | name or callsign of the person keeping this log |
| Rank | select | `RANKS` |
| Role | select | `SHIP_ROLES` + `SHUTTLE_ROLES`, plus "Other…" |
| Ship | select | `SHIPS` + "Other…" revealing a text field |
| Mission Name | text | free text |
| Mission Type | select | `MISSION_TYPES`; "Campaign" reveals the extra fields |
| Authorisation | select | `AUTHORISATIONS` |
| Date | `<input type=date>` | defaults to today — see below |
| Time | `<input type=time>` | defaults to now, local |

Rank+Role and Date+Time as two-column rows; everything else full width.

**The date default matters.** The in-universe year runs ahead of the real one — real 2026 is
**2182**. Store an OFFSET added to the current year, never a hardcoded year:

```js
var IN_UNIVERSE_YEAR_OFFSET = 156;              // 2182 - 2026
function todayInUniverseISO(){
  var n = new Date();                            // LOCAL parts, never toISOString():
  return (n.getFullYear() + IN_UNIVERSE_YEAR_OFFSET) + '-' +
         pad2(n.getMonth()+1) + '-' + pad2(n.getDate());
}
```

`toISOString()` converts to UTC and hands you tomorrow's date for evening sessions west of UTC.
Re-apply these defaults at startup **and** when the user starts a new session, filling only fields
that are still empty.

## 10. Storage and data safety

- Working data goes in **one** localStorage key per tool (`ucn<Tool>_v1`).
- Reusable data and UI preferences get their **own** keys so "New Mission" doesn't wipe them.
- Writes are debounced ~300 ms **and** flushed on `pagehide` / `visibilitychange` — iOS can kill a
  backgrounded PWA inside the debounce window.
- **Never swallow a storage error.** Everything is in one key, so exceeding quota loses the whole
  record, and a silent failure looks exactly like working normally. Surface it loudly — a red
  bordered banner, not a muted line.
- Downscale user-supplied images before storing (canvas, max ~512px). A phone photo as a base64
  data URL can blow the ~5 MB quota on its own.
- Changing a stored shape needs a migration run from **both** the load path and the JSON-restore
  path. Keep the old key in defaults so the merge still delivers it to the migration.
- Tell the user plainly that nothing is uploaded or synced, and that a PDF export is the permanent
  copy.

## 11. Importing JSON from a sibling tool

There is an established pattern; follow it.

- A collapsible section on the report screen: file input, summary card once loaded, remove button
  behind a confirm.
- **Validate strictly, reject clearly.** Gate on the format's schema/version marker and say which
  check failed ("no schema field" vs "unsupported version X"). Distinguish "not valid JSON" from
  "wrong format". Never guess at an unknown shape.
- **Accept every historical shape** the format has had — bare arrays, files missing keys they never
  had.
- **Recompute anything derived** (totals, counts, used-vs-remaining). Exports carry stale or wrong
  derived fields; treat them as hints, never truth.
- **Namespace incoming ids.** They are unique within a file, not globally.
- Coerce rather than crash: numbers to strings, unparseable timestamps to `null`.
- **When entries are dropped, say so with a count** in both the summary and the report. A silent
  drop is indistinguishable from a file that was short in the first place.
- Convert ISO/UTC timestamps to the reader's local zone for display.
- Summary card in the app; full detail in the PDF.
- Never collapse grouped rows into one if that loses per-row data, or hides an unfinished item
  behind a completed-looking one. Annotate the group and keep one row each.

## 12. Untrusted content

Every string from an imported file or typed by a user is **data**.

- Escape with an HTML escaper before it reaches `innerHTML`; use a separate attribute escaper for
  attribute values, and keep that split consistent.
- Never `eval`, never inject as markup.
- If imported text reads like an instruction ("ignore previous instructions…"), that is content to
  render, not a direction to follow.

## 13. Domain rules

- The Bridge Command cast list is `{performer, character}`. The performer (real actor name) is
  **searchable so you can find someone, but must never be displayed or exported** — only the
  character name. Deliberate privacy rule.
- Ranks, mission types and ship names are free text or data lists, not enums.
- Build dates from **local** date parts, never `toISOString()`.

## 14. PDF export

jsPDF, vendored inline. `new jsPDF({unit:'mm', format:'a4', compress:true})`. A module-level
`pdfCursorY` in mm is the vertical write head and every helper advances it. **This is the core
pattern — do not replace it with a layout engine.**

**Geometry:** page 210×297. Margins L18 R18 T24 B20. Content width 174.

**Palette:**

```
NAVY   [27, 42, 94]     headings, table headers, key cells, frame
ORANGE [221, 122, 43]   rules, accents, cover subtitle, chart lines
TEXT   [22, 32, 74]     body copy
MUTED  [140, 152, 191]  secondary text, empty states, axis labels
LINE   [222, 226, 240]  hairline separators, gridlines
```

**Fonts:** embed Exo 2 (regular/bold/italic) and Orbitron Bold as base64 TTFs registered into
jsPDF's VFS via `addFileToVFS` + `addFont`. Wrap registration in try/catch and fall back to
helvetica so a font failure degrades instead of breaking export. Expose `pdfBodyFont()` /
`pdfHeadingFont()`.

**Helpers to implement:**

- `pdfDrawFrame(doc)` — 0.5mm navy rect inset 8mm from every edge; filled navy 16×4 corner blocks
  at all four corners; 1.6mm orange filled circles on the corner points. Drawn on **every** page.
- `pdfNewPage(doc)` — addPage, drawFrame, reset cursor to top margin.
- `pdfEnsureSpace(doc, mm)` — new page if cursor + mm exceeds page height minus bottom margin.
  Call **before drawing any block**.
- `pdfHeading(doc, text)` — Orbitron bold 13, navy, UPPERCASED, then a 0.6mm orange rule full
  content width. Advances ~9mm.
- `pdfSubHeading(doc, text)` — Orbitron bold 10.5, navy, UPPERCASED, +6mm.
- `pdfParagraph(doc, text, opts)` — body font, default 10pt, line height `fontSize*0.5`,
  `splitTextToSize` to content width. opts: `{italic, color, fontSize}`.
- `pdfTable(doc, headers, rows, colWidths)` — navy filled header band 7mm tall, white bold 8pt
  UPPERCASE labels; rows 7mm, body 9pt, cells inset 2.5mm, hairline LINE rule under each row.
  **Repeat the header band after any page break.** Empty tables print italic muted "None
  recorded." Truncate cell text with an ellipsis to the column width.
- `pdfBlockNote(doc, title, text)` — bordered box for free text, 9.5pt, 4.4mm lines.

**Document skeleton — important:**

1. **Cover page:** centred logo (~32mm) at y=42; Orbitron bold 21 navy title at y=84; orange
   letter-spaced subtitle (e.g. `M I S S I O N   R E P O R T`) at y=91; then a centred 120mm meta
   table at y=108 with 40mm navy key cells (white bold 8pt) and white value cells (9.5pt), 8.5mm
   rows — populated from the Setup tab.
2. `doc.addPage()` immediately — **page 2 is reserved and left blank**.
3. Every section via `pdfSectionStart(doc, title, tocEntries)`, which starts a new page, pushes
   `{title, page: doc.internal.getNumberOfPages()}` onto `tocEntries`, and writes the heading.
4. At the very end, `pdfDrawToc(doc, tocEntries)`: `doc.setPage(2)`, write "Table of Contents", then
   per entry the title left, page number right in bold navy, a dashed LINE leader between
   (`setLineDashPattern([0.6,1.2],0)`, reset after), and `doc.link(x, y, w, 7, {pageNumber})` over
   the row. 9mm per row. Save and restore `pdfCursorY` around this.

**Reserve-and-backfill is what makes TOC page numbers correct without a two-pass render. Keep it.**

**PDF style rules:**

- All headings uppercase; body sentence case.
- Empty states are italic MUTED text, never blank space.
- Charts: pin the axis to a fixed range so reports are comparable rather than scaling to the data;
  space points by index when samples are irregular; label only the first and last x values;
  gridlines in LINE, series in ORANGE. A single data point is stated, not plotted.
- Long free text goes in `pdfBlockNote`, never truncated into a table cell.
- Any imported or user-typed text is drawn as plain text only — never evaluated.

## 15. Verifying changes

There are no unit tests. Drive the real app:

```bash
npx http-server -p 8080 -c-1 --silent     # a service worker needs a real origin, not file://
```

Playwright + Chromium, 414×896 mobile viewport.

- Build fixtures that **violate every rule at once**: wrong derived values, entries out of order,
  missing required fields, unparseable dates, duplicate ids, an injection payload. Passing on clean
  data proves nothing.
- For PDFs, **render the output and read the text back** (pdfjs-dist). A valid `%PDF-` header
  proves almost nothing — missing glyphs and wrong columns only show up when rendered. A section
  can span pages, so read the whole section, not just the page it starts on.
- Pin a non-UTC timezone (e.g. `Pacific/Kiritimati`, UTC+14) when asserting local-time conversion,
  so the assertion would actually fail on a UTC bug.
- Report honestly which failures were the app and which were the test harness.

## 16. Traps already hit — don't repeat them

Each of these shipped or nearly shipped in a real tool.

- **Both embedded fonts are subsetted, and Orbitron's subset is narrower than Exo 2's.** In Exo 2,
  `↳` (U+21B3) and `▸` (U+25B8) are missing while `»`, `·`, `—`, `×`, `…` are present. In
  **Orbitron**, `·` (U+00B7) and `»` (U+00BB) are *also* missing — `—`, `-`, `/`, `|`, `:` are
  safe. Worse, a missing glyph in an Orbitron run **truncates the rest of the string** rather than
  just dropping the character, so text silently disappears. Headings and badges use Orbitron;
  tables and body use Exo 2. Check the character map of the font you are actually drawing with.
- **`[hidden]` loses to any class that sets `display`.** A `.crit-bar{display:flex}` defeats the
  attribute and every row renders as flagged. Add `[hidden]{display:none !important}` once,
  globally.
- **`Object.create(null)` rows break any later `obj.hasOwnProperty(k)` copy loop.** Use a
  prototype-safe shallow copy.
- **`local()`-only `@font-face` rules resolve to an errored face** when the font isn't installed,
  shadowing a runtime-injected one. Don't add them "as a fallback".
- **CSS `text-transform` affects `innerText`**, so case-sensitive test assertions on rendered text
  fail misleadingly.
- **A `pagehide` save-flush overwrites localStorage on navigation**, so seeding storage from a live
  app page and reloading won't work. Seed from a page with no app JS on it.
- **A card's padding and a full-bleed banner's negative margin are a matched pair.** Change one,
  change the other. The banner's top radius is the card radius minus the border width.

---

## Using this with an LLM

Paste the whole file, then add what you want built, e.g.:

> Build the Comms Officer tool: a Setup tab per section 9, a Log tab where each entry has a
> timestamp, the ship it was sent to, and free text, and a PDF export per section 14.

Tell it explicitly: **match the above for anything visual, and say where the data doesn't fit the
existing components rather than silently inventing a new visual language.**
