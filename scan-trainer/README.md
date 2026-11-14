# UCN Scan Trainer

Practice for the Radar station's scan, modelled on how the scan behaves in the
game (Empty Epsilon, which Bridge Command runs), in our own code:

- Press **Scan**. Each scan has stages, each with its own signal name: two
  (`[1/2]`, `[2/2]`) at levels 1 and 2, three at level 3, four at level 4.
- In each stage the sliders hide a setting, each starting at least 0.2 off
  it. Their total distance from it (counted as the game does, so four
  sliders stay noisy until all are close) drives three waves, red, green and
  blue: each slides sideways at its own speed (red slowest), green and blue
  stretch, and the noise fades the wave out. All three also drift slowly.
  Because the slide follows the distance either side of a setting, the waves
  turn back the moment a slider passes it: that turning point is where it goes.
- Under 0.05 in total the signal is in the lock: the waves pull together by
  themselves over a second, **LOCKED** shows, and at two seconds the next
  stage starts. Moving off the setting cancels the lock.
- Each level has that many sliders per stage: **level 1** one, up to
  **level 4** with four.

The clock runs from pressing Scan to the last lock. The level, and each
level's best time and number of scans, are saved (`ucnScanTrainer_v1`); the
records can be shared as a picture with your name (shared with the other tools
as your name and rank). After a scan, **Challenge a friend** shows a QR code
and link that give them the same contact: the seed in the link makes both
the stages' names, hidden settings and starting sliders the same, and their result
says who was faster (within a twentieth of a second is a dead heat). Screen readers hear the signal
as weak, fair, strong or clean on each slider. Below the scope are the UCN
Academy Manual's notes on what a primary and a secondary scan tell you (3.2),
and that more scanner power makes the lock easier (Table 3-13).

The behaviour follows the game's own rules; the code and the signal names are
ours. The number of stages is set by the game master in the game, so ours (2,
2, 3, 4 by level) is our own choice. Fan-made. Not affiliated with
Bridge Command / The London Space Elevator Ltd.

| File | What it is |
|---|---|
| `index.html` | The page |
| `scan.js` | The stages, the signal error and the trace drawing, with no page code |
| `test.js` | Checks them; run `node test.js` (CI runs it on every change) |
| `sw.js` | Offline copy: settings here, the rest from `shared/offline-sw.js` |
