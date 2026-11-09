# UCN Hacking Trainer

A grid puzzle for the UCN tools: probe every safe node of a network without
tripping one of its traps. Each number shows how many of the 8 nodes around it
hide a trap. Four security levels: Basic (6×6, 4 traps), Secure (8×8, 10),
Hardened (10×10, 25) and Fortified (12×12, 36). The first probe is always safe.

Fan-made. Not affiliated with Bridge Command / The London Space Elevator Ltd.

| File | What it is |
|---|---|
| `index.html` | The page: controls, grid, instructions and tips |
| `game.js` | The rules (levels, trap placement, probing, flags), with no page code |
| `test.js` | Checks the rules; run `node test.js` (CI runs it on every change) |
| `sw.js` | Offline copy: settings here, the rest from `shared/offline-sw.js` |
