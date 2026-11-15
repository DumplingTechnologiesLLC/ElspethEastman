# Redesign delivery and review

The redesign replaces the legacy portfolio and CMS with six shared public/editor pages: Home, Voiceover, Music, Streaming, Press, and Bio. The [Figma file](https://www.figma.com/design/viiamFWKh3yqWHBfl1PJA3/Elspeth-Eastman-Redesign?node-id=244-425) supplies the visual target. The [local technical design](elspeth-eastman-redesign-tdd.md) supplies the content ownership, API contracts, and page acceptance criteria.

## Architecture carried forward

The tooling migration supersedes the technical design's historical React 17, CRA, styled-components, router-provider, and CMSContext examples. Implementation uses React 19, TypeScript, Vite, StyleX, pnpm, Poetry, Vitest/RTL, Storybook, Oxlint, and Prettier.

Domain models own their related types and constants. Ports describe dependencies; application services and platform adapters implement them in separate directories. The composition root supplies scoped service instances, and service hooks hide construction from their consumers. Business state and mutations belong to services.

Each feature keeps its presentational component, wired component, state hook, stories, and isolated hook/component tests together. Wired components call only their own state hook and compose children. Presentational components receive data, callbacks, and slots; their hooks handle DOM behavior. Public and CMS routes use the same page presentation, with editor slots supplied at the wired boundary. Service containers pass explicitly through composition, preserving SSR compatibility.

## Review sequence

`feature/redesign` is the integration destination. Dependent PRs use their immediate parent as the review base so Files changed shows one slice. As parents land, their children can retarget to the integration branch. Each PR description links its parent and describes its caller, ownership boundary, and verification. Redesign PRs remain open for review.

1. **Review rails and specification.** Preserve the local TDD, record architectural precedence, and run CI for integration and dependent PR bases.
2. **Page identity and shared records.** Establish immutable page identities, keyed copy/image slots, identity labels, facts, and deterministic initialization. Review database ownership and constraints.
3. **Registry and aggregate reads.** Resolve pages by stable IDs and return ordered page content. Review read contracts and query behavior.
4. **Shared content mutations.** Add metadata, copy, labels, facts, and atomic ordering. Review validation, immutable ownership, authorization, and failure rollback.
5. **Media uploads and storage.** Validate uploads and configure persistent storage. Review content-type/size checks, contextual alt text, and environment boundaries.
6. **Client contracts and services.** Add clustered domain types, DTO mappings, content ports/adapters, routing state, and canonical mutation reconciliation. Review 2xx/204, multipart, expiry, and failed-draft behavior.
7. **Design primitives and responsive shell.** Translate Figma tokens, navigation, forms, typography, cards, and footer into StyleX components and isolated stories.
8. **Shared CMS controls.** Add reusable text, image, external-link, collection, and page-settings editors with service-backed state and presentational slots.
9. **Home.** Prove the public/CMS load-edit cycle, hero imagery, responsive layout, and retained contact pipeline.
10. **Voiceover.** Add role CRUD, metadata, promotion, and URL-selected detail. Review canonical identity across card, hero, and detail.
11. **Music.** Add the practice singleton and independent release collection, including artwork and external actions.
12. **Streaming.** Add recent streams, eligible hero promotion, and independent clips.
13. **Press.** Add coverage, required outlet metadata, UTC publication timestamps, selected detail, and appearances.
14. **Bio.** Add authored biography, chapters, current work, and registry-driven explore navigation.
15. **Cutover and regression coverage.** Connect approved content, preserve ambiguous legacy data, retire unused legacy rendering/endpoints, and validate the complete redesign.

These are review boundaries rather than fixed commit-size targets. A page may split further when its backend rules or editor interactions need a separate review. Shared contracts land before their consumers; page-specific fields stay with their domain owner.

## Acceptance for each slice

Every executable TypeScript file except wired components retains 100% statements, branches, functions, and lines. Django retains 100% statements and branches. Type checking, architecture lint, formatting, client/Storybook builds, and browser checks remain required.

Page reviews include desktop/mobile Figma references, public/CMS stories, and interaction evidence. Mutations keep failed drafts, disable duplicate submissions, preserve ownership, and reconcile canonical responses. Reorder and promotion validate complete membership under the owning page lock. Uploaded media and seeded imagery keep contextual alt text.

Development and preview validation use disposable or isolated data and console-only email. Production remains behind the locked master branch and its separate release process. Persistent media configuration and final content approval belong to the cutover gate.
