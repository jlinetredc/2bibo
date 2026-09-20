# Blocks validation — TASK 019

Date: 2026-09-19. Scope: Classic, Shape Fill and Puzzle only.

Implemented: lifted drag preview and cancellation on resize; tablet landscape
layout; gesture-activated placement/completion SFX and persistent mute; validated
per-profile/guest snapshots restoring active mode, boards, trays and undo history.

## Evidence

| Check | Result |
|---|---|
| Lint, typecheck, production build | Passed on Node.js 24 |
| Unit tests | 179 passed; includes snapshot validation and deterministic continuation |
| Full Chromium/WebKit suite | 83 passed; five native-touch CDP tests run on Chromium and are skipped on WebKit |
| 320 / 375 / 768 / 1024 CSS px | Passed; large controls, no horizontal overflow, portrait/landscape state retained |
| Drag lifecycle | Repeated 20-drag sequences, outside release, Escape, native touch cancel, quick subsequent tap and rotation cancellation passed |
| Drag preview | Lifted shape stays inside horizontal screen edges; symbolic valid/invalid board footprints; cancelled preview removed |
| Landscape tablet | Boards and trays entirely visible at 1024×768 |
| Persistence | All three modes restore; full Shape Fill/Puzzle completions remain completed after reload; restart/undo saves; guest and two profiles isolated |
| Storage errors | Corrupt/future data preserved; bad profile read cannot overwrite guest; failed writes reported while playing continues |
| Audio | Actual WAV source playback after gesture in Chromium, no autoplay; muted placement stays silent after reload; unsupported Windows WebKit degrades safely |
| Manual browser review | Landscape drag, portrait layout, reload restoration and mute reviewed in the in-app browser |

After the final preview edge clamp, the focused polish suite also passed on
Chromium and WebKit. Audio manager unit/fixture tests cover replacement and
cancellation of pending/active sources.

## Device limits

Physical iPad Safari, real-child play, notch/browser-toolbar behavior and
subjective listening volume were not available for this run. Desktop WebKit
device emulation and Chromium touch injection are not physical-device signoff.
Before calling the game stable for real children, repeat the drag, rotation,
mute/listening and reload checks on an iPad. No physical-device pass is claimed.

These tests do not claim PWA/offline support; the scheduled PWA tasks remain
untouched. Browser eviction/private-session durability and simultaneous edits
from multiple tabs are not guaranteed. No cloud sync or child telemetry is used.

## Baby experience follow-up — 2026-09-20

New sessions start with a 5×5 board and one-/two-cell pieces. Existing saves keep
their original piece catalogue and board size. Parent settings are behind the
shared ParentGate, with focus restored on close and fresh verification each time.
Size/difficulty drafts do not alter play until the parent starts a new board.
Audio and hints retain their shared persistence paths.

Touch/pen uses an aim point 56 CSS px above the finger; mouse aiming remains
direct. A 14px edge tolerance accepts nearby legal placements, including full
shape-mask validation, without searching for distant free cells. Native Chromium
touch tests now target the lifted aim point and still exercise cancellation,
no document scrolling and no text selection in all three modes.

The first-play hand is a visual-only demonstration of a legal footprint, not an
automatic move. First input dismisses it without consuming that input. It can be
replayed from parent settings; reduced-motion uses a static illustration. Tests
cover dismissal/restoration, unchanged progress during replay, settings gating,
Escape/focus return, small controls at 320/375/768/1024px, deterministic baby
streams and old-save validation. Manual browser review confirmed the simplified
screen and a successful near-edge drop. Physical iPad validation is still needed.
