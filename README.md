# CSS Weekly

Slides from every Computer Science Society committee weekly. The homepage (`index.html`, live at [cssweekly-seven.vercel.app](https://cssweekly-seven.vercel.app)) shows every weekly on one screen, with no scrolling, as a timeline from oldest (left) to latest (right): each has its date, title and a thumbnail of every slide. Click a title to open the deck, or a thumbnail to open it at that slide. On phones it becomes a normal scrolling page, oldest at the top.

| # | Date | Weekly | Deck |
|---|------|--------|------|
| 04 | Tue 20 Oct 2026 | Welcome, Junior Committee, plus CSS Jeopardy (3 slides) | [`weeklies/04-welcome-jc/`](weeklies/04-welcome-jc/) |
| 03 | Tue 13 Oct 2026 | Induction committee briefing (8 slides) | [`weeklies/03-induction/`](weeklies/03-induction/) |
| 02 | Mon 5 Oct 2026 | CS Fair briefing (6 slides). Held a day early because the fair took Tuesday | [`weeklies/02-cs-fair/`](weeklies/02-cs-fair/) |
| 01 | Wed 30 Sep 2026 | First committee meeting (7 slides) | [`weeklies/01-first-meeting/`](weeklies/01-first-meeting/) |

Regular slot: Tuesdays at 6 PM, under an hour.

## Presenting

- Left and right arrows, Page Up and Page Down: change slides
- Home and End: first and last slide
- F: fullscreen
- P: print every slide (weeklies 01 and 02)

Weekly 04 slide 3 is CSS Jeopardy (4 categories × 5 tiers). Click a square to open its question; it is crossed off straight away. A right answer adds the points and a wrong answer takes the same amount off: use the Right and Wrong buttons, or 1–6 for right and Shift+1–6 for wrong. Enter shows the answer, 0 means nobody got it and Esc goes back to the board. The motto question has a +200 Latin bonus. Undo reverses the last score change, and scores are saved in the browser until you click Reset game.

Weekly 03 has a 10-minute countdown on slide 4, before Round 1. Click Press start or press S to start or pause; M mutes and R resets. It plays Space Walk by Silent Partner from the YouTube Audio Library (no attribution required), embedded in the deck, and pauses when you leave the slide.

## Layout

- `index.html` and `weeklies/archive.css`: the archive homepage
- `weeklies/NN-name/`: one folder per weekly. Weeklies 01 and 02 each have their own `styles.css` and `slides.js` and share `assets/`; weekly 03 is a single self-contained file
- `weeklies/thumbs/NN-S.jpg`: slide thumbnails (weekly NN, slide S), 640×360
- `cs-fair-briefing.html`: redirects the old CS Fair link to `weeklies/02-cs-fair/`

## Adding a new weekly

1. Put the deck in `weeklies/05-short-name/index.html`.
2. Add a thumbnail per slide as `weeklies/thumbs/05-1.jpg`, `05-2.jpg` and so on (16:9, 640 wide).
3. In `index.html`, copy the latest `<article class="weekly latest">` block to the end of the `.grid`, then update its number, date, title and thumbnails. Remove ` latest` from the old block's class and delete its `LATEST` tag. Update `--cols` on `<main class="stage">` to the new number of weeklies. The weeklies sit side by side, so they get narrower as more are added; past about six, the page will need a different layout.

## Credits

The visual style adapts [CSS Photo Club Design 2](https://github.com/Yoonjae7/cssphotoclub): retro computer windows, lavender borders, mint cursor, Pixelify Sans headings and a terminal footer. The CSS logo and the bundled Pixelify Sans and DM Sans fonts come from that repository. Font licenses are in `assets/fonts/`.
