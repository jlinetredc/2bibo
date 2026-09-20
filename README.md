# Bibo Play V2 Starter Pack

This package is the single project brief for Codex / Antigravity.

## What to do

1. Copy all files into the repository root.
2. Keep `AGENTS.md` at the root.
3. Keep `BIBO_MASTER_PLAN.md` at the root.
4. Keep all supporting specifications under `/docs`.
5. Tell the agent:

```text
Read AGENTS.md first.
Then read BIBO_MASTER_PLAN.md and all relevant files under /docs.
Inspect the repository.
Find the first incomplete task whose dependencies are satisfied.
Implement that task only.
Run all required validation.
Update BIBO_MASTER_PLAN.md.
Do not start the next task.
```

## Priority

The project intentionally prioritizes independent games first:

1. Blocks
2. Jigsaw
3. Memory
4. Tangram
5. Maze
6. Sort
7. PWA + Parent basics
8. Train Track
9. Parking
10. Pattern
11. Tower / Bridge / Physics
12. Discovery games
13. Creative games
14. Toy sandbox
15. Adaptive difficulty
16. Bibo World integration

The independent games are production modules, not disposable prototypes.

## Local development

Use Node.js 24 LTS (see `.nvmrc`) and npm. Node.js 22.13+ is also supported.

```bash
npm ci
npm run dev
```

Open http://localhost:3000. The initial page is a minimal Vietnamese welcome
screen; the game hub and game modules are separate roadmap tasks.

## Validation

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npx playwright install chromium webkit
npm run test:e2e
```

`typecheck` generates Next.js route types before checking TypeScript, including on
a fresh checkout. `test` runs Vitest once; `test:watch` starts watch mode.
Playwright starts the production build on port 3100 and tests Chromium and
tablet-emulated WebKit at 320, 375, 768, and 1024px. Run `build` before `test:e2e`.
Browser emulation does not replace physical iPad touch checks for future games.

Use `npm run start` to serve a production build on port 3000. No environment
variables, external fonts, or service credentials are required.
