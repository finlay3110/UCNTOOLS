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
- **Damage Control** — where each OCP, crystal, warp switch (Destabilisation
  Conduit), restabiliser and spare OCP store is on the UCS Takanami and UCS
  Havock, from the Engineering tool's Damage Control tables. Once answered, the
  ship's deck plan (Appendix H) shows the spot circled. Then OCPs, crystals,
  manual repairs and warp core emergencies (3.11).

Tap an answer and the right one turns green with the manual's reason. Each
drill keeps its best score, the fastest time for it, and how many rounds were
played, in this browser (and in the portal's backup); they can be shared as a
picture, with your name on it if you add one. The name is the one the other
UCN tools share.

After a round, **Challenge a friend** shows a QR code (and link) holding the
round's seed and your score, so a friend gets the same ten questions in the same
order; their result says who won. The full-screen QR view is `shared/qr.js`.

The ship icons are the Navigation & Radar tool's, copied into `icons.js`.

Fan-made. Not affiliated with Bridge Command / The London Space Elevator Ltd.

| File | What it is |
|---|---|
| `index.html` | The page: drill picker, questions, records, help |
| `drills.js` | The questions, rounds and records, with no page code |
| `icons.js` | Radar icons, from the Navigation & Radar tool |
| `maps/` | The two deck plans (Appendix H, as in Engineering's ship maps), cropped |
| `test.js` | Checks every question and round; run `node test.js` (CI runs it on every change) |
| `sw.js` | Offline copy: settings here, the rest from `shared/offline-sw.js` |
