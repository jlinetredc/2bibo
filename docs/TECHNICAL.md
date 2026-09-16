# Technical Architecture

## Stack

Recommended:

```text
Next.js
TypeScript
Tailwind CSS
Framer Motion
Zustand
Vitest
Playwright
```

## App Router

Suggested routes:

```text
/
 /play
 /profile
 /world/[worldId]
 /world/[worldId]/chapter/[chapterId]
 /level/[levelId]
 /room
 /rewards
 /parents
 /settings
```

## Suggested source structure

```text
src/
├── app/
├── components/
│   ├── child/
│   ├── parent/
│   ├── feedback/
│   └── layout/
├── games/
│   ├── select/
│   ├── multi-select/
│   ├── drag-drop/
│   ├── sort/
│   ├── memory/
│   ├── pattern/
│   ├── sequence/
│   └── count/
├── data/
│   ├── worlds/
│   │   ├── forest/
│   │   ├── farm/
│   │   ├── colors/
│   │   └── brain/
│   ├── rewards/
│   └── characters/
├── hooks/
├── lib/
│   ├── difficulty/
│   ├── storage/
│   ├── audio/
│   └── analytics/
├── store/
├── types/
└── utils/
```

## Core types

### Child profile

```ts
export type ChildAge = 3 | 4 | 5 | 6;

export interface ChildProfile {
  id: string;
  name: string;
  age: ChildAge;
  avatarId: string;
  createdAt: string;
}
```

### World

```ts
export interface World {
  id: string;
  name: string;
  description: string;
  icon: string;
  image?: string;
  chapterIds: string[];
  order: number;
}
```

### Chapter

```ts
export interface Chapter {
  id: string;
  worldId: string;
  name: string;
  levelIds: string[];
  order: number;
}
```

### Base level

```ts
export interface BaseLevel {
  id: string;
  worldId: string;
  chapterId: string;
  engine: GameEngineType;
  ageMin: ChildAge;
  ageMax: ChildAge;
  instruction: string;
  audio?: string;
  hint?: string;
}
```

## Game engine types

```ts
export type GameEngineType =
  | "select"
  | "multi-select"
  | "drag-drop"
  | "sort"
  | "memory"
  | "pattern"
  | "sequence"
  | "count";
```

## Game renderer

Use one central renderer.

```tsx
<GameRenderer level={level} age={profile.age} />
```

Responsibilities:

1. resolve engine
2. calculate age difficulty
3. render engine
4. report result
5. trigger feedback
6. save progress

## Storage abstraction

Do not access localStorage directly throughout UI code.

Define:

```ts
interface StorageAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
}
```

V1:

```text
LocalStorageAdapter
```

Future:

```text
CloudStorageAdapter
```

## Store design

Suggested Zustand slices:

```text
profile
progress
rewards
settings
session
```

Persist:

- child profile
- completed levels
- stars
- unlocked rewards
- room setup
- settings

Do not persist transient animation state.

## Difficulty service

Create:

```ts
getDifficultyProfile(age: ChildAge)
```

Return values like:

```ts
{
  maxOptions: 3,
  countMax: 10,
  memoryPairs: 3,
  patternComplexity: 2,
  sequenceLength: 3
}
```

Engines consume this configuration.

## Audio

Create a centralized audio service.

Responsibilities:

- play instruction
- replay instruction
- play feedback sounds
- respect muted setting
- prevent overlapping narration

Do not preload every world audio file.

## Assets

Recommended:

```text
public/
├── images/
│   ├── characters/
│   ├── animals/
│   ├── objects/
│   └── worlds/
└── audio/
    ├── ui/
    ├── forest/
    ├── farm/
    ├── colors/
    └── brain/
```

## Testing

### Unit tests

Test:

- difficulty mapping
- star calculation
- unlock rules
- storage adapters
- progress reducers

### Component tests

Test:

- select engine
- count engine
- memory engine
- retry behavior

### E2E

Test:

```text
create profile
→ open world
→ complete level
→ receive stars
→ refresh
→ verify progress remains
```

## Security/privacy

V1 should minimize stored child data.

Store only:

- display name/nickname
- selected age
- avatar
- local progress

Do not request:

- exact birthdate
- address
- school
- phone number
- child email

## Performance

Goals:

- route-level code splitting
- optimized images
- minimal JS for locked worlds
- audio loaded on demand
- avoid large animation libraries beyond current needs

## Deployment

Target:

```text
GitHub → Vercel
```

Environment variables should not be required for V1.

## Future backend compatibility

Architecture should allow later addition of:

- Supabase
- Firebase
- parent account sync
- multi-device progress

Do not implement these in V1.
