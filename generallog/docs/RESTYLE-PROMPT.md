# Restyle prompt — the log screen only

Paste everything below the line into an LLM along with the app you want changed.
Fill in the three `<...>` placeholders first.

Scoped deliberately to the log area: the entry blocks, the compose card, the
critical flag and the quick-entry buttons. It says nothing about the app's header,
navigation, other screens or overall chrome, because those are not being edited.

The CSS is lifted verbatim from the UCN General Log, so it is known to work rather
than approximated.

---

You are restyling **one screen** of an existing app: the log screen, where records
are written and listed. Below is the look, the components, and a hard list of things
you must not break.

**The app:** `<NAME + ONE LINE ON WHAT IT DOES>`

**The log screen:** `<WHICH FILE / COMPONENT / ROUTE IS THE LOG SCREEN>`

**The code:** `<PASTE IT, OR NAME IT IF IT IS ALREADY IN CONTEXT>`

## Rule zero — scope, and what survives

**Only the log screen changes.** Do not restyle the header, the navigation, other
screens, or anything shared unless the log screen is visibly broken without it. If a
style you need already exists in the app, reuse it rather than adding a parallel one.
If a class name here collides with something already in the app, prefix mine rather
than editing theirs.

This is a visual change. Keep the existing behaviour, data model, storage format,
element ids, event handlers and function names unless the markup strictly forces a
change. Do not "modernise" logic you were not asked about.

**Do not remove any feature. In particular this screen has quick-entry buttons —
one-tap buttons that log a record immediately. They stay.** Restyle them (there is a
section on exactly how), never delete, merge, or hide them behind a menu. If you
think a quick-entry button conflicts with the style, say so in your summary and leave
it working; do not resolve it by deleting it.

At the end, list what you restyled, anything you changed structurally and why, and
anything you left alone because touching it risked behaviour.

## The feel

A naval bridge console: dark, high-contrast, navy and amber. Used one-handed on a
phone, in a darkened room, mid-session, by someone who is also doing something else.
Dense and functional, not airy. Mobile-first — design for ~414×896 and let the column
centre with a `max-width` around 520px rather than widening.

Dark only on this screen. Do not add a light variant or a theme switch.

## Tokens

Only the ones these components need. Add any the app does not already define.

```css
:root{
  --navy:#1B2A5E;  --orange:#DD7A2B;  --red:#B23A3A;  --white:#ffffff;
  --card:#141c38;  --card-hi:#1b254a; --border:#2a3a66;
  --text:#e8ecf7;  --muted:#8c98bf;

  --font-display:'Orbitron', 'Exo 2', system-ui, sans-serif;
  --font-body:'Exo 2', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}
```

Orbitron for structural text — headings, badges, timestamps. Always uppercase,
letter-spacing 0.04–0.10em. Exo 2 for body text and inputs. Small and dense: 9–10px
uppercase labels, 13–14px body.

If the app already loads fonts, keep its loading strategy and point these two
variables at Orbitron and Exo 2. **Do not introduce a font CDN into an app that does
not already make network requests.**

Orange is the primary-action colour: **one solid orange call-to-action on this
screen**, plus the section headings. Red means destructive or critical — nothing else.

## Section headings

The log screen wants two: one over the compose card, one over the list.

```css
.sec{
  font-family:var(--font-display); font-size:13px; letter-spacing:0.1em;
  text-transform:uppercase; color:var(--orange); font-weight:700;
  margin:18px 0 8px; padding-bottom:6px; border-bottom:1px solid var(--border);
}
.sec-sub{ font-size:11px; color:var(--muted); margin:-4px 0 10px; }
```

The sub-line under a heading is worth using. It is where you say the thing the user
would otherwise have to guess — "Timestamped the moment you save it", or who the
record will be filed under. Put the record count in the list heading:
`ENTRIES (12)`, and `ENTRIES (3 OF 12)` when a filter is on.

## Fields

```css
.f{ margin-bottom:10px; }
label{
  display:block;
  font-size:10px; text-transform:uppercase; letter-spacing:0.06em;
  color:var(--muted); font-weight:600; margin-bottom:3px;
}
input, select, textarea{
  width:100%; background:rgba(255,255,255,0.05); border:1px solid var(--border);
  color:var(--text); border-radius:9px; padding:10px; font-size:14px;
  font-family:var(--font-body);
  transition:border-color .2s, background-color .2s;
}
input:focus, select:focus, textarea:focus{
  outline:none; border-color:var(--orange); background:rgba(221,122,43,0.08);
}
textarea{ resize:vertical; min-height:70px; line-height:1.5; }
select option{ color:#16204a; background:#ffffff; }
.row{ display:flex; gap:8px; }
.row > .f{ flex:1; min-width:0; }
```

`select option` needs that explicit colour or the options render unreadable on some
platforms. Two fields side by side go in a `.row`.

# Component 1 — the compose card

The "write a new record" block. Anatomy, top to bottom:

1. Section heading (`NEW ENTRY`) with a muted sub-line saying what happens on save.
2. **One card** holding every input: the classifying select(s) first, then the
   textarea, then any toggles. Nothing else — **no buttons inside the card.**
3. **The solid orange primary button sits below the card, not inside it.** That
   separation is the whole trick: the card is the form, the button is the commitment.

```css
.card{
  background:linear-gradient(160deg, var(--card) 0%, var(--card-hi) 100%);
  border:1px solid var(--border); border-radius:14px; padding:12px 12px 10px;
  margin-bottom:10px;
}
.btn-primary{
  display:block; width:100%; border:0; cursor:pointer;
  background:var(--orange); color:#241100;
  border-radius:16px; padding:22px 14px; font-size:17px; font-weight:700;
  font-family:var(--font-body);
  box-shadow:0 6px 22px rgba(221,122,43,0.30);
  letter-spacing:0.02em;
}
.btn-primary:active{ background:#c96b22; }
.btn-primary[disabled]{ opacity:0.45; box-shadow:none; cursor:default; }
```

The button is deliberately tall — 22px of vertical padding. It is the one thing on
the screen that must be hittable without looking.

Any boolean in the card is a toggle switch, not a checkbox. Use a real `role="switch"`
with `aria-checked` kept in sync.

```css
.sw-row{ display:flex; align-items:center; gap:10px; margin:6px 0 10px; }
.sw-row .sw-lb{ flex:1; min-width:0; font-size:13px; }
.sw-row .sw-lb small{ display:block; font-size:11px; color:var(--muted); }
.sw{
  flex:0 0 46px; width:46px; height:26px; border-radius:13px; cursor:pointer;
  background:rgba(255,255,255,0.10); border:1px solid var(--border);
  position:relative; padding:0; transition:background-color .18s;
}
.sw::after{
  content:''; position:absolute; top:2px; left:2px; width:20px; height:20px;
  border-radius:50%; background:var(--white); transition:transform .18s;
}
.sw[aria-checked="true"]{ background:var(--orange); border-color:var(--orange); }
.sw[aria-checked="true"]::after{ transform:translateX(20px); }
```

**On save:** clear the text, reset the toggles, leave the classifying select where it
is, and confirm with a toast — never an `alert()`. Put something useful in the toast:
not "Saved" but "Logged at 21:14". If the text is empty, do not save; focus the
textarea and toast "Write the entry first".

```css
.toast{
  position:fixed; left:50%; bottom:24px;      /* clear any fixed bottom chrome */
  transform:translate(-50%, 10px); z-index:60;
  background:var(--orange); color:#241100; border-radius:24px;
  padding:10px 18px; font-size:13px; font-weight:600; max-width:90vw;
  box-shadow:0 8px 26px rgba(0,0,0,0.45);
  opacity:0; pointer-events:none; transition:opacity .25s ease, transform .25s ease;
}
.toast.on{ opacity:1; transform:translate(-50%, 0); }
```

Give it `role="status"` and `aria-live="polite"`. Show for ~1.8s.

# Component 2 — the log block

One record, one card, reusing `.card` above. Anatomy:

- **Head row** — a badge on the left naming the record's type; a flexible spacer; the
  timestamp on the right in Orbitron orange with the date beneath it in 9px muted;
  then a 30px round red delete button.
- **Body** — the text at 13.5px, `white-space:pre-wrap`, never truncated.
- **Foot row** — a spacer, then a small quiet Edit button on the right.

```css
.card-head{ display:flex; align-items:center; gap:8px; margin-bottom:9px; }
.card-head .grow{ flex:1; min-width:0; }
.badge{
  font-family:var(--font-display); font-size:12px; font-weight:700;
  letter-spacing:0.05em; text-transform:uppercase;
  color:var(--white); background:var(--navy); border:1px solid var(--orange);
  border-radius:7px; padding:4px 9px; max-width:100%;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.del{
  flex:0 0 30px; width:30px; height:30px; border-radius:50%;
  background:rgba(178,58,58,0.18); border:1px solid var(--red); color:#ff9d9d;
  font-size:14px; line-height:1; cursor:pointer; padding:0;
  display:flex; align-items:center; justify-content:center;
}
.ent-time{
  font-family:var(--font-display); font-size:12px; font-weight:700;
  letter-spacing:0.06em; color:var(--orange); white-space:nowrap;
}
.ent-time small{ display:block; color:var(--muted); font-size:9px; letter-spacing:0.08em; }
.ent-tx{ font-size:13.5px; line-height:1.5; white-space:pre-wrap; word-wrap:break-word; margin:0; }
.ent-foot{ display:flex; gap:8px; align-items:center; margin-top:9px; }
.ent-foot .grow{ flex:1; min-width:0; }
.ent-foot .btn-quiet{ margin:0; padding:7px 10px; font-size:12px; width:auto; border-radius:9px; }
.btn-quiet{
  cursor:pointer; background:rgba(255,255,255,0.04); border:1px solid var(--border);
  color:var(--text); border-radius:12px; padding:12px;
  font-family:var(--font-body); font-size:14px; text-align:left;
}
.btn-quiet:active{ background:rgba(221,122,43,0.10); }
```

The time is the loudest thing in the head row after the badge, because scanning a log
means scanning times. Date goes underneath in muted 9px — present, not competing.

**Order newest first.** Where two records share a timestamp, break the tie on
insertion order so the later one still sorts first; a plain string compare on the
timestamp silently puts same-minute records the wrong way round.

**Empty state**, always a sentence, never blank space:

```css
.empty{ font-style:italic; color:var(--muted); font-size:13px; margin:6px 0 2px; }
```

"None recorded." when there is nothing; "No entries match the filter." when a filter
is hiding everything. Those are different states and must read differently.

Deleting asks first. Say what is lost and that it cannot be recovered.

# Component 3 — the critical flag

When a record is flagged, make it unmissable rather than tasteful. It has to register
while the user is scrolling past at speed, in the dark, not looking properly.

Three things at once: a **full-bleed red banner across the top of the card**, a **2px
red border**, and a **red-tinted body**. Not one of the three — all three.

```css
.card.crit{
  border:2px solid var(--red); padding:11px 11px 9px;
  background:linear-gradient(160deg, #2b1526 0%, #35202f 100%);
  box-shadow:0 0 0 1px rgba(178,58,58,0.35), 0 4px 18px rgba(178,58,58,0.22);
}
.crit-bar{
  display:flex; align-items:center; gap:7px;
  margin:-11px -11px 10px; padding:7px 11px;
  background:var(--red); color:var(--white); border-radius:11px 11px 0 0;
  font-family:var(--font-display); font-size:10px; font-weight:700;
  letter-spacing:0.1em; text-transform:uppercase;
}
.crit-bar .ic{ font-size:12px; line-height:1; }
.card.crit .badge{ border-color:#ff9d9d; }
```

Markup: the banner is the **first child of the card**, before the head row.

```html
<div class="card crit">
  <div class="crit-bar"><span class="ic" aria-hidden="true">☢️</span>Critical entry</div>
  <div class="card-head">…</div>
  …
</div>
```

Three details that are easy to get wrong:

- The negative margins pull the banner out to the card edge, so **they must match the
  `.card.crit` padding** (11px here, one less than `.card` because the border grew by
  one). Get this wrong and the banner floats with a hairline gutter.
- The banner's top radius is the **card radius minus the border width** — 14 − 2 = 11
  — or you get a pale crescent in each top corner.
- The emoji is decorative, so `aria-hidden`. The word "Critical" carries the meaning.

The compose card's toggle sets this. Label it "Flag as critical" with a muted
sub-line saying what it does: "Bannered red here, and called out in the report."

# Component 4 — the quick-entry buttons (keep these)

These are the fastest path on the screen. Their behaviour does not change at all;
only their look does.

Dashed-orange, in a grid directly under the compose card's primary button, with their
own muted label or small section heading:

```css
.quick{ display:grid; grid-template-columns:repeat(2, 1fr); gap:8px; margin-top:10px; }
.quick button{
  cursor:pointer; background:rgba(221,122,43,0.12); border:1.5px dashed var(--orange);
  color:var(--orange); border-radius:12px; padding:12px 10px;
  font-family:var(--font-body); font-size:14px; font-weight:600;
  min-height:48px; text-align:center;
}
.quick button:active{ background:rgba(221,122,43,0.22); }
```

Two per row at phone width. Drop to one column if the labels are long, go to three if
they are single words. Never below a 44px tap target.

**Why dashed and not solid:** the solid orange primary button is the one loud call to
action on the screen. Dashed-orange reads as the same family — "this also files a
record" — while keeping the hierarchy legible. Do not promote a quick button to solid
orange, and do not demote it to grey.

If a quick button carries an emoji, put it before the label at 16px; the label still
carries the meaning, so it must read correctly with the emoji ignored.

**Every quick-entry tap fires a toast naming what was logged**, because the record it
creates is often below the fold and the user gets no other confirmation.

## Interaction rules for this screen

- If you set `-webkit-tap-highlight-color:transparent` to kill the touch flash, you
  MUST add `:focus-visible{ outline:2px solid var(--orange); outline-offset:2px }` or
  keyboard focus becomes invisible.
- Icons are emoji, sparse and functional (🗒️ ⏱️ ☢️ ⚡ 🔧). Never where a word is clearer.
- Honour `prefers-reduced-motion` by dropping the transitions.
- If Edit opens a dialog, use whatever pattern the app already uses. If it has none,
  a bottom sheet suits this style: full width, `max-width:520px`, `max-height:88vh`,
  `border-radius:18px 18px 0 0`, 2px orange top border, on an `rgba(8,12,24,0.72)`
  scrim, closing on Escape and backdrop click, with focus moved in on open and
  returned to the trigger on close.

## Gotchas that will bite you

- **`[hidden]` loses to any class that sets `display`.** `.crit-bar` sets
  `display:flex`, so toggling the `hidden` attribute on it does nothing and *every*
  record renders as critical. Add `[hidden]{ display:none !important; }` once,
  globally, and toggle with the attribute rather than inline styles. This one is not
  hypothetical — it shipped and had to be fixed.
- Set record text with `textContent`, never `innerHTML`. Use `innerHTML` only for
  static templates you wrote yourself, then fill values in afterwards.
- The card's `padding` and `.crit-bar`'s negative `margin` are a matched pair. Change
  one, change the other.

## Do not

- Restyle anything outside the log screen.
- Add a light variant or a theme switch.
- Put a button inside the compose card, or more than one solid orange call-to-action
  on the screen.
- Use pill-rounded "friendly app" corners. Corners are 7–16px, except the toast (24px)
  and the toggle switch.
- Truncate record text in the list, or replace an empty state with blank space.
- Add a network request of any kind.
- Remove, merge or hide the quick-entry buttons.

## Acceptance checklist

Confirm each of these before you answer:

- [ ] Every quick-entry button that existed still exists, still fires the same
      handler, and is still one tap from the same screen.
- [ ] No feature, handler or stored field was removed; nothing outside the log screen
      was restyled.
- [ ] The primary button sits below the compose card, not inside it, and is the only
      solid orange call-to-action on the screen.
- [ ] A flagged record has all three of banner, 2px border and tinted body, and is
      obvious while scrolling past.
- [ ] `[hidden]{display:none !important}` is present and unflagged records show no
      banner.
- [ ] Records are newest first, with same-timestamp ties in the right order.
- [ ] Both empty states read as italic muted sentences, and say different things.
- [ ] Focus is visible on keyboard navigation.
- [ ] Nothing loads over the network that did not before.
