# Counting Interaction Engine — TASK 101

`src/games/counting-adventure/` contains a pure counting domain and reusable
`CountingGame` interaction component. It accepts the shared standalone/quest
hosting contract with required initial `config` and optional `onComplete`.
TASK 101 introduced only the engine and synthetic fixture. TASK 102 adds the
production scenarios and registry-backed route described below. Synthetic stars
in the isolated fixture remain test data, separate from the production catalogue.

## Configuration and domain

A definition supplies `id`, `instruction`, `destinationLabel`, `target` and
`items` with unique IDs, accessible labels and visual symbols. Targets must be
positive integers reachable using the supplied 1–20 objects. The upper bound
is a technical core limit, not an age preset. A future host supplies age-appropriate
content through shared difficulty policy; this engine contains no age checks.

`createCountingState` validates, copies and freezes content. `moveCountingItem`
commits one distinct object to the destination or returns it to the source.
Invalid IDs and duplicate moves do nothing. Drag preview is presentation state
and never contributes to the count. `checkCounting` completes only on exact
quantity; too few or too many objects produce a retry while preserving them all.
Moving again clears retry feedback. Completion protects against stale input;
`resetCounting` clears the round without changing its content.

No timer, penalties, score or attempt cap is present. State is local to the
mounted component; refresh intentionally starts fresh. No direct browser storage
or persistence writes are introduced. Domain operations accept constructor or
transition states, not arbitrary untrusted snapshots.

## Interaction contract

- Tap a source object to put it in; tap a placed object to take it out. Semantic
  buttons also support keyboard activation. Objects never overlap.
- Drag with the shared `attachPointerDrag` utility. Only object handles suppress
  touch scrolling/selection. Movement must exceed 8px to become a drag; the
  following click is suppressed so drops cannot count twice.
- Release over the destination to add, or over the source to return. Outside
  release does nothing. Pointer cancellation, lost capture, Escape, page hiding,
  blur, scroll, resize and unmount cancel without transferring anything.
- A pointer-transparent lifted preview leaves the destination visible. Decorative
  count/completion motion is disabled for reduced-motion preferences.
- “Xong rồi” checks the count; “Chơi lại” clears selection and completion.
  `onComplete({ id, count, placedIds })` fires once per round after successful
  confirmation in either hosting mode. Replaying allows another completion.
- Treat config as initial immutable content. A different config ID remounts the
  round. For a new round with the same ID but changed content, the host must remount.

The component uses shared theme tokens and >=48px semantic controls. Tablet
layout places source and destination side by side; narrow screens stack them.
Natural document scrolling remains available outside drag handles.

## Validation (2026-09-21)

- Unit/component tests: all target quantities 1–20, unreachable/sparse/duplicate
  content rejection, mutation isolation, duplicate events, under/over count,
  removal/retry, reset, once-per-round completion and both hosting modes.
- Chromium browser tests: 320/375/768/1024px, portrait/landscape, touch taps,
  keyboard, retry, replay, fresh refresh, target sizes, overflow, 20 repeated
  drags, outside release, Escape, quick tap recovery, reduced motion, 20 objects,
  and native CDP touch drag/cancellation without scrolling/text selection.
- Direct in-app browser review: inspected the layout, moved objects by click and
  drag, checked retry on an incomplete quantity and successful completion.
- WebKit was downloaded but cannot launch on this machine because its runtime
  reports missing `ngtcp2.dll`. WebKit/iPad Safari validation is therefore pending;
  Chromium emulation and direct browser review are not physical iPad signoff.

Fixture: `tests/fixtures/game-shell/counting.html` via the existing Vite fixture
server. Browser suite: `tests/e2e/counting.spec.ts`.

## Reusable scenarios — TASK 102

Open `/play` → **Cùng Bibo đếm**, or `/play/counting-adventure`. The central
registry lazily loads `CountingAdventure`; the route uses the existing GameShell.

| Stable scenario ID | Activity | Theme | Objects → destination |
|---|---|---|---|
| feed-animals | Cho thỏ ăn | Animals | Carrots → rabbit's portion |
| fill-basket | Táo vào giỏ | Farm | Apples → basket |
| give-items | Chia bánh | Food | Cookies → bear's portion |
| collect-objects | Nhặt vỏ sò | Ocean | Shells → bucket |
| place-objects | Xếp sao | Space | Stars → sky |

`data/scenarios.ts` owns immutable labels, instruction templates and visual
symbols. `createCountingScenario(id, profile?)` resolves the shared Difficulty
Service's `counting-adventure` adapter and validates its result through the
existing core. Defaults are target/supply 3/5 for 3–4, 5/7 for 5–6, 8/10 for 7+;
guests use 3/5. These are initial product defaults, not tested developmental claims.
The engine has no scenario-ID or age branches. An optional destination symbol
provides visible context alongside its accessible label. Symbols use local system
emoji rendering; there are no external assets, downloads or duplicated engines.

Standalone hosts show the five activity buttons. Switching activities starts a
fresh round. “Lượt mới” and shell restart clear the round and change its target,
preserving the selected activity. Quest hosts pass `{ scenarioId, profile }` and receive the
same completion result without an activity chooser. This reserves reuse and does
not implement the quest engine. Remount to change the initial profile/config.

The route reads the selected local profile via `loadProfiles`, waits for hydration,
and falls back to the youngest preset with a notice on read failure. It never
overwrites unreadable profiles. Gameplay and activity selection are session-only;
refresh starts the rabbit activity fresh using the saved profile's band.
No progress persistence, rewards, audio or other roadmap games are added here.

Validation adds all five scenarios across all age bands, over-count correction,
completion, invalid input, profile isolation, quest callbacks and restart behavior.
Browser checks cover all five activities at 320/375/768/1024px, hub navigation,
touch controls, retry, completion, refresh, saved-profile defaults and read failure.
WebKit/iPad signoff remains limited by the environment issue documented above.

## User-requested variety and frameless objects (2026-09-21)

Round zero retains the initial defaults above. Subsequent standalone rounds cycle
through 1–5 / 1–10 / 1–20 for the three age bands, wrapping without consecutive
repeats. Switching activities also advances the sequence. This is variety, not
performance-based progression. `createCountingScenario(id, profile, round)` is
deterministic and validates the non-negative safe integer round. Supply follows
the target with two extra objects, capped at the core limit of 20. Profile and
in-progress quantities do not change mid-round; refresh resets the sequence.
Quest replay retains its configured round instead of advancing automatically.

Object buttons have transparent backgrounds and no individual border/shadow;
symbols are larger while >=48px touch targets and keyboard focus outlines remain.
The source/destination areas retain their shared theme surfaces and drop boundaries.

## Visual feedback follow-up (2026-09-21)

The destination symbol is now a large receiver above the placed objects. Object
symbols are 52px within frameless controls of at least 64×72px; redundant plus/return
marks are removed while accessible action labels remain. The live count is enlarged
and briefly scales when changed. Completion adds a short receiver wiggle and static
stars/heart, preserving all objects for counting. Reduced motion disables both
animations. Standalone completion changes the next-round action to “Chơi tiếp”;
advancement is always explicit. Quest replay and completion callbacks are unchanged.

Validation: lint/typecheck/build and 301 unit tests passed. Six targeted Chromium
cases passed their assertions at 320/375/768/1024px, including touch cancellation,
drag, keyboard, restart, profile integrity and continuation. Direct browser review
confirmed drag/tap, enlarged artwork and completed scene. Physical iPad/WebKit
signoff remains pending as documented above. No number-settings or audio changes.
