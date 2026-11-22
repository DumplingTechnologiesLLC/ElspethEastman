# Initial content and client entry

The versioned `0006_seed_renderer_defaults` migration initializes the fixed renderer records before a page can load. It uses historical models and frozen defaults, performs no network or upload-storage writes, and preserves existing keyed copy, image uses, singleton practice, and collection contents. Normal restarts and later deployments do not run the migration again. Its reverse operation retains authored data.

Home's `hero` and Bio's `portrait` image slots, Music's practice singleton, introductory copy, section headings, and identity strips are initialized from the supplied design. Existing authored `Skills` copy takes precedence for the Voiceover, Music, and Streaming body paragraphs. Copy remains plain text. Page IDs/kinds and current labels/slugs remain independent.

Initial roles reuse the current site's Tristana and Cadence material and existing YouTube destinations. Three releases reuse the existing album destinations, verified on the client's official Bandcamp pages:

- [Elspeth! The Musical](https://elspetheastman.bandcamp.com/album/elspeth-the-musical), 2012.
- [Return of the Elspeth!](https://elspetheastman.bandcamp.com/album/return-of-the-elspeth), 2013.
- [i saw her across the world](https://elspetheastman.bandcamp.com/album/i-saw-her-across-the-world-official-soundtrack), 2014.

The release artwork is each album's actual cover, retrieved from that page's Open Graph image metadata. The decorative rib artwork stays in Figma stories. Seeded images ship under `portfolio/static/portfolio/v1/` and resolve through the existing `seed/` media convention, so release dynos do not need to write shared storage. Files retain their original bytes; filename extensions and stored MIME types match the decoded JPEG data. Tests check every file and dimension.

Music's initial watch action uses the existing official YouTube channel with the label “Watch on YouTube.” It does not claim a particular practice video. New reel, Twitch, interview, stream, and clip destinations remain unset. No publication timestamp or current-study/duration/follower fact is invented to satisfy a sample card. The client can add new roles, releases, streams, clips, coverage, appearances, biography chapters, current activities, and facts through their respective CMS editors.

Legacy `Project`, `Experience`, `Skills`, affiliations, and footer records remain in their original tables. Ambiguous credits and videos are preserved for client reconciliation. The redesign does not treat every historical video as a new role, or every credit as a release. Existing collection members suppress initial collection bootstrap, preserving any content already entered during review.

Storybook and browser fixtures contain the complete Figma examples for reviewing every layout. Their `example.invalid` destinations are test data and do not enter the seed migration. Persistent staging/production uploads retain the separate configuration gate described in [media storage](media-storage.md); Review Apps and browser tests use isolated disposable storage.
