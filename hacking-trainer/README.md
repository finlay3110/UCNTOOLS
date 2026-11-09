# UCN Hacking Trainer

A grid puzzle for the UCN tools: probe every safe node of a network without
tripping one of its traps. Each number shows how many of the 8 nodes around it
hide a trap. Four security levels: Basic (6×6, 4 traps), Secure (8×8, 10),
Hardened (10×10, 25) and Fortified (12×12, 36). The first probe is always safe.
As in Bridge Command, there are no flags.

Each run is timed from the first probe. The best time and best score (how much
of the network was cleared before a trap) for each level are kept in this
browser, go in the portal's backup, and can be shared as a picture.

Fan-made. Not affiliated with Bridge Command / The London Space Elevator Ltd.

| File | What it is |
|---|---|
| `index.html` | The page: controls, grid, instructions and tips |
| `game.js` | The rules (levels, trap placement, probing, score, records), with no page code |
| `test.js` | Checks the rules; run `node test.js` (CI runs it on every change) |
| `sw.js` | Offline copy: settings here, the rest from `shared/offline-sw.js` |
