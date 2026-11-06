# UCN Ship Search

A quick lookup tool for the United Confederation Navy (UCN) fan community — find out which ship (**UCS Havock** or **UCS Takanami**) is running at a given date and time, or pull up a full day's schedule at a glance.

> ⚠️ **Fan-made project.** This tool is not affiliated with, endorsed by, or an official product of Bridge Command / The London Space Elevator Limited. Ship allocations shown here are subject to change without notice and are **not** official Bridge Command scheduling — always confirm on the day.

---

## Features

- **Find my ship** — enter a date + time, get told which ship is running (or that nothing's scheduled)
- **Full day timetable** — enter just a date to see both ships' complete schedule for that day, weekday or weekend
- **Private slot toggle** — private mission slots are hidden by default; a "Show private mission slots" checkbox reveals them
- **PDF export** — download any day's schedule as a UCN-themed PDF, generated client-side with [jsPDF](https://github.com/parallax/jsPDF) (no server required)
- **View full Rota (PDF)** — button linking to the master `UCN_Ship_Allocation_Rota.pdf`, generated with ReportLab
- **Mobile-first design** — full-width phone layout, 44px+ tap targets, safe-area padding for notched devices
- **UCN dark console theme** — navy/cyan colour scheme, embedded logo, animated starfield background
- **No dependencies to install** — a single self-contained `index.html` (jsPDF is embedded inline, not loaded from a CDN)

## Canonical schedule — Bridge Command Ship Matrix

| | Weekdays | Weekends |
|---|---|---|
| **UCS Havock** | 11:00\*, 13:00\*, 15:00\*, 17:00, 19:00, 20:45 | 09:45, 11:30, 13:30, 15:30, 17:30, 19:30, 21:15 |
| **UCS Takanami** | 11:15\*, 13:15\*, 15:15\*, 17:15, 19:15, 21:00 | 10:00, 11:45, 13:45, 15:45, 17:45, 19:45, 21:30 |

\* indicates a **private** mission slot.

## Files

```
.
├── index.html                       # the tool itself — everything is self-contained
└── UCN_Ship_Allocation_Rota.pdf      # master rota PDF linked from the "View full Rota" button
```

Both files must live in the same folder for the "View full Rota (PDF)" button to work — it links to `UCN_Ship_Allocation_Rota.pdf` as a relative path.

## Updating the schedule

If Bridge Command's ship allocation times ever change, update the `SHIPS` array near the top of the `<script>` section in `index.html`:

```js
const SHIPS = [
  { name: "UCS Havock", weekday: [...], weekend: [...] },
  { name: "UCS Takanami", weekday: [...], weekend: [...] }
];
```

Times marked private should keep the trailing `*` (e.g. `"11:00*"`).

If you also regenerate `UCN_Ship_Allocation_Rota.pdf` to match, keep the filename identical or update the button's `href` in `index.html`.

## Credits

Designed by **Lt Fin "Tetra"**, part of the wider UCN fan tool suite (ID Card Generator, Mission Companion, Songbook, Tool Portal).
