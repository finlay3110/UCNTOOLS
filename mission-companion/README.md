# UCN Mission Companion

An offline companion app for [**Bridge Command**](https://bridgecommand.co.uk), the immersive
starship-bridge experience in London. Record a mission as you play it — crew, briefing, points of
interest, a timestamped log, and the debrief — then export the whole thing as a formatted PDF
mission report.

Built to be used one-handed on a phone, in a darkened room, while you are also doing something
else.

> **Fan-made.** Not affiliated with, endorsed by, or approved by Bridge Command / The London Space
> Elevator Limited. The UCN logo and setting are their property.

## Install it

Open the hosted app and add it to your home screen:

- **iPhone / iPad** — Safari → Share → *Add to Home Screen*
- **Android** — Chrome → menu → *Install app*
- **Desktop** — the install icon in the address bar

It then runs full-screen with no browser chrome, and **works completely offline** — including a
cold first launch with no signal. Nothing is fetched at runtime: the fonts, artwork, rank insignia
and PDF library are all bundled into the single HTML file.

Updates arrive automatically the next time you open it.

## What it does

Five tabs, in the order you use them during a mission:

| Tab | |
|---|---|
| **Briefing** | Authorisation, threat level, and the briefing itself. Optional Flight Controller / Training Officer and points-of-interest sections. |
| **Crew** | Who is on which station — 11 ship roles plus an optional shuttle crew. Names, callsigns, ranks and pronouns. |
| **Notes** | Points of interest and people met, kept as you go. |
| **Log** | The mission timeline. Quick-action buttons file common events (Code Red, combat, nuclear authorisation) in one tap, timestamped. |
| **Debrief** | Mission outcome, promotions and medals — plus the import sections below. |

Above the tabs, a collapsible header holds the mission's own details: operation name, ship, mission
type, date and time, and who filed the report.

### The PDF report

**Export PDF** produces an A4 report with a cover page, a clickable table of contents, crew tables,
the briefing, notes, the full timeline, promotion and medal cards with their insignia, and an
optional Captain's certification page. It is the thing to keep — see *Your data* below.

### Importing from the other UCN tools

The Debrief tab can absorb JSON exported by the sibling fan tools, so one report covers the whole
bridge:

- 📡 **Comms Log** — the Comms Officer's log, merged into its own report section
- 🔧 **Engineering Log** — repairs, conduits, power cell swaps, OCP spares and a hull-integrity
  graph. Damage Control and Power Management are often two different engineers, so it takes one
  combined log or each engineer's separately, merged into a single timeline.
- 🧭 **Navigation Log** — waypoints from the Navigation & Radar tool, grouped by category

Every importer validates strictly and tells you what it rejected or skipped, rather than quietly
showing you fewer rows than the file contained.

### Player roster

A list of the people you play with, kept separately from any one mission so it survives *New
Mission*. Search it when filling crew stations instead of retyping names. It exports and imports as
JSON so a group can share one roster — the format is documented in
[`docs/player-roster-format.md`](docs/player-roster-format.md).

## Your data

**Everything is stored on your device, in your browser. Nothing is uploaded, synced or backed up
anywhere.** There is no account and no server.

That means:

- Clearing your browser data, switching phones or reinstalling **will lose your missions**.
- **Export a PDF when a mission ends.** That is the permanent copy.
- *More → Backup Mission (JSON)* saves a restorable snapshot if you want one.

The app tells you if it ever fails to save — for example if the device is out of storage — rather
than failing silently.

Nothing you type leaves the device. The one deliberate exception to what is displayed: the
Bridge Command cast list is searchable by the performer's real name so you can find someone, but
only the **character** name is ever shown or exported.

## Running it locally

There is no build step. It is one HTML file plus a service worker.

```bash
git clone https://github.com/finlay3110/mission-companion.git
cd mission-companion
npx http-server -p 8080 -c-1
```

Then open <http://127.0.0.1:8080/>. Serve it over http rather than opening the file directly — a
service worker needs a real origin, so `file://` will run the app but not the offline caching.

## Contributing

The conventions, the reasoning behind the odd-looking decisions, and a list of traps this project
has already fallen into are in [`CLAUDE.md`](CLAUDE.md). Worth reading before changing anything —
several of the constraints are load-bearing and look like tidying opportunities.

Building a *new* UCN tool, or asking an LLM to? Paste
[`docs/ucn-tool-style-guide.md`](docs/ucn-tool-style-guide.md) — the suite-wide house style,
written to be read cold with no other context.

The short version: one self-contained HTML file, plain ES5, no build step, no npm, and no runtime
network requests of any kind. Bump `CACHE_VERSION` in `sw.js` whenever `index.html` changes, or
installed copies keep serving the old build.

## Licence and credits

Fan-made by [@finlay3110](https://github.com/finlay3110) for the Bridge Command community.

Bridge Command, the United Confederation Navy, its ships and its setting are the property of
Bridge Command / The London Space Elevator Limited. This project is unofficial and takes no
payment.

Bundled third-party libraries keep their own licences: [jsPDF](https://github.com/MrRio/jsPDF)
(MIT) and [pako](https://github.com/nodeca/pako) (MIT and Zlib). Fonts are
[Exo 2](https://fonts.google.com/specimen/Exo+2) and
[Orbitron](https://fonts.google.com/specimen/Orbitron), both under the SIL Open Font License.
