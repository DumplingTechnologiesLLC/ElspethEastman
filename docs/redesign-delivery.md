# Redesign delivery and review

The redesign replaces the legacy portfolio and CMS with six shared public/editor pages: Home, Voiceover, Music, Streaming, Press, and Bio. The [Figma file](https://www.figma.com/design/viiamFWKh3yqWHBfl1PJA3/Elspeth-Eastman-Redesign?node-id=244-425) supplies the visual target. The [local technical design](elspeth-eastman-redesign-tdd.md) supplies the content ownership, API contracts, and page acceptance criteria.

## Architecture carried forward

The tooling migration supersedes the technical design's historical React 17, CRA, styled-components, router-provider, and CMSContext examples. Implementation uses React 19, TypeScript, Vite, StyleX, pnpm, Poetry, Vitest/RTL, Storybook, Oxlint, and Prettier.

Domain models own their related types and constants. Ports describe dependencies; application services and platform adapters implement them in separate directories. The composition root supplies scoped service instances, and service hooks hide construction from their consumers. Business state and mutations belong to services.

Each feature keeps its presentational component, wired component, state hook, stories, and isolated hook/component tests together. Wired components call only their own state hook and compose children. Presentational components receive data, callbacks, and slots; their hooks handle DOM behavior. Public and CMS routes use the same page presentation, with editor slots supplied at the wired boundary. Service containers pass explicitly through composition, preserving SSR compatibility.

## Review sequence

`feature/redesign` is the integration destination. Dependent PRs use their immediate parent as the review base so Files changed shows one slice. As parents land, their children can retarget to the integration branch. Each PR description links its parent and describes its caller, ownership boundary, and verification. Redesign PRs remain open for review.

1. **[#9 Review rails and specification](https://github.com/DumplingTechnologiesLLC/ElspethEastman/pull/9).** Preserve the local TDD, record architecture precedence, and run CI for dependent PR bases.
2. **[#10 Page identity and shared records](https://github.com/DumplingTechnologiesLLC/ElspethEastman/pull/10).** Review immutable identities, keyed content, media ownership, and initialization.
3. **[#11 Registry and shared reads](https://github.com/DumplingTechnologiesLLC/ElspethEastman/pull/11).** Review the public wire contract and query behavior.
4. **[#12 Shared content mutations](https://github.com/DumplingTechnologiesLLC/ElspethEastman/pull/12).** Review authorization, immutable ownership, field errors, and atomic ordering.
5. **[#13 Media uploads and storage](https://github.com/DumplingTechnologiesLLC/ElspethEastman/pull/13).** Review decoded image validation, contextual uses, and persistent/disposable environment boundaries.
6. **[#14 Canonical content entries](https://github.com/DumplingTechnologiesLLC/ElspethEastman/pull/14).** Review roles, coverage, recent streams, and atomic nested metadata.
7. **[#15 Hero promotion](https://github.com/DumplingTechnologiesLLC/ElspethEastman/pull/15).** Review one-record identity, image eligibility, manual positions, and concurrency.
8. **[#16 Music content](https://github.com/DumplingTechnologiesLLC/ElspethEastman/pull/16).** Review the practice singleton and independent releases.
9. **[#17 Independent page collections](https://github.com/DumplingTechnologiesLLC/ElspethEastman/pull/17).** Review clips, appearances, chapters/current work, and complete aggregate reads.
10. **[#18 Client transport](https://github.com/DumplingTechnologiesLLC/ElspethEastman/pull/18).** Review preserved HTTP status, bodyless success, multipart, and query-aware navigation.
11. **[#19 Domain contracts and routing](https://github.com/DumplingTechnologiesLLC/ElspethEastman/pull/19).** Review model/type clustering, typed ports, and current-slug route policies.
12. **[#22 Wire schemas](https://github.com/DumplingTechnologiesLLC/ElspethEastman/pull/22).** Review DTO declarations independently of domain interfaces.
13. **[#20 Read mappings](https://github.com/DumplingTechnologiesLLC/ElspethEastman/pull/20).** Review discriminators, nested values, and DTO/domain reference separation.
14. **[#23 Write and failure mappings](https://github.com/DumplingTechnologiesLLC/ElspethEastman/pull/23).** Review whitelists, omission/null semantics, and domain field errors.
15. **[#21 HTTP content adapter](https://github.com/DumplingTechnologiesLLC/ElspethEastman/pull/21).** Review endpoint/verb binding, canonical results, and multipart requests.
16. **[#24 Site registry service](https://github.com/DumplingTechnologiesLLC/ElspethEastman/pull/24).** Review shared loading, route state, cached metadata, and query-preserving rename behavior in [SiteService](../frontend/src/application/services/SiteService.ts).

17. **[#25 Page-scoped loading](https://github.com/DumplingTechnologiesLLC/ElspethEastman/pull/25).** Review independent aggregate caches, in-flight deduplication, and subscriber lifecycles in [PageService](../frontend/src/application/services/PageService.ts).

18. **[#26 Canonical content reconciliation](https://github.com/DumplingTechnologiesLLC/ElspethEastman/pull/26).** Review immutable record updates, fixed image slots, hero identity, and scoped ordering in [page content policies](../frontend/src/application/services/pageContent/).

19. **[#27 Page-scoped mutations](https://github.com/DumplingTechnologiesLLC/ElspethEastman/pull/27).** Review canonical response reconciliation, ownership checks, duplicate prevention, failed draft support, and authentication expiry in [PageService](../frontend/src/application/services/PageService.ts).

20. **[#28 Promotion, ordering, and media](https://github.com/DumplingTechnologiesLLC/ElspethEastman/pull/28).** Review complete membership validation, separate practice state, and independent asset uploads before the editor forms consume these commands.

21. **[#29 Editor drafts and lifecycle](https://github.com/DumplingTechnologiesLLC/ElspethEastman/pull/29).** Review form validation, stable metadata keys, explicit deletion, failed drafts, and cancellation-safe upload/save completion in [ContentEditorService](../frontend/src/application/services/ContentEditorService.ts).

22. **[#30 Shared resource editors](https://github.com/DumplingTechnologiesLLC/ElspethEastman/pull/30).** Review explicit input construction for page settings, keyed text, fixed image uses, identity labels, and facts. Editors are scoped through the service container and consume page interfaces.

23. **[#31 Page collection editors](https://github.com/DumplingTechnologiesLLC/ElspethEastman/pull/31).** Review field/input mappings for entries, music practice/releases, clips, appearances, and Bio chapters/current work. Metadata keys and UTC publication values retain their ownership through edits.

24. **[#32 Figma controls and modal](https://github.com/DumplingTechnologiesLLC/ElspethEastman/pull/32).** Review cream/amber typography and control tokens, accessible fields, safe action links, and native modal dismissal/focus/scroll behavior before the pages consume them.

25. **[#33 Content editor presentation](https://github.com/DumplingTechnologiesLLC/ElspethEastman/pull/33).** Review isolated field/error projection, image preview/upload controls, metadata ordering, validation focus, and explicit deletion in the Figma dialog. The presentation receives callbacks and has no service dependencies.

26. **[#34 Responsive site shell](https://github.com/DumplingTechnologiesLLC/ElspethEastman/pull/34).** Review canonical navigation, mobile disclosure behavior, footer credits, public/editor switching, and page/login/editor slots. The registry and session own routing and authentication state.

27. **Page composition and CMS controls.** Review page-scoped subscriptions, loading/error boundaries, typed edit/delete intents, accessible ordering buttons, scoped native drag/drop, and full-membership moves against the canonical cache.

The remaining reviews connect mutation lifecycles, shared editor state, Figma primitives and the responsive shell, then each public/CMS page pair. Home establishes the retained contact flow; Voiceover and Press add URL-selected details; Music, Streaming, and Bio retain their separate owners. The final cutover review connects unambiguous existing content, preserves ambiguous legacy data, removes unused rendering, and validates the full redesign.

Page presentation reviews link their backend contracts and include state hooks, stories, and interaction evidence. These are review boundaries; a complex page can split further. DTO and write-mapping parents were extracted using additive ancestry merges, preserving published history. Merge reviewed parents with merge commits so children can retarget with focused diffs.

## Acceptance for each slice

Every executable TypeScript file except wired components retains 100% statements, branches, functions, and lines. Django retains 100% statements and branches. Type checking, architecture lint, formatting, client/Storybook builds, and browser checks remain required.

Page reviews include desktop/mobile Figma references, public/CMS stories, and interaction evidence. Mutations keep failed drafts, disable duplicate submissions, preserve ownership, and reconcile canonical responses. Reorder and promotion validate complete membership under the owning page lock. Uploaded media and seeded imagery keep contextual alt text.

Development and preview validation use disposable or isolated data and console-only email. Production remains behind the locked master branch and its separate release process. Persistent media configuration and final content approval belong to the cutover gate.
