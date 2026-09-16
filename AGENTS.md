# Bibo World Agent Rules

You are working on Bibo World, an educational web game for children ages 3–6.

Read this file before modifying the project.

## Mission

Build a safe, calm, playful, touch-first learning experience where children learn through guided play rather than tests.

The product should optimize for meaningful 5–10 minute learning sessions, not maximum screen time.

## Core product principles

1. Child-first UI.
2. Touch-first interaction.
3. Instructions must be short and easy to understand.
4. Audio support must be available for important instructions.
5. Incorrect answers must never be punished.
6. Never subtract stars, lives, streaks, or rewards for mistakes.
7. Never use competitive leaderboards.
8. Avoid stressful timers.
9. Do not use dark patterns.
10. Avoid ads in the child experience.
11. Do not make educational performance claims such as IQ scores.
12. Encourage breaks and offline activities.
13. Mobile and tablet are higher priority than desktop.

## Architecture rules

### Game content is data

Game engines must not contain hard-coded level questions.

Correct:

```ts
<GameRenderer level={levelData} />
```

Incorrect:

```ts
if (levelId === "forest-001") {
  return <Question>Which animal lives in a tree?</Question>
}
```

### Reusable engines

Place reusable game logic under:

```text
src/games/
```

Place level/world content under:

```text
src/data/
```

Place shared UI under:

```text
src/components/
```

### Age adaptation

Age determines presentation and difficulty.

Supported child ages:

```text
3
4
5
6
```

Never duplicate entire game engines just to support a different age.

## V1 storage

Use LocalStorage through a storage abstraction.

Do not couple components directly to `window.localStorage`.

Use a storage service so V2 can later migrate to Supabase/Firebase without rewriting game UI.

## Accessibility

- Minimum primary touch target: 48×48 px.
- Do not require hover.
- Use semantic buttons.
- Use visible focus states.
- Use accessible labels for icons.
- Do not rely on color alone for correctness.
- Respect `prefers-reduced-motion`.
- Audio must have replay controls.
- Avoid rapid flashing.

## Child-friendly feedback

Correct answer:

- Positive animation
- Short praise
- Star reward when appropriate

Examples:

- “Tuyệt quá!”
- “Con làm được rồi!”
- “Giỏi lắm!”

Incorrect answer:

- Do not show red failure screens.
- Do not play harsh sounds.
- Allow retry.

Examples:

- “Gần đúng rồi!”
- “Con thử lại nhé.”
- “Bibo sẽ giúp con.”

## Performance

- Use optimized images.
- Prefer WebP/AVIF.
- Lazy-load non-critical audio and imagery.
- Avoid autoplaying large media.
- Avoid unnecessary dependencies.
- Avoid loading assets for locked worlds.

## Testing requirements

Before completing a task, run:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

If the project does not yet contain a requested script, create a reasonable script or document why it is not available.

Test responsive layouts at minimum:

```text
320px
375px
768px
1024px
```

Test core game flows:

- correct answer
- incorrect answer
- retry
- next level
- refresh
- progress persistence

## Git discipline

Prefer small, feature-focused commits.

Examples:

```text
feat: initialize bibo world foundation
feat: add child profile flow
feat: implement select game engine
feat: add forest world content
feat: add reward persistence
```

Do not combine unrelated work into a single commit.

## Scope control

Do not implement later roadmap features while working on an earlier task unless required by architecture.

Avoid premature backend work.

V1 does not require:

- authentication
- online accounts
- social features
- global leaderboards
- multiplayer
- payments
- cloud sync

## Definition of done

A feature is done only when:

1. It works on touch devices.
2. It works after browser refresh.
3. It follows the data-driven architecture.
4. It contains no hardcoded level-specific logic in the engine.
5. It has child-friendly feedback.
6. It is responsive.
7. Lint/typecheck/build pass.
