# UCN General Log

A personal log for Bridge Command sorties: one keeper, one log. Every entry is
stamped with the time it was logged, and the whole thing exports as a PDF mission
report or a JSON backup.

**Fan-made. Not affiliated with, endorsed by, or connected to Bridge Command or
The London Space Elevator Ltd.** All trademarks belong to their owners.

## Running it

Open `index.html`. That is the whole tool — one file, no build step, no npm, no
network requests at all. Fonts, the logo and jsPDF are embedded, so it works on a
cold first launch with the aircraft-mode switch on.

## Hosting on Netlify

The site root is the repository root and `index.html` is the entry point, so there is
nothing to configure: connect the repo with no build command and a publish directory
of `.`, or drag the folder onto the Netlify dashboard. `_headers` keeps the shell and
the service worker on `must-revalidate` so a deploy always reaches a device that
already has them.

## Installing it

Hosted over https, the tool registers `sw.js` and can be added to a phone's home
screen, where it opens full-screen and runs with no signal. The page is fetched
network-first, so a new deploy always wins and nobody is ever stuck on a stale build;
the cache is only the fallback for a slow or absent network.

Opened as a local file this does nothing at all — `registerServiceWorker()` bails
unless the origin is https or localhost, so the single-file build stays exactly as
self-contained as it was.

## Tabs

| Tab | Holds |
|---|---|
| **Setup** | Who is keeping the log, the ship and mission, and the date and time. Mission Name is a picker of the 32 known operations, and choosing one fills in its type. Rank and Mission Name each carry a search box that narrows the picker — operations match on name or type. Rank, Role, Ship and Mission Name all take free text through Other. |
| **Briefing** | Authorisation and threat level, then the free-text briefing notes. All three open the report. |
| **Log** | The compose card and the entry stream, newest first, with a filter. Entries are yours by definition, so there is no author to pick — just the type, the text and a critical flag. |
| **More** | PDF export, JSON export and import, session controls, and the About note. |

## Data

Everything lives in this browser's local storage, on this device only — no account,
no server. Clearing site data erases the log, so **Export JSON** is the backup.
Import replaces the whole log and asks first.

Dates run on the in-universe calendar: the UCN year is the real year plus 156, stored
as an offset so it stays correct as real years pass.

## Editing the file

`index.html` is ordered so it stays hand-editable:

1. `<style>` — the console stylesheet.
2. `<style id="ucn-fonts">` — Orbitron and Exo 2 as base64 WOFF2.
3. The markup.
4. `<script id="ucn-assets">` — the logo and the subset TTFs the PDF embeds.
5. `<script id="ucn-jspdf">` — the vendored library.
6. `<script id="ucn-app">` — the application, plain ES5 in one IIFE.

Only blocks 1, 3 and 6 are hand-written; the rest are pasted-in assets.

`sw.js`, `manifest.webmanifest`, `_headers` and the three icons sit alongside it
and are only used when the tool is hosted.

## Restyling another tool to match

`docs/RESTYLE-PROMPT.md` is a paste-ready prompt for giving another app's log screen
this look — the compose card, the log block, the critical flag and the quick-entry
buttons, with the CSS quoted from this file. Scoped to the log area only; it says
nothing about headers, navigation or other screens.

## Credits

* [jsPDF](https://github.com/parallax/jsPDF) 4.2.1 — MIT.
* Orbitron and Exo 2 — SIL Open Font License 1.1, subset and embedded.
