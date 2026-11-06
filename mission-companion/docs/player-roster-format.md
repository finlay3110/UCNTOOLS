# UCN Player Roster — JSON export format

The Mission Companion's **Player Roster** is a list of the people you play with, kept separately
from any one mission so it survives "New Mission". It can be exported to share with the rest of
your group, and imported from any UCN tool that produces this format.

This document is the contract. A sibling tool that writes a file matching it will import cleanly.

> The roster is **only** about people. It is not mission crew: assigning someone to a station
> happens on the Crew tab, per mission. A roster entry records who someone *is* and which station
> they *usually* take.

## Current format — `ucn.player.roster/2`

```json
{
  "schema": "ucn.player.roster/2",
  "exportedAt": "2026-09-04T10:00:00.000Z",
  "players": [
    {
      "name": "Rowan",
      "callsign": "Viper",
      "pronouns": "she/her",
      "role": "Helm"
    }
  ]
}
```

### Top level

| Key | Type | Required | Notes |
|---|---|---|---|
| `schema` | string | recommended | Must be `"ucn.player.roster/2"` if present. A *different* value is rejected with a message naming it. Absent is tolerated — see Older shapes. |
| `exportedAt` | string | optional | ISO 8601 UTC. Informational only; nothing depends on it. |
| `players` | array | **yes** | May be empty. A file with no `players` array is rejected. |

### A player

All five fields are strings. Only `name` is required.

| Key | Required | Notes |
|---|---|---|
| `name` | **yes** | Non-empty after trimming. An entry without one is skipped — there is no player to add. |
| `callsign` | no | May be `""`. Part of the duplicate check. |
| `pronouns` | no | Free text. The app offers `he/him`, `she/her`, `they/them`, `he/they`, `she/they` and an "other" box, but any string is accepted. |
| `role` | no | The station this player **usually** takes. May be `""`. See below. |

**Do not export an `id`.** Ids are unique to one device's roster and are regenerated on import;
including them achieves nothing and invites collisions.

### `role` — the usual station

Not an enum. The app's own list is:

```
Captain, First Officer, Helm, Navigation, Comms, Power Management,
Damage Control, Radar, Drone Operator, Beams, Missiles,
Shuttle Helm, Shuttle Generalist, Shuttle Engineer
```

A value **outside** that list is kept verbatim rather than dropped, and appears in the roster's
station dropdown marked `(from import)`. So a tool with its own station names will not lose
data — but a value that matches one of the names above is what makes the "usually" hint work.

`role` is a habit, not an assignment. It never sets or overrides a mission crew station. It is
used for two read-only things:

- the player's usual station is shown beside their name in the Crew tab's search dropdown, so
  you can see who normally takes the station you are filling;
- a muted "Usually Helm" note appears on a crew card when someone is assigned somewhere else.
  People swap stations constantly — this is informational and never blocks anything.

## Older shapes, still accepted

**v1 — a bare array**, which is what this app wrote before v2 and what older shared roster files
still are. No wrapper, no `schema`, no `role`:

```json
[
  { "name": "Legacy One", "callsign": "Old", "pronouns": "he/him" },
  { "name": "Legacy Two", "callsign": "",    "pronouns": "" }
]
```

Imported players get `role: ""`. New tools should write v2, but a v1 file will never be rejected
for lacking keys it never had.

## What the importer does

1. **Rejects** only what clearly isn't a roster: a `schema` that is present but different, an
   object with no `players` array, or a top-level value that is neither object nor array.
   Invalid JSON is reported separately from a wrong format, so you are told which failed.
2. **Skips** an entry that is not an object, or whose `name` is empty after trimming.
3. **Coerces** the rest: numbers become strings, anything else non-string becomes `""`, and all
   strings are trimmed.
4. **Deduplicates** on name + callsign, case-insensitively. Importing the same shared roster
   twice adds nobody the second time.
5. **Merges** — importing never deletes or overwrites anyone already on the roster.
6. **Reports everything**: the toast names how many were imported, how many were already there,
   and how many were skipped. A silent drop is indistinguishable from a short file, so it never
   stays silent.

Text in these files is user-authored. It is treated as data throughout: escaped before display,
never evaluated, and any instruction-shaped content is rendered rather than followed.

## Minimum viable export

The smallest file a sibling tool can write and have work correctly:

```json
{
  "schema": "ucn.player.roster/2",
  "players": [
    { "name": "Fin", "role": "Comms" }
  ]
}
```
