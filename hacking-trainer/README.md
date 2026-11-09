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

Two meters above the grid show what the hacking achieves against what it
costs. **Hacked [system]**: pick the target system (Beams, Missiles, Impulse,
Manoeuvring, Warp or Shields) under the meter. Each finished attempt adds half
its applied breach, a full hack wears off in about 3 minutes, and the line
below says what that does to a target system at 100% power, e.g. beams firing
every 24 s instead of 6 at a full hack (manual 3.9.5; shields from its Table
3-18). Switching system starts it from 0%. **Scanner
heat**: every finished attempt, failed ones included, adds 20–40°; the
coolant setting under the meter cools 0.5° a second per 10%, and with none the
Scanners don't cool. Both run on real time across attempts, and start again
from zero when the page is reloaded.

Each attempt is timed from the first probe. The best time (full breach), best
breach and breaches for each level are kept in this browser, go in the portal's
backup, and can be shared as a picture. The records also show the manual's training
benchmark, the **Academy standard**: a full breach on Secure in under 40 seconds
without triggering a routine. The tips draw the manual's 1-2-1, 1-2-2-1 and 1-1
patterns the way its figures do.

Fan-made. Not affiliated with Bridge Command / The London Space Elevator Ltd.

| File | What it is |
|---|---|
| `index.html` | The page: controls, grid, instructions and tips |
| `game.js` | The rules (levels, routine placement, probing, two strikes, Apply, the target's hack and Scanner heat, records), with no page code |
| `test.js` | Checks the rules; run `node test.js` (CI runs it on every change) |
| `sw.js` | Offline copy: settings here, the rest from `shared/offline-sw.js` |
