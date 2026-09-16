# Bibo World — Starter Pack for Codex / Antigravity

Bibo World is an educational web game for children ages 3–6.

This starter pack defines the product rules, educational principles, technical architecture, UI rules, content rules, and implementation roadmap so an AI coding agent can build the project consistently.

## Recommended stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Zustand
- LocalStorage persistence for V1
- Static/local audio and image assets
- Vercel deployment

## Recommended workflow

1. Read `AGENTS.md`
2. Read all files under `/docs`
3. Start with tasks in `docs/TASKS.md`
4. Complete one task at a time
5. Run lint, typecheck, tests, and build before marking a task complete
6. Commit each feature separately

## V1 scope

Worlds:

- Forest
- Farm
- Colors
- Brain Island

Target:

- 4 worlds
- 3 chapters per world
- 5 levels per chapter
- 60 total levels
- 8 reusable game engines

Do not build all 10 worlds in V1.

## Later worlds

- Ocean
- City
- Home
- Language
- Numbers
- Space

The architecture must allow these worlds to be added mostly through data, not new page logic.
