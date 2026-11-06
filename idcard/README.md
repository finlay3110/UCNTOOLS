# UCN ID Card Generator

A browser-based tool for generating United Confederation Navy crew ID cards.

**Fan-made project.** Not affiliated with, endorsed by, or approved by Bridge
Command / The London Space Elevator Limited. The UCN logo is their property.

Live at **[toolportal.netlify.app](https://toolportal.netlify.app)**

---

## What it does

- Fill in a form — Name, Pronouns, Rank, Ship, Division, Clearance level, Task
  group, ID number — and see the card update live as you type.
- Upload your own photo (passport-style crop), or leave the placeholder box.
- Choose a barcode or a QR code for the ID number.
- Five clearance levels, each with its own colour treatment: Emerald, Amber,
  Scarlet, Obsidian (subtle sparkle), Gravium (violet gradient + shimmer).
- **Download PDF (A4, cut lines)** — a full A4 sheet with the card at true
  credit-card size (CR-80, 3.370″ × 2.125″) and dashed cut marks around it.
- **Download PDF (card size)** — a page sized exactly to the card itself, no
  margins, for anyone printing directly onto pre-cut card stock.
- Both PDFs are double-sided: front is the card you built, back is a QR code
  linking to this tool plus the fan-project disclaimer. Print double-sided
  ("flip on long edge") and the back lines up correctly with the front.
- **Batch printing** — export a card as a small file, send it to someone,
  import theirs back, queue up a whole crew, and print everyone at once:
  10 cards per A4 sheet, double-sided, with cut marks. Good for print runs
  covering a full roster instead of one card at a time.
- Runs entirely in the browser. Nothing typed or uploaded is sent anywhere —
  the photo, the batch files, all of it stays on your device.

---

## Structure

```
index.html          the page itself
css/style.css        all styling
js/app.js            form handling, live preview, PDF generation, batch printing
js/vendor/           jsPDF, vendored locally (not loaded from a CDN)
fonts/               Exo 2 + Orbitron .ttf files, embedded into generated PDFs
assets/              logo, watermark, and clearance-level background images
```

Two more libraries — JsBarcode and QRCode.js — are loaded from cdnjs rather
than vendored, so an internet connection is needed for the barcode/QR
feature, and for the Exo 2 / Orbitron webfonts shown on-screen (Google
Fonts). This doesn't affect the "nothing leaves your device" privacy note —
those are just asset downloads, not uploads of anything you've typed.

---

## Editing

- **Colours, layout, fonts:** `css/style.css`
- **Form fields, live preview, PDF drawing:** `js/app.js`
- **Card front layout:** `drawCardFront()` in `js/app.js` — draws directly
  onto the PDF with jsPDF (not a screenshot of the HTML), so this is also
  the source of truth for exact positioning/sizing on the printed card.
- **Card back layout:** `drawCardBack()` — same idea, for the QR + disclaimer
  side.
- **Fonts embedded in the PDF:** see `registerFonts()` — add/replace files in
  `fonts/` and update the list there. (These are separate from the on-screen
  Google Fonts link in `index.html`.)
- **Batch/grid layout:** `buildBatchPdf()` — controls how many cards fit per
  sheet and the cut-mark spacing.

## Standing conventions for this project

- PDF generation always goes through jsPDF, drawn directly — never browser
  print-to-PDF or an HTML-to-image screenshot approach. Screenshot-based
  export was tried early on and doesn't reliably survive different browsers.
- No emoji in the UI — inline SVG line-icons instead, styled with
  `currentColor` in the UCN cyan/orange palette, for a consistent look across
  platforms.
