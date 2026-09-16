# Bibo World Implementation Tasks

Complete tasks in order unless a dependency requires otherwise.

---

# Phase 1 — Foundation

## TASK 001 — Initialize project

Create the Bibo World project.

Requirements:

- Next.js App Router
- TypeScript
- Tailwind CSS
- ESLint
- mobile-first layout
- source under `src/`

Deliver:

- working app
- base routes
- package scripts
- build passes

Do not implement game content.

Suggested commit:

```text
feat: initialize bibo world project
```

---

## TASK 002 — Add project architecture

Create the folder architecture defined in `TECHNICAL.md`.

Add:

- types
- game engine registry
- storage abstraction
- difficulty service
- base Zustand store

Do not implement full games yet.

Suggested commit:

```text
feat: add core project architecture
```

---

## TASK 003 — Child profile flow

Implement local child profile creation.

Fields:

- nickname
- age: 3/4/5/6
- avatar

Requirements:

- no exact birthday
- persist locally
- editable by parent
- child-friendly visuals

Suggested commit:

```text
feat: add child profile flow
```

---

# Phase 2 — Navigation & World Map

## TASK 004 — Home screen

Implement:

- Start/Continue
- Stars
- Rewards
- Parent area entry

Child-facing text must remain minimal.

---

## TASK 005 — World map

Create world selection for V1:

- Forest
- Farm
- Colors
- Brain Island

Requirements:

- locked/unlocked states
- touch-friendly cards
- no horizontal page overflow
- visual progress indication

---

# Phase 3 — Shared Game Runtime

## TASK 006 — Game renderer

Build:

```tsx
<GameRenderer />
```

Responsibilities:

- load level data
- select engine
- pass age difficulty
- collect result
- trigger feedback
- update progress

No level-specific conditionals.

---

## TASK 007 — Feedback system

Create shared feedback components.

States:

- correct
- retry
- hint
- reward

Requirements:

- no punishment
- no harsh error styling
- reduced-motion support

---

## TASK 008 — Audio service

Implement:

- instruction playback
- replay button
- UI sounds
- mute preference
- stop previous narration before starting new narration

---

# Phase 4 — Game Engines

## TASK 009 — Select Game

Features:

- 2–4 answer cards
- image-based choices
- keyboard accessible
- touch-first
- retry support
- audio instruction support

Content must be data-driven.

---

## TASK 010 — Count Game

Features:

- visual objects
- answer buttons
- age-based quantity limit
- count range from difficulty service

---

## TASK 011 — Drag & Drop Game

Features:

- pointer events
- snap feedback
- tap alternative where practical
- accessible destination labeling

---

## TASK 012 — Memory Game

Features:

- configurable pairs
- age-based card count
- restart
- completion callback

---

## TASK 013 — Multi Select Game

Features:

- multiple correct items
- submit/confirm action
- optional auto-complete for simple age-3 content

---

## TASK 014 — Sort Game

Features:

- order objects
- drag and tap controls
- age-based item count

---

## TASK 015 — Pattern Game

Features:

- AB
- ABA
- ABC
- age-based complexity

---

## TASK 016 — Sequence Game

Features:

- 2–5 ordered steps
- daily routine support
- age-based sequence length

---

# Phase 5 — V1 Content

## TASK 017 — Forest world

Create:

```text
3 chapters
5 levels each
15 total levels
```

Educational focus:

- animals
- habitat
- observation
- classification
- sounds

Use a mixture of:

- select
- multi-select
- drag-drop
- memory
- pattern

---

## TASK 018 — Farm world

Create 15 levels.

Focus:

- counting
- size
- food
- quantities
- animals

---

## TASK 019 — Colors world

Create 15 levels.

Focus:

- color recognition
- shapes
- matching
- simple visual creativity

---

## TASK 020 — Brain Island

Create 15 levels.

Focus:

- memory
- classification
- patterns
- ordering
- simple logic

---

# Phase 6 — Progression & Rewards

## TASK 021 — Progress system

Track:

- completed levels
- stars
- chapter completion
- unlocked levels

Progress must survive refresh.

---

## TASK 022 — Rewards

Implement:

- stickers
- clothing
- room items
- pets

Rewards must be deterministic.

No loot boxes.

---

## TASK 023 — Bibo Room

Create:

```text
/room
```

Allow children to place unlocked items.

Keep interaction simple.

V1 room objects:

- bed
- plant
- toy
- wall picture
- rug
- pet

---

# Phase 7 — Parent Experience

## TASK 024 — Parent gate

Implement adult gate before `/parents`.

Preferred:

- hold button
or
- simple adult math task

---

## TASK 025 — Parent dashboard

Show:

- recent activity
- domains practiced
- completed levels
- suggested skills to practice

Do not show intelligence rankings.

---

## TASK 026 — Offline activity suggestions

After sessions, show context-aware suggestions.

Examples:

- find 3 red objects
- count 5 spoons
- sort socks
- imitate an animal movement

---

# Phase 8 — Session Health

## TASK 027 — Break suggestions

After sustained play, suggest a break.

Do not hard-lock the game.

Examples:

- stretch
- jump
- walk like an animal

---

# Phase 9 — Quality

## TASK 028 — Responsive audit

Validate:

```text
320px
375px
768px
1024px
```

Fix:

- clipping
- tiny controls
- overflow
- unreadable text

---

## TASK 029 — Accessibility audit

Check:

- keyboard navigation
- semantic buttons
- labels
- reduced motion
- audio replay
- focus states

---

## TASK 030 — Persistence audit

Verify:

```text
create profile
play level
earn stars
unlock reward
refresh browser
```

Everything expected must persist.

---

## TASK 031 — Performance audit

Goals:

- optimized images
- lazy audio
- no large unused bundles
- no autoplay video backgrounds
- Lighthouse performance target above 90 where practical

---

## TASK 032 — Vercel deployment

Deploy production build.

Verify:

- direct route loading
- refresh on dynamic routes
- static assets
- audio
- LocalStorage
- responsive behavior

---

# Phase 10 — Post V1

Only begin after V1 is stable.

Order:

1. Ocean
2. Home
3. City
4. Language
5. Numbers
6. Space
7. optional cloud sync
8. parent account
9. multi-device profiles

Do not start these during V1 unless explicitly requested.
