# CSS Slides

Every slide the Computer Science Society has used, in one place. The homepage (`index.html` and `hub.css`, live at [cssweekly-seven.vercel.app](https://cssweekly-seven.vercel.app)) is a scrolling hub with three sections, each deck shown as a card with a thumbnail of every slide. Click a title to open the deck, or a thumbnail to open it at that slide.

1. **CSS Weeklies**: the committee meeting slides, latest first.
2. **Event material**: what we put on screen at events (the Play deck below).
3. **External relations**: decks for speakers, partners and the university.

## CSS Weeklies

| # | Date | Weekly | Deck |
|---|------|--------|------|
| 04 | Tue 20 Oct 2026 | Welcome, Junior Committee (2 slides) | [`weeklies/04-welcome-jc/`](weeklies/04-welcome-jc/) |
| 03 | Tue 13 Oct 2026 | Induction committee briefing (8 slides) | [`weeklies/03-induction/`](weeklies/03-induction/) |
| 02 | Mon 5 Oct 2026 | CS Fair briefing (6 slides). Held a day early because the fair took Tuesday | [`weeklies/02-cs-fair/`](weeklies/02-cs-fair/) |
| 01 | Wed 30 Sep 2026 | First committee meeting (7 slides) | [`weeklies/01-first-meeting/`](weeklies/01-first-meeting/) |

Regular slot: Tuesdays at 6 PM, under an hour.

## External relations

| # | Deck | Folder |
|---|------|--------|
| 03 | Computer Science Society Panel Talk, CSS × Matthew Pang: the invitation deck addressed to Matthew Pang, with Matthew Pang (Partner Technical Specialist, IBM) as the invited third speaker; Asadullah and Wyhow are shown as confirmed (7 slides) | [`external/03-matthew-pang-panel/`](external/03-matthew-pang-panel/) |
| 02 | Computer Science Society Panel Talk, CSS × Asadullah: the same deck addressed to Asadullah (Cognizant, confirmed speaker), with a congratulations on his marriage and wording for a speaker who has already confirmed (7 slides) | [`external/02-asadullah-panel/`](external/02-asadullah-panel/) |
| 01 | Computer Science Society Panel Talk, CSS × Wyhow: the deck we show Wyhow (Microsoft) when we meet to invite him to speak (7 slides: cover, the panel and our LinkedIn/Instagram promotion, speaker hospitality with the RM40 travel cap, the road to event day, optional MOU, what we need from the speaker with a poster preview, points to confirm) | [`external/01-wyhow-panel/`](external/01-wyhow-panel/) |

It is a single self-contained file with the same keys as the weeklies. Speakers: Asadullah (Data Scientist, Cognizant, confirmed), Wyhow (Solution Engineer, Microsoft, invited) and a third speaker still to be confirmed; update slide 2 and the thumbnails when that changes.

## Presenting

- Left and right arrows, Page Up and Page Down: change slides
- Home and End: first and last slide
- F: fullscreen
- P: print every slide (weeklies 01 and 02)

## Play: countdown, Canva and Jeopardy (one set of slides)

[`play/`](play/) is a separate three-slide deck for the big screen: **slide 1 is the 10-minute countdown, slide 2 is a link to our Canva slides and slide 3 is CSS Jeopardy**. Press the right arrow (or Page Down) to go to the next slide and the left arrow to go back. It has no links to the weeklies or the archive. The homepage links to it in a PLAY row under Week 4: Countdown opens slide 1 and Jeopardy opens slide 3.

- **Countdown (slide 1):** press Start (or Space), M mutes, R resets, and the up and down arrows add or remove a minute (open `play/countdown/?min=5` on its own for a different starting length). It shows the SA disclaimer QR code, plays Space Walk by Silent Partner from the YouTube Audio Library (no attribution required), and a goose runs by every minute (G calls it by hand). Leaving the slide pauses it.
- **Canva (slide 2):** one big button that opens the Canva design in a new tab; press Enter (or Space) the moment you arrive and it opens, with no click needed. The link is the `href` of `#go` in `play/canva/index.html`.
- **Jeopardy (slide 3):** 4 categories × 5 tiers. Click a square to open its question; it is crossed off straight away. A right answer adds the points and a wrong answer takes the same amount off: use the Right and Wrong buttons, or 1–6 for right and Shift+1–6 for wrong. Enter shows the answer, 0 means nobody got it and Esc goes back to the board. The motto question has a +200 Latin bonus. Undo reverses the last score change, and scores are saved in the browser until you click Reset game. While a question is open the arrows do nothing, so you can't skip ahead by accident.
- **F** goes fullscreen from any slide.

Weekly 03 has a 10-minute countdown on slide 4, before Round 1. Click Press start or press S to start or pause; M mutes and R resets. It plays Space Walk by Silent Partner from the YouTube Audio Library (no attribution required), embedded in the deck, and pauses when you leave the slide.

## Layout

- `index.html` and `hub.css`: the slide hub homepage
- `play/`: the countdown, Canva and Jeopardy deck (`play/countdown/`, `play/canva/` and `play/jeopardy/` are its three slides); thumbnails in `play/thumbs/N.jpg`
- `weeklies/NN-name/`: one folder per weekly. Weeklies 01 and 02 each have their own `styles.css` and `slides.js` and share `assets/`; weekly 03 is a single self-contained file
- `weeklies/thumbs/NN-S.jpg`: slide thumbnails (weekly NN, slide S), 640×360
- `external/NN-name/`: one folder per external relations deck, with thumbnails in `external/thumbs/NN-S.jpg`
- `cs-fair-briefing.html`: redirects the old CS Fair link to `weeklies/02-cs-fair/`

## Adding a deck to the hub

1. Put the deck in its section's folder: `weeklies/05-short-name/index.html`, `external/02-short-name/index.html`, or a new folder for event material.
2. Add a 16:9, 640-wide thumbnail per slide in that section's `thumbs/` folder (`05-1.jpg`, `05-2.jpg` and so on).
3. In `index.html`, copy an existing `<article class="deck">` into the right section and update its file name, tag, title, links, captions and slide count. In CSS Weeklies, put it first so the latest stays on top.

## Credits

The visual style adapts [CSS Photo Club Design 2](https://github.com/Yoonjae7/cssphotoclub): retro computer windows, lavender borders, mint cursor, Pixelify Sans headings and a terminal footer. The CSS logo and the bundled Pixelify Sans and DM Sans fonts come from that repository. Font licenses are in `assets/fonts/`.
