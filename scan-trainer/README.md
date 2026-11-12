# UCN Scan Trainer

Practice for the Radar station's scan, modelled on how the in-game scan plays:

- Press **Scan**. Each scan has two stages, `[1/2]` and `[2/2]`, each with
  its own signal name.
- In each stage, the sliders hide a setting. The further off they are, the
  noisier the trace: three lines (red, green and blue) full of noise that
  drift apart. Getting close pulls them together into one clean wave.
- Clean means the sliders' total distance from their setting is under 5%.
  Hold it there for 2 seconds and the stage shows **LOCKED**, then the next
  stage starts.
- **Level 1** has one slider per stage. **Level 2** has two, and both must be
  right before the signal comes clean.

The clock runs from pressing Scan to the second lock. The level, and each
level's best time and number of scans, are saved (`ucnScanTrainer_v1`); the
records can be shared as a picture with your name (shared with the other tools
as your name and rank). After a scan, **Challenge a friend** shows a QR code
and link that give them the same contact: the seed in the link makes both
stages' names, hidden settings and starting sliders the same, and their result
says who was faster (within a twentieth of a second is a dead heat). Screen readers hear the signal
as weak, fair, strong or clean on each slider. Below the scope are the UCN
Academy Manual's notes on what a primary and a secondary scan tell you (3.2),
and that more scanner power makes the lock easier (Table 3-13).

The figures (5%, 2 seconds) are tuned by eye from gameplay footage, not taken
from the game, and the signal names are our own. Fan-made. Not affiliated with
Bridge Command / The London Space Elevator Ltd.

| File | What it is |
|---|---|
| `index.html` | The page |
| `scan.js` | The stages, the signal error and the trace drawing, with no page code |
| `test.js` | Checks them; run `node test.js` (CI runs it on every change) |
| `sw.js` | Offline copy: settings here, the rest from `shared/offline-sw.js` |
