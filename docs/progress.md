# Gigi — Full Progress Log

## Project overview
Wordle-style boba recipe guessing game. Player guesses Gigi's secret daily drink recipe across 6 levels, each unlocking more ingredients. Built in vanilla HTML/CSS/JS — no build tools, open `index.html` directly.

---

## Session 2026-04-16 — Initial build

### What was built (full game in one pass)

**Data layer**
- `TEAS`, `MILKS`, `SYRUPS`, `TOPPINGS` arrays with unlock levels and metadata (family, milkRule, group)
- `SUGAR_LEVELS`, `ICE_LEVELS` constants
- `LEVELS` config: 6 levels, each with `toppingSlots` (1 / 1 / 1 / 2 / 2 / 3)
- `DRINK_POOL` of eligible recipes, filtered by level at answer generation time

**Scoring — `scoreTastiness(recipe)`**
- 5-axis score (max 100): base family harmony, milk harmony, topping harmony, sweetness, ice
- Daily answers must score ≥ 80 (reseeded until threshold met)

**RNG + daily answer**
- `mulberry32` seeded PRNG; seed = `hashString(dateString + ':' + level)`
- `getDailyAnswer(level)` — deterministic per day+level, never stored in localStorage
- `generateRandomRecipe(rng, level)` — picks toppings without duplicates via splice

**Clue evaluation — `evaluateGuess(guess, answer, guessIndex)`**
- Tea, milk: binary correct/wrong
- Syrup: correct / family (same flavor family, wrong flavor) / wrong
- Sugar, ice: directional (correct / more / less)
- Toppings: correct / group (right pearl/popping/jelly type, wrong specific) / wrong
- First-guess topping order optimized via `optimizeToppingOrder` (tries all permutations, picks best clue score)

**Validation**
- Requires exactly N toppings for the level
- 2-of-3 rule: at least 2 of {tea, milk, syrup} must be non-null
- Soft roasts: passion+milk, grass jelly, roasted+fruit syrup, 100% sugar
- Hard block: only triggered by missing exact N toppings or duplicate toppings

**Phrase library + Gigi voice**
- ~200 phrases across categories: win, syrup_family, topping_group, directional clues, roasts
- No-repeat within a level; reset on level advance
- Roast takes priority over clue phrase

**UI**
- Chip selector rows (tea, milk, syrup, sugar, ice, toppings)
- Live boba cup: CSS layers update in real time as selections change
- Guess history: prepend rows, oldest fade to .old
- Animated tiles on guess rows (tileFlip keyframe)
- End-state overlay: win/fail, share (emoji grid), Next Level button (win only)
- Legend overlay (how to play)

**Persistence**
- `gigi_level` in localStorage (level progression)
- Daily save key `gigi_{date}_L{level}`: guesses + solved flag
- On reload: replays saved guesses into history, restores UI state

---

## Session 2026-04-17 — Bug fixes + UX improvements

See full details in [session-2026-04-17.md](session-2026-04-17.md).

### 1. Topping group-hint overcounting fix
`evaluateGuess` and `optimizeToppingOrder` now track per-group slot counts. Previously, if the answer had 2 pearls + 1 popping boba, and you guessed 2 poppings + 1 pearl, both wrong poppings would show "right family". Now only the first wrong popping consumes the one available group slot; the second correctly shows "wrong".

### 2. Fail state no longer locks players out
Failing a level used to save `failed: true` to localStorage, blocking play for the rest of the day. Now: failed state is never persisted (localStorage entry is cleared on fail). Old stuck saves are migrated on load. "Try Again" button added to the fail overlay for in-session retries.

### 3. Restart game button
↺ button added to the header (left of the level pill). Prompts for confirmation, then resets to Level 1 and clears all today's saves across all levels.

### 4. Click outside to dismiss end overlay
Clicking the dark backdrop around the win/fail overlay now dismisses it (same behavior the legend overlay already had).

### 5. Topping selection UX helpers
- Helper text below the topping chip list: "Pick up to X toppings" / "X of X selected — tap a topping to swap"
- When tapping a new chip at capacity: chip list shakes, all selected chips pulse/glow, hint text flashes accent orange
