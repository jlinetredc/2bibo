# Agent Prompt Samples

## Prompt 1 — Foundation

```text
You are implementing TASK 001 from docs/TASKS.md.

Before coding:
1. Read AGENTS.md.
2. Read docs/PRODUCT.md.
3. Read docs/UI-GUIDE.md.
4. Read docs/TECHNICAL.md.

Implement only TASK 001.

Do not implement game content yet.

After implementation:
- run lint
- run typecheck
- run tests if configured
- run build

Report:
1. files created/changed
2. architecture decisions
3. validation results
4. any blockers
```

## Prompt 2 — Select Game

```text
You are implementing TASK 009 from docs/TASKS.md.

Read AGENTS.md and the relevant project docs first.

Build the Select Game as a reusable engine.

Requirements:
- all content comes from level data
- no hard-coded level questions
- touch-first
- semantic buttons
- audio replay support
- retry after incorrect answer
- positive feedback only
- difficulty must support ages 3–6
- responsive at 320, 375, 768, 1024 px

Add tests.

Run lint, typecheck, tests, and build before finishing.
```

## Prompt 3 — Forest World

```text
You are implementing TASK 017 from docs/TASKS.md.

Do not create new game engines unless an existing engine is technically insufficient.

Create Forest world content:
- 3 chapters
- 5 levels per chapter
- 15 levels total

Focus:
- animals
- habitats
- observation
- classification
- animal sounds

Use existing reusable engines and data structures.

Every level must include:
- age range
- instruction
- engine
- answer data
- hint
- learning objective

Run the full validation suite before finishing.
```
