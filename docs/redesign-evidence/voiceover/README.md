# Voiceover visual evidence

The public/CMS page uses the shared introduction, canonical entries, a promoted entry, and URL-selected detail. Reference stories use the authored Figma samples; production initialization reuses matching existing content and leaves new records for client entry.

References: [desktop collection](https://www.figma.com/design/viiamFWKh3yqWHBfl1PJA3/Elspeth-Eastman-Redesign?node-id=163-252), [mobile collection](https://www.figma.com/design/viiamFWKh3yqWHBfl1PJA3/Elspeth-Eastman-Redesign?node-id=329-1310), [desktop detail](https://www.figma.com/design/viiamFWKh3yqWHBfl1PJA3/Elspeth-Eastman-Redesign?node-id=244-499), [mobile detail](https://www.figma.com/design/viiamFWKh3yqWHBfl1PJA3/Elspeth-Eastman-Redesign?node-id=329-1412).

Captures: [desktop](desktop.png), [mobile](mobile.png), [selected desktop](selected-desktop.png), and [selected mobile](selected-mobile.png). [Browser checks](checks.json) record the rendered dimensions and absence of horizontal overflow or page errors in pinned Chromium on macOS.

Each entry supplies one canonical image. CSS applies the grayscale/color transition, and selected detail uses that same image. Content flows around optional metadata and captions. RTL covers selection callbacks, matching-card focus restoration, direct-link/deletion fallbacks, and retaining focus when the selected record updates. The final cutover adds the real API and URL integration flows.
