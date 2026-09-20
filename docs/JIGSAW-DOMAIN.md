# Jigsaw domain, image pieces, snapping and difficulty — TASK 020–023

`src/games/jigsaw/domain/jigsaw.ts` is a pure TypeScript state engine. It has no
React, DOM, image, audio, storage or game-host dependency and can serve both
standalone and future quest hosts.

## Definition and state

A `JigsawDefinition` contains a puzzle `id` and supplied `pieces`. Each piece has
its own `id` and exactly one `targetId`. Both namespaces must be unique within
the puzzle. IDs are non-empty strings without surrounding whitespace. The
256-piece maximum is a defensive allocation bound, not a difficulty preset.

`JigsawState` contains an immutable definition and committed correct placements
(`pieceId`, `targetId`). Unplaced pieces are those absent from the placement list.
The domain holds no transient drag position or rendered geometry. Image metadata
can later be kept alongside the definition, keyed by piece ID.

## Operations

- `createJigsawState(definition, placements?)` validates, copies and deeply freezes
  definitions and optional snapshots. Empty/ambiguous definitions, duplicate,
  unknown or incorrect placements, and sparse arrays throw. To restore a JSON
  snapshot, pass its definition and placements through this constructor first.
- `canPlaceJigsawPiece(state, pieceId, targetId)` checks the exact logical match
  and that neither the piece nor target is already occupied.
- `placeJigsawPiece` commits a correct placement immutably. A wrong/unknown or
  repeated placement returns the original state without consuming anything.
- `removeJigsawPiece` removes that piece's placement; an absent ID is a no-op.
- `resetJigsaw` clears placements while retaining the definition; an empty game
  is a no-op. Removal/reset are allowed after completion.
- `isJigsawComplete` derives completion from all pieces being correctly placed.
  A UI host can detect the incomplete-to-complete transition to emit its own
  effects/callback. This module produces neither effects nor counters.

Queries and transitions accept constructor-produced states. JSON compatibility
is not a persistence implementation. No timer, penalty, score or child data is
part of the model.

## Validation and scope

Node-environment unit tests verify immutability, invalid input, atomic rejection,
removal/reset, all 24 placement orders of a four-piece fixture, and JSON resume
for supplied 4/6/9/12/16/24-piece definitions. These fixture counts do not select
age-based difficulty.

## Rectangular image pieces — TASK 021

`domain/imagePieces.ts` exports `generateImagePieces({ id, image, rows, columns })`.
The host supplies a source URL, descriptive alt text and actual decoded pixel
dimensions. Generation validates metadata, not image bytes; loading, decoding
and load-error handling belong to the future host.

The immutable, JSON-compatible result holds the copied image metadata, a logical
Jigsaw definition and row-major crop rectangles keyed by piece/target IDs. IDs
include grid dimensions and coordinates and are scoped to the puzzle definition.
Crop coordinates are also solved positions within the source image; they do not
implement proximity or snapping.

Each axis is partitioned using integer edges. Remaining pixels are assigned to
the first bands, so odd dimensions have exact coverage without gaps or overlap.
Every piece has positive dimensions; grids exceeding image dimensions or the
existing 256-piece technical bound are rejected. This is not a difficulty preset.

`JigsawImagePiece.tsx` renders a passive, accessible SVG viewport over the shared
source image, preserving each crop's aspect ratio. It needs no per-piece bitmap,
canvas copy or object URL. A future host can wrap it in an interactive control;
the renderer itself has no pointer handling, state or persistence.

Fourteen additional unit tests cover exact pixel coverage, deterministic IDs,
immutability, input rejection and compatibility with domain completion. An
isolated browser fixture reconstructs all six test grids and compares rendered
pixels against the source in Chromium and WebKit. Responsive checks cover 320,
375, 768 and 1024px, including portrait and landscape. Manual browser review
covered the passive renderer; touch dragging is not applicable yet.

## Snap System — TASK 022

`domain/snap.ts` provides a pure proximity query (`findJigsawSnap`) and an atomic
release operation (`snapJigsawPiece`). Inputs are a generated image manifest,
constructor-produced logical state, piece ID, current rendered image bounds,
the dragged piece's rendered top-left and an explicit radius. All geometry uses
one CSS-pixel coordinate space. The board excludes borders, padding and letterbox
margins. The host must subtract the grab offset from the pointer position;
passing the pointer itself would make placement depend on where a piece was held.

Only the piece's own unoccupied target can match. The inclusive Euclidean radius
measures top-left alignment, allowing a near miss in any direction without
accepting the corners of a square tolerance region. Zero requires exact alignment.
The radius stays in CSS pixels as the board scales; no age preset is selected.
Successful previews return the exact immutable destination rectangle. Committing
uses the existing logical placement operation, without storing transient geometry.

Unknown/already-placed pieces, mismatched puzzle IDs or logical mappings, invalid
geometry and distant drops return no preview and leave the original state object
unchanged. A puzzle ID must identify its image/definition consistently; the host
must change it when replacing content. These APIs trust generated manifests and
validated states rather than treating arbitrary JSON as safe input.

Host integration contract:
- Query during dragging without committing; on cancellation discard the preview.
- On release, recompute using current state and current image bounds, including
  after scrolling or rotation. Do not commit a cached preview.
- Render placed pieces at their exact solved crop positions. Rejected pieces
  remain available, without penalties.
- Tap/keyboard placement can use the existing exact-target domain API.

Twelve Node tests cover radius boundaries, wrong targets, duplicate/repeated
release, reset, invalid/stale inputs, unchanged state on rejection and complete
odd-pixel puzzles at board widths derived from 320/375/768/1024px. These are
geometry checks, not browser or physical-device interaction tests. No new UI,
pointer handlers, animation or persistence are introduced, so manual touch and
responsive UI checks are not applicable to this increment.

## Age-based difficulty — TASK 023

The data-only `difficultyPresets.ts` adapter is registered as `jigsaw` in the
shared Difficulty Service. `getJigsawDifficulty(profile?)` is its typed consumer.
Only the existing age band is read; no exact age or new profile field is needed.

| Level | Supported piece counts | Default profile band |
| --- | --- | --- |
| starter | 4 | 3–4, absent/null profile |
| easy | 6, 9 | 5–6 |
| standard | 9, 12, 16 | 7+ |
| advanced | 16, 24 | Explicit host selection only |

Four roadmap levels map onto three existing broad profile bands conservatively.
These are initial product defaults, not development assessments or device-tested
tuning. The lowest count in each level is the default. No automatic progression,
performance tracking, new parent settings UI or persisted preference is added.

`generateDifficultyPuzzle({ id, image, profile?, level?, pieceCount? })` resolves
the profile through the central service, optionally selects an explicit level,
validates the count against that level and invokes the existing image generator.
Unknown levels/bands, unsupported counts and images too small for the grid throw.
The host supplies a new puzzle ID and invokes this only for a new game; changing
configuration never mutates an existing puzzle or its placements.

Landscape/square grids are 2×2, 2×3, 3×3, 3×4, 4×4 and 4×6. Portrait images swap
rows and columns. Image dimensions determine orientation, so rotating the device
does not regenerate pieces. Snap tolerances remain a separate host input.

Ten new Node tests verify central resolution, safe defaults, mutation isolation,
explicit advanced selection, invalid input and full generation/snap completion
for every supported count in both image orientations. No production UI or input
changes are included; responsive browser and manual touch checks are not
applicable to this configuration/domain increment.

## Theme content — TASK 024

Six local theme packs with twelve original SVG pictures now feed the same
difficulty/image generation path through `generateThemedPuzzle`. See
`docs/JIGSAW-THEMES.md` for the catalogue, asset provenance, loading and API
contracts. The earlier synthetic image remains a test fixture.

## Playable host and completion — TASK 025

### Interlocking presentation extension (2026-09-20)

Gameplay opts into `JigsawImagePiece` interlocking rendering. `pieceOutline.ts`
builds cubic tab/socket outlines with complementary shared edges and flat image
borders. Full-image SVG clipping preserves the picture in protruding tabs.
The optional fitted viewBox keeps tray shapes within their large rectangular
touch controls; board and ghost views retain original source anchors and allow
SVG overflow. Source rectangles, identities, placement and snap logic are
unchanged. Rectangular rendering remains available for existing consumers.
Browser geometry coverage on all six grids checks every pixel-center of an
uneven-sized source for exactly one covering piece; original raster checks remain.

`JigsawGame.tsx` now composes these modules into a reusable standalone/quest
component with tap/keyboard and captured-pointer placement, image load recovery,
once-per-round completion and full-image reveal. The registry-backed
`/play/jigsaw` route supplies profile defaults and explicit picture selection.
See `docs/JIGSAW-VALIDATION.md` for the runtime contract and available-device
results. The physical one-handed iPad check remains pending, so TASK 025 is not
fully complete.
