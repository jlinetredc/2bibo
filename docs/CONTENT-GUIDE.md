# Content Guide

## Audience

Children ages 3–6.

Content must be:

- concrete
- familiar
- visual
- short
- positive

## Instruction style

Preferred:

```text
Chọn con mèo.
Tìm màu đỏ.
Đếm những quả táo.
Kéo cá về biển.
```

Avoid:

```text
Hãy tiến hành lựa chọn đối tượng có đặc tính phù hợp.
```

## Question length

Aim for:

```text
3–10 words in Vietnamese
```

Longer narration may be used for story moments, not for gameplay instructions.

## Vocabulary themes

Good early themes:

- animals
- food
- family objects
- clothing
- colors
- shapes
- vehicles
- weather
- nature
- daily routines

## Sensitive content

Avoid:

- violence
- frightening imagery
- death themes
- weapons
- gambling
- commercial ads
- body shaming
- competitive ranking

## Wrong answers

Wrong options should be reasonable but not intentionally confusing.

For age 3, differences should be visually clear.

Difficulty can become subtler with age.

## Numbers

Age 3:

```text
1–5
```

Age 4:

```text
1–10
```

Age 5:

```text
1–20
simple addition with objects
```

Age 6:

```text
basic addition/subtraction
```

## Language learning

For younger children, prioritize:

```text
image → sound → meaning
```

before:

```text
written word → spelling
```

## English content

English should be optional in V1.

Example:

```text
🐱
“Mèo”
“Cat”
```

Do not overload the child with bilingual labels everywhere.

## Audio narration

Narration should:

- sound warm
- be slow enough for preschoolers
- avoid robotic pacing
- avoid overly excited shouting
- use consistent pronunciation

## World-specific content

### Forest

- animals
- habitats
- plants
- sounds
- observation

### Farm

- animals
- food
- quantities
- sizes
- counting

### Colors

- colors
- shapes
- visual matching
- creative combinations

### Brain Island

- memory
- patterns
- classification
- sequences
- simple puzzles

## Level authoring checklist

Every level should define:

- learning objective
- age range
- engine type
- instruction
- assets
- answers
- hint
- reward
- offline extension if appropriate

## Example content object

```ts
{
  id: "forest-001",
  worldId: "forest",
  chapterId: "forest-ch1",
  engine: "select",
  ageMin: 3,
  ageMax: 6,
  instruction: "Con nào sống trên cây?",
  audio: "/audio/forest/forest-001.mp3",
  options: [
    { id: "monkey", image: "/images/animals/monkey.webp" },
    { id: "fish", image: "/images/animals/fish.webp" },
    { id: "cow", image: "/images/animals/cow.webp" }
  ],
  correctAnswer: "monkey",
  hint: "Con hãy nhìn lên cành cây nhé.",
  reward: {
    stars: 3
  }
}
```
