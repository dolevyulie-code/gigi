# Gigi — Wordle-Style Boba Guessing Game

Vanilla HTML/CSS/JS. No frameworks, no build tools. Opens directly as a local file in browser.

> Full progress log: [docs/progress.md](docs/progress.md)
> Latest session log: [docs/session-2026-04-17.md](docs/session-2026-04-17.md)

## Files
| File | Purpose |
|---|---|
| `index.html` | HTML skeleton — header, selector rows, cup visual, overlays |
| `style.css` | All styles, animations, category colors |
| `game.js` | All logic, data, state, UI updates |
| `docs/progress.md` | Full history of all sessions and design decisions |
| `docs/session-2026-04-17.md` | Latest session log |

## Design doc
`C:\Users\Yulie\Downloads\gigi_game_design.md` — authoritative source for ingredients, scoring, clue logic.

## Related project
`C:\Users\Yulie\gigis-boba-shop\` — cup-filling game, different mechanics. Reference for visual language.

---

## Core rules — never break these
- No frameworks or build tools — must open directly as a local HTML file
- MAX_GUESSES = 7
- 2-of-3 rule: at least 2 of {tea, milk, syrup} must be non-null per guess
- Daily answer seeded from `date + level` via mulberry32 RNG — never stored in localStorage
- Tastiness threshold ≥ 80 for daily answers (reseeded until met)
- Topping order optimization on first guess only (best clue permutation across all 3! = 6 orderings)
- One Gigi phrase per guess — roast takes priority over clue comment
- No-repeat phrase rule within a level; reset on level advance
- Failed state is never persisted — players can always retry; progress clears on fail

---

## Key data structures (game.js)
- `TEAS`, `MILKS`, `SYRUPS` — arrays with `id`, `label`, `family`/`milkRule`, `unlocksAt`
- `TOPPINGS` — array with `id`, `label`, `group` (`pearl`/`popping`/`jelly`), `unlocksAt`
- `SUGAR_LEVELS`, `ICE_LEVELS` — ordered arrays used for directional clues
- `LEVELS` — level configs: `toppingSlots` (1/1/1/2/2/3), unlock thresholds
- `state{}` — `level`, `date`, `answer`, `current`, `guesses`, `solved`, `failed`

## Key functions (game.js)
- `getDailyAnswer(level)` — deterministic answer via date+level seed, tastiness ≥ 80
- `evaluateGuess(guess, answer, guessIndex)` — returns clues for all 6 axes; toppings use count-aware group matching
- `optimizeToppingOrder(guessToppings, answerToppings)` — tries all permutations, picks highest clue score; count-aware
- `scoreTastiness(recipe)` — 5-axis harmony score 0–100
- `validateSelection(current, level)` — returns `{ error, roast }` for hard/soft validation
- `choosePhrase(clues, roast)` — selects Gigi's response phrase; roast priority, no-repeat
- `buildUI(level)` / `buildSelectorRow(cat, level)` — constructs chip rows + topping hint
- `refreshChipState(cat)` — syncs chip selected state + topping badge + hint text
- `onChipClick(cat, value)` — handles chip toggles; at-capacity toppings trigger shake+pulse+flash
- `retryLevel()` — resets current level in-session without advancing
- `restartGame()` — resets to level 1, clears all today's saves (with confirm prompt)
- `advanceLevel()` — increments level, rebuilds UI, saves new level
- `saveState()` / `loadState()` — localStorage persistence; failed state is never saved

---

## Clue states
| Axis | States |
|---|---|
| Tea, Milk | `correct` / `wrong` |
| Syrup | `correct` / `family` (same flavor family) / `wrong` |
| Sugar | `correct` / `sweeter` / `less_sweet` |
| Ice | `correct` / `more_ice` / `less_ice` |
| Toppings (per slot) | `correct` / `group` (right pearl/popping/jelly, wrong specific) / `wrong` |

Topping group hints are count-aware: if the answer has 1 popping boba, only 1 wrong popping guess gets `group`; further wrong poppings get `wrong`.

---

## Level progression
| Level | Topping slots | Unlocks |
|---|---|---|
| 1 | 1 | Pearls, basic syrups |
| 2 | 1 | Peach, Thai syrup; Popping Boba |
| 3 | 1 | Jelly toppings |
| 4 | 2 | Rose, Matcha syrup; Boba: Coffee |
| 5 | 2 | Taro syrup; Grass Jelly, Rainbow Jelly |
| 6 | 3 | Passion Fruit syrup; Boba: Peach, Jelly: Strawberry |
