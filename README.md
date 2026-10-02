# CSS Weekly — CS Fair briefing

Open `index.html` in a browser. The deck works offline; the two activity links on slide 2 need an internet connection.

- Left and right arrows, Page Up and Page Down: change slides
- Home and End: first and last slide
- F: fullscreen
- P: print all five slides

The five slides cover the briefing, fair overview, independent purchase/activity flows, prices and preorder follow-up. The fair dates remain 6–7 October 2026. Activity access without a purchase is labeled as a draft assumption.

Slide 3 uses inline SVG in `index.html` and the deck's bundled fonts and palette in `styles.css`. Its activity flow is linear: visitor starts, photo booth and snack, optional MediaPipe experience, then thanks. Stock is 29 T-shirts. Preorders preserve the selected price, including bundle and eligible winner discounts.

The visual style adapts [CSS Photo Club Design 2](https://github.com/Yoonjae7/cssphotoclub): dark retro computer windows, lavender borders, mint cursor, Pixelify Sans headings and a terminal footer. The CSS logo and bundled Pixelify Sans and DM Sans fonts come from that repository. Font licenses are in `assets/fonts/`.
