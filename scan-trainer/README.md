# UCN Scan Trainer

Practice for the Radar station's scan. Your waveform (blue) is drawn over the
contact's (orange): set its **length** and **height** until it lies exactly over
the contact's, and it locks when you let go of a slider on target (within 3
steps out of 100 on each). The Match bar shows how close you are.

- **Level 1**: one waveform, two sliders.
- **Level 2**: two waveforms, two sliders each; both must be on target.

The clock starts at your first slider move. The level and your best time for
each are saved (`ucnScanTrainer_v1`). Below the scope are the UCN Academy
Manual's notes on what a primary and a secondary scan tell you (3.2), and that
more scanner power makes the lock easier (Table 3-13).

The game is an original practice drill built from a description of the
in-game scan, not a copy of it. Fan-made. Not affiliated with Bridge Command /
The London Space Elevator Ltd.

| File | What it is |
|---|---|
| `index.html` | The page |
| `scan.js` | The contacts, the lock, the match and the drawing, with no page code |
| `test.js` | Checks them; run `node test.js` (CI runs it on every change) |
| `sw.js` | Offline copy: settings here, the rest from `shared/offline-sw.js` |
