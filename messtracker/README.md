# UCN Mess Log

A phone-sized tool for working through the UCN mess menu: log which drinks you
had on which day with a 0–5 star score and notes, tick off what you have tried,
and export the record as CSV, JSON or PDF.

Everything is stored on your own device. Nothing is uploaded or synced, and the
app makes **no network requests at all** — the fonts, jsPDF and the default menu
are built into the page, so it works offline on a cold first launch with no
signal.

Fan-made and **not affiliated** with Bridge Command / The London Space Elevator
Limited.

## Running it

`index.html` is the whole app. There is nothing to install and nothing to build.

- **Open it directly.** Download `index.html` and open it. It works from
  `file://`, just without the offline service worker.
- **Serve it.** Any static server will do: `npx http-server -p 8080 -c-1`, then
  visit <http://localhost:8080>. A service worker needs a real origin, so this
  is the way to test offline behaviour.

## Deploying it

The app files live at the **repository root** and there is no build step, so a
static host can serve the repository as-is.

`netlify.toml` pins the publish directory to the repository root and marks
`index.html`, `sw.js` and `manifest.json` as must-revalidate, so a CDN copy can
never keep serving an old build after an update. Netlify needs no build command.

Any other static host works the same way — every path the page references is
relative, so it can be served from a domain root or from a project subpath
without configuration.

Open the deployed URL on a phone and use **Add to Home Screen** to install it.
It then launches full-screen and runs offline.

## Files

| File | What it is |
|---|---|
| `index.html` | The entire application — markup, styles, script, fonts and jsPDF, all inlined |
| `manifest.json` | Web app manifest, so it installs to the home screen |
| `sw.js` | Service worker. `CACHE_VERSION` is a content hash, regenerated whenever the cached files change |
| `icon-192.png`, `icon-512.png` | Home-screen icons |
| `netlify.toml` | Publish directory and cache headers for Netlify |
| `NOTICES.md`, `licences/` | Third-party licences for the embedded fonts and jsPDF |

## The menu

The app ships with the 19-drink mess menu built in. You can replace it with your
own CSV from the Setup tab — columns `Category,Name,Price,Description,Source Menu`,
of which only `Name` is required. Importing a menu never touches your log or your
tried marks; they are matched back up by drink name.

Drinks that are not on the menu can be logged with **Other / off-menu…** on the
Log tab, and appear in an **Off menu** group at the foot of the Menu tab, where
they can be added to the menu properly.
