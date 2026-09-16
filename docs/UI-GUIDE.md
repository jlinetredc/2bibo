# UI Guide

## Design goal

The interface should be instantly understandable to a preschool child.

The child should not need to read navigation text to use the core experience.

## Layout priorities

Priority order:

1. Tablet portrait
2. Tablet landscape
3. Mobile portrait
4. Desktop

## Touch targets

Primary interactive controls:

```text
minimum 48×48px
```

Prefer larger targets for child gameplay.

Recommended game answers:

```text
64–120px depending on layout
```

## Typography

Use:

- rounded
- highly legible
- large
- short lines

Avoid:

- thin fonts
- condensed fonts
- long paragraphs
- all-uppercase body text

## Child-facing text

Prefer:

```text
Chọn con mèo.
```

Avoid:

```text
Vui lòng lựa chọn hình ảnh tương ứng với động vật được yêu cầu.
```

## Navigation

Child mode should have very few persistent controls.

Suggested:

- Home
- Replay audio
- Pause
- Next

Do not expose complex settings during play.

## Parent navigation

Parent pages may use normal navigation patterns.

## Visual hierarchy

Each activity should have:

1. character/instruction
2. primary task
3. large answer area
4. minimal secondary UI

Avoid visual clutter.

## Color

Use color for joy and categorization.

Do not rely on color alone for:

- correctness
- navigation
- state

Use icons, shapes, labels, or motion as additional indicators.

## Correct state

Use:

- star
- check mark
- happy character
- light celebratory animation

## Retry state

Use neutral/encouraging styling.

Avoid full-screen red error states.

## Motion

Motion should reinforce meaning.

Good:

- object snapping into place
- star appearing
- character nodding
- gentle confetti

Avoid:

- constant bouncing
- distracting loops
- flashing
- excessive screen shake

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

## Audio controls

Any spoken instruction should have:

```text
🔊 replay button
```

Do not require auto-play audio for essential usability.

## Responsive requirements

Test:

```text
320px
375px
768px
1024px
```

No horizontal page scrolling.

## Game board behavior

If an activity cannot fit:

- reflow
- reduce card size
- wrap
- use local controlled scrolling only when absolutely necessary

## Parent gate

The parent section should require a simple gate.

Recommended:

```text
Hold a button for 3 seconds
```

or a simple adult challenge.

Do not use child personal information as a password.

## Accessibility

Use:

- semantic `<button>`
- `aria-label`
- clear focus outline
- alt text for meaningful images
- screen reader labels where practical

Do not:

- implement clickable divs when buttons are appropriate
- use drag as the only interaction if an easy tap alternative exists

## Empty/loading states

Keep child-facing loading states friendly and short.

Example:

```text
Bibo đang chuẩn bị trò chơi...
```

Avoid technical terminology.
