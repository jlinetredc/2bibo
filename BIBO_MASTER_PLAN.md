# BIBO_MASTER_PLAN.md

> Master execution roadmap. The agent must read `AGENTS.md` first.

## Execution algorithm

1. Read `AGENTS.md`.
2. Read this file.
3. Read relevant docs.
4. Inspect repository.
5. Find first incomplete task whose dependencies are complete.
6. Implement that task only.
7. Run required validation.
8. Mark task complete.
9. Append Agent Log entry.
10. Stop.

Deployment preference: deploy to Vercel only when explicitly requested by the user.
Layout preference: Jigsaw must keep its board above the tray in one column without gameplay scrolling on iPad. Fit artwork to available height and compact the tray while preserving usable touch targets; do not globally disable scrolling or clip controls.
Visual consistency preference: all project screens share colors, typography, buttons and control states through src/game-core/theme/tokens.css; follow docs/UI-UX.md.

- [x] User-requested project-wide Bibo theme — Shared palette/font/control tokens, consistent home/hub/profiles/parent UI and both game shells.
- [x] User-requested production deployment (2026-09-20) — Publish current theme, Jigsaw updates and Công chúa pack to existing 2bibo Vercel project.

---

# EPIC 0 — Foundation

- [x] TASK 001 — Initialize Next.js + TypeScript + Tailwind + ESLint + Vitest + Playwright + scripts.
- [x] TASK 002 — Add core folders/types without implementing games.

# EPIC 1 — Core Platform

- [x] TASK 003 — Build Game Registry with lazy-load support and duplicate-ID tests.
- [x] TASK 004 — Build reusable GameShell with back/restart/sound/safe-area support.
- [x] TASK 005 — Build shared Pointer Events input utilities.
- [x] TASK 006 — Build Audio Manager with music/SFX/voice channels.
- [x] TASK 007 — Build versioned persistence abstraction using localStorage + IndexedDB.

# EPIC 2 — Profile & Parent Foundation

- [x] TASK 008 — Build multiple local child profiles: nickname, age band, avatar.
- [x] TASK 009 — Build shared Difficulty Service.
- [x] TASK 010 — Build reusable Parent Gate.

# EPIC 3 — Game Hub

- [x] TASK 011 — Build `/play` Game Hub from Game Registry.
- [x] TASK 012 — Add category model: Puzzle, Think, Build, Create, Explore, Play.

# EPIC 4 — GAME 1: Bibo Blocks

- [x] TASK 013 — Build pure variable-grid Block Board domain logic.
- [x] TASK 014 — Implement canPlace/place/remove/clear/reset logic with tests.
- [x] TASK 015 — Build deterministic Block Piece Generator.
- [x] TASK 016 — Build Blocks Classic Mode.
- [x] TASK 017 — Build Blocks Shape Fill mode: heart/star/fish/rocket/house.
- [x] TASK 018 — Build Blocks Puzzle Mode with solver/checker.
- [x] TASK 019 — Blocks polish gate: iPad drag, portrait/landscape, preview, sound, persistence.
- [x] User-requested visual follow-up — Colorful beveled Blocks tiles based on the supplied visual reference.
- [x] User-requested scoring follow-up — Round scores and gentle star celebrations for full lines and completed boards.
- [x] User-requested round-end follow-up — Clear no-move result with a gentle sad face, final score and prominent replay action.
- [x] User-requested board feedback — Show successful placement and completion effects directly on affected board cells.
- [x] User-requested deployment — Publish the current Bibo app to Vercel for HTTPS access on iPad.
- [x] User-requested placement guidance — Highlight one complete legal footprint while selecting or dragging a Blocks piece.
- [x] User-requested Blocks options — Persistent hint toggle, 5×5/6×6/8×8 Classic boards and playful child-friendly presentation.
- [x] User-requested app layout — Compact mode toolbar, grouped play surface and inline target/score display.
- [x] User-approved child experience, items 1–3 — Baby 5×5/small-piece preset, protected parent settings, lifted touch aiming with nearby snapping, and first-play visual guidance.

TASK 019 validation scope: desktop Chromium/WebKit, tablet emulation, injected touch and manual browser review passed. Physical iPad/real-child and listening-volume signoff remains unverified; see `docs/BLOCKS-VALIDATION.md` before calling the game stable on hardware.

**Release 0.1**

# EPIC 5 — GAME 2: Jigsaw

- [x] TASK 020 — Build Jigsaw domain engine.
- [x] TASK 021 — Build image piece generation; rectangular V1 allowed.
- [x] TASK 022 — Build Snap System.
- [x] TASK 023 — Add age-based difficulty: 4/6–9/9–16/16–24 pieces.
- [x] TASK 024 — Add theme packs: Animals, Dinosaurs, Vehicles, Ocean, Space, Farm.
- [ ] TASK 025 — Add completion experience and one-handed iPad test.

TASK 025 status (2026-09-20): playable host/completion implementation and browser
validation are done. Physical one-handed iPad validation is still required; keep
this task unchecked and do not start TASK 026. See `docs/JIGSAW-VALIDATION.md`.

- [x] User-requested Jigsaw visual/count follow-up — Doraemon/Labrador illustrations, visual drag guidance and explicit 4/6/9/12/16/24-piece selection.
- [x] User-requested Jigsaw library/scatter follow-up — Six more character scenes, thumbnail library and freely movable pieces without pagination.
- [x] User-requested Jigsaw child app layout — Rounded app header, warm toy mat, picture-based theme navigation and visual progress.
- [x] User-requested Jigsaw scroll reduction — Compact controls and side-by-side tablet play surface, including portrait and all 24 pieces.
- [x] User-requested Jigsaw placement celebration — Brief stars at each correctly placed piece, with a static reduced-motion badge.
- [x] User-requested interlocking Jigsaw pieces — Complementary curved tabs/sockets on the board, tray and drag preview.
- [x] User-requested larger Jigsaw pieces — Double-size four-piece tablet tray and enlarged 6–12-piece layouts.
- [x] User-requested iPad Jigsaw column layout — Larger full-width picture above a shallow piece tray; preserve rotation, touch and tap placement.
- [x] User-requested no-scroll iPad column — Fit board and all pieces within portrait/landscape viewport; compact toolbar and landscape tray.
- [x] User-requested deployment of no-scroll iPad column (2026-09-20) — Published and verified on the production domain.
- [x] User-requested Công chúa pack — Four supplied pictures added with their original dimensions.
- [ ] User-requested Công chúa restoration — Clean screenshot artifacts and improve all four images; built-in image tool returned no assets and reported moderation_blocked. Originals retained.
- [ ] User-requested Elsa picture — image generation blocked; awaiting a user-supplied picture. No placeholder is presented as Elsa.

**Release 0.2**

# EPIC 6 — GAME 3: Memory

- [ ] TASK 026 — Build Memory core: hidden/revealed/matched.
- [ ] TASK 027 — Add Picture Match.
- [ ] TASK 028 — Add Shadow Match.
- [ ] TASK 029 — Add Sound Match.
- [ ] TASK 030 — Add Sequence Memory.

**Release 0.3 / Alpha Gate**

Before continuing, fix high-severity issues found in real child iPad play.

# EPIC 7 — GAME 4: Tangram

- [ ] TASK 031 — Build Tangram geometry engine with move/rotate/snap.
- [ ] TASK 032 — Add Guide Mode.
- [ ] TASK 033 — Add Shadow Mode.
- [ ] TASK 034 — Add Challenge Mode.
- [ ] TASK 035 — Add 25+ data-driven targets.

# EPIC 8 — GAME 5: Maze

- [ ] TASK 036 — Build Maze domain model.
- [ ] TASK 037 — Build seeded maze generator + solvability validator.
- [ ] TASK 038 — Add Classic Maze.
- [ ] TASK 039 — Add Collect Mode.
- [ ] TASK 040 — Add Key & Door Mode.
- [ ] TASK 041 — Add difficulty scaling.

# EPIC 9 — GAME 6: Sort

- [ ] TASK 042 — Build generic sorting engine.
- [ ] TASK 043 — Add Color Sort.
- [ ] TASK 044 — Add Shape Sort.
- [ ] TASK 045 — Add Category Sort.

**Core Six Games Gate**

# EPIC 10 — PWA

- [ ] TASK 046 — Make app installable PWA.
- [ ] TASK 047 — Add offline app shell.
- [ ] TASK 048 — Add offline support for Blocks, Memory, Maze and Tangram.

# EPIC 11 — Parent Basics

- [ ] TASK 049 — Add play-time reminder settings: 15/30/45/no limit.
- [ ] TASK 050 — Add per-profile game permissions.
- [ ] TASK 051 — Add Quiet Mode.
- [ ] TASK 052 — Add local activity summary without IQ/ranking.

**Release 1.0 — Bibo Play V1**

# EPIC 12 — GAME 7: Train Track

- [ ] TASK 053 — Build track grid and pieces.
- [ ] TASK 054 — Build track connectivity validation.
- [ ] TASK 055 — Build train simulation.
- [ ] TASK 056 — Build solvable Train Puzzle Mode.
- [ ] TASK 057 — Build Free Build Mode.

# EPIC 13 — GAME 8: Parking

- [ ] TASK 058 — Build parking grid movement engine.
- [ ] TASK 059 — Build parking solver/validator.
- [ ] TASK 060 — Build Kid Mode.
- [ ] TASK 061 — Build Advanced Mode.

# EPIC 14 — GAME 9: Pattern

- [ ] TASK 062 — Build pattern engine: AB, AAB, ABB, ABC, ABBA.
- [ ] TASK 063 — Add themes: colors, animals, shapes, sounds.

**Release 1.2**

# EPIC 15 — Physics Foundation

- [ ] TASK 064 — Evaluate Matter.js vs lightweight/custom approach on tablet; record ADR.
- [ ] TASK 065 — Build shared physics adapter with clean create/reset/destroy behavior.

# EPIC 16 — GAME 10: Tower Builder

- [ ] TASK 066 — Build Free Tower.
- [ ] TASK 067 — Tune child-friendly stability/physics.
- [ ] TASK 068 — Add Tower Challenges.

# EPIC 17 — GAME 11: Bridge Builder

- [ ] TASK 069 — Build bridge editor.
- [ ] TASK 070 — Build vehicle test mode.
- [ ] TASK 071 — Add encouraging retry feedback.

**Release 1.5**

# EPIC 18 — Physics Playground

- [ ] TASK 072 — Build sandbox editor with ball/ramp/domino/spring/fan/box/tube.
- [ ] TASK 073 — Add Build/Play/Reset loop.
- [ ] TASK 074 — Save local creations as My Machines.

# EPIC 19 — Discovery

- [ ] TASK 075 — Build Magnet Lab.
- [ ] TASK 076 — Build Balance Scale.
- [ ] TASK 077 — Build Sink or Float.
- [ ] TASK 078 — Build Color Mixing.

**Release 2.0**

# EPIC 20 — Creative

- [ ] TASK 079 — Build Drawing Studio.
- [ ] TASK 080 — Build Coloring.
- [ ] TASK 081 — Build Music Pad.
- [ ] TASK 082 — Build Repeat the Rhythm.
- [ ] TASK 083 — Build Room Designer.

# EPIC 21 — Toy Sandbox

- [ ] TASK 084 — Build Toy Cars.
- [ ] TASK 085 — Build Farm Toy.
- [ ] TASK 086 — Build Dino Sandbox.
- [ ] TASK 087 — Build Space Sandbox.

**Release 2.5**

# EPIC 22 — Adaptive Layer

- [ ] TASK 088 — Define internal skill model: spatial, memory, planning, matching, motor, creative.
- [ ] TASK 089 — Add local structured performance evidence.
- [ ] TASK 090 — Build gradual adaptive difficulty engine with manual override.

# EPIC 23 — Bibo World Foundation

Do not start unless V1 is stable and game APIs are standardized.

- [ ] TASK 091 — Build versioned World State: time/weather/plants/animals/buildings/inventory/NPCs.
- [ ] TASK 092 — Build data-driven world interaction system: tap/drag/use/collect/inspect.
- [ ] TASK 093 — Build child-friendly inventory.
- [ ] TASK 094 — Build plant lifecycle.
- [ ] TASK 095 — Build simple habitat-dependent animal ecosystem.

# EPIC 24 — Quest Engine

- [ ] TASK 096 — Build quest schema supporting dialogue/world interaction/collect/game/completion.
- [ ] TASK 097 — Formalize standalone vs quest integration API for existing games.
- [ ] TASK 098 — Add initial story quests: Broken Bridge, Lost Bunny, Build Railway, Build House.

# EPIC 25 — Living World

- [ ] TASK 099 — Add Day/Night state.
- [ ] TASK 100 — Add Weather: sun/rain/wind/snow.
- [ ] TASK 101 — Add Farming.
- [ ] TASK 102 — Add Cooking.
- [ ] TASK 103 — Add Discovery Book.

**Release 3.0 foundation**

---

# Quality gate for every game

Before calling a game stable:

- touch interactions repeat reliably;
- no stuck pointer state;
- no accidental document scroll during active drag;
- 320 / 375 / 768 / 1024 layouts checked;
- portrait/landscape checked;
- restart gives clean state;
- intended persistence survives refresh;
- audio/mute works;
- reduced-motion keeps game usable;
- lint/typecheck/test/build pass.

---

# ADR / TECHNICAL DECISIONS

2026-09-20 — No-scroll clarification supersedes the prior vertical-scroll allowance. Jigsaw measures available board height with ResizeObserver and refits on resize; preserve artwork aspect and minimum target size. At >=1000px, 16–24-piece trays use twelve columns/two rows. Move tidy into the guide toolbar to reclaim the tray header row. No global overflow lock; the picture library and small/zoomed screens retain normal accessibility scrolling.

2026-09-20 — Jigsaw tablet column layout: supersedes the previous side-by-side/no-scroll tablet requirement at the user's request. Cap the single play column at 800px and use 4/6/8 tray columns depending on piece count at widths >=700px. Retain normalized rearranged positions and natural document scrolling; no storage/domain changes.

Count-aware Jigsaw tray sizing — 2026-09-20
- Use two columns for four pieces, three for 6–12 and four for 16–24. Match CSS tray height/size to stable initial count, preserving normalized rearrangement and preventing remaining pieces from resizing after each placement. Four-piece controls are 128px on tablet/112px on phone; 6–12 are 88px/80px. Dense 16–24 layouts retain 64px controls.

Interlocking Jigsaw presentation — 2026-09-20
- Retain rectangular source anchors and the existing snap/domain contract. Generate deterministic cubic SVG outlines from shared edge lengths/polarities, with flat image borders; clip the full source image so tabs carry adjacent image content. Board/drag SVGs overflow their source anchors; fitted tray viewBoxes include tab margins within existing large touch controls.
- Keep the rectangular renderer option for exact source-raster fixtures and other consumers. Visible shape rendering is enabled explicitly in gameplay. No new art assets or reference-image import is needed for this geometry change.

Jigsaw per-piece feedback — 2026-09-20
- Mount one 900ms, pointer-transparent celebration for each committed placement, keyed by piece ID and positioned using source-image percentages. This includes the final piece and follows board resizing. Timer cleanup runs on unmount; replay clears effects. Reduced motion uses a static star. No scoring/domain/persistence changes or new audio.

Bibo shared visual theme — 2026-09-20
- Centralize visual tokens in src/game-core/theme/tokens.css and import them through global CSS. All existing route/component styles consume shared palette and typography values. Move the Jigsaw-specific header appearance into GameShell so both games use one implementation.
- Keep domain logic, persistence, child data and pointer behavior unchanged. Game artwork/tile colors remain game-specific; controls use common semantic colors and system fonts without remote assets. Global disabled styling must not fade completed puzzle artwork.

Jigsaw scroll reduction — 2026-09-20
- Use side-by-side gameplay from 700px in both orientations, with CSS-controlled tray row spacing and viewport-aware board width. Preserve normalized piece positions, 64px tablet piece controls and target minimums; do not lock global scrolling or clip content on smaller/zoomed displays.

Jigsaw child app presentation — 2026-09-20
- Scope shell appearance through the Jigsaw scene; leave other games and shared shell behavior unchanged. Use native progress semantics and visual theme thumbnails without changing puzzle state, drag coordinates or storage.

Jigsaw library/scatter follow-up — 2026-09-20
- Keep free mat coordinates as normalized, bounded presentation state separate from puzzle placement/domain logic and persistence. Cancellation leaves positions unchanged; “Xếp gọn” restores stable initial slots. Every remaining piece stays mounted, with tap/keyboard alternatives.
- Stage picture/count choices inside a native modal thumbnail library; closing discards changes and restores focus. Six additional local generated WebP scenes reuse the existing image pipeline; provenance and prompts are in docs/JIGSAW-CHARACTER-ART.md.

Jigsaw character/count follow-up — 2026-09-20
- Preserve the existing image/snap engine and register generated character artwork as local WebP metadata. Original illustrations remain in the generator output directory; shipped assets preserve the entire 1448×1086 composition. Provenance/prompts are in docs/JIGSAW-CHARACTER-ART.md.
- User-selected counts explicitly choose the matching existing difficulty level only when starting a new puzzle. This does not change profile data or add automatic progression. The guide toggle and tray pagination are transient UI state.
- Six-piece tray pages and a landscape side tray shorten drag reach. Visible numbers are replaced by image fragments, while semantic labels and non-drag alternatives remain. No deployment or new roadmap task is included.

ADR-025 — 2026-09-20

Decision: Compose the completed Jigsaw domain, image, difficulty and theme modules into a lazy registry-backed standalone route and reusable standalone/quest component. Use shared captured Pointer Events for dragging and numbered piece/target buttons for separate-tap and keyboard placement. Reveal the seamless source image and emit completion once per round; replay explicitly resets that guard.

Reason: A real playable host is necessary to exercise completion and one-handed interaction. Two-tap placement avoids requiring a sustained drag; source-proportional grid rows preserve alignment as pieces are placed. Motion is brief and disabled by reduced-motion preferences.

Impact: Profile defaults are read through shared persistence; unreadable profiles fall back without overwrite. Picture changes are explicit. Progress is session-only, audio remains optional/absent, and no future game or deployment is included. Hardware signoff is separate from emulation; TASK 025 remains open pending the documented physical iPad check.

ADR-024 — 2026-09-20

Decision: Provide six immutable metadata-driven Jigsaw packs with two original local SVG illustrations each. Keep reusable artwork under public/images/themes and game-specific catalogue/integration under src/games/jigsaw/data. Selected pictures delegate to the existing difficulty/image generation path.

Reason: Simple vector scenes are small, scale cleanly and need no third-party image requests. Metadata imports do not eagerly load image bytes; other games can reuse the same source files.

Alternatives considered: Remote stock artwork, duplicated per-game assets and eager bitmap bundles.

Impact: Stable pack/picture IDs, Vietnamese labels/descriptions, explicit rejection of invalid selections and no new dependency or child data. No production gallery, completion UI, persistence or PWA caching is added. Asset provenance and integration are documented in docs/JIGSAW-THEMES.md.

ADR-023 — 2026-09-20

Decision: Register Jigsaw's data-only difficulty adapter with the shared service. Preserve existing profile bands: 3–4 starts at 4 pieces, 5–6 at 6 (options 6/9), and 7+ at 9 (options 9/12/16). The fourth level, 16/24, requires explicit host selection. Generate rectangular grids from the selected count and source-image orientation only when creating a new puzzle.

Reason: The roadmap defines four levels while saved profiles expose three broad bands. Conservative defaults avoid inferring exact age, migrating profiles or automatically increasing difficulty. All six supported counts reuse the existing generator and snap engine.

Alternatives considered: Adding a fourth profile band, using the hardest level automatically for 7+, and automatic performance-based progression.

Impact: No new child data, stored settings, parent UI or adaptive progression. Defaults are initial product choices pending real-device/child tuning. Theme packs and completion experience remain TASK 024–025.

ADR-022 — 2026-09-20

Decision: Keep Jigsaw proximity snapping in a pure domain module with separate preview and release operations. Map generated source crops into current rendered image bounds; compare piece top-left alignment with an explicit inclusive Euclidean radius in CSS pixels. Only the piece's own available target may accept it.

Reason: Reuse the same geometry and atomic logical placement across future standalone/quest hosts, independent of pointer grab position or display scale. Rejected drops preserve state and pieces without punishment.

Alternatives considered: Pointer hit-testing without grab offsets, source-pixel tolerances that change with scale, and committing cached previews.

Impact: Hosts supply current geometry and discard previews on cancellation. No pointer handlers, production route, difficulty presets, themes or completion presentation are added. See docs/JIGSAW-DOMAIN.md for integration requirements.

ADR-021 — 2026-09-20

Decision: Keep rectangular image crop metadata separate from logical Jigsaw state. Partition decoded source dimensions with shared integer edges, distribute remainder pixels to the first bands, and render each crop through an SVG viewport over one shared source image.

Reason: Exact source coverage and proportional rendering without per-piece bitmap copies or browser dependencies in generation. Piece/target IDs encode grid coordinates within the puzzle definition.

Impact: The host supplies decoded dimensions and handles image loading. Existing 256-piece validation remains a technical bound. No snap system, difficulty presets, theme assets or production Jigsaw route are introduced. See docs/JIGSAW-DOMAIN.md.

ADR-020 — 2026-09-20
Decision: Model Jigsaw as an immutable supplied piece-to-target definition and committed exact placements. Validate/copy/freeze definitions and optional snapshots at construction; wrong or duplicate drops are no-ops, removal/reset are explicit, and completion is derived. Keep opaque logical IDs independent from image/geometry metadata.
Reason: Establish one reusable engine for standalone/quest hosts without implementing image generation or proximity snapping ahead of their tasks. Preserve valid state on rejected child actions and validate JSON checkpoints before reuse.
Alternatives considered: Embedding image crop geometry in domain state, mutable drag coordinates, deriving difficulty now, and coupling completion to UI/audio callbacks.
Impact: No Jigsaw route, registry entry, assets, storage or input handlers yet. A 256-piece technical allocation guard is not an age preset. See docs/JIGSAW-DOMAIN.md for the API contract. TASK 021 is next and remains unstarted.

Blocks baby experience — 2026-09-20
- New local sessions use a 5×5 Classic board and a deterministic single/domino catalogue. The generator stores optional pieceSet="baby"; absent means the unchanged version-1 catalogue, preserving old saved games. Restart retains the current catalogue. Optional tutorialSeen is false only for new sessions; legacy records skip unsolicited onboarding. Both fields use existing shared progress storage.
- Parent settings use the existing ParentGate inside a native modal dialog. Each opening needs a fresh gate; no persistent unlock. Hints/audio apply immediately, while difficulty/size drafts replace Classic only through explicit new-board action. No account or child information is requested.
- Touch/pen aiming is lifted 56 CSS px above the finger. Shared Blocks hit-testing permits at most 14px edge tolerance, checks the full legal footprint/mask and clips candidates to the visible board. Tap rules remain exact. The visual first-play demonstration never mutates gameplay and dismisses on the first play-area interaction; reduced-motion disables its animation.

Blocks options — 2026-09-20
- Keep optional hintsEnabled in the shared version-1 progress record (missing means enabled); accept supported square Classic sizes 5/6/8 while retaining existing saves. Board dimensions remain the source of truth for placement and restart. Larger boards scroll locally on narrow screens to preserve 48px cells; changing size requires an explicit new-board action.

Blocks scoring follow-up — 2026-09-19
Decision: Derive round scores from existing persisted moves/lines (Classic: 10 per move, 50 per line) or occupied cells/completion (finite modes: 10 per cell, 100 completion bonus). Undo restores the corresponding progress score. Keep timed celebrations transient and trigger only on a successful new clear/completion, never on restoration.
Reason: Avoid saved-data migrations, duplicate bonuses and points farming through undo; keep play pressure-free. Reduced-motion shows a static bonus without moving stars. No leaderboard or new data collection.

Use this format:

```text
ADR-001 — YYYY-MM-DD
Decision:
Reason:
Alternatives considered:
Impact:
```

ADR-001 — 2026-09-19
Decision: Use Next.js 16 App Router, React 19, Tailwind 4, strict TypeScript, ESLint 9 with Next's flat config, Vitest 5 with Vite 6, and Playwright against the production build. Recommend Node.js 24 LTS; supported Node ranges are declared in package.json.
Reason: Establish the required stack with reproducible npm dependencies and working unit/browser validation. ESLint 9 satisfies the peer requirements of Next's bundled React/accessibility plugins; Vite 6 supports the component test harness without adding another native bundler.
Alternatives considered: ESLint 10 (incompatible with bundled lint plugins), older Vitest (reported dependency advisory), and development-server-only browser tests.
Impact: Use Node.js 24 before installing or running scripts; the existing system Node.js 20.16 is too old for the test tooling. Build before running Playwright; install Chromium/WebKit once. Future core folders, contracts, hub, and games remain deferred to their own tasks.

---

ADR-002 — 2026-09-19
Decision: Keep GameMode and generic BaseGameProps in src/game-core/types.ts; track the remaining architecture folders with .gitkeep files.
Reason: Establish the documented reusable game boundary without introducing runtime systems or speculative feature types.
Alternatives considered: Putting game contracts in the general src/types folder or scaffolding future service APIs now.
Impact: Games can import the shared contract using @/game-core/types; game-specific types stay in their modules. Registry, category, profile, persistence, and quest implementations remain in their scheduled tasks.

---

ADR-003 — 2026-09-19
Decision: Use an immutable registry snapshot with list/get/load operations and a single initially empty application catalogue. Game definitions contain deferred module loaders; category remains an opaque string until TASK 012.
Reason: Metadata discovery must not eagerly load game implementations, and duplicate IDs must fail at catalogue construction. Copies and frozen entries prevent metadata mutation from invalidating ID lookup.
Alternatives considered: Mutable global registration, eager game imports, and registry-level promise caching.
Impact: Future implemented games register centrally with dynamic imports. Missing IDs and loader failures reject load requests; failures can be retried without a cached rejection. Game modules, GameShell, hub UI, and category behavior remain separate tasks.

---

ADR-004 — 2026-09-19
Decision: GameShell is a controlled client component with host-owned back, restart, and mute callbacks. Safe-area padding remains owned by the root body; the shell accounts for vertical insets in its minimum height.
Reason: Keep the shell reusable without tying it to routing, game state, or the future Audio Manager/persistence services; avoid double safe-area padding.
Alternatives considered: Internal navigation/audio state, forced child remounts on restart, and a public demo route.
Impact: Hosts handle actual navigation/reset/audio effects. An isolated Vite test fixture exercises the shell without adding game routes; no pointer utilities or audio services are implemented in this task.

---

ADR-005 — 2026-09-19
Decision: Provide a framework-independent attachPointerDrag utility with one captured primary pointer per handle, viewport-coordinate samples, explicit cancellation, and idempotent teardown. Apply touch-action and selection prevention only on attached handles.
Reason: Share reliable input lifecycle across games without coupling it to game state or globally blocking scrolling. Touch-action must be configured before a gesture begins.
Alternatives considered: React-only input hooks, global document scroll prevention, and game-specific drag/drop logic in the core utility.
Impact: Hosts attach/destroy with their lifecycle, own rollback/hit-testing, and supply keyboard/non-drag alternatives. Game implementations and Audio Manager remain separate tasks.

---

ADR-006 — 2026-09-19
Decision: Use a lazy, host-owned Web Audio manager with separate music/SFX/voice gains, explicit gesture unlock, and one active/pending clip per channel. Export detached settings snapshots for later storage integration.
Reason: GainNodes support independent volume; replacement prevents stacked narration/effects. Abortable fetches and request identity checks prevent stale playback after mute, stop, replacement, or disposal.
Alternatives considered: HTMLAudioElement-only volume control, eager audio initialization, multiple overlapping SFX, and direct localStorage use before the shared persistence task.
Impact: Hosts own activation/lifecycle and GameShell wiring; failures leave gameplay usable. Files decode on demand without an unbounded cache. Durable preference saving is deferred to TASK 007 and Quiet Mode to TASK 051; no storage implementation is added here.

---

ADR-007 — 2026-09-19
Decision: Use lazy async localStorage/IndexedDB adapters behind a runtime-validated versioned store. Keep physical database schema version separate from per-record data versions. Apply pure migrations in memory on read; write current envelopes only on explicit set.
Reason: Centralize browser storage access, preserve corrupt/future records for recovery, avoid read-time migration write races, and report save failures accurately. IndexedDB operations resolve on transaction completion.
Alternatives considered: Generic unchecked casts, automatic destructive resets, silent memory fallback, and automatic write-back migrations.
Impact: Hosts handle PersistenceError and await writes; JSON preferences use localStorage, larger structured-clone data uses IndexedDB. Audio settings now have shared load/save helpers and a reload-tested integration fixture. No profile implementation or multi-key transaction API is introduced.

---

ADR-008 — 2026-09-19
Decision: Keep local profiles and active profile ID in one validated version-1 persistence envelope. Use generated IDs, trimmed nicknames, age bands 3–4/5–6/7+, and a fixed avatar catalog.
Reason: Keep selection consistent with saved profiles, support duplicate nicknames, and avoid collecting identifying child data. Await successful writes before updating displayed profiles; preserve unreadable records and failed-save drafts.
Alternatives considered: Separate selection keys, nickname-based identity, account login, and uploaded avatars.
Impact: The /profiles route exposes create/select/edit from the welcome page. Age bands are metadata only; difficulty, progress, Parent Gate and Game Hub remain future tasks.

---

ADR-009 — 2026-09-19
Decision: Resolve game-owned presets centrally by existing profile age band, with the youngest band as the no-profile default. Use an immutable service catalogue with cloned configuration data and explicit errors for unsupported IDs/bands or incomplete adapters.
Reason: Avoid age checks scattered in UI, prevent configuration mutation across sessions, and keep game-specific tuning in its scheduled task. Resolution only needs ageBand and has no storage or game-loader dependency.
Alternatives considered: Global numeric difficulty tiers, prebuilt presets for unimplemented games, and immediate performance-based adaptation.
Impact: The application difficulty catalogue remains empty until games supply tuned adapters. The service supports typed configurations through its generic factory. Performance evidence, adaptation and manual override remain TASK 088–090; Parent Gate remains TASK 010.

---

ADR-010 — 2026-09-19
Decision: Implement ParentGate as a mount-per-attempt inline component with one-shot verified/cancel callbacks, a 3-second captured-pointer hold, and an untimed typed-phrase alternative. Hosts own protected content and focus return.
Reason: Reuse the gate without coupling it to routing or future parent settings, support keyboard/assistive input, and cancel interrupted holds without retaining authorization or collecting child data.
Alternatives considered: Persisted unlock flags, a global modal, private-information questions, and hold-only input.
Impact: This is interaction friction rather than authentication. The gate is exercised through an isolated browser fixture; no parent settings or Game Hub is added. TASK 011 remains untouched.

---

ADR-011 — 2026-09-19
Decision: Render /play from the central registry's metadata on the server, with native game links to /play/<encoded-game-id> and no prefetch/module loading. Use a non-interactive empty state while the real catalogue is empty.
Reason: Keep discovery independent of game loading, avoid pretend playable cards, and exercise populated layouts through synthetic test-only registry entries.
Alternatives considered: Hardcoded future games, eager module loading, and building a game host before any playable game exists.
Impact: Home and profiles now link to the hub without requiring a profile. Future game implementation tasks must supply matching routes when registering games. Categories and filtering are deferred; TASK 012 is not started.

---

ADR-012 — 2026-09-19
Decision: Define six immutable ordered categories with stable lowercase IDs, canonical English names and Vietnamese labels in shared core. GameDefinition uses the derived GameCategory union; registry creation rejects invalid categories at runtime.
Reason: Keep category identity independent of display language and prevent arbitrary strings or older prose group names from entering the catalogue.
Alternatives considered: Unchecked strings, translated IDs and multiple categories per game.
Impact: Each game has one primary category; Thinking/Construction/Creative/Discovery/Toy Play map to think/build/create/explore/play. Fixtures use valid IDs; no games, filtering UI or persistence changes were added. TASK 013 remains untouched.

---

ADR-013 — 2026-09-19
Decision: Represent BlockBoard as independent row/column dimensions and an immutable flat row-major cell array. Use null for empty cells and non-blank string identifiers for occupied cells. Construct validated copied snapshots; reject out-of-bounds reads explicitly.
Reason: Support rectangular grids without UI/storage coupling, prevent accidental shared-state mutation, and distinguish invalid coordinates from empty cells.
Alternatives considered: A fixed square grid, mutable nested arrays and rendering-specific cell objects.
Impact: Allocation is capped at 4096 cells as a technical guard; game sizes and age presets remain undecided. Creation, bounds and read operations are complete. Placement/removal/clear/reset remain TASK 014; no game route or registry entry is added.

---

ADR-014 — 2026-09-19
Decision: Use pure immutable board operations with instance-identified pieces and distinct non-negative occupied offsets. Placement validates atomically and never auto-clears; clear detects full rows/columns simultaneously and clears their union without gravity.
Reason: Keep collision checks consistent, avoid partial writes and row/column order bugs, and preserve independent operations for later game modes. Unique live IDs make piece removal unambiguous after partial line clears.
Alternatives considered: In-place mutation, sequential line clearing, automatic clearing inside place, and removing by display/color ID.
Impact: clear reports line indices and unique cleared-cell count; reset empties the same dimensions, while hosts own session/puzzle restoration. Shape generation, scoring and UI remain later tasks. TASK 015 was not started.

---

ADR-015 — 2026-09-19
Decision: Generate pieces with pure versioned state transitions, a uint32 seed/LCG and a fixed ten-entry shape catalogue filtered by board dimensions. Use sequential per-stream instance IDs and immutable results.
Reason: Reproduce and resume exact sequences without clock/global randomness, preserve board-operation compatibility and avoid pieces larger than an empty board.
Alternatives considered: Math.random, hidden mutable generator state, random UUIDs and occupancy-aware puzzle generation.
Impact: Hosts own one stream per board and reset/resume them together. Algorithm/catalogue changes require replay-version consideration. Dimension fit is not a solvability guarantee; Classic gameplay, tray rules and solver work remain later tasks. TASK 016 was not started.

---

### ADR 016 — Classic session and playable registry entry

Decision: Compose pure board/generator operations into a 5×5 Classic session with a three-piece tray refilled only when exhausted, simultaneous line clearing, rejected-move no-ops and legal-move detection. Expose a reusable game component through a lazy registry entry and standalone route.
Reason: Provide a complete Classic loop with 48px targets at 320px, deterministic restarts and touch/keyboard alternatives without duplicating domain logic.
Alternatives considered: Immediate per-piece refill, scoring pressure, and embedding navigation/storage in game logic.
Impact: Endless Classic does not emit completion. Configuration is read on mount; the host remounts to restart. Sessions are in memory; sound, durable progress and the full physical-iPad polish gate remain TASK 019. Silent hosts may hide the GameShell audio control. Shape Fill and Puzzle remain unimplemented.

---

ADR-017 — 2026-09-19
Decision: Implement Shape Fill with five immutable 5×5 silhouette masks and a reusable single-cell/horizontal-domino/vertical-domino palette. Compose existing board placement with mask checks; retain filled lines, undo whole placements and emit one completion per round.
Reason: Keep this mode distinct from finite Puzzle mode, guarantee every remaining cell is fillable without a solver, and preserve large touch targets. Share the existing Piece input component with Classic instead of duplicating pointer lifecycle logic.
Alternatives considered: Random finite piece sets requiring a solver, encoding outside cells as occupied blocks, and independent duplicate drag implementations.
Impact: Blocks keeps one hub entry with lazily loaded mode selection. Shell restart retains the selected silhouette; target/mode changes create fresh boards. Sessions remain in memory. Puzzle/solver and the full audio/persistence/iPad polish gate remain TASK 018 and TASK 019 respectively.

---

ADR-018 — 2026-09-19
Decision: Use finite fixed-orientation piece sets with exact rectangular coverage, pure placement/undo, a separate replay-based solution checker and a deterministic bounded exact-cover solver. Validate content and require a proven solution before opening a puzzle.
Reason: Accept any legal solution, provide hints consistent with existing moves, detect dead ends without punishment and avoid presenting unverified content. The three authored boards provide playable content without introducing random generation.
Alternatives considered: Comparing against a single authored answer, reusing Classic's random infinite tray, unbounded search and silently treating search exhaustion as impossibility.
Impact: Domain content is limited to 5×5 and eight pieces; search stops at 10,000 nodes with a distinct limit result. Pieces cannot rotate and full lines do not clear. Blocks lazily exposes Puzzle as “Ghép kín”, shares Piece input, emits completion once per round and preserves selected board on shell restart. Sound, persistence and physical-iPad polish remain TASK 019.

---

ADR-019 — 2026-09-19
Decision: Keep reusable game components storage/audio independent through optional initial-state, state-change and feedback callbacks. The standalone host owns validated version-1 snapshots per local profile/guest, active mode, ordered writes and shared Audio Manager preferences. Use small localStorage records through the shared abstraction; preserve unreadable/future records and disable writes after failed reads.
Reason: Resume exact Classic generation, target/Puzzle state and undo without mixing child profiles or silently overwriting corrupt data. Gesture-only short original SFX and explicit cleanup avoid autoplay and overlapping feedback. A lifted pointer-transparent preview and landscape board/tray columns improve touch usability without global scroll locks.
Alternatives considered: Component-local browser storage, unbounded move logs, audio autoplay, discarding old data after errors and blocking all page scrolling.
Impact: Switching modes/reloading now resumes each mode; restart persists a clean active board. Classic tray validation depends on the version-1 generator recurrence. Physical iPad, subjective sound level and real-child stability remain explicitly unverified. PWA, Quiet Mode, cloud sync and Jigsaw were not started.

---

# CHANGELOG / AGENT LOG

Append one short entry per completed task:

```text
YYYY-MM-DD — TASK XXX completed
- summary
- validation result
```

2026-09-19 — TASK 001 completed
- Initialized Next.js App Router, strict TypeScript, Tailwind, ESLint, Vitest, Playwright, npm scripts/lockfile, and a minimal Vietnamese welcome page. Added development instructions; preserved existing documentation edits.
- Validation on Node.js 24.19.0: lint, typecheck, test (1), build, and test:e2e (2) passed. Chromium and tablet-emulated WebKit checked 320/375/768/1024px, including portrait and landscape; npm install audit reported zero vulnerabilities. Playwright required execution outside the sandbox for Windows server cleanup. Physical touch and persistence checks are not applicable to this non-interactive scaffold.

---

2026-09-19 — TASK 002 completed
- Added all remaining core folders from docs/ARCHITECTURE.md, the GameMode/BaseGameProps type-only contract, and folder responsibility/import guidance. No games or runtime services implemented.
- Validation on Node.js 24.19.0: npm run lint, npm run typecheck, npm run test (1 passed), and npm run build all passed. Touch, responsive, and persistence manual checks are not applicable to this folder/type/documentation-only change. TASK 003 was not started.

---

2026-09-19 — TASK 003 completed
- Added the central immutable Game Registry with deferred loading, ID validation, lookup/list APIs, and 11 registry tests covering duplicates, lazy loading, unknown IDs, retry, and mutation isolation. Documented the API; no game or UI implementation added.
- Validation on Node.js 24.19.0: npm run lint, npm run typecheck, npm run test (12 passed across 2 files), and npm run build all passed. Manual touch/responsive/persistence checks are not applicable to this non-UI registry change. TASK 004 was not started.

---

2026-09-19 — TASK 004 completed
- Added reusable GameShell, scoped responsive styles, callback/mute unit tests, and isolated browser fixture/tests. Documented host integration and safe-area ownership.
- Validation: lint, typecheck, 14 unit tests, build, and 6 Chromium/WebKit browser tests passed on Node.js 24. Browser checks covered 320/375/768/1024px, portrait/landscape, touch emulation, keyboard focus, restart, mute state, reduced motion, and scrolling. In-app browser visual/interaction review confirmed controls and callbacks. Physical iPad/notch behavior was not tested; persistence and actual audio playback belong to later tasks. TASK 005 was not started.

---

2026-09-19 — TASK 005 completed
- Added shared Pointer Events drag lifecycle, capture/cancellation/cleanup, scoped scroll/selection prevention, 10 unit tests, and an isolated pointer interaction fixture with browser tests. Documented host responsibilities and API.
- Validation on Node.js 24: lint, typecheck, 24 unit tests, build, and 9 browser tests passed; 1 Chromium-CDP-only touch test skipped on WebKit. Checked 20 repeated drags, outside release, Escape/cancel recovery, quick tap, keyboard alternative, no selection, scoped scrolling, 320/375/768/1024px, and portrait/landscape. Chromium touch injection confirmed pointercancel and outside scrolling. In-app browser manual drag/release and quick activation reviewed. No physical iPad test performed; persistence does not apply. TASK 006 was not started.

---

2026-09-19 — TASK 006 completed
- Added Audio Manager with independent music/SFX/voice mute/volume, explicit activation, channel replacement, cancellation, cleanup, settings snapshots, and 14 audio unit tests. Added an isolated generated-WAV browser fixture demonstrating GameShell mute/restart integration.
- Validation on Node.js 24: lint, typecheck, 38 unit tests, build, and 11 browser tests passed; 1 existing Chromium-only touch case skipped on WebKit. Audio fixture checked 320/375/768/1024px. Actual decoding/source playback and mute/replacement verified in Chromium; Windows WebKit lacks AudioContext and verified safe fallback. Physical iPad and subjective audio listening were not tested. Durable mute persistence awaits the shared storage task. TASK 007 was not started.

---

2026-09-19 — TASK 007 completed
- Added lazy localStorage/IndexedDB adapters, versioned envelopes, runtime validation/migrations, explicit errors, and typed audio preference load/save integration. Added 9 unit cases and 5 browser scenarios per engine covering persistence, rollback, binary data, and mute restoration.
- Validation on Node.js 24: lint, typecheck, 47 unit tests, build, and 21 browser tests passed; 1 existing Chromium-only touch case skipped on WebKit. Reload and ArrayBuffer persistence verified on both engines; Blob succeeds on Chromium while Windows WebKit's Blob error is reported without overwriting old data. No physical iPad/manual touch check for this storage-only task. TASK 008 was not started.

---

2026-09-19 — TASK 008 completed
- Added multiple local profiles with nickname, age band, preset avatar, persistent selection, edit form, and shared persistence integration. Added domain and browser coverage; documented the storage contract.
- Validation on Node.js 24: lint, typecheck, 54 unit tests, build, and 27 browser tests passed; 1 existing Chromium-only touch case skipped on WebKit. Checked 320/375/768/1024px, portrait/landscape, tablet-emulated tap, focus restoration, reload, corrupt records and failed writes. In-app browser manual form/avatar/save/reload and visual review passed. Physical iPad touch was not tested. TASK 009 was not started.

---

2026-09-19 — TASK 009 completed
- Added shared Difficulty Service, age-band resolution, per-game preset adapter contract, isolated configuration snapshots and 10 unit cases. Documented the API, fallback and future integration boundary.
- Validation on Node.js 24: npm run lint, npm run typecheck, npm run test (64 passed across 8 files), and npm run build all passed. Manual touch/responsive/persistence checks are not applicable to this pure service change; no UI, storage or gameplay was changed. TASK 010 was not started.

---

2026-09-19 — TASK 010 completed
- Added reusable ParentGate, scoped touch styles, untimed accessible alternative, lifecycle cancellation, focus behavior, 10 unit cases and a browser integration fixture.
- Validation on Node.js 24: lint, typecheck, 74 unit tests, build, and 32 browser tests passed; 2 Chromium-CDP-only touch cases skipped on WebKit. Checked 320/375/768/1024px, portrait/landscape, reduced motion, early release/outside cancellation, fresh reentry, keyboard alternative, focus return and native Chromium touch cancellation/completion. In-app browser visual and alternative-entry review passed. No physical iPad test; gate intentionally has no persisted unlock state. TASK 011 was not started.

---

2026-09-19 — TASK 011 completed
- Added registry-derived /play hub, responsive visual cards, honest empty state, home/profile navigation, 3 unit cases and a populated browser fixture. Documented the route integration contract.
- Validation on Node.js 24: lint, typecheck, 77 unit tests, build, and 36 browser tests passed; 2 existing Chromium-CDP-only touch cases skipped on WebKit. Checked 320/375/768/1024px, portrait/landscape, long names, scrolling, keyboard focus/activation, tablet-emulated taps, reduced motion, direct access and reload. In-app browser visual review passed for empty and populated states. Physical iPad was not tested; hub does not change stored profile data. TASK 012 was not started.

---

2026-09-19 — TASK 012 completed
- Added the immutable six-category catalogue, GameCategory type and runtime guard; integrated registry validation and updated synthetic fixtures. Added 15 unit cases covering all categories, invalid aliases/values, immutability and lazy loading.
- Validation on Node.js 24: lint, typecheck, 92 unit tests, build and 36 browser regression tests passed; 2 existing Chromium-CDP-only touch cases skipped on WebKit. This data-model change adds no UI or gameplay; new manual touch/responsive/persistence checks are not applicable. TASK 013 was not started.

---

2026-09-19 — TASK 013 completed
- Added pure variable-grid BlockBoard types, validated immutable construction, coordinate bounds and cell reads under src/games/block-puzzle/domain. Added 28 cases for rectangular/single-axis grids, snapshots, invalid dimensions/coordinates, allocation bounds and mutation isolation.
- Validation on Node.js 24: npm run lint, npm run typecheck, npm run test (120 passed across 12 files), and npm run build all passed. Manual touch/responsive/persistence checks are not applicable to this pure domain task; no UI, interaction or durable storage is introduced. TASK 014 was not started.

---

2026-09-19 — TASK 014 completed
- Added canPlace/place/remove/clear/reset and the minimal piece-offset contract. Added 17 tests covering atomic rejection, collision/bounds, malformed shapes, identity-based removal, simultaneous clearing, reset and immutability, including all 64 occupancy patterns of a 2x3 board.
- Validation on Node.js 24: npm run lint, npm run typecheck, npm run test (137 passed across 13 files), and npm run build all passed. Manual touch/responsive/persistence checks are not applicable to these pure domain operations; no UI, durable storage or generator is introduced. TASK 015 was not started.

---

2026-09-19 — TASK 015 completed
- Added a deterministic version-1 piece generator with explicit seed/state, fixed shape catalogue, dimension filtering, sequential instance IDs and immutable outputs. Added 17 tests covering replay vectors, JSON continuation, 1200 generated pieces across six board sizes, connectivity, board placement and invalid inputs.
- Validation on Node.js 24: npm run lint, npm run typecheck, npm run test (154 passed across 14 files), and npm run build all passed. Manual touch/responsive/persistence checks are not applicable to this pure generator task; no UI or durable storage was added. TASK 016 was not started.

---

2026-09-19 — TASK 016 completed
- Added Blocks Classic domain/session, a 5×5 playable board, three-piece tray, full-row/column clearing, gentle no-move restart, basic placement preview, captured pointer drag with cancellation, and tap/keyboard placement. Registered Bibo Blocks and its lazy standalone route; documented the session contract. Updated hub tests and Vite fixture alias; made the shell keyboard test wait for rendering before Tab.
- Validation on Node.js 24: npm run lint, npm run typecheck, npm run test (159 passed), npm run build, and npm run test:e2e -- --workers=4 (41 passed; 3 Chromium-CDP-only cases skipped on WebKit) all passed. Browser coverage includes 320/375/768/1024px, portrait/landscape rotation, 20 repeated outside/cancel drags, touch cancellation, no drag scrolling/text selection, quick subsequent tap, refill, restart and navigation. Manually reviewed placement/drag and 320px layout in the browser; physical iPad was unavailable. Reload intentionally starts a fresh Classic board; audio/persistence await TASK 019. TASK 017 was not started.

---

2026-09-19 — TASK 017 completed
- Added Shape Fill for heart/star/fish/rocket/house, reusable pieces, mask-restricted placement, whole-piece undo, completion/replay, tap/keyboard/drag support and a lazy mode switch in Blocks. Extracted the existing Piece component for reuse by Classic; documented domain and host contracts.
- Validation on Node.js 24: npm run lint, npm run typecheck, npm run test (168 passed), npm run build and npm run test:e2e -- --workers=4 (56 passed; 4 CDP-only cases skipped on WebKit) passed. Tests cover all five masks/completions, no line clearing, invalid/overlapping placement, undo, once-per-round completion callback, selected-target restart, Classic regression, 320/375/768/1024px, rotation, reduced motion, 20 repeated drag cancellations/outside releases, native Chromium touch cancellation and no drag scrolling/text selection. Manual browser review confirmed drag, undo, target change and usable 320px scrolling/layout. Physical iPad was unavailable. Progress remains in memory as planned for TASK 019; TASK 018 was not started.

---

2026-09-19 — TASK 018 completed
- Added finite Blocks Puzzle mode with three solver-verified boards, exact-cover solver, independent checker, legal placement/undo, current-state hints, gentle dead-end recovery, completion/replay and lazy mode navigation. Kept touch/keyboard controls and shared Piece drag lifecycle; documented solver bounds and host contracts.
- Validation on Node.js 24: npm run lint, npm run typecheck, npm run test (177 passed), npm run build and full npm run test:e2e -- --workers=4 (67 passed, 5 CDP-only cases skipped on WebKit) passed. After the selected-board checkmark adjustment, lint/unit/typecheck/build and targeted Puzzle E2E (11 passed, 1 CDP-only skip) passed. Coverage includes all three boards, exhaustive small-board oracle comparison, invalid answers, unsolvable/limit distinction, dead-end undo, once-per-round callback, 320/375/768/1024px, rotation, reduced motion, repeated cancellation/outside release and native Chromium touch with no drag scrolling/text selection. Manual browser review confirmed drag, hints, undo, preview and 320px scrolling. Physical iPad was unavailable; sessions remain in memory. TASK 019 was not started.

---

2026-09-19 — TASK 019 completed (implementation and available-device validation)
- Added lifted/clamped drag preview, resize cancellation and tablet landscape layout; gesture-only placement/completion WAV feedback with persistent mute; per-profile/guest restoration of all Blocks modes via the shared versioned store. Added corruption/future-version protection, ordered saves, error feedback and device-validation documentation.
- Validation on Node.js 24: lint, typecheck, 179 unit tests and build passed. Full E2E: 83 passed, five CDP-only cases skipped on WebKit. Final preview-edge adjustment: build/lint/typecheck/unit checks and 16 focused polish E2E passed. Covered 320/375/768/1024px, rotation, repeated drags/cancellation, no drag scrolling/selection, state/undo/completion restoration, restart, two-profile/guest isolation, denied writes, corrupt records and actual Chromium SFX/mute. Manual browser review confirmed landscape drag, portrait layout and progress/mute after reload. Physical iPad/real-child play and subjective volume were unavailable and are not claimed as passed; see docs/BLOCKS-VALIDATION.md. TASK 020 was not started.

---

2026-09-19 — User-requested Blocks visual follow-up completed
- Applied six colorful CSS tile finishes with raised faces, beveled edges and dark recessed empty cells to all three Blocks modes. Tray, lifted drag preview, placement preview and placed pieces share stable colors; Shape Fill derives its palette from the placed footprint. No gameplay or saved-data changes were needed.
- Validation: lint, typecheck, 179 unit tests, production build and full browser suite passed (83 passed; five existing CDP-only cases skipped on WebKit). Automated checks cover 320/375/768/1024px, portrait/landscape and touch cancellation; manual browser review confirmed colored placement, drag and the 320px layout. Physical iPad was not tested. TASK 020 remains unstarted.
- Technical decision: keep colors in the Blocks presentation layer and derive them from existing piece identity/shape; no assets, dependencies or persistence migration required.

---

2026-09-19 — Blocks visual follow-up runtime correction
- The existing production server on port 3002 had remained running across the visual rebuild. Restarted only that Bibo server against the already validated build; verified the actual localhost:3002 page now displays dark empty cells and colorful beveled tray pieces. No application code changed and no further roadmap task was started.

---

2026-09-19 — User-requested Blocks scoring and celebrations completed
- Added shared score display and brief non-blocking star burst/bonus feedback to all three modes, with reduced-motion support and timer cleanup. Scores survive restoration through existing state; rejected placements earn nothing and restart resets the score.
- Validation: lint/typecheck/build passed; 181 unit tests passed. Full browser regression suite: 83 passed, five existing CDP-only skips; two additional Chromium/WebKit scoring cases passed. Covered completion bonuses/restoration, line clear/rejection/reset, reduced motion, 320/375/768/1024px, rotation and touch cancellation. Manual browser check confirmed drag adds points and completing a heart shows stars/+100. Restarted the actual production server on port 3002 and verified the new UI there. Physical iPad remains untested. TASK 020 was not started.

---

2026-09-19 — User-requested Classic round-end clarity completed
- Added a gentle sad face, explicit no-space heading, final score and large replay button above the board. Focus announces the result and brings it into view; exhausted-round cells are disabled and the unusable tray is hidden. Restart restores normal play and zero score. Existing no-move domain detection and persistence remain unchanged; no consequential architecture change.
- Validation: lint, typecheck, build and 181 unit tests passed. Final isolated browser suite: 87 passed, five existing CDP-only skips. A prior overlapping test invocation caused artifact cleanup errors; the clean rerun passed. New coverage verifies restored no-move state, focus, disabled input, score preservation, keyboard/touch replay and 320/375/768/1024px layouts. Visually reviewed the 320px captured result. Physical iPad remains untested. Restarted production server on port 3002 with the new build. TASK 020 was not started.

---

2026-09-20 — User-requested board-local feedback completed
- Successful placements briefly show a checkmark and soft outline on the placed cells in all three modes. Classic cleared rows/columns and completed finite boards show stars on the affected cells. Decorations ignore pointer input, expire after one second, clear on undo/restart/unmount, and remain static with reduced motion.
- Technical decision: effects are transient UI state derived from before/placed/after board snapshots. Logical placement/clearing and persistence commit immediately; no delayed gameplay or saved-data change.
- Validation: lint/typecheck/build and 181 unit tests passed; full Chromium/WebKit suite passed (87 passed, five existing CDP-only skips), including board-local line feedback/reduced motion and existing 320/375/768/1024px, rotation and touch checks. Manual browser screenshot verified marks on the exact placed cells. Updated production server on port 3002. Physical iPad untested; TASK 020 remains unstarted.

---

2026-09-20 — User-requested Vercel deployment completed
- Deployed the current local source to Vercel project jlinetredc-5338s-projects/2bibo. Production: https://2bibo.vercel.app (deployment dpl_8HUGKSJEHoCaTPSaTZerefqt4tCw). Ignored local Vercel metadata and excluded local build/test artifacts and environment files from uploads.
- Validation: local lint/typecheck, 181 unit tests and build passed; Vercel production build reached READY. Anonymous HTTPS request returned 200 without authentication; browser smoke test loaded Blocks and confirmed placement/score increased to 10.
- Deployment decision: use the existing Next.js configuration with a direct CLI source deployment. GitHub auto-link failed, so automatic deployment on push is not configured. Progress remains device/browser-local. No roadmap game task was started; TASK 020 is still next.

---

2026-09-20 — User-requested placement guidance completed
- Added a stable nearest-legal-placement helper and non-interactive dashed/arrow guidance in all three modes. Hints respect occupancy, board edges and silhouette masks, update with the hovered origin and support tap selection too. They suggest a legal fit, not an automatic move or a guaranteed Puzzle solution; the existing solver hint remains available. No score, storage or drag/drop rules changed.
- Validation: lint/typecheck/build, 183 unit tests and 89 Chromium/WebKit browser tests passed (five existing CDP-only skips). New tests cover whole footprints, edges/occupancy/masks and moving the hint without auto-placement. Existing responsive/touch/rotation checks passed. Manual browser review confirmed a three-cell arrow footprint matching the selected piece. TASK 020 remains unstarted.

---

2026-09-20 — User-requested Blocks options and presentation completed
- Added a remembered automatic-hint toggle across all Blocks modes, Classic 5×5/6×6/8×8 size selection with explicit new-board action, and a pastel scene with mascot and larger playful controls. Restart retains board size; legacy progress stays compatible.
- Validation: lint/typecheck/build and 184 unit tests passed. Full browser run had 89 passes, five existing CDP-only skips and two landscape failures; after the landscape correction, all affected Blocks suites passed (51 passed, three CDP-only skips). Checks cover 320/375/768/1024px, rotation, persistence, accurate placement at large-board edges, touch cancellation and local board scrolling. Manual browser review confirmed the 8×8 layout and dragging into its last column. Physical iPad remains untested. TASK 020 remains unstarted.

---

- Published to https://2bibo.vercel.app (deployment dpl_Kc5nP61RJU7YB5T5GEt3eLg3hoMX, READY); browser smoke review confirmed the new scene, hint toggle, board-size choices and restored score.

2026-09-20 — User-requested app layout completed
- Removed the oversized decorative welcome block; grouped mode navigation and automatic hints into one compact toolbar. Grouped board controls within a rounded play surface, combined target title with a score badge, and shortened instructions. Kept 48px controls, larger boards, tap/drag alternatives, scores and persistence intact. Presentation-only changes; no consequential architecture decision.
- Validation: lint, typecheck, 184 unit tests and build passed. Full Chromium/WebKit suite passed: 91 passed, five existing CDP-only skips. Windows test-server cleanup stalled; explicitly terminated only the verified test servers, after which Playwright exited successfully. Manual review covered 320/375/768/1024px, portrait/landscape and successful drag placement; physical iPad untested. TASK 020 remains unstarted.

---

- Deployed to https://2bibo.vercel.app (dpl_CdTMQzzkfCoiWHAXX3DhxeBz5LE6, READY); production browser review confirmed the compact toolbar and Shape Fill play surface.

2026-09-20 — User-approved child experience items 1–3 completed
- Added default baby sessions with single/domino pieces, protected settings for size/difficulty/hints/audio, safe explicit new-board action and unchanged legacy saves. Added lifted touch/pen aiming and local legal-drop tolerance across all Blocks modes. Added dismissible first-play/replay hand illustration with reduced-motion support and saved dismissal.
- Validation: lint/typecheck/build and 188 unit tests passed. Final full Chromium/WebKit suite: 95 passed, five existing CDP-only skips. Covers 320/375/768/1024px, rotation, native touch cancellation/no scrolling, all three modes, parent gate/Escape/focus return, settings persistence, draft cancellation, tutorial dismissal/replay without changing progress, deterministic baby streams, old saves and nearby/far drop behavior. Manual browser review confirmed preserved legacy play, parent settings, baby board, near-edge placement, portrait layout and replay guide. Physical iPad remains untested. Suggested follow-ups 4–6 and roadmap TASK 020 were not started.

---

- Published to https://2bibo.vercel.app (dpl_9vV49zVdkwRpwZ7TMsLr9BwQRjKc, READY). Production browser smoke review confirmed saved mode restoration and the new parent-settings entry.

2026-09-20 — TASK 020 completed
- Added the pure Jigsaw domain engine: validated piece/target identities, immutable state/snapshot construction, exact legal placement, atomic rejection, removal, reset and derived completion. Added API/scope documentation and 12 domain tests, including every four-piece placement order and 4/6/9/12/16/24-piece JSON continuation fixtures.
- Validation on Node.js 24: npm run lint, npm run typecheck, npm run test (200 passed across 24 files) and npm run build all passed. New domain tests run in Node without a DOM. Responsive 320/375/768/1024px, manual touch and browser E2E are not applicable to this domain-only increment; no UI, route, existing gameplay or deployment changed. TASK 021 was not started.

---

2026-09-20 — TASK 021 completed
- Added deterministic rectangular image-piece generation with exact integer pixel coverage, validated immutable metadata and logical piece/target mappings. Added a passive accessible SVG crop renderer and isolated synthetic-image validation fixture; no production Jigsaw route or gameplay interaction yet.
- Validation on Node.js 24: npm run lint, npm run typecheck, npm run test (214 passed across 25 files) and npm run build passed. Targeted Chromium/WebKit image-piece E2E tests passed (2): reconstructed pixels match the source for six grids, with responsive checks at 320/375/768/1024px in portrait/landscape. Manual browser review confirmed the passive renderer; touch dragging and persistence are not applicable to this increment. Physical iPad remains untested.
- Updated domain documentation and ADR-021. No Vercel deployment; deploy only on explicit user request. TASK 022 remains unstarted.

---

2026-09-20 — TASK 022 completed
- Added pure Jigsaw snap preview and release operations, exact destination geometry, CSS-pixel proximity tolerance and atomic placement through the existing domain engine. Wrong/distant/duplicate drops and invalid geometry preserve state. Documented host grab-offset, resize/scroll, cancellation and non-drag integration contracts in docs/JIGSAW-DOMAIN.md; recorded ADR-022.
- Validation on Node.js 24: npm run lint, npm run typecheck, npm run test (226 passed across 26 files) and npm run build all passed. Twelve new Node tests cover boundary distances, wrong targets, repeated release/reset, stale definitions, malformed geometry and full-puzzle placement at scales corresponding to 320/375/768/1024px. These are mathematical geometry checks; browser layout, manual touch and persistence checks are not applicable to this pure domain increment. No physical iPad claim or Vercel deployment.
- TASK 023 remains unstarted.

---

2026-09-20 — TASK 023 completed
- Added four Jigsaw difficulty levels (4 / 6–9 / 9–16 / 16–24), central age-band adapter registration, typed resolution and new-puzzle generation with supported-count validation and image-oriented grids. Existing profiles and running puzzles remain unchanged. Documented the three-band/four-level mapping and ADR-023.
- Validation on Node.js 24: npm run lint, npm run typecheck, npm run test (236 passed across 27 files) and npm run build passed. Ten new tests verify age defaults, guest behavior, mutation isolation, every level/count in both image orientations, snap completion, explicit advanced selection and invalid input. Responsive browser, manual touch and persistence checks are not applicable to this data/domain-only increment; physical iPad tuning remains unverified. No Vercel deployment.
- TASK 024 remains unstarted.

---

2026-09-20 — TASK 024 completed
- Added Animals, Dinosaurs, Vehicles, Ocean, Space and Farm packs with twelve original 640×480 local SVG illustrations, Vietnamese metadata, immutable lookup and themed-puzzle generation through the existing difficulty pipeline. Added asset/API documentation and ADR-024, plus an isolated visual review fixture.
- Validation: npm run lint, npm run typecheck, npm run test (244 passed across 28 files) and npm run build passed on Node.js 24. Targeted Jigsaw Chromium/WebKit E2E: 4 passed, covering all asset decoding, 24-piece rendering, 320/375/768/1024px layouts and existing exact raster reconstruction. Visually reviewed the captured twelve-picture gallery and assembled images. No new touch handlers; manual touch/physical iPad gameplay is not claimed. No Vercel deployment.
- TASK 025 remains unstarted.

---

2026-09-20 — TASK 025 implementation delivered; physical iPad check pending
- Added the registry-backed /play/jigsaw host, profile-based starting counts, explicit theme-picture selection, shared pointer drag/cancellation with lifted touch preview, separate-tap/keyboard placement, image load retry and gentle full-image completion with replay. Completion callbacks fire once per round in standalone/quest hosts. Visual review found an uneven-row issue; explicit source-proportional rows and regression checks fixed it.
- Validation: lint, typecheck, 247 unit tests across 29 files and production build passed. Final gameplay Chromium/WebKit run: 7 passed, 1 CDP-only skip; earlier hub regression (4) and Jigsaw image/crop regression (4) passed. Covered 320/375/768/1024px, control sizes, rotation with retained placements, repeated cancellation/outside release, touch injection without scrolling/selection, quick tap recovery, reduced motion, older-profile resolution and image error recovery. Reviewed captured playing/completion screens. Physical hand reach and real iPad Safari remain untested; docs/JIGSAW-VALIDATION.md records the remaining procedure.
- TASK 025 remains unchecked because its physical one-handed test is incomplete. TASK 026 was not started. No Vercel deployment.

---

2026-09-20 — User-requested Jigsaw characters, visual dragging and piece counts
- Added generated Doraemon and Labrador illustrations (local WebP), explicit 4/6/9/12/16/24-piece selection, image guide toggle, image-first targets, six-piece tray pagination and side-by-side landscape layout. Changed choices are applied only by starting a new puzzle; replay retains active count. Kept tap/keyboard and pointer cancellation behavior.
- Validation: lint/typecheck/build and 249 unit tests passed. Final gameplay Chromium/WebKit run: 9 passed, 1 CDP-only skip. Image/crop browser checks separately passed 4 cases. Full 24-piece completion, draft selection, guides, pagination, four viewport widths, rotation and touch injection covered. The initial landscape drag failure was fixed by keeping the tray alongside the board; final captured UI was visually reviewed.
- Elsa generation was rejected by the image tool (moderation_blocked); no alternative tool/retry was used, and no Elsa asset or selectable entry was added. The user was informed and asked for an image. TASK 025 physical iPad check remains pending; TASK 026 was not started. No Vercel deployment.

---

2026-09-20 — User-requested Jigsaw library/scatter follow-up completed
- Added six new Doraemon/Labrador group scenes (eight character pictures; twenty total), compact play toolbar and thumbnail library. Replaced pagination with a freely movable piece mat, keyboard nudges and “Xếp gọn”.
- Validation: lint/typecheck/build and 256 unit tests passed. Chromium/WebKit: 15 passed, one CDP-only WebKit skip; checked full 24-piece completion, four viewport widths, image/crop integrity, rearrangement/cancellation, touch input, draft cancellation and focus restoration. Reviewed generated artwork and local UI. Physical iPad one-handed review remains pending under TASK 025; TASK 026 was not started. No Vercel deployment.

2026-09-20 — User-requested Jigsaw child app layout completed
- Added a rounded scoped app header, warm toy-mat styling, visual progress, theme thumbnails and a two-column phone picture gallery. Kept existing pointer/tap/keyboard behavior and local-only preferences.
- Lint, typecheck, 256 unit tests and build passed. Final gameplay browser run: 11 passed, one CDP-only WebKit skip, covering 320/375/768/1024px, rotation, touch/cancel, image recovery and 24-piece completion. Reviewed local tablet/phone screenshots. A run overlapping a build was discarded and repeated against a stable build. Physical iPad validation remains pending; no deployment or TASK 026 work.

2026-09-20 — User-requested Jigsaw scroll reduction completed
- Reduced chrome spacing, fitted all 24 pieces beside the board on portrait/landscape tablets and tightened the tablet picture library into four columns. Smaller screens retain scrolling when needed for touch accessibility.
- Lint/typecheck/build, 256 unit tests and 11 gameplay browser tests passed (one CDP-only WebKit skip). Added no-page-scroll assertions at 768×1024 and 1024×768; retained 320/375px, rotation, touch/cancel and completion checks. Visually reviewed both tablet orientations. Real iPad one-handed validation remains pending; no deployment or next-task implementation.

2026-09-20 — Project-wide visual consistency preference recorded
- Documented shared palette roles, typography, button/control states, spacing and navigation requirements in docs/UI-UX.md. This is a documentation-only preference update; no claim that existing screens have all been migrated. Reviewed the documentation diff; runtime validation is not applicable. No future task started or deployment performed.

2026-09-20 — Project-wide Bibo visual theme completed
- Added shared theme tokens and migrated home, hub, profiles, parent gate/settings, Blocks modes/feedback and Jigsaw UI to the common pastel palette, rounded system font, control colors, radii and shadows. Both games now use the same GameShell header. Retained game art/board colors and all domain/persistence behavior.
- Lint/typecheck/build and 256 unit tests passed. Full browser run: 106 passed, 6 CDP-only skips, 4 failures; after replacing a brittle home flex-only assertion with visible/reachable control checks and rerunning two fixture cases interrupted by reload, targeted run passed 9 with 1 skip. All 110 distinct applicable browser cases passed across the runs. Local visual review covered all five routes, profile form, parent gate/settings and picture library; 320/375/768/1024px checks found no horizontal overflow. Existing 24-piece tablet no-scroll and touch/cancellation checks passed. Physical iPad validation remains pending. No Vercel deployment or TASK 026 work.

2026-09-20 — Jigsaw per-piece celebration completed
- Added an eight-spark burst and star badge at every correctly placed piece, lasting 900ms with shared theme colors. Effects never intercept input; reduced motion hides sparks and keeps a static badge.
- Lint/typecheck/build and 256 unit tests passed, including expanded wrong-placement, lifetime, final-piece and replay assertions. Gameplay browser run: 12 passed, one CDP-only skip and a timeout in the long 24-piece WebKit scenario. Increased that multi-layout/48-tap scenario budget to 60s; targeted rerun passed both browsers. All 13 applicable cases passed across runs. Verified center position, reduced motion, touch/cancel and four responsive widths; visually reviewed local feedback. No deployment. TASK 025 physical iPad validation remains pending; no next task started.

2026-09-20 — User-requested interlocking Jigsaw pieces completed
- Added curved complementary tabs/sockets, flat outer edges, image-aware clipping and shaped tray/drag previews. Preserved counts, snap/tap/keyboard controls, placement celebrations and tablet layout.
- Lint/typecheck/build and 256 unit tests passed. Chromium/WebKit Jigsaw checks: 15 passed, one CDP-only skip. Browser Path2D coverage sampled every source-pixel center for all six supported grids on an uneven-sized image with zero gaps/overlaps, alongside existing exact rectangular raster checks. Gameplay covered 320/375/768/1024px, 24-piece completion, touch/cancel, reduced motion and tablet no-scroll. Visually reviewed a partially assembled 12-piece local round. Physical iPad review remains pending; no deployment or next task started.

2026-09-20 — Larger Jigsaw tray pieces completed
- Enlarged four-piece tablet controls from 64px to 128px and spread them in two columns. Enlarged 6–12-piece layouts with three columns; kept dense 16–24-piece tablet layout compact. Visual shape/tab proportions remain unchanged.
- Lint/typecheck/build, 256 unit tests and 13 gameplay browser cases passed (one CDP-only WebKit skip). Updated narrow-mat non-overlap tests for new sizes; reviewed the four-piece tablet screen. Existing rotation, touch cancellation, 24-piece no-scroll and completion checks passed. No deployment or next task started; real iPad review remains pending.

2026-09-20 — Công chúa picture pack completed
- Copied all four user PNGs unchanged into the local princess pack, retaining both garden variants and actual image proportions. Recorded provenance in docs/JIGSAW-THEMES.md; catalogue now has nine packs and 24 pictures. Existing registry/renderer handles the new pack without architecture changes.
- Lint/typecheck/build, 257 unit tests and two Chromium/WebKit image-gallery checks passed. Browser checks validate all 24 images and responsive 24-piece proportions. Local selection, touch placement and 320/375/768/1024px checks passed; visually reviewed the Công chúa library. No deployment or next-task work; physical iPad validation remains pending.

2026-09-20 — Công chúa restoration blocked by image tool
- User confirmed all four princess pictures. Inspected originals and requested faithful cleanup/sharpening with the built-in imagegen tool. No output assets were returned; an isolated diagnostic request reported HTTP 400 moderation_blocked (output stage). No further generation or alternate-tool bypass attempted after that explicit rejection. Original assets and catalogue remain unchanged; restoration remains unchecked.
- Documentation-only status update; no runtime code changed or validation required. No deployment or next task started.

2026-09-20 — Explicitly requested production deployment completed
- Deployed the current workspace to the existing Vercel project 2bibo. Deployment dpl_AGQwtutKqhXPPgWXWyCGVNo8BJbV is READY and aliased to https://2bibo.vercel.app. Princess images remain the supplied originals; blocked restoration is not included.
- Preflight lint/typecheck/build and 257 unit tests passed; Vercel production build passed. Public browser smoke checks returned HTTP 200 for home, hub, profiles and Blocks; Jigsaw loaded the Công chúa library, decoded images and accepted touch placement with no page errors. No architecture changes or next-task work. Physical iPad validation remains pending.

2026-09-20 — User-requested iPad Jigsaw column layout completed
- Enlarged the board above a full-width tray, with one to three tray rows on tablets. Preserved piece sizes, touch dragging, tap/keyboard alternatives, cancellation and rotation progress. Narrow phone layout remains usable.
- Lint/typecheck/build and 263 unit tests passed. Jigsaw Chromium/WebKit: 13 passed, one CDP-only WebKit skip after making the resize check wait for responsive state. Covered 320/375/768/1024px, full 24-piece completion and touch cancellation/snapping; reviewed portrait and landscape screenshots. Vertical scrolling is intentional for the larger board; no horizontal page overflow. Physical iPad one-handed validation remains pending under TASK 025. No deployment or TASK 026 work.











2026-09-20 — No-scroll iPad Jigsaw column completed
- Kept board above tray; size it to the remaining height and compact the tray/controls. All six piece counts fit at 768x1024 and 1024x768 in Chromium and WebKit with visible pieces/targets >=48px. Reviewed the resulting landscape screen; existing portrait/rotation, touch cancellation/snapping and tap completion checks passed.
- Lint/typecheck/build, 265 unit tests and 13 gameplay browser cases passed (one CDP-only WebKit skip). Rotation geometry assertions now read related bounds in one frame during refitting. Additional all-count WebKit smoke passed after waiting for local page hydration. Updated docs/JIGSAW-VALIDATION.md. No deployment; TASK 025 physical one-handed review remains pending; TASK 026 not started.

2026-09-20 — Explicitly requested no-scroll production deployment completed
- Vercel deployment dpl_A4nTDTP3t4iE6D6zG7j9V7hoC5j5 is READY and aliased to https://2bibo.vercel.app. Includes the column layout and viewport fitting already validated by lint/typecheck/build, 265 unit tests and 13 gameplay browser checks.
- Vercel production build passed. Public WebKit smoke returned HTTP 200 and confirmed board above tray without scrolling at 768x1024 and 1024x768 with 24 pieces; touch placement succeeded with no page errors. No implementation or architecture changes; physical iPad review remains pending and no next task started.

# Agent report format

After each task:

```text
TASK COMPLETED:
TASK XXX — <name>

CHANGED:
- paths

IMPLEMENTED:
- summary

VALIDATION:
- lint:
- typecheck:
- test:
- build:

MANUAL CHECKS:
- touch:
- responsive:
- persistence:

PLAN UPDATE:
- TASK XXX marked complete

NEXT TASK:
- TASK XXX+1

BLOCKERS:
- none / explanation
```

Do not start the next task in the same run.

