# Jigsaw completion and one-handed validation — TASK 025

## Larger tray pieces (2026-09-20)

Four-piece trays use two columns with 128px tablet/112px phone controls;
6–12 pieces use three columns and 88px/80px controls. Dense 16–24 layouts
retain 64px controls. Sizes remain stable as pieces are placed. Updated narrow
mat tests verify initial controls do not overlap. Lint/typecheck/build, 256 unit
tests and 13 gameplay browser cases passed (one CDP-only skip), including
rotation, touch cancellation and tablet 24-piece no-scroll. Visually reviewed
the four-piece tablet layout; physical iPad review remains pending.

## Interlocking pieces (2026-09-20)

Gameplay now displays curved tabs and sockets in the tray, board and drag
preview, while keeping rectangular touch/snap anchors. Outer picture edges stay
flat. Lint/typecheck/build, 256 unit tests and 15 browser checks passed, with
one CDP-only WebKit skip. Added Path2D coverage checks for all supported grids:
zero uncovered or multiply covered pixel-centers on the uneven 101×67 source.
Existing responsive, no-scroll tablet, 24-piece completion, cancellation and
reduced-motion checks passed. Visually reviewed local 12-piece play with shaped
guides and a placed piece. Physical iPad validation remains pending.

## Per-piece celebration (2026-09-20)

Correct placements show eight small sparks and a central star for 900ms, including
the last piece. Effects are decorative and pointer-transparent, with cleanup on
replay/unmount. Reduced motion shows a static badge without sparks. Source-image
percentages keep feedback at the correct cell across resizing.

Lint/typecheck/build and 256 unit tests passed; extended tests verify rejected
placement, effect expiry, final-piece feedback and replay cleanup. All 13 applicable
gameplay browser cases passed across runs (one CDP-only WebKit skip); the 24-piece
multi-layout test needed a 60s budget and passed on rerun. Correct effect position,
reduced motion, touch/cancel and four screen widths were covered. Local feedback
was visually reviewed; physical iPad validation remains pending.

## Scroll reduction (2026-09-20)

Gameplay uses two columns from 700px in portrait and landscape, tighter control
spacing and a compact mat with 64px pieces. All 24 pieces and the board fit at
768×1024 and 1024×768 without page scrolling, asserted in Chromium/WebKit and
visually reviewed. Global scrolling remains available on small/zoomed displays.
Lint/typecheck/build, 256 unit tests and 11 gameplay browser cases passed; one
CDP-only WebKit case was skipped. Physical iPad review remains pending.

## Child app layout follow-up (2026-09-20)

Scoped rounded app chrome, warm mat, visual progress and thumbnail theme choices
were added without changing the puzzle engine. Phone picture selection uses two
columns. Lint/typecheck/build and 256 unit tests passed; final gameplay tests:
11 passed, one CDP-only WebKit skip. Reviewed tablet and phone screenshots;
responsive, rotation, touch cancellation and image retry checks passed. A test
run overlapping build output was discarded and rerun with stable output.
Real one-handed iPad validation remains pending. No deployment.

## Current scatter-mat and library follow-up (2026-09-20)

Added six more generated scenes, bringing Doraemon/Labrador to four pictures
each. Replaced tray pagination with all remaining pieces on a movable mat,
normalized bounded positions, keyboard nudging and “Xếp gọn” recovery. A modal
thumbnail library stages picture/count choices; closing it preserves the round
and returns focus to its opener. The play toolbar stays compact.

Lint, typecheck, 256 unit tests and production build passed. Chromium/WebKit
Jigsaw coverage includes all 20 images, exact crop reconstruction, a complete
24-piece round, 320/375/768/1024px bounds, touch/cancellation, rotation, mat
rearrangement, tidy recovery and discarded library drafts. Physical iPad and
one-handed reach remain unverified; the TASK 025 hardware procedure below is
still pending. No deployment was performed.

## Earlier visual/count follow-up (superseded tray layout, 2026-09-20)

Added generated Doraemon/Labrador illustrations, explicit 4–24-piece selection,
visual guide toggle, image-first placement without visible matching numbers,
six-piece tray pages and a side-by-side landscape layout. Guest/age defaults
still apply until a count is explicitly selected. Tap/keyboard remain available.

Final lint/typecheck/build and 249 unit tests passed. Jigsaw gameplay E2E passed
9 cases with one CDP-only WebKit skip; image/crop regression separately passed
4 cases. The first browser run exposed offscreen tray reach after rotation;
landscape layout was corrected and all gameplay cases rerun successfully.
Coverage includes a complete 24-piece round, draft changes, hints, tray navigation,
all four viewport widths, drag/cancel, rotation and native touch injection.
Generated images and the final landscape screen were visually reviewed. Physical
iPad validation remains pending. Elsa art was blocked by the image tool and has
not been added; a user-supplied image is needed to finish that content request.

## Implementation delivered

The registry now exposes Bibo Jigsaw at `/play/jigsaw`, loaded lazily within
GameShell. The standalone host reads the selected profile through the shared
profile API (4/6/9-piece age defaults), falls back to a guest board if reading
fails, and never overwrites profiles. Selecting a different picture is a draft;
the explicit “Ghép tranh này” action starts it. All twelve local theme pictures
are available. No timer, penalty, forced login or new child data is introduced.

`JigsawGame` accepts a generated puzzle as `config` plus the shared standalone/
quest contract. Remount with a new key for a new configuration. It supports:

- Single-pointer dragging via the shared capture/cancellation utility. A tray
  thumbnail becomes a board-sized preview centered on the aim point; touch/pen
  lifts that point 56 CSS px. Snapping uses the existing 28px-radius domain query.
- Two separate taps (piece, matching numbered target) or keyboard buttons as a
  one-handed alternative that does not require a held gesture.
- Gentle rejection without consuming pieces. Only draggable handles disable
  scrolling/selection; ordinary document scrolling remains available. Escape,
  pointer cancellation/lost capture, blur/hidden state, resize and scrolling
  cancel pending drags. Source image load errors have a retry action.
- Source-proportional grid rows/columns, including partially filled boards.
- Final full-image reveal with removed seams, short encouragement, a brief star
  animation and focus on the result heading. Reduced-motion disables animation.
  “Ghép lại” resets the round; “Chọn tranh khác” focuses the picture selector.
- Exactly one `onComplete({ puzzleId, pieces })` per completed round. Replay
  permits a new completion callback; no timed auto-advance occurs.

Audio is optional in the design and is not added here; the unused shell control
is hidden. Progress is session-only: refresh opens a fresh puzzle. There is no
new persistence schema, adaptive difficulty or parent settings work in this task.

## Checks performed (2026-09-20)

| Check | Result |
| --- | --- |
| lint / typecheck / build | Passed |
| Unit tests | 247 passed across 29 files |
| Final gameplay Chromium/WebKit run | 7 passed, 1 CDP-only WebKit skip |
| Earlier image/crop browser regression | 4 passed |
| Hub browser regression | 4 passed |
| 320 / 375 / 768 / 1024px | Passed, 4- and 9-piece hosts, controls at least 48px |
| Portrait → landscape → portrait | Passed, placements retained; active drag cancelled |
| Completion, replay, keyboard, WebKit taps | Passed |
| 20 cancelled/outside drags, then valid drag and quick tap | Passed in both engines |
| Single native touch injection / no scroll or selection / cancellation | Passed in Chromium via CDP |
| Image failure/retry and selected older profile | Passed in both engines |
| Visual review | Captured playing and completion screens reviewed; uneven grid-row issue found, corrected and regression-tested |
| Physical iPad held/operated with one hand | **Not performed — device/operator required** |

WebKit emulation and injected input do not demonstrate real hand reach, Safari
hardware behavior or comfort. TASK 025 remains unchecked until the following
device check is recorded. Do not start TASK 026 on the strength of emulation alone.

## Remaining physical-device check

Use the new local build on iPad Safari (deployment is not authorized implicitly).
Record iPad model, iPadOS/Safari version, orientation and hand used; no child
identity is needed.

1. Open Bibo Jigsaw, use one hand to finish a 4-piece picture with separate taps.
2. Replay and perform 20 drags, including wrong/outside drops and interrupted
   gestures. Confirm no stuck preview, text selection or unwanted scrolling.
3. Finish by dragging; verify the lifted preview is visible and targets/replay
   can be reached comfortably. Try the other hand if practical.
4. Rotate portrait → landscape → portrait during play. Verify placements remain
   correct, pending drag cancels and controls remain reachable.
5. Verify full-image reveal, calm feedback, replay and picture change; repeat
   with Reduce Motion. Check the older-profile 9-piece layout for clipping.

If any check fails, record and fix it within TASK 025. If it passes, record the
result here and mark TASK 025 complete in the master plan.

## 2026-09-20 — Larger board in a tablet column

User-requested follow-up replaces the side-by-side tablet arrangement: board above the tray, maximum play width 800px. Tablet trays use 4/6/8 columns and at most three rows. Natural vertical scrolling is allowed to preserve the larger picture; previous tablet zero-scroll assertions no longer apply. No global scroll lock was introduced.

Validation: lint, typecheck, production build, 263 unit tests; 13 Chromium/WebKit gameplay cases passed, one CDP-only WebKit skip. Responsive assertions cover 320/375/768/1024px, board above tray, enlarged tablet board, shallow tray, contained pieces and >=48px targets. A resize-state wait fixed a stale geometry assertion in the first WebKit run. Touch injection covered cancel, valid snap, no scrolling during an active drag and subsequent tap. Full 24-piece completion, rotation retention and tidy/rearrangement passed. Visually reviewed tablet screenshots in both orientations. Hardware one-handed review is still pending. This change has not been deployed.

## 2026-09-20 — No-scroll clarification (current behavior)

Supersedes the previous allowance for vertical gameplay scrolling on tablets. Board remains above the tray and fits the remaining viewport height using measured top/tray dimensions, preserving its aspect ratio and minimum 48px targets. Tidy now shares the guide toolbar. At >=1000px, 16/24-piece trays use twelve columns and two rows; portrait retains eight columns. No global overflow lock or clipped controls; library and narrow/zoomed-screen scrolling remain available.

Lint/typecheck/build and 265 unit tests passed. Chromium/WebKit gameplay: 13 passed, one CDP-only WebKit skip. Additional browser checks covered all six piece counts (4/6/9/12/16/24) at 768x1024 and 1024x768: no page overflow, every piece and target visible and >=48px. Existing 320/375px checks passed. Rotation assertions read geometry atomically to avoid comparing different resize frames. Local WebKit smoke initially clicked before hydration; rerun after waiting for the game passed. Reviewed the landscape layout screenshot; touch drag/cancel and tap alternatives passed automated checks. Physical one-handed iPad review remains outstanding. No deployment.
