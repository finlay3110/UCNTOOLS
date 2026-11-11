# UCN Portal

The United Confederation Navy (UCN) fan-made digital tool suite — every tool plus the portal homepage, hosted together as one GitHub Pages site at **https://finlay3110.github.io/UCNTOOLS/**.

> **This is a fan-made project.** It is not affiliated with, endorsed by, or approved by Bridge Command / The London Space Elevator Limited.

## What's in the suite

Seven tools sit behind the **Mission Tools** dropdown — the reference tools meant for use during an active mission:

| Tool | Description |
|---|---|
| **Mission Companion** | An in-bridge reference companion for active missions — quick access to procedures, guides, and operational tools. |
| **Engineering Reference** | Power, thermal, warp, and damage control reference tools for engineering watch. |
| **Nav Reference** | Navigation and radar reference tool for plotting and interpreting bridge instruments. |
| **Comms Log** | Log and reference bridge communications during a mission. |
| **General Log** | Keep your own mission log from any station you're assigned to. |
| **Tactical Aids Archive** | Searchable library of tactical aid PDFs, grouped by category. |
| **Tractor & Drones** | Tractor beam reach for any arc, what it can drag and which incoming ordnance it can deflect, and drone and probe range by scanner power, from the UCN Academy Manual. |

Two sit behind the **Mess Tools** dropdown — for the mess deck, off watch:

| Tool | Description |
|---|---|
| **Shanty Songbook** | The full digital songbook — searchable lyrics, favourites, chorus highlighting, and offline-ready access. |
| **Mess Drink Tracker** | Keep a running tally of drinks on the mess deck. |

Two training games sit behind the **Training** dropdown — practice for the bridge, off watch:

| Tool | Description |
|---|---|
| **Hacking Trainer** | Practice for Bridge Command hacking, to the UCN Academy Manual's rules: breach a defensive grid at four cyber defence levels (Basic, Secure, Hardened, Fortified), with best times and breaches to share. |
| **Bridge Drills** | Quick drills from the UCN Academy Manual: radar recognition, ordnance choice and standard callouts, ten questions a round, with best scores to share. |

The remaining three sit on their own cards:

| Tool | Description |
|---|---|
| **ID Card Generator** | Build and print a fleet-standard crew ID card — rank, division, clearance level, photo, and barcode/QR, formatted to true CR-80 card size, with print files for ordering it on plastic. |
| **Ship Search** | Looks up which ship (UCS Havock or UCS Takanami) is running at a given date/time, or shows the full day's schedule. |
| **Mission Stats** | Import a CSV of your deployments from the Bridge Command portal and track your mission history. |

Below them, **Your name & rank** sets the name and rank the tools share (`shared/profile.js`): each tool fills them in wherever its own are still blank, and a name typed in any tool shows here. **Back up & Restore** saves every tool's data in one file.

The portal also links out to Bridge Command's official website and Discord server for anyone looking for the source community.

## Repo layout

The portal (`index.html`, `sw.js`) sits at the root; each tool lives in its own folder and keeps its own README.

| Folder | Tool | Formerly |
|---|---|---|
| `mission-companion/` | Mission Companion | mission-companion repo |
| `engineering/` | Engineering Reference | ENGINEERING-GUIDE-LARP repo |
| `navigation/` | Nav Reference | navguide repo |
| `commslog/` | Comms Log | commsLog repo |
| `generallog/` | General Log | GENERAL-LOG-TOOL repo |
| `tactical-aids/` | Tactical Aids Archive | TACTICAL-AID-TOOL repo |
| `songbook/` | Shanty Songbook | shantysongbook repo |
| `messtracker/` | Mess Drink Tracker | UCN-DRINK-TRACKER- repo |
| `idcard/` | ID Card Generator | propidcard repo |
| `shipsearch/` | Ship Search | SHIPSEARCH repo |
| `missionstats/` | Mission Stats | MISSIONTRACKER repo |
| `hacking-trainer/` | Hacking Trainer | new here |
| `tractor-drones/` | Tractor & Drones | new here |
| `bridge-drills/` | Bridge Drills | new here |
| `crew-rota/` | Crew Rota | new here |
| `helm/` | Helm | new here |
| `scan-trainer/` | Scan Trainer | new here |

## What's new

The homepage's **What's new** card is written at each deploy from merged pull requests: every line in a pull request's description that starts `What's new:` becomes an entry (newest six shown), and each song added through the Submit a song form appears by itself. Write the line for players, in plain words. To have each one posted to Discord as it goes live, add a channel webhook URL as the repository secret `DISCORD_WEBHOOK_URL` (Settings → Secrets and variables → Actions). The code is `.github/scripts/whats-new.js`.

## Deploying

Every push to `main` deploys the whole site via `.github/workflows/deploy.yml`, which also rebuilds `tactical-aids/manifest.json` from the PDFs in `tactical-aids/pdfs/`. One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Each tool's old CI checks still run when that tool's folder changes; Engineering's and Navigation's also run when `shared/` changes, after writing the shared files in exactly as the deploy does. Tactical Aids needs no check: the deploy rebuilds its PDF list (and copies in the ship maps from `engineering/ship-maps/`) every time.

## Shared between the tools

Edit these, not the copies inside the tools. The deploy writes them into every tool that uses them (`.github/scripts/sync-shared-lists.js`, between `ucn-lists:` marker comments), so each tool stays one self-contained page that works offline. Run `node .github/scripts/sync-shared-lists.js` to update the copies in the repo too.

| File | What it is |
|---|---|
| `shared/ucn-lists.json` | The known operations (with mission type) and the rank ladder |
| `shared/profile.js` | Your name and rank, typed once and filled into the other tools |
| `shared/share.js` | The "Share log" button on phones |
| `shared/offline-sw.js` | The offline copy for Comms Log, ID Card, Ship Search and Mission Stats |

The deploy also stamps the service-worker cache versions of Songbook, Tactical Aids, Mess Log, Mission Companion and Engineering from a hash of their files (`.github/scripts/stamp-cache-versions.js`), so a change always reaches phones that already have the tool.

The homepage's **Back up & restore** card saves every tool's data in one file.

On iPhone, every Home Screen app keeps its own storage, separate from Safari and from each other, so the tools' install prompts there point to the homepage: added once, it holds every tool, and they share their data.

All tools share one web origin, so each must keep its own `localStorage` keys and cache-name prefix, and a service worker must only delete caches carrying its own prefix.

## Features

- No build step and no dependencies to install — `index.html` carries all of its own CSS, JavaScript, and imagery, with `sw.js` alongside it for offline support
- UCN dark navy theme with orange/red accent colours, Exo 2 + Orbitron typography, and an animated starfield background
- Tools open in the same tab, so a home-screen install of the portal keeps the whole suite inside one app window
- Add to Home Screen support (iOS Safari meta tags + inline web app manifest for Android/Chrome), backed by a service worker so the installed app still opens offline
- Staggered entrance animation on load, and a starfield that both honour `prefers-reduced-motion`
- Fully responsive card grid

## Tech

Plain HTML, CSS, and vanilla JavaScript — no frameworks, no build tools, no external JS dependencies beyond Google Fonts (Exo 2, Orbitron).

Two files ship: `index.html` and `sw.js`. The service worker has to be a separate file because a browser will not register one from an inline or blob script, so the portal is not strictly single-file any more — but it is still copy-and-deploy, with nothing to compile.

## Disclaimer

All tools listed above are unofficial, fan-made projects created for the UCN community and are not affiliated with, endorsed by, or approved by Bridge Command / The London Space Elevator Limited. The Official Links section points to Bridge Command's own website and Discord server.
