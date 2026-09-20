# Shared Bibo theme validation — 2026-09-20

Scope: home, game hub, profiles and editing form, shared GameShell, parent gate,
Blocks settings/modes/feedback, Jigsaw play surface and picture library.
Theme values live in `src/game-core/theme/tokens.css`; all app typography
inherits its system font stack. Game artwork retains its own colors.

- Lint, typecheck, 256 unit tests and production build passed.
- Full Chromium/WebKit suite: 106 passed, 6 CDP-only WebKit skips. Four initial
  failures comprised two obsolete home flex-layout assertions and two fixture
  cases interrupted by page reload. Updated the home test to verify usable
  links, then reran home, theme images and parent gate: 9 passed, 1 CDP-only
  skip. All 110 distinct applicable browser cases passed across these runs.
- Local review of the five routes at 320/375/768/1024px found no horizontal
  overflow and the same computed font stack. Visually reviewed home, hub,
  profile form, both games, parent gate/settings and the picture library.
- Existing checks cover focus, reduced motion, profile persistence, protected
  settings, drag cancellation, injected touch, rotation, all Blocks modes and
  24-piece Jigsaw completion without tablet page scrolling.
- No physical iPad or child usability signoff is claimed. TASK 025 remains
  pending that hardware review. No deployment was performed.
