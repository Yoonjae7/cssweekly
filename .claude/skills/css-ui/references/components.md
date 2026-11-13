# CSS UI component catalogue

Class names are from `assets/deck-template.html` (every class below is already styled there). Hub classes are in `hub.css`.

## Frame

| Class | What it is |
|---|---|
| `.stage` | Fixed 1920×1080 board, centred and scaled by `--s` |
| `.slide` | One slide: paper background with a 48px grid (`rgba(112,112,162,.07)` lines) |
| `.eyebrow` | Small uppercase label above a heading. Pattern: `Computer Science Society / Section` |
| `.head` | Heading block, absolute at `top:96px; left/right:120px`. Holds eyebrow, `h1`, `.lede` |
| `h1 em` | Purple emphasis, usually the last phrase: `Three speakers, <em>one panel.</em>` |
| `.lede` | One-line subtitle, 34px, muted |
| `.footer` | `Deck / Topic` left, `03 / 07` right, Pixelify 24px, 50px from the bottom |
| `.rise`, `.pop` | Entrance animations, staggered with `style="--d:N"` (120ms steps) |

## Window (the signature component)

```html
<article class="person pop" style="--d:3">          <!-- or .window / .perk / .next / .doc -->
  <div class="bar"><span>speaker_01</span><span class="lights" aria-hidden="true"><i></i><i></i><i></i></span></div>
  ...
</article>
```

Purple title bar (48–54px) with a Pixelify title and three pale squares, 4px ink border, `12px 12px 0 var(--shadow)`. `.bar` inside `.person` and `.perk` is 48px; the standalone `.window` bar is 54px. Dark variant: body `background: var(--screen)` with mint Pixelify text (cover window, "next steps" box).

## People

- `.speakers` grid of three `.person` windows. Inside: `.photo` (or `.blank` initial/`?` circle), `.info` with `h3` name and `.role`.
- `.stamp` (CONFIRMED, mint) and `.stamp.invited` (lavender): absolute, top-right of the window, rotated 3°, 4px ink border, Pixelify 24px.
- `.person.open`: dashed border, transparent, no shadow, for an unfilled slot.
- `.facts`: three-column row under the cards, each with a mint left rule and a small label (`Venue`, `Date`, `Promotion`).

## Lists and steps

- `.steps` > `.step`: 74px numbered tile (`style="--c:var(--mint)"` cycling mint, pink, lavender, sun) beside a bold line and a muted line. Same pattern as `.need` and `.ask`.
- `.road` > `.stop`: 3×2 card grid, numbered corner tile, `h3`, `p`, optional `.chip` (sun yellow, for timing like `THIS WEEK`). `.stop.final` is the mint finish card.
- `.perks` > `.perk`: window cards with a filled-colour pixel icon (SVG, 5px ink stroke), `h3`, `p`. Three or four across (four across: 38px `h3`, 26px `p`).

## Callouts

- `.tag`: mint button-style label with a hard shadow (cover). Not clickable.
- `.chip`: small sun-yellow timing label inside a card.
- `.note-strip`: one muted line under cards, with a small mint square bullet.
- `.doc`: a window styled as a document mock-up (`.org`, `h3`, `.line` placeholder bars, `.sign`).
- `.poster-win` > `.poster`: a poster preview (`.ph` circular silhouette, `.who` as `Name | Role, Company`).
- `.closing` / `.next`: dark window with a mint `> LABEL` line, one short paragraph, a dashed rule, then a bold mint sign-off.

## Icons

Pixel-style filled SVGs in a `viewBox="0 0 150 110"`: shapes filled with mint, pink, lavender or sun, plus `#fbfaf6` highlights and `#303044` details; every shape strokes ink with `stroke-width:5; stroke-linejoin:round; stroke-linecap:round` (set once on `.perk svg *`). Existing icons: car, gift, plate with fork and knife, speech bubble with a star.

## Hub classes (`hub.css`)

`.hero`, `.badge`, `.jumps` > `.jump` (numbered jump cards), `.sec-head` + `.sec-no`, `.decks` / `.decks.two` / `.cols`, `.deck` (window card) > `.deck-body` > `.tag`, `h3`, `.note`, `.thumbs` > `a` > `.shot` (+ `b` index badge) + `.cap`, `.deck-foot` > `.count`, `.open` (mint button). Breakpoints: 1000px collapses the two-column layouts; 760px stacks the hero and hides the logo badge. The hub uses `--muted:#5f5d76` and `--card:#fbfaf6` (slightly different from decks).

## Known traps

- A heading in Pixelify uppercase can mangle a name's casing. Keep names in their written case ("Wyhow", "Asadullah"); the footer pattern `CSS × Name / Topic` renders fine in mixed case.
- `.person .photo` must stay `object-fit: cover` and square, or portraits stretch.
- `.lede` max-width is 1500px on `.head`; longer text wraps and collides with the cards.
- Cover title width: at 140px a 13-character name still fits beside the logo window. Drop the size before letting it wrap.
- A copied deck keeps the old names in the `<title>`, `aria-label`s, footers, thanks line and the script's `document.title`. Search for all of them.
