# AGENTS.md — Bibo Play V2

This file contains mandatory operating rules for Codex / Antigravity.

## Read order

Before any implementation:

1. Read this file.
2. Read `BIBO_MASTER_PLAN.md`.
3. Read relevant files under `/docs`.
4. Inspect the current repository.
5. Implement only the first incomplete task whose dependencies are satisfied.

## Scope discipline

- One task per run unless the user explicitly asks otherwise.
- Do not start future tasks.
- Do not build Bibo World early.
- Do not implement unrelated refactors.
- Preserve working code unless a change is necessary.
- Avoid speculative abstractions that are not required by the current task.

## Product mission

Build an ad-free collection of polished independent games and digital toys for children, primarily for iPad/tablet use.

Later, reuse those same games inside Bibo World.

## Child experience rules

Never add:

- ads
- paid gems
- loot boxes
- forced login
- leaderboards
- streak pressure
- harsh failure screens
- countdown timers by default
- “watch ad to continue”
- unnecessary child data collection

Prefer:

- touch-first interactions
- large controls
- short text
- visual instructions
- retry without punishment
- gentle feedback
- offline/local-first behavior

## Architecture rules

### Game registry

The game hub must derive game entries from a central registry.

Do not hardcode all game cards in a page component.

### Game modules

Each major game belongs under:

```text
src/games/<game-id>/
```

Game domain logic should be separated from UI when practical.

### Shared core

Shared systems belong under:

```text
src/game-core/
```

Examples:

- game registry
- game shell
- audio
- input
- persistence
- difficulty
- asset helpers

### Storage

Game components must not directly scatter `localStorage` or IndexedDB calls.

Use the shared persistence abstraction.

### Reusability

Major games should be designed so they can later run in:

```text
standalone mode
```

and:

```text
quest mode
```

inside Bibo World.

Do not fork duplicate implementations later.

## Touch / iPad requirements

- Pointer Events for custom dragging.
- Do not disable page scrolling globally.
- Disable scroll only in active draggable regions when needed.
- Avoid hover-only controls.
- Primary controls should generally be >= 48×48 CSS px.
- Test portrait and landscape.
- Prevent accidental text selection during drag.
- Handle pointer cancellation cleanly.

## Accessibility

- Use semantic buttons.
- Add visible focus states.
- Respect `prefers-reduced-motion`.
- Do not rely on color alone.
- Add accessible labels for icon-only controls.
- Provide non-drag alternatives where practical.

## Feedback

Correct:

```text
Tuyệt quá!
Con làm được rồi!
Giỏi lắm!
```

Incorrect:

```text
Thử lại nhé!
Gần đúng rồi!
```

Never use:

```text
FAILED
WRONG
GAME OVER!
```

as aggressive child-facing failure states.

## Child privacy

Allowed local profile fields:

- nickname
- age band
- avatar
- local progress
- preferences

Do not request:

- exact birth date
- school
- address
- precise location
- child email
- child phone

## Validation

Before marking an implementation task complete, run when available:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Gameplay work should also be checked at:

```text
320px
375px
768px
1024px
```

and touch behavior should be manually reviewed.

## Task completion

After finishing a task:

1. Mark its checkbox complete in `BIBO_MASTER_PLAN.md`.
2. Append a short line to `CHANGELOG / AGENT LOG`.
3. Record consequential architecture decisions under `ADR / TECHNICAL DECISIONS`.
4. Stop.
5. Report what was completed.
6. State the next task without implementing it.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
