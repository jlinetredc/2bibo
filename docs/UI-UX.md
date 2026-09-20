# UI-UX.md

## Primary device

iPad/tablet first.

Then:
- mobile
- desktop

## Visual goal

### Project-wide consistency (user preference, 2026-09-20)

All screens must share one Bibo visual language: home, game hub, profiles,
parent settings, dialogs and every game. The existing screens were migrated
to shared Bibo theme values on 2026-09-20; subsequent UI work must reuse them.

### Shared implementation

`src/game-core/theme/tokens.css`, imported once by `src/app/globals.css`, owns
the rounded system font stack, purple primary/text palette, pastel mint/yellow
surfaces, selected/focus colors, control/panel radii and raised shadows. CSS
modules consume these variables; GameShell owns the common game header.
Home entry links use the shared `bibo-button` and `bibo-button-primary` styles.
Font rendering follows installed system fonts, with no external font requests.

Primary actions use purple with white text, ordinary actions use light surfaces
with dark text, selected controls use lilac plus existing checkmarks/labels,
and hints/rewards use warm yellow. Artwork and board cells keep their semantic
game colors. Disabled board cells retain their full artwork opacity.

- Use a shared palette with consistent roles for page backgrounds, surfaces,
  text, primary/secondary actions, selection and gentle feedback. Favor the
  warm pastel direction; keep readable contrast.
- Use one shared rounded font stack and consistent heading/body/button sizes;
  inherit typography in controls instead of assigning fonts per game.
- Reuse button variants, corner radii, borders, shadows, spacing and focus,
  pressed, selected and disabled states. Primary touch controls remain at
  least 48×48 CSS px, preferably larger for children.
- Keep navigation icons, labels and back/restart placement consistent.
- Game artwork and board colors may vary by theme; surrounding app controls
  should remain recognizable across games.
- Put reusable style values and controls in the shared layer when implementing
  UI changes. Avoid adding another independent screen-specific design system.
- Minimize gameplay scrolling on tablets without hiding controls or disabling
  global scrolling; preserve safe areas, zoom access and reduced motion.

When changing a shared style, review the hub, profiles, Blocks and Jigsaw in
both orientations, including dialogs and narrow screens.

The app should feel like a native children's game hub, not a normal website.

Avoid:
- long navigation bars
- dense dashboards
- footer-heavy layouts
- small text links

## Game Hub

Use:
- large visual cards
- icons/illustrations
- minimal labels
- generous spacing

No broken “coming soon” cards that look tappable.

## GameShell

Shared shell should provide:

- back
- restart
- sound
- optional pause
- safe game area

Keep chrome minimal.

## Touch

Primary child controls:
- generally >= 48×48 px
- preferably larger inside gameplay

Dragging:
- use Pointer Events
- pointer capture
- avoid accidental scroll
- avoid text selection
- handle cancel/release correctly

## Orientation

Core games should work in:
- portrait
- landscape

When practical, preserve current gameplay state on rotation.

## Feedback

Use:
- gentle animation
- positive sound
- snap
- checkmark/star
- character reaction

Avoid:
- screen shake
- flashing
- harsh red overlays
- loud buzzers

## Reduced motion

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

The game must remain fully usable.

## Text

Child-facing instructions:
- short
- concrete
- visual first

Prefer:

```text
Kéo cá về biển.
```

Avoid:

```text
Hãy tiến hành di chuyển đối tượng tương ứng tới vị trí được chỉ định.
```

## Parent area

Parent UI may be more conventional.

Protect entry via reusable Parent Gate.

## Quiet Mode

When enabled:
- music off
- voice off by default
- reduced effects
- manual replay remains possible when useful
