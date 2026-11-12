# UCN Helm

A quick reference for the Helm, using the figures in the UCN Academy Manual
(also in Tactical Aids → General Info). The ship picker sits at the top; the
rest is in four tabs: Ship (handling, combat manoeuvre), Course (time to
target, bearings and turns), Manoeuvres (with the Elite Hidden Tactic) and
Warp (checklist, warp guide).

- **Ship handling**: the Takanami's or the Havock's speed, acceleration, turn
  rate, shields and hull (3.3 and Appendix H). The tool remembers the ship.
- **Time to target**: a distance in sectors (20U) or U gives the time on
  impulse from a standstill and at warp, for the impulse and warp power
  Engineering is giving you.
- **Bearings and turns**: your heading and the target's bearing give the
  shorter way round, how long the turn takes at your manoeuvring power, and
  the heading that puts the target astern.
- **Combat manoeuvre**: what heats what, and how long the reserve takes to
  refill (3.3.3).
- **Advanced manoeuvres**: About Face, Breakthrough, Special Delivery,
  Longbow Shot and Monkey at the Zoo, step by step with the calls (Appendix G),
  each with a diagram of the routes that **Start demonstration** plays out with
  captions (the manual has no figures, so positions are illustrative), then the
  Elite Hidden Tactic from the UCN Effective Guide to Warp.
- **Before engaging warp**: the checklist and the calls to know (5.1).
- **Warp guide**: the Academy's setup for each distance (Appendix F) and the
  field setups from the UCN Effective Guide to Warp.

The warp table, field setups and Elite Hidden Tactic come from
`shared/warp.js`, the same as Engineering's.

Only the chosen ship is saved (`ucnHelm_v1`). Fan-made. Not affiliated with
Bridge Command / The London Space Elevator Ltd.

| File | What it is |
|---|---|
| `index.html` | The page; the warp setups between the `ucn-lists:warp` markers come from `shared/warp.js` |
| `helm.js` | The figures, manoeuvres and sums, with no page code |
| `test.js` | Checks them; run `node test.js` (CI runs it on every change) |
| `sw.js` | Offline copy: settings here, the rest from `shared/offline-sw.js` |
