# Number Match core — TASK 099

`src/games/number-match/domain/numberMatch.ts` is a pure, DOM-independent core.
It supports `number-to-objects` and `objects-to-number`, with inclusive ranges
1–5, 1–10 and 1–20. Both standalone and future quest hosts use the same functions.

## Contract

- `createNumberMatch(definition)` validates and copies/freezes an ID, direction,
  numberMax, target and ordered choices. Choice IDs and quantities are unique;
  every quantity is a positive in-range integer and exactly one matches the
  target. At least two choices are required. Invalid content throws before play.
- `getNumberMatchPresentation(state)` returns the prompt and choice faces.
  A number face has a value; an objects face has one logical object per unit.
  IDs are stable within each group, not global artwork IDs. Hosts supply artwork
  and a large, non-overlapping layout; no coordinates or written equations are
  imposed by the core.
- `chooseNumberMatch(state, choiceId)` returns immutable `retry` or `complete`
  state. A wrong choice leaves all choices available; there is no loss, timer,
  score or attempt limit. Unknown/repeated selections and events after completion
  are no-ops. Hosts can detect the transition into completion once by comparing
  previous and next status.
- `resetNumberMatch(state)` clears selection/feedback, retaining content/order.
  Queries/transitions accept states created by this module. JSON-compatible
  definitions can be reconstructed through the validating constructor; this is
  not a durable progress or untrusted state-restoration API.

The host supplies authored choices explicitly; this task adds no random/shared
question generator, age policy, registry card, route, audio or persistence.
TASK 100 adds age presets and shared Difficulty Service integration below. Shared Math
models/generation/evidence remain TASK 132–135. No Bibo World dependency is needed.

Validation covers every target in both directions across all three ranges,
correct and incorrect selections, retries, completed-round event protection,
reset, mutation isolation, malformed data and ambiguous/missing answers.
This domain-only increment has no rendered/touch surface to review; responsive,
portrait/landscape and manual iPad checks apply when a playable host is added.

## Difficulty presets — TASK 100

The central Difficulty Service registers the data-only `number-match` adapter
from `domain/difficultyPresets.ts`. It uses existing profile bands:

| Age band | Inclusive quantity range | Choices per round |
|---|---|---|
| 3–4 | 1–5 | 2 |
| 5–6 | 1–10 | 3 |
| 7+ | 1–20 | 4 |

These are initial product defaults, not measured ability or exact-age claims.
Missing/null profiles use 3–4; invalid age bands are rejected by the shared
service. No new profile fields or stored settings are introduced.

`getNumberMatchDifficulty(profile?)` is the typed entry point to the central
service. Returned configuration is detached: mutating one result does not affect
future rounds. Both matching directions use the same preset.

`createNumberMatchForProfile(definitionWithoutNumberMax, profile?)` resolves the
preset when opening a new round, requires exactly the configured option count,
and passes its range into the existing validating core. The host supplies target,
direction and authored choices. Out-of-range or ambiguous content is rejected;
choices are not silently truncated or generated. For example:

```ts
createNumberMatchForProfile({
  id: "first-round",
  direction: "number-to-objects",
  target: 3,
  choices: [{ id: "two", value: 2 }, { id: "three", value: 3 }],
}, { ageBand: "3-4" });
```

Resolve only at new-round creation; changing profiles does not modify an active
round. Hosts load profiles via shared persistence and can use these same APIs in
standalone or quest contexts. This task has no route, UI, adaptive progression,
manual difficulty override or shared Math generator. Browser/touch/persistence
validation is not applicable to this data/domain integration; unit tests exercise
every quantity in both directions for all bands and the shared-service boundary.
