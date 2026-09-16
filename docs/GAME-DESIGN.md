# Game Design Specification

## Core gameplay loop

```text
Choose World
→ Enter Chapter
→ Hear/see short mission
→ Play one activity
→ Receive feedback
→ Earn progress/reward
→ Continue or take a break
```

## Game engines

V1 should support eight reusable engines.

### 1. Select Game

The child selects one correct option.

Use for:

- animal recognition
- color recognition
- vocabulary
- shape recognition

Example:

```text
Which animal lives in water?

🐟  🐶  🐔
```

### 2. Multi Select Game

The child selects multiple valid items.

Use for:

- category recognition
- selecting all fruits
- selecting all red objects

### 3. Drag & Drop Game

The child moves an item to its correct destination.

Use for:

- animal → habitat
- object → room
- shape → matching slot

Provide a tap-based alternative when practical.

### 4. Sort Game

The child orders items.

Use for:

- small → large
- low → high
- morning routine
- quantity comparison

### 5. Memory Game

Pairs of cards.

Difficulty examples:

```text
age 3: 4 cards
age 4: 6 cards
age 5: 8 cards
age 6: 8–12 cards
```

### 6. Pattern Game

Complete a repeating pattern.

Examples:

```text
🔴 🔵 🔴 🔵 ?
```

```text
🐱 🐶 🐱 🐶 ?
```

### 7. Sequence Game

Put actions in the correct order.

Examples:

- washing hands
- brushing teeth
- getting dressed
- planting a seed

### 8. Count Game

Count visual objects.

Examples:

```text
🍎 🍎 🍎

2   3   4
```

## Age difficulty model

### Age 3

- 2–3 options
- counting 1–5
- obvious visual differences
- short 2-step sequences
- memory 4 cards
- AB patterns
- very little text

### Age 4

- 3 options
- counting 1–10
- basic sorting
- 3-step sequences
- memory 6 cards
- AB and simple ABA patterns

### Age 5

- 3–4 options
- counting 1–20
- simple addition with objects
- 3–4 step sequences
- memory 8 cards
- more complex classification

### Age 6

- 4 options
- simple addition/subtraction
- longer sequences
- memory 8–12 cards
- advanced patterns
- mixed-skill challenges

## Feedback design

### Correct

Use:

- short positive phrase
- light animation
- optional star

Examples:

```text
Tuyệt quá!
Con làm được rồi!
Giỏi lắm!
```

### Incorrect

Use:

```text
Gần đúng rồi!
Con thử lại nhé.
Bibo sẽ giúp con.
```

Do not:

- subtract rewards
- lock the activity
- show “FAILED”
- use harsh red warning UI
- play negative buzzer sounds

## Attempts

A child should be allowed to retry.

If the child makes repeated mistakes:

1. reduce distractors
2. visually highlight relevant area
3. replay instruction
4. provide a gentle hint

Do not immediately reveal the answer unless necessary.

## Progression

Hierarchy:

```text
World
→ Chapter
→ Level
```

A level unlocks the next level when completed.

Do not require perfect stars to progress.

## Stars

Suggested scoring:

```text
Completed independently: 3 stars
Completed after one hint: 2 stars
Completed with several hints: 1 star
```

This must never be shown as failure.

## World progression

World completion can unlock:

- badge
- sticker pack
- Bibo clothing
- room object
- pet

## Bibo Room

The Bibo Room is a light meta-game.

Children can place unlocked items in a room.

V1 room items:

- bed
- plant
- toy
- wall picture
- rug
- pet

The room must not become more important than learning gameplay.

## Movement breaks

After several levels, suggest an activity away from the screen.

Examples:

```text
Jump like a rabbit 5 times.
Stretch your arms like a tall tree.
Walk like an elephant.
```

## Offline learning prompts

Examples:

After color activity:

```text
Find 3 red objects in your room.
```

After number activity:

```text
Count 5 spoons with a grown-up.
```

After sorting activity:

```text
Sort socks and shirts into two groups.
```

## Character roles

### Bibo — bear

Main companion.

Traits:

- curious
- kind
- encouraging

### Mimo — rabbit

Logic and puzzle character.

### Poko — panda

Numbers and counting character.

### Lala — fox

Language and storytelling character.

## Character emotions

Supported states:

```text
happy
thinking
celebrating
encouraging
sleeping
```
