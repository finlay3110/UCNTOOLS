# UCN Hacking Trainer

Practice for Bridge Command hacking, following the UCN Academy Manual (section
3.9, also in Tactical Aids → General Info): probe the safe nodes of a defensive
grid without triggering its defence routines. A revealed node's trace (number)
shows how many of the 8 nodes around it hide a routine. Four cyber defence
levels: Basic (6×6, 4 routines), Secure (8×8, 10), Hardened (10×10, 25) and
Fortified (12×12, 36). The first probe is always safe, and there are no flags.

As in the game, the first defence routine triggered is marked X and the attempt
carries on; a second ends it. Once progress passes the level's mark (Basic 60%,
Secure 70%, Hardened 80%; Fortified needs a full breach) Apply banks the breach,
and a failed attempt past the mark still applies what it had.

Each attempt is timed from the first probe. The best time (full breach), best
breach and breaches for each level are kept in this browser, go in the portal's
backup, and can be shared as a picture.

Fan-made. Not affiliated with Bridge Command / The London Space Elevator Ltd.

| File | What it is |
|---|---|
| `index.html` | The page: controls, grid, instructions and tips |
| `game.js` | The rules (levels, routine placement, probing, two strikes, Apply, records), with no page code |
| `test.js` | Checks the rules; run `node test.js` (CI runs it on every change) |
| `sw.js` | Offline copy: settings here, the rest from `shared/offline-sw.js` |
