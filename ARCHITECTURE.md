# Component and service boundaries

A feature's wired component connects request-scoped domain services to a presentation component. Keep stateful features together so their view, state adapter, stories, and isolated tests can be maintained as one unit:

```text
Foo/
  Foo.presentational.tsx
  Foo.wired.tsx
  useFooState.ts
  Foo.stories.tsx
  __test__/
    useFooState.test.ts
    Foo.test.tsx
```

`Foo.wired.tsx` calls only `useFooState`. Its remaining work is JSX composition and passing the hook's result as props. Compose other wired features at that boundary and pass them into presentation slots. A presentation component renders data, callbacks, and slots supplied by its caller; it can own DOM state such as focus, expansion, canvas animation, and iframe activation.

Give pure reusable controls presentation files, stories, and component tests. Add a state hook and wired boundary when a control acquires a domain dependency. Avoid empty hooks created solely to fill out a directory template.

## Own business behavior in services

Domain services own API workflows, validation, saved and unsaved drafts, authentication, notifications, and confirmation policy. Their interfaces describe the capabilities a caller needs. The service container aggregates those interfaces and constructs concrete services using HTTP, clock, navigation, storage, and confirmation ports.

Pass a `ServiceContainer` explicitly to each wired root. `useSkillsService(services)` and the other service accessors select an interface from that container; state hooks subscribe through `useSyncExternalStore` and start the relevant lifecycle. This explicit argument lets an SSR request supply its own container. The browser binds browser APIs once in `browserServices`, and domain services remain usable with ordinary in-memory ports.

Create one container for each browser root or SSR request, and dispose it when that owner ends. The SSR unit test renders independent anonymous and editor requests without DOM globals. Rendering currently remains client-side in production; this migration prepares the dependency boundaries for a later SSR implementation.

Use slots when a view needs several independently wired features. `Application.wired.tsx`, for example, supplies navigation, skills, projects, experience, footer, contact, login, and notification slots to `Application.presentational.tsx`. Presentation files and stories never import wired components.

## Test each boundary independently

Test state hooks with RTL's `renderHook` and service doubles. Assert subscription updates, lifecycle cleanup, selected controller configuration, and callback delegation. Test presentation files with supplied props and callback spies, exercising visible states and DOM interactions. Service unit tests cover validation, transport results, persistence workflows, and legacy behavior independently of React.

Vitest measures all client TypeScript, stories, tooling, and configuration. `*.wired.tsx` is the sole application-code exclusion. Test code and type declarations are outside the executable application denominator. Coverage thresholds require every measured file to reach 100% statements, branches, functions, and lines. Django coverage includes historical data migrations and configuration; the unit runner starts coverage before Django initializes.

`pnpm lint` runs Oxlint and an Oxc AST check for the component boundaries, provider prohibition, business I/O in presentations, and unsupported StyleX shorthands. The checker tests both accepted and rejected examples. Review still needs to distinguish DOM logic from business rules inside a hook.

StyleX compiles component styles into the client CSS. Use longhand border, background, and font properties; the compiler's accepted TypeScript types can be broader than its supported CSS input. Global CSS owns font faces, the body reset, and shared icon animation.

## Preserve the regression baseline

Feature-neutral changes must pass the committed API snapshot and all desktop/mobile screenshots. The TypeScript migration renamed snapshot directories to follow their test filenames while preserving every JSON and PNG byte. Storybook has a browser check for every indexed story; those checks fail on browser exceptions or application API requests.

Use React's client and conventional server-rendering APIs. This application has no React Server Components runtime.
