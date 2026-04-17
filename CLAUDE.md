# Gigi — Wordle-Style Boba Guessing Game

Vanilla HTML/CSS/JS. No frameworks, no build tools. Opens directly as a local file in browser.

## Files
- `index.html` — HTML skeleton (~80 lines)
- `style.css` — all styles
- `game.js` — all logic + data

## Design doc
`C:\Users\Yulie\Downloads\gigi_game_design.md` — authoritative source for ingredients, scoring, clue logic.

## Implementation plan
`C:\Users\Yulie\.claude\plans\inherited-snacking-emerson.md`

## Related project
`C:\Users\Yulie\gigis-boba-shop\` — cup-filling game, different mechanics. Reference for visual language.

## Key rules
- MAX_GUESSES = 7
- 2-of-3 rule: at least 2 of {tea, milk, syrup} required
- Tastiness threshold ≥ 80 for daily answers
- Daily answer seeded from date + level, NOT stored in localStorage
- Topping order optimization on first guess only (best clue permutation)
- One Gigi phrase per guess — roast takes priority over clue comment
- No-repeat phrase rule within a level; reset on level advance
