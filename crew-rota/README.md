# UCN Crew Rota

Plans who takes which station each session, and shares the stations out
fairly so everyone gets a turn somewhere new.

- **Who's here** — add the players for the session. Names are suggested from
  Mission Companion's player roster and from past rotas.
- **Stations** — the stations Mission Companion, General Log and Mission Stats
  use (ship, plus shuttle when it's in use). Remove any not in use this time.
  Pick anyone by hand and they stay put; **Shuffle fairly** fills the rest so
  each person gets the stations they've had least, and not the one they had
  last time. With fewer players than stations, the stations nearest the top
  are filled first.
- **Share** — the phone's share sheet (the rota as text, plus a link), a copy
  as text for Discord, or a QR code of the link. Opening the link shows the
  rota, and **Use this rota** makes it the one on that device.
- **Past rotas** — each date you make a rota for is kept on the device, and
  the shuffle counts them all. Forget any that shouldn't count.

## The other tools

The current rota is saved in this site's browser storage (`ucnCrewRota_v1`),
which every tool on the site shares, and `shared/rota.js` (copied into each
tool on deploy) reads it:

- **Mission Companion** — the Crew tab's **Fill crew from the Crew Rota**
  fills the crew cards, with callsigns and pronouns from the player roster,
  switches the shuttle on if anyone is on it, and sets the ship if none is set.
- **General Log** — a log with no station yet takes yours from the rota
  (matched on the Logged By name, or the name you set in the tools), and the
  ship if none is set.
- **Mission Stats** — a new mission starts with your station and ship from
  the rota.

On iPhone, each app added to the home screen keeps its own storage, so this
only works between tools opened in the browser, or from the homepage app.
The link works anywhere.

Fan-made. Not affiliated with Bridge Command / The London Space Elevator Ltd.

| File | What it is |
|---|---|
| `index.html` | The page |
| `rota.js` | The stations, the fair shuffle, links and text, with no page code |
| `test.js` | Checks the shuffle, links, storage, and that the other tools' station lists match; run `node test.js` (CI runs it) |
| `sw.js` | Offline copy: settings here, the rest from `shared/offline-sw.js` |
