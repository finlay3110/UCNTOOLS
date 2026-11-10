# UCN Bridge Drills

Quick drills from the UCN Academy Manual (also in Tactical Aids → General
Info), ten multiple-choice questions a round in a random order:

- **Radar recognition** — name the ship class from its radar icon, the
  manual's advice for each class (Appendix B), contact colours, ordnance marks
  on Tactical, and which radar channel shows what.
- **Ordnance choice** — which weapon suits the moment, and the ranges,
  timings and blasts behind the choice (Tables 3-19 and 3-20).
- **Callouts** — the standard call for the moment, station by station, in the
  manual's own words.

Tap an answer and the right one turns green with the manual's reason. Each
drill keeps its best score, the fastest time for it, and how many rounds were
played, in this browser (and in the portal's backup); they can be shared as a
picture, with your name on it if you add one. The name is the one the other
UCN tools share.

The ship icons are the Navigation & Radar tool's, copied into `icons.js`.

Fan-made. Not affiliated with Bridge Command / The London Space Elevator Ltd.

| File | What it is |
|---|---|
| `index.html` | The page: drill picker, questions, records, help |
| `drills.js` | The questions, rounds and records, with no page code |
| `icons.js` | Radar icons, from the Navigation & Radar tool |
| `test.js` | Checks every question and round; run `node test.js` (CI runs it on every change) |
| `sw.js` | Offline copy: settings here, the rest from `shared/offline-sw.js` |
