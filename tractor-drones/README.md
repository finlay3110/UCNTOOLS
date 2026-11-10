# UCN Tractor & Drones

A quick reference for Beams and Dock & Drone officers, using the figures in the
UCN Academy Manual (also in Tactical Aids → General Info):

- **Tractor beam reach** — drag the arc and see how far the beam reaches
  (Table 3-21: 2U at 6°, 1U at about 22.5°, 0.5U at 90°, in between drawn as
  straight lines), drawn to scale, and which incoming ordnance it can push far
  enough when caught at full reach (3.8.4): torpedoes need 17° or less to break
  their lock, nukes and EMPs 23° or less to beat their blast, mines 67° or less
  to stay clear of their trigger.
- **What the tractor can drag** — how strongly it moves each size of target
  with Cargo Docks at 100% and at 200–300% (Table 3-22).
- **Drones and probes** — drone control range and probe scan radius for a
  scanner effectiveness from 100% to 300% (Tables 3-26 and 3-27).

Nothing is saved. Fan-made. Not affiliated with Bridge Command / The London
Space Elevator Ltd.

| File | What it is |
|---|---|
| `index.html` | The page |
| `calc.js` | The manual's figures, with no page code |
| `test.js` | Checks the figures; run `node test.js` (CI runs it on every change) |
| `sw.js` | Offline copy: settings here, the rest from `shared/offline-sw.js` |
