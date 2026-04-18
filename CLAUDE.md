# Gigi — Wordle-Style Boba Guessing Game

Vanilla HTML/CSS/JS. No frameworks, no build tools. Opens directly as a local file in browser.

> Full progress log: [docs/progress.md](docs/progress.md)
> Latest session log: [docs/session-2026-04-17.md](docs/session-2026-04-17.md)

## Files
| File | Purpose |
|---|---|
| `index.html` | HTML skeleton — header with hero Gigi, selector rows, cup visual, 3 end-state popups |
| `style.css` | All styles, animations, Gigi character system, popup designs |
| `game.js` | All logic, data, state, UI updates, Gigi dialogue + animation helpers |
| `img/gigi-idle.png` | Grumpy Gigi — default header state, failure popup |
| `img/gigi-happy.png` | Excited Gigi — level win popup |
| `img/gigi-cool.png` | Sunglasses Gigi — reserved for future hint feature |
| `img/gigi-smug.png` | MLG shades Gigi — game-complete popup |
| `img/gigi-dead.png` | Skeleton Gigi — reserved for future hard game-over state |
| `docs/progress.md` | Full history of all sessions and design decisions |
| `docs/session-2026-04-17.md` | Latest session log (Phase 1: bug fixes; Phase 2: Gigi character integration) |

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
- Do not edit, rewrite, or substitute any line in `GIGI_DIALOGUE` — all popup dialogue is approved verbatim

---

## Gigi character system

### PNG moods (`GIGI_MOODS`)
| Key | File | When used |
|---|---|---|
| `idle` | `img/gigi-idle.png` | Default; failure popup |
| `happy` | `img/gigi-happy.png` | Level win popup |
| `cool` | `img/gigi-cool.png` | Future: hint used |
| `smug` | `img/gigi-smug.png` | Game-complete popup |
| `dead` | `img/gigi-dead.png` | Future: hard game-over |

### Two-div animation isolation (critical pattern)
```html
<div class="gigi-wrapper">   <!-- reaction animations (shake, hop, droop, pop-in) -->
  <div class="gigi-idle-bob"> <!-- continuous bob loop -->
    <img class="gigi-img" />
  </div>
</div>
```
Both layers use CSS `transform`. Separating them prevents the idle bob from resetting when a reaction animation fires. Never collapse these into one element.

### Popup architecture
Three sub-popups live inside `#end-overlay`; only one is shown at a time:
- `#popup-failure` — grumpy Gigi, dark answer card, orange "Try again" button
- `#popup-success` — happy Gigi, green drink card, green "Next level →" button
- `#popup-complete` — smug Gigi (centered, 170px), upward-tail bubble, orange banner, stat grid

### Speech bubble in header
- `#gigi-speech` starts hidden; shown by `showGigiPhrase()`, hidden by `clearGigiPhrase()`
- `gigi-speech-pop` animation fires on every new message (class toggled via JS reflow trick)
- Mobile (≤720px): bubble stacks below Gigi, tail flips upward — scoped to `#gigi-speech .gigi-speech-bubble::before/after` so popup bubbles are unaffected
- `.roast` class on the bubble tints border + both tail pseudo-elements coral

---

## Key data structures (game.js)
- `TEAS`, `MILKS`, `SYRUPS` — arrays with `id`, `label`, `family`/`milkRule`, `unlocksAt`
- `TOPPINGS` — array with `id`, `label`, `group` (`pearl`/`popping`/`jelly`), `unlocksAt`
- `SUGAR_LEVELS`, `ICE_LEVELS` — ordered arrays used for directional clues
- `LEVELS` — level configs: `toppingSlots` (1/1/1/2/2/3), unlock thresholds
- `state{}` — `level`, `date`, `answer`, `current`, `guesses`, `solved`, `failed`
- `GIGI_MOODS` — maps mood key → PNG path
- `GIGI_DIALOGUE` — approved popup dialogue pools: `failure` (8), `levelSuccess` (4), `gameComplete` (4)
- `gigiLastShown` — tracks last-shown index per dialogue category for anti-repeat

---

## Key functions (game.js)
- `getDailyAnswer(level)` — deterministic answer via date+level seed, tastiness ≥ 80
- `evaluateGuess(guess, answer, guessIndex)` — returns clues for all 6 axes; toppings use count-aware group matching
- `optimizeToppingOrder(guessToppings, answerToppings)` — tries all permutations, picks highest clue score; count-aware
- `scoreTastiness(recipe)` — 5-axis harmony score 0–100
- `validateSelection(current, level)` — returns `{ error, roast }` for hard/soft validation
- `choosePhrase(clues, roast)` — selects Gigi's in-game response phrase; roast priority, no-repeat
- `buildUI(level)` / `buildSelectorRow(cat, level)` — constructs chip rows + topping hint
- `refreshChipState(cat)` — syncs chip selected state + topping badge + hint text
- `onChipClick(cat, value)` — handles chip toggles; at-capacity toppings trigger shake+pulse+flash
- `showGigiPhrase(text, isRoast)` — updates `#gigi-speech-text`, shows bubble, triggers pop-in, applies roast tint
- `clearGigiPhrase()` — empties text, hides `#gigi-speech`
- `setGigiMood(mood, selector)` — swaps `src` on all matching `.gigi-img` elements
- `playGigiAnimation(animClass, wrapperSelector)` — force-reflows + re-adds animation class to replay it
- `flashGigiMood(mood, durationMs)` — temporary mood swap, reverts to `idle` after duration
- `pickGigiLine(category)` — random popup dialogue line with anti-repeat
- `accumulateGuesses(count)` / `getTotalGuesses()` — localStorage-backed cross-level guess counter
- `showEndState(won)` — shows failure / level-success / game-complete popup with pop-in → follow-up animation sequence
- `retryLevel()` — resets current level in-session without advancing
- `restartGame()` — resets to level 1, clears all today's saves + total guess counter (with confirm prompt)
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
