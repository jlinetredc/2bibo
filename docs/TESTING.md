# TESTING.md

## Required commands

When configured:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Responsive checkpoints

```text
320px
375px
768px
1024px
```

## Device priority

1. iPad Safari
2. iPhone Safari
3. Android Chrome
4. Desktop Chrome

## Touch test checklist

For drag games:
- drag 20 times repeatedly
- pointer cancellation
- release outside target
- quick tap after drag
- no accidental page scroll
- no text selection
- no stuck pointer state

## Rotation

Test:
- portrait → landscape
- landscape → portrait

Check:
- no corrupted state
- no clipped controls
- no offscreen game board

## Persistence

Test:

```text
create profile
→ play game
→ save progress
→ refresh
→ verify intended state remains
```

## Audio

Check:
- mute persists
- voice stops before new voice starts
- no overlapping effects that become painful
- Quiet Mode behavior

## PWA

Check:
- manifest
- icons
- standalone launch
- offline shell
- direct route behavior
- cached games work as promised

## Game-specific solvability

Procedural games that require solutions must validate generated content before presenting it.

Especially:
- Maze
- Parking
- Blocks Puzzle
- Train puzzle

## Performance

Avoid:
- huge eager asset loads
- autoplay background video
- excessive JavaScript
- unnecessary heavy libraries

For physics, benchmark on tablet-class hardware before committing to the engine.
