---
name: css-ui
description: Design system for Computer Science Society (CSS) UI. Use when building or editing anything for the society in its retro-computer style: slide decks (weeklies, event screens, external relations / speaker decks), the CSS Slides hub homepage, posters, cards and web pages. Triggers on "CSS slides", "weekly", "panel talk", "speaker deck", "hub", pixel headings, window cards, lavender and mint palette.
---

# CSS UI

The look of the Computer Science Society (CSS): a retro computer desktop. Pixel headings, window frames with a purple title bar, hard lavender shadows, pastel tiles, a faint paper grid. It is cheerful but tidy. This repo (`cssweekly`) is the reference implementation.

## Start from the right file

| Making | Start from | Register |
|---|---|---|
| A new slide deck | `assets/deck-template.html` in this skill (copy it to `<section>/<NN-name>/index.html`) | pick below |
| A weekly or event deck | `weeklies/04-welcome-jc/index.html` | playful |
| A deck for people outside the society (speakers, partners, the university) | `external/01-wyhow-panel/index.html` | formal |
| The hub homepage | `index.html` + `hub.css` | playful |
| Anything new | `references/components.md` for the class catalogue | either |

Fonts and the logo live in `assets/` at the repo root (`assets/fonts/*.ttf`, `assets/css-logo.png`). Never load fonts from a CDN.

## Tokens

```
--paper:#f8f7f2   page background (with a faint 48px grid)
--card:#fdfcf9    card surface
--ink:#303044     text, borders
--purple:#7070a2  accent, window title bars, <em> in headings
--lavender:#b3aee0
--shadow:#d6d4e2  hard offset shadows
--screen:#2a2838  dark "screen" panels
--mint:#98e7ad    positive, buttons, "confirmed"
--pink:#f1a1db    secondary tile colour
--sun:#fbe7a6     chips, fourth tile colour
--muted:#55536a   secondary text
```

Tile colours always cycle in this order: mint, pink, lavender, sun.

Type: **Pixelify Sans** for headings and small mono labels, **DM Sans** for everything you read. Pixelify's digits are ambiguous (2 looks like 8, 5 like S), so load the `ClearDigits` font-face (DM Sans limited to `U+0030-0039`) and put it first in the heading font stack: `font-family: ClearDigits, Pixelify, monospace`.

Slide type scale on the 1920×1080 stage: cover title 140–170px, slide title 96–104px (the last word or phrase wrapped in `<em>` for purple), eyebrow 24px uppercase 600 weight with 5px letter-spacing, lede 34px muted on **one line**, body 26–30px, footer 24px Pixelify.

Geometry: 120px side margins, heading block at top 96px, content from about y=400, **content must end by about y=950** (footer sits at the bottom 50px). Borders 4px ink, card shadow `12px 12px 0 var(--shadow)`, no blur anywhere.

## Two registers

**Playful** (weeklies, countdown, Jeopardy, hub): small tilts (±1.5°), washi tape, spinning asterisks, tiny confetti squares, binary strip, envelope doodle, `.exe` window titles, light jokes.

**Formal** (anything a guest or outsider will read): the same system, calmer. No tilt (stamps may sit at 3°), no tape, asterisks, binary or envelope. Window titles are plain words (`speaker_01`, `travel`, `gift`), not `.exe`. Copy is polite and plain. Photos are circular portraits.

Do not "fix" a formal deck by making it flat, white and corporate. That was tried and rejected: keep the pixel headings, window frames and hard shadows, and only remove the decoration.

## Slide decks

One self-contained `index.html` per deck: inline CSS, a 1920×1080 `.stage` scaled to the window with `--s`, one `<section class="slide" hidden>` per slide. The engine in the template gives:

- Right arrow, Page Down, Space: next. Left arrow, Page Up, Shift+Space: back. Home and End. F fullscreen. P print. Click left or right half of the screen. `#N` in the URL.
- **No replay at the ends.** `show()` returns early when the target slide is the current one (`shown` flag). Keep this in every deck. A Next press on the last slide must do nothing, not re-run the entrance animation.
- Entrance animations (`.rise`, `.pop` with `--d:N` stagger) replay when a slide is shown, and are disabled under `prefers-reduced-motion`.
- Print CSS stacks every slide on its own 1920×1080 page.

Rules for content:

- About 7 slides or fewer, one idea each. A lede is one line, never wrapped.
- Footer pattern: `Deck name / Topic` on the left, `03 / 07` on the right. Update every footer count when you add, remove or reorder slides.
- Cards that wrap to 3+ lines push the row into the footer. Shorten the copy first, shrink type last.
- Address the recipient as "you". Do not use he/she for a person unless told.
- Never invent facts (dates, amounts, roles, times). Use a clearly marked placeholder and tell the user what is missing. Use names exactly as the user spells them. Currency is RM.
- People: circular portrait 200px, 4px ink border, `8px 8px 0` shadow, square-cropped JPEG at 640px stored in the deck folder, `object-position: center 30%`, alt text `Photo of Name`. Status as a rotated stamp on the window (CONFIRMED mint, INVITED lavender). An unfilled slot is a dashed card with a `?` circle.

## Slide hub (`index.html` + `hub.css`)

A scrolling page, not a fixed board: header with logo window and three jump cards, then CSS Weeklies (latest first, two cards across), then Event material and External relations side by side. A deck is one window card: title bar `name.exe`, tag line, `h3` link, a thumbnail per slide with caption, then `N SLIDES` and an "Open deck →" button. Cards are all the same width.

Adding a deck:

1. Put it in `weeklies/NN-name/`, `external/NN-name/` or a new events folder.
2. Make 640×360 thumbnails in that section's `thumbs/` (`NN-S.jpg`).
3. Copy an existing `<article class="deck">` into the right section of `index.html`; update title, links, captions, slide count.
4. Add a row to the README table.

## Making thumbnails and checking your work

Always look at every slide before saying it is done. On macOS:

```bash
# serve the repo, then screenshot a slide (the hash picks the slide)
python3 -m http.server 8765 &
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --hide-scrollbars --window-size=1920,1080 --virtual-time-budget=5000 \
  --screenshot=out.png "http://localhost:8765/external/01-name/#3"
sips -s format jpeg -s formatOptions 82 --resampleWidth 640 out.png --out thumbs/01-3.jpg
```

Notes: macOS has no `timeout` command. Screenshot each slide in its own call (a long loop can exceed the tool time limit). If a slide comes out blank except for the footer, it was a timing flake: shoot it again. Regenerate thumbnails for every slide whose content changed, and stop the server when done.

Check each slide for: lede on one line, no text touching a card edge or the footer, nothing past y≈950, stamps not covering the title-bar dots, and phone width for the hub (no horizontal scroll).

## Before you finish

- Footer counts, hub captions, hub slide count and README all match the deck.
- No leftover names from a copied deck (`grep -ri oldname`).
- Commit and push only when the user asks. Photos of real people become public once pushed, so confirm they were supplied for the deck.
