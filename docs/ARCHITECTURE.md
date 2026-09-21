# ARCHITECTURE.md

## Default stack

```text
Next.js App Router
TypeScript
Tailwind CSS
Vitest
Playwright
Zustand where shared client state is useful
IndexedDB for larger local data
localStorage for small settings
Pointer Events for touch interaction
```

## Target structure

```text
src/
├── app/
├── components/
├── games/
├── game-core/
├── data/
├── store/
├── hooks/
├── lib/
├── types/
└── parent/
```

## Game module structure

### Foundation folder responsibilities

- `src/app/`: Next.js routes, layouts, and route composition.
- `src/components/`: reusable UI that is not specific to a game.
- `src/games/`: independent game modules, each under its own game ID.
- `src/game-core/`: shared game contracts and, in later tasks, registry, shell, input, audio, persistence, and difficulty systems.
- `src/data/`: shared content and theme data.
- `src/store/`: shared client state when a feature needs it.
- `src/hooks/`: reusable application hooks; game-specific hooks stay with their game.
- `src/lib/`: general utilities that are not game systems.
- `src/types/`: cross-application types; game contracts remain in `game-core` and game-specific types remain in their modules.
- `src/parent/`: parent-facing features.

Empty folders are tracked with `.gitkeep` until their corresponding tasks add
implementation files. No game modules or service implementations are included
in the foundation scaffold.

### Per-game layout

Example:

```text
src/games/block-puzzle/
├── BlockPuzzle.tsx
├── domain/
│   ├── board.ts
│   ├── pieces.ts
│   └── solver.ts
├── ui/
├── data/
└── tests/
```

Do not create huge single-file games when domain logic can be separated.

## Blocks board domain (TASK 013)

`src/games/block-puzzle/domain/board.ts` provides pure `createBoard`,
`isWithinBoard` and `getCell` functions. A `BlockBoard` has independent positive
integer `rows` and `columns`, with immutable row-major `cells`. Coordinates are
zero-based `{ row, column }`; `null` means empty and a non-blank string identifies
an occupied block/piece. Identifiers carry no color or rendering requirements.

Construction optionally accepts an initial cell snapshot, checks its exact size
and values (including sparse arrays), then copies and freezes it. Invalid
dimensions/snapshots throw; invalid positions return false from `isWithinBoard`
and throw from `getCell`, so an invalid coordinate cannot be mistaken for empty.
Queries accept boards produced by the constructor. The 4096-cell allocation cap
is a technical guard, not a selected game grid size or difficulty preset.

The model imports no UI, storage or browser APIs. State is JSON-compatible, but
durable persistence is not implemented here.

### Board operations (TASK 014)

`boardOperations.ts` accepts boards created by `createBoard`. A `BlockPiece`
contains a non-blank instance ID and a non-empty list of distinct, non-negative
integer `{ row, column }` offsets from a placement origin. Only occupied offsets
are checked; holes in a shape are not occupied. IDs must be unique among pieces
still on the board, so removal cannot accidentally delete a different instance.

- `canPlace(board, piece, origin)` returns false for malformed shapes/IDs,
  duplicate live IDs, overlap or invalid/out-of-bounds coordinates.
- `place` uses the same checks and throws on rejection; success returns a new
  frozen board. It does not auto-clear lines.
- `remove(board, pieceId)` removes every remaining cell with that ID, including
  remnants after line clearing. Missing IDs are a no-op; blank IDs throw.
- `clear(board)` finds all full rows and columns from the original snapshot,
  clears their union simultaneously, and returns `{ board, rows, columns,
  clearedCells }`. Intersections count once; other cells do not fall or move.
  With no full lines, the original board is returned in the result.
- `reset(board)` returns a fresh empty board with the same dimensions. Session
  state and restoration of a puzzle's initial layout remain host responsibilities.

Operations never mutate inputs. Piece generation, scoring, rotation, game modes
and UI are not implemented by this task; the deterministic generator is TASK 015.

### Deterministic piece generator (TASK 015)

`pieceGenerator.ts` exposes `createPieceGenerator(seed, { rows, columns })` and
pure `nextPiece(state) -> { piece, state }`. The seed is an unsigned 32-bit integer
(including zero). Version-1 state stores dimensions, PRNG state and the next
instance ID; it can be JSON-round-tripped for exact continuation. No storage,
clock, global randomness or UI is used. Invalid state/dimensions and exhausted
safe-integer ID sequences throw before generation.

Version 1 uses the 32-bit recurrence `(1664525 * state + 1013904223) mod 2^32`,
implemented with `Math.imul`. One step selects from a fixed ordered catalogue:
single cell, horizontal/vertical domino, horizontal/vertical straight triomino,
four L-triomino orientations, and a 2x2 square. Shapes exceeding the board's
dimensions are excluded before selection. Catalogue order and arithmetic are
part of the versioned replay contract, covered by a fixed seed-1 test vector.

Returned shapes and states are frozen. IDs are `block-<sequence>` and unique
within one uninterrupted stream. Hosts must keep one stream per board, resume
its saved state with that board, and reset the board when restarting the stream;
IDs from separate streams are not globally unique. Dimension fit does not
guarantee a move on an occupied board or a solvable puzzle.

### Blocks Classic (TASK 016)

`domain/classic.ts` composes board operations and the generator into immutable
session transitions: a 5×5 board, three pieces per tray, refilling only after
all three are used, and simultaneous row/column clearing after each placement.
Invalid moves return the original state. Remaining legal moves are checked
across every tray piece and origin; a stuck board offers a gentle fresh start.
Seed 1 is the default; hosts can supply another seed through `ClassicConfig`.
Restart resets both board and stream. There is no timer or leaderboard.

`ClassicGame` accepts the shared standalone/quest contract without routing or
storage dependencies. Endless play does not invoke `onComplete`. Configuration
is initial state; hosts remount to start a new session. The standalone route
loads through the central registry and owns navigation and shell restart.
Tap/keyboard selection and cell activation complement captured pointer drag.
The pointer targets the shape's top-left origin; preview marks valid/invalid
footprints with symbols and borders. Cancellation clears the preview.
Five columns preserve 48px touch targets at 320px. Scrolling stays enabled
outside tray handles. Shape Fill and Puzzle are described below.

Classic's reusable component owns session state. TASK 019's standalone host
now restores and saves it and supplies sound feedback (see Blocks polish below).
The shell's optional `showAudioControl` still defaults to true.

### Blocks Shape Fill (TASK 017)

`domain/shapeFill.ts` defines five immutable 5×5 silhouette masks: heart, star,
fish, rocket and house. The mask is separate from `BlockBoard`; cells outside
the silhouette are never playable. Pure placement composes the existing
collision/bounds checks with mask containment and never clears full lines.
Each placement has its own ID, and undo removes its entire footprint.

This is free filling with a reusable single-cell/horizontal-domino/vertical-domino
palette, not a finite puzzle. A single cell can fill every remaining target cell,
so legal placements cannot make the target unsolvable. No random targets or
solver/checker are introduced; those belong to TASK 018's Puzzle mode.

`ShapeFillGame` accepts `BaseGameProps<ShapeFillConfig, ShapeFillResult>` with an
initial target ID and emits completion once per round, after exact mask coverage.
Its optional target-change notification lets the standalone shell retain the
chosen silhouette on restart. Choosing another silhouette or replaying starts a
fresh board. Completed boards retain their cells and offer replay or another
shape. TASK 019's standalone host retains each mode session on switching and
reload, including the selected silhouette and completed board.

The existing Blocks route adds mode controls and lazily imports Shape Fill.
The hub retains one central Blocks entry. `Piece.tsx` shares the existing tray
pointer lifecycle between both modes, including cancellation and selection
prevention; each mode owns its own placement rules and hit testing. Shape Fill
also supports tapping or keyboard activation, symbolic placement preview,
non-interactive outside cells, and undo without punishment. No animations,
audio, durable progress or future game modes are added by this task.

### Blocks Puzzle (TASK 018)

`domain/puzzle.ts` defines validated immutable rectangular puzzles, finite
fixed-orientation pieces, placement history, whole-piece undo, an exact-cover
solver and a separate solution checker. Content is limited to 5×5 and eight
pieces, with unique IDs, valid offsets and total piece area equal to board area.
Each piece is used once; full lines remain occupied. The checker replays moves
with board collision/bounds validation and accepts any exact complete covering.

The deterministic solver covers the first empty cell, backtracks over remaining
pieces and memoizes dead states. It preserves prior legal moves and distinguishes
solved, unsolvable, invalid placement history and search-budget exhaustion.
Search is capped at 10,000 nodes; exhaustion is never reported as unsolvable.
`createPuzzleState` refuses to open a puzzle unless the solver proves a solution.
Three authored partitions in `data/puzzles.ts` supply 3×3, 3×4 and 4×4 boards;
their piece sets are checked at runtime. No random puzzle generator is added.

`PuzzleGame` follows the shared standalone/quest contract with an initial
`puzzleId` and once-per-round completion result. The Blocks route lazily loads
it under “Ghép kín” and remembers the selected board for shell restart. Hints
select a remaining piece and preview a valid continuation; a proven dead end
offers undo without penalty. Piece orientation stays as shown, and origins
refer to the top-left bounding box (which can be an unoccupied shape offset).
Tap, keyboard and the existing shared Piece pointer lifecycle are supported.
TASK 019's host retains the selected board and placement history across mode
switches and reload. Physical-iPad verification is tracked in the validation note.

### Blocks polish and standalone session (TASK 019)

`useBlocksSession.ts` owns profile resolution, loading, ordered saves, audio and
their lifecycle. Components accept optional typed `SessionProps` with initial
state, state-change and feedback callbacks; quest hosts remain free of browser
storage. Gameplay starts after loading, and initialization never writes defaults.
Completed restored boards do not re-emit completion or autoplay feedback.

`progress.ts` stores one small version-1 JSON snapshot via shared persistence,
under `blocks:guest` or `blocks:profile:<local-profile-id>`. It contains active
mode and all three mode states. No nickname or other child fields are copied.
The profile identity is captured on entry; selecting another profile takes effect
on the next route entry. There is no cross-tab merge; simultaneous edits to the
same profile follow last-write-wins semantics.

Validation checks fixed dimensions, counters, board IDs, shape mask/history and
Puzzle replay against canonical content. Classic's remaining tray is reconstructed
from the last three version-1 LCG steps using the multiplier's uint32 inverse,
preserving exact sequence continuation without an unbounded move log. A failed
profile/progress read disables progress writes for that visit and preserves the
unreadable/future record. Write failures report a note while session play continues;
the next action retries with the latest whole snapshot. No failure deletes data.

Audio uses the existing manager and versioned audio preferences. User placement
gestures unlock SFX; successful placement and line/completion feedback use two
short original WAV tones in `public/audio`, reproducible with
`node scripts/generate-blocks-audio.mjs`. No music, speech or autoplay is added.
Mute stops playback and persists all channel mute flags. New state changes,
restart, mode changes, page hiding and exit invalidate pending feedback/stop
audio; disposal occurs on exit. Unsupported Web Audio leaves gameplay usable.

The shared Piece shows a pointer-transparent lifted shape preview clamped within
screen edges; the existing symbolic board footprint remains the placement guide.
Resize/rotation cancels an active drag without placing. Landscape tablets place
the board beside the tray/actions; smaller screens retain normal document
scrolling. Only drag handles suppress touch scroll/selection. No animations are
required, so reduced-motion remains fully usable.

See `docs/BLOCKS-VALIDATION.md` for automated/manual evidence and the outstanding
physical-device checks before claiming real-child iPad stability.

## Game Registry

All games register centrally.

Suggested type:

```ts
export interface GameDefinition {
  id: string;
  name: string;
  category: GameCategory;
  minAge: number;
  maxAge?: number;
  icon?: string;
  load: () => Promise<unknown>;
}
```

The Game Hub must derive available games from registry data.

The application catalogue is `gameRegistry` in `src/game-core/registry.ts`.
Its `list()` returns immutable metadata in registration order, `get(id)` returns
an entry or `undefined`, and `load(id)` invokes only the requested loader.
Register implemented games centrally with deferred `() => import(...)` loaders;
do not import game implementations at the top of the registry module.
The catalogue contains Bibo Blocks Classic, loaded at `/play/block-puzzle`.
`createGameRegistry` also permits isolated
catalogues for tests and rejects duplicate, blank, or whitespace-padded IDs.
Load failures propagate to the caller and can be retried; module caching is left
to dynamic imports rather than caching rejected promises in the registry.
`category` uses the `GameCategory` union from `src/game-core/categories.ts`.
Registry construction also validates categories at runtime and rejects unknown
values before invoking any loader.

### Categories (TASK 012)

`gameCategories` is an immutable ordered catalogue of stable lowercase IDs,
canonical English names and Vietnamese labels. `isGameCategory(unknown)` narrows
external values without accepting aliases, whitespace or case changes.

| ID | Name | Vietnamese label | Game-design group |
|---|---|---|---|
| puzzle | Puzzle | Giải đố | Puzzle |
| think | Think | Tư duy | Thinking |
| build | Build | Xây dựng | Construction |
| create | Create | Sáng tạo | Creative |
| explore | Explore | Khám phá | Discovery |
| play | Play | Chơi tự do | Toy Play |

Each game has one primary category. Store IDs in definitions; display labels are
metadata and never identifiers. The model adds no games, category filters or
storage migration: the category task added no playable entries, and fixture
definitions now use valid category IDs.

## Game Hub (TASK 011)

`src/app/play/page.tsx` reads `gameRegistry.list()` on the server and renders
`GameGrid` from registry metadata. Cards use the game name and decorative text
icon (with a generic fallback) and link to `/play/<encoded-game-id>`. Native game
links do not prefetch or invoke registry loaders. When registering a playable
game, its implementation task must also provide the matching route; no game
routes or catalogue entries are invented for the hub task.

The empty catalogue displays a non-interactive empty state with no pretend game
cards. Home and profile selection link to `/play`; the hub links back to home and
profiles. A profile is optional and the hub does not read or overwrite local
storage. The category model is shared core data; filtering and parent settings
are not implemented by the hub.
Synthetic registry data in `tests/fixtures/game-shell/hub.html` covers populated
cards without adding fixture games to the production catalogue.

## Shared game contract

Suggested:

```ts
export type GameMode = "standalone" | "quest";

export interface BaseGameProps<TConfig = unknown, TResult = unknown> {
  mode: GameMode;
  config?: TConfig;
  onComplete?: (result: TResult) => void;
}
```

Not every tiny toy needs complex completion semantics, but main games should remain compatible with later quest integration.

The foundation contract lives in `src/game-core/types.ts` and can be imported
with `import type { BaseGameProps, GameMode } from "@/game-core/types"`.
`mode` describes the hosting context; individual gameplay variants belong in
each game's configuration. Generic defaults use `unknown` so consumers must
provide a concrete type or narrow values before using them. The `quest` value
reserves compatibility only; it does not implement Bibo World or a quest engine.

## GameShell integration

`src/game-core/GameShell.tsx` is a client component that accepts `title`,
`children`, `onBack`, `onRestart`, `muted`, and `onMutedChange`. The host owns
navigation, resetting game state, and applying audio preferences. The shell
does not remount children or persist settings. Connect the audio callback to
the Audio Manager's per-channel `setMuted` methods in the host.

Use the shell inside the app's root layout. The root body applies safe-area
insets once; the shell subtracts vertical insets from its viewport minimum
height, adds internal spacing, and allows ordinary document scrolling. Hosts
outside that layout must provide the same safe-area padding and viewport meta.
Controls are 52px minimum, have visible keyboard focus and Vietnamese labels;
the mute toggle has a stable label and `aria-pressed` state. No animation is
introduced, including when reduced motion is requested.

The browser-only fixture in `tests/fixtures/game-shell/` exercises callbacks and
layout without adding a public game or development route. Playwright starts
its Vite server on port 3101 alongside the production app on port 3100.

## Shared pointer input

`attachPointerDrag(element, callbacks)` in `src/game-core/input/pointerDrag.ts`
attaches to a dedicated drag handle. Call it from an effect and return
`() => controller.destroy()` for cleanup. Attach only one controller per handle.
Callbacks are `onStart`, `onMove`, `onEnd`, and `onCancel(sample, reason)`.
Samples contain pointer identity/type, viewport CSS-pixel position, start, and
delta. Hosts perform their own board-coordinate conversion, hit testing,
placement validation, and cancellation rollback. A tap also produces start/end;
game-specific drag thresholds and click behavior belong to the host.

Only a primary pointer's main button starts a session. Capture tracks release
outside the handle. Cancellation covers pointercancel, lost capture, window blur,
hidden document, Escape, explicit `cancel()`, and `destroy()`. Teardown removes
listeners and restores the handle's original inline styles. Call destroy when
removing the handle; callers must keep callbacks current when reattaching.

The utility sets touch-action/user-select on the handle only, never on body or
document. The style applies for the handle's enabled lifetime because
[touch-action must be set before a gesture starts](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action).
Other page regions remain scrollable. Use small dedicated handles rather than
attaching to a whole page, and provide semantic button/keyboard alternatives in
each game. No animation, game rules, or persistence is included.

`tests/fixtures/game-shell/pointer.html` is an isolated interaction fixture.
Browser tests cover repeated capture/release and layouts in Chromium/WebKit;
native touch injection uses Chromium CDP and is explicitly skipped on WebKit.

## Persistence

Use a versioned persistence layer.

Suggested:

```ts
interface KeyValueStore {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
}
```

Storage policy:

```text
localStorage → small preferences/settings
IndexedDB → larger progress/creations
```

Do not call storage APIs directly throughout game components.

Implemented modules live in `src/game-core/persistence/`:

- `createLocalStorageStore(namespace)` stores JSON-compatible preferences using
  encoded namespace/key prefixes; construction does not access browser APIs.
- `createIndexedDBStore(database)` stores structured-clone data in an `entries`
  object store (database schema version 1). Each operation opens/closes its own
  connection and resolves only on transaction completion, not request success.
- `createVersionedStore<T>(backend, { version, validate, migrations })` wraps either
  backend with `{ version, data }` envelopes and a runtime type guard. Backend
  reads return unknown; validated reads return `T | null`.

Missing entries return null. Invalid JSON/envelopes, failed validation, unknown
future versions, and missing/failed migrations reject with `PersistenceError`.
Codes are storage/corrupt/version/invalid/blocked. Storage denial, quota errors,
and transaction aborts remain explicit failures; no silent in-memory substitute
claims data was saved. Callers can keep playing with session state and surface
save availability appropriately. Never clear storage automatically after errors.

Migration N converts a payload from version N to N+1 and must be pure. Reads
migrate only in memory, preserving original records and avoiding a read-time
write that could overwrite concurrent edits. Explicit `set` validates and writes
the current version. Operations on one key are atomic; there is no multi-key or
cross-backend transaction API. Await writes whose ordering matters. JSON storage
requires JSON-compatible values; use IndexedDB for ArrayBuffers/larger data.

`loadAudioSettings`/`saveAudioSettings` in `src/game-core/audio/audioSettings.ts`
provide the first typed consumer. Load before enabling audio controls, initialize
the manager with the result, and save snapshots after preference changes. The
audio fixture demonstrates this and handles storage failures without blocking
session audio. No child profile model is introduced here.

Browser tests verify reload, migration, binary ArrayBuffer data, rejected writes,
transaction rollback, and audio mute restoration in Chromium and WebKit. Blob
round-trips work in Chromium; the Windows WebKit build reports an internal
Blob/File storage error, which is propagated while the old entry is preserved.
Use ArrayBuffers where that backend cannot store Blobs. Physical iPad behavior
and browser eviction/private-session durability have not been tested.

## Audio architecture

Central channels:

```text
music
SFX
voice
```

Requirements:

- separate mute/volume
- stop previous narration before new narration
- avoid loud autoplay
- persist user settings

`createAudioManager(initialSettings?)` in `src/game-core/audio/audioManager.ts`
creates a session-scoped service without constructing AudioContext or fetching
media. Call `unlock()` directly from a user gesture, then `play(channel, url)`.
This follows [Web Audio activation guidance](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices).
Never invoke unlock on mount. Unsupported or blocked audio returns false;
play returns started/muted/locked/cancelled/error without breaking gameplay.

Channels use independent GainNodes with initial music/SFX/voice levels of
0.25/0.4/0.5. These are gain levels, not guarantees about device loudness; use
appropriately mastered assets. Volume is clamped to 0–1; non-finite inputs are
rejected. One active or pending clip per channel prevents overlapping speech
and accumulating effects. A new request replaces the previous one. Music loops
by default; pass `{ loop: false }` for a finite clip. Mute or zero volume stops
pending/active clips; unmuting never resumes old audio automatically.

Use `stop(channel)`/`stopAll()` on restart or navigation and `dispose()` when
the host exits. Requests are aborted when stopped and stale decode results
cannot start playback. Files are fetched on demand; no application-level decoded
buffer cache or eager asset loading is introduced. Keep background music clips
small because this implementation decodes a complete file in memory.

`getSettings()` returns a detached snapshot that can initialize another manager.
Durable saving/restoration uses the shared `loadAudioSettings`/`saveAudioSettings`
helpers; the manager itself does not access localStorage/IndexedDB. Quiet Mode remains
TASK 051. The isolated audio fixture demonstrates GameShell and storage wiring without
adding a public route. Chromium tests exercise actual WAV decoding and source
playback; this Windows WebKit build has no AudioContext and tests the unavailable
audio path. Physical iPad Safari and listening-level checks remain unverified.

## Difficulty architecture

Central service:

```ts
getDifficulty(gameId, profile, performanceState?)
```

TASK 009 implements `createDifficultyService(adapters)` and the application
`getDifficulty(gameId, profile?)` in `src/game-core/difficulty/difficultyService.ts`.
Each adapter supplies a game ID and structured-cloneable `presets` keyed by the
existing profile bands (`3-4`, `5-6`, `7+`). The generic configuration type belongs
to the game; configurations need not use numerical levels. Multiple bands may
share the same settings. The service only reads `ageBand`, never child identity.

An absent/null profile selects `3-4` as the conservative starting preset. Invalid
bands, duplicate/blank/padded IDs, incomplete presets and unknown game IDs throw
explicit errors. Presets are cloned at construction and on resolution, so neither
caller mutations nor game state can change subsequent results. Adapters contain
data only; no game loader is invoked and no persistence is accessed.

The application catalogue registers Number Match's data-only presets as of TASK
100 (1–5/2 choices, 1–10/3 choices, 1–20/4 choices for the existing age bands).
Its typed resolver and profile-aware round constructor are documented in
`docs/NUMBER-MATCH.md`; no game UI or profile storage is loaded by registration.
The catalogue also registers Jigsaw's data-only presets as of TASK 023;
its initial age defaults and explicit advanced level are documented in
`docs/JIGSAW-DOMAIN.md`. No game loader is imported by this registration.
For typed game configuration, instantiate `createDifficultyService<TConfig>`;
the shared heterogeneous catalogue returns `unknown`, requiring consumer narrowing.
Do not scatter `if age === 4` throughout UI. This service does not select the active
profile automatically; the host passes its loaded profile. The optional
`performanceState` shown in the target API above is deferred to TASK 088–090 along
with evidence collection, adaptive changes and manual override. No game-specific
piece counts, UI or parent controls are implemented by TASK 009.

## Parent Gate (TASK 010)

`src/parent/ParentGate.tsx` exports a reusable client component with `onVerified`
and `onCancel` callbacks. Mount a fresh gate for each parent-entry attempt. Render
protected content only after verification, unmount the gate on either callback,
and let the host restore focus or navigate. The gate initially focuses its hold
button. It is an inline named region, not a modal; hosts must not nest it in a form.

The default path requires a continuous 3-second primary-pointer hold. Release,
movement outside the button, pointer cancellation/capture loss, focus loss,
hidden document, pagehide, Escape and unmount cancel pending work. Only the hold
button disables touch scrolling/text selection. Completion fires once per mount.

The untimed alternative accepts the displayed phrase `PHỤ HUYNH`, ignoring case
and surrounding whitespace; keyboard activation of the hold button opens it too.
It collects no personal information and stores no unlocked flag. This gate adds
deliberate interaction friction, not authentication or proof of adulthood. There
is no permanent authorization, parent settings page or game-hub integration yet.
The isolated `parent.html` browser fixture exercises integration and focus return.

## Physics architecture

Do not select a physics engine until the dedicated evaluation task.

The selected engine should be wrapped by a shared adapter to avoid coupling all games to vendor APIs.

## Procedural generation

For solution-based games:

```text
generate
→ validate
→ solve/check
→ show player
```

Applies especially to:

- Maze
- Parking
- Blocks puzzle generation
- Train puzzle generation where applicable

## Asset reuse

Assets should be reusable between:

- Jigsaw
- Memory
- Sort
- Coloring
- Maze
- Bibo World

Preferred theme packs:

```text
Animals
Dinosaurs
Space
Ocean
Vehicles
Farm
City
Food
Nature
```

Avoid copying the same source asset into many game-specific folders.
# Local profiles (TASK 008)

`src/game-core/profiles/profiles.ts` owns profile validation, immutable create/edit/select operations, and load/save through shared versioned localStorage. The `profiles` record stores `{ profiles, activeId }` together in a version-1 envelope. Each profile has a generated ID, a trimmed nickname (1–24 characters), an age band (`3-4`, `5-6`, `7+`), and a preset avatar ID. Unknown fields/options, duplicate IDs and dangling active IDs are rejected.

`/profiles` provides the client picker and editor, linked from the welcome page. It loads after hydration, awaits saves before changing displayed records, preserves drafts on write errors, and does not replace unreadable records. No account, exact birth date, uploaded image, difficulty mapping or game progress is part of this task.
