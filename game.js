'use strict';

/* ═══════════════════════════════════════════════════════════════
   SECTION 1 — DATA: Ingredients
═══════════════════════════════════════════════════════════════ */

const TEAS = [
  { id: 'black',   label: 'Black Tea',            unlocksAt: 1 },
  { id: 'green',   label: 'Green Tea',             unlocksAt: 1 },
  { id: 'oolong',  label: 'Oolong Tea',            unlocksAt: 1 },
  { id: 'jasmine', label: 'Jasmine Tea',           unlocksAt: 3 },
  { id: 'roasted', label: 'Roasted Tea',           unlocksAt: 5 },
];

const MILKS = [
  { id: 'cow', label: 'Cow Milk', unlocksAt: 1 },
  { id: 'oat', label: 'Oat Milk', unlocksAt: 1 },
  { id: 'soy', label: 'Soy Milk', unlocksAt: 4 },
];

const SYRUPS = [
  { id: 'mango',       label: 'Mango',         family: 'fruit',   unlocksAt: 1, milkRule: 'flexible'       },
  { id: 'brown_sugar', label: 'Brown Sugar',   family: 'creamy',  unlocksAt: 1, milkRule: 'needs_milk'     },
  { id: 'strawberry',  label: 'Strawberry',    family: 'fruit',   unlocksAt: 1, milkRule: 'flexible'       },
  { id: 'osmanthus',   label: 'Osmanthus',     family: 'floral',  unlocksAt: 1, milkRule: 'needs_tea_milk' },
  { id: 'lychee',      label: 'Lychee',        family: 'fruit',   unlocksAt: 1, milkRule: 'flexible'       },
  { id: 'peach',       label: 'Peach',         family: 'fruit',   unlocksAt: 2, milkRule: 'flexible'       },
  { id: 'thai',        label: 'Thai',          family: 'creamy',  unlocksAt: 2, milkRule: 'needs_milk'     },
  { id: 'rose',        label: 'Rose',          family: 'floral',  unlocksAt: 4, milkRule: 'flexible'       },
  { id: 'matcha',      label: 'Matcha',        family: 'roasted', unlocksAt: 4, milkRule: 'needs_milk'     },
  { id: 'taro',        label: 'Taro',          family: 'creamy',  unlocksAt: 5, milkRule: 'needs_milk'     },
  { id: 'passion',     label: 'Passion Fruit', family: 'fruit',   unlocksAt: 6, milkRule: 'never_milk'     },
];

const SUGAR_LEVELS = ['0%', '25%', '50%', '75%', '100%'];
const ICE_LEVELS   = ['no_ice', 'less_ice', 'regular', 'extra'];

const TOPPINGS = [
  { id: 'brown_sugar_pearl', label: 'Brown Sugar Pearl',   group: 'pearl',   unlocksAt: 1 },
  { id: 'classic_pearl',     label: 'Classic Pearl',       group: 'pearl',   unlocksAt: 1 },
  { id: 'crystal_boba',      label: 'Crystal Boba',        group: 'pearl',   unlocksAt: 1 },
  { id: 'boba_strawberry',   label: 'Boba: Strawberry',    group: 'popping', unlocksAt: 2 },
  { id: 'boba_mango',        label: 'Boba: Mango',         group: 'popping', unlocksAt: 2 },
  { id: 'boba_passion',      label: 'Boba: Passion Fruit', group: 'popping', unlocksAt: 2 },
  { id: 'boba_lychee',       label: 'Boba: Lychee',        group: 'popping', unlocksAt: 2 },
  { id: 'boba_coffee',       label: 'Boba: Coffee',        group: 'popping', unlocksAt: 4 },
  { id: 'boba_peach',        label: 'Boba: Peach',         group: 'popping', unlocksAt: 6 },
  { id: 'jelly_mango',       label: 'Jelly: Mango',        group: 'jelly',   unlocksAt: 3 },
  { id: 'jelly_passion',     label: 'Jelly: Passion Fruit',group: 'jelly',   unlocksAt: 3 },
  { id: 'jelly_lychee',      label: 'Jelly: Lychee',       group: 'jelly',   unlocksAt: 3 },
  { id: 'jelly_coffee',      label: 'Jelly: Coffee',       group: 'jelly',   unlocksAt: 3 },
  { id: 'jelly_grass',       label: 'Jelly: Grass',        group: 'jelly',   unlocksAt: 5 },
  { id: 'jelly_rainbow',     label: 'Jelly: Rainbow',      group: 'jelly',   unlocksAt: 5 },
  { id: 'jelly_strawberry',  label: 'Jelly: Strawberry',   group: 'jelly',   unlocksAt: 6 },
];

const MAX_GUESSES = 7;

const LEVELS = [
  { level: 1, toppingSlots: 1 },
  { level: 2, toppingSlots: 1 },
  { level: 3, toppingSlots: 1 },
  { level: 4, toppingSlots: 2 },
  { level: 5, toppingSlots: 2 },
  { level: 6, toppingSlots: 3 },
];

function getUnlocked(list, level) {
  return list.filter(x => x.unlocksAt <= level);
}

function getLevelConfig(level) {
  return LEVELS.find(l => l.level === level) || LEVELS[0];
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 2 — SCORING (Tastiness)
═══════════════════════════════════════════════════════════════ */

// Axis 1 — Base family harmony (max 30)
// Key: {family: teaPresent+milkPresent+syrupPresent+syrupFamily}
function scoreAxis1(recipe) {
  const hasTea   = recipe.tea   !== null;
  const hasMilk  = recipe.milk  !== null;
  const hasSyrup = recipe.syrup !== null;

  if (hasTea && hasMilk && !hasSyrup) {
    // Tea + Milk only — no syrup family matters
    // cow milk scores highest (28), others 24
    return recipe.milk === 'cow' ? 28 : 24;
  }

  const syrupObj = hasSyrup ? SYRUPS.find(s => s.id === recipe.syrup) : null;
  const family   = syrupObj ? syrupObj.family : null;

  if (hasTea && !hasMilk && hasSyrup) {
    // Tea + Syrup
    if (family === 'fruit')    return 28;
    if (family === 'floral')   return 25;
    if (family === 'creamy')   return -10;
    if (family === 'roasted')  return 10;
  }

  if (!hasTea && hasMilk && hasSyrup) {
    // Milk + Syrup
    if (family === 'creamy')  return 30;
    if (family === 'fruit')   return 10;
    if (family === 'floral')  return 16;
    if (family === 'roasted') return 8;
  }

  if (hasTea && hasMilk && hasSyrup) {
    // Full combo
    if (family === 'creamy')  return 28;
    if (family === 'fruit')   return 26;
    if (family === 'floral')  return 25;
    if (family === 'roasted') return 24;
  }

  return 0;
}

// Axis 2 — Tea × syrup affinity (max 20)
// Skipped (20 pts) if no tea or no syrup
const TEA_SYRUP_AFFINITY = {
  black:   { fruit: 16, creamy: 18, floral: 12, roasted: 17 },
  green:   { fruit: 19, creamy:  8, floral: 18, roasted: 10 },
  oolong:  { fruit: 14, creamy: 14, floral: 20, roasted: 15 },
  jasmine: { fruit: 18, creamy:  7, floral: 19, roasted:  8 },
  roasted: { fruit: -8, creamy: 20, floral:  9, roasted: 18 },
};

function scoreAxis2(recipe) {
  if (recipe.tea === null || recipe.syrup === null) return 20;
  const syrupObj = SYRUPS.find(s => s.id === recipe.syrup);
  if (!syrupObj) return 20;
  const row = TEA_SYRUP_AFFINITY[recipe.tea];
  return row ? (row[syrupObj.family] ?? 0) : 0;
}

// Axis 3 — Syrup × milk compatibility (max 15)
function scoreAxis3(recipe) {
  if (recipe.syrup === null) return 15; // no syrup, skip
  const syrupObj = SYRUPS.find(s => s.id === recipe.syrup);
  if (!syrupObj) return 15;

  const hasMilk = recipe.milk !== null;
  const hasTea  = recipe.tea  !== null;
  const rule    = syrupObj.milkRule;

  if (rule === 'needs_milk') {
    return hasMilk ? 15 : -12;
  }
  if (rule === 'needs_tea_milk') {
    // osmanthus: +15 with both, -8 no milk, -5 no tea (with milk)
    if (hasMilk && hasTea) return 15;
    if (!hasMilk)          return -8;
    return -5; // has milk but no tea
  }
  if (rule === 'flexible') {
    return 12;
  }
  if (rule === 'never_milk') {
    return hasMilk ? -15 : 15;
  }
  return 0;
}

// Axis 4 — Topping × base match (max 20)
// Base type: hasMilk → 'milk', hasFruitSyrup → 'fruit_tea', else 'specialty'
function getBaseType(recipe) {
  if (recipe.milk !== null) return 'milk';
  if (recipe.syrup !== null) {
    const s = SYRUPS.find(s => s.id === recipe.syrup);
    if (s && s.family === 'fruit') return 'fruit_tea';
  }
  return 'specialty';
}

function getToppingScore(toppingId, baseType) {
  const t = TOPPINGS.find(x => x.id === toppingId);
  if (!t) return 0;

  if (t.id === 'jelly_grass') return -12; // always

  if (t.group === 'pearl') {
    // Brown sugar pearl: milk/specialty=20, full=18, fruit=14
    // Classic pearl:     milk/specialty=19, full=17, fruit=13
    // Crystal boba:      milk/specialty=12, full=13, fruit=14
    const scores = {
      brown_sugar_pearl: { milk: 20, specialty: 20, fruit_tea: 14 },
      classic_pearl:     { milk: 19, specialty: 19, fruit_tea: 13 },
      crystal_boba:      { milk: 12, specialty: 12, fruit_tea: 14 },
    };
    return (scores[t.id] || {})[baseType] ?? 0;
  }

  if (t.group === 'popping') {
    const isFruitBoba = t.id !== 'boba_coffee';
    if (isFruitBoba) {
      return baseType === 'fruit_tea' ? 18 : (baseType === 'milk' ? 6 : 14);
    } else {
      // coffee boba
      return baseType === 'fruit_tea' ? 7 : 14;
    }
  }

  if (t.group === 'jelly') {
    const isFruitJelly  = ['jelly_mango','jelly_passion','jelly_lychee','jelly_strawberry','jelly_rainbow'].includes(t.id);
    const isCoffeeJelly = t.id === 'jelly_coffee';
    if (isFruitJelly) {
      return baseType === 'fruit_tea' ? 16 : (baseType === 'milk' ? 9 : 13);
    }
    if (isCoffeeJelly) {
      return baseType === 'fruit_tea' ? 5 : 13;
    }
  }

  return 0;
}

function scoreAxis4(recipe) {
  if (!recipe.toppings || recipe.toppings.length === 0) return 0;
  const baseType = getBaseType(recipe);

  // Group duplicate penalty: two+ from same non-pearl group → -5
  const groupCounts = {};
  for (const tid of recipe.toppings) {
    const t = TOPPINGS.find(x => x.id === tid);
    if (!t) continue;
    if (t.group !== 'pearl') {
      groupCounts[t.group] = (groupCounts[t.group] || 0) + 1;
    }
  }
  const groupPenalty = Object.values(groupCounts).filter(c => c >= 2).length * 5;

  const avg = recipe.toppings.reduce((sum, tid) => sum + getToppingScore(tid, baseType), 0)
              / recipe.toppings.length;

  return Math.min(20, avg) - groupPenalty;
}

// Axis 5 — Sugar × ice balance (max 10, min -10)
function scoreAxis5(recipe) {
  let score = 10;

  if (recipe.sugar === '0%')   score -= 5;
  if (recipe.sugar === '75%')  score -= 3;
  if (recipe.sugar === '100%') score -= 14;

  if (recipe.ice === 'no_ice')   score += 2;
  if (recipe.ice === 'less_ice') score += 2;
  if (recipe.ice === 'regular')  score -= 2;
  if (recipe.ice === 'extra')    score -= 4;

  if (recipe.sugar === '100%' && recipe.ice === 'extra') score -= 3;
  if (recipe.sugar === '0%'   && recipe.ice === 'extra') score -= 3;

  return Math.max(-10, Math.min(10, score));
}

function scoreTastiness(recipe) {
  return scoreAxis1(recipe)
       + scoreAxis2(recipe)
       + scoreAxis3(recipe)
       + scoreAxis4(recipe)
       + scoreAxis5(recipe);
}

function isValid2of3(recipe) {
  const count = (recipe.tea !== null ? 1 : 0)
              + (recipe.milk !== null ? 1 : 0)
              + (recipe.syrup !== null ? 1 : 0);
  return count >= 2;
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 3 — RNG + Daily Answer
═══════════════════════════════════════════════════════════════ */

function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function hashString(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (h * 33) ^ s.charCodeAt(i);
  }
  return h >>> 0;
}

function getTodayDateString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function pickRandom(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

function generateRandomRecipe(rng, level) {
  const cfg     = getLevelConfig(level);
  const teas    = [null, ...getUnlocked(TEAS, level).map(t => t.id)];
  const milks   = [null, ...getUnlocked(MILKS, level).map(m => m.id)];
  const syrups  = [null, ...getUnlocked(SYRUPS, level).map(s => s.id)];
  const tpool   = getUnlocked(TOPPINGS, level);

  // Pick tea, milk, syrup ensuring 2-of-3
  let tea, milk, syrup;
  do {
    tea   = pickRandom(teas, rng);
    milk  = pickRandom(milks, rng);
    syrup = pickRandom(syrups, rng);
  } while (!isValid2of3({ tea, milk, syrup }));

  const sugar   = pickRandom(SUGAR_LEVELS, rng);
  const ice     = pickRandom(ICE_LEVELS, rng);

  // Pick toppings (no duplicates)
  const slots = cfg.toppingSlots;
  const toppings = [];
  const available = [...tpool];
  for (let i = 0; i < slots && available.length > 0; i++) {
    const idx = Math.floor(rng() * available.length);
    toppings.push(available[idx].id);
    available.splice(idx, 1);
  }

  return { tea, milk, syrup, sugar, ice, toppings };
}

function getDailyAnswer(level) {
  const dateStr = getTodayDateString();
  const baseSeed = hashString(dateStr + ':' + level);
  let attempt = 0;
  while (true) {
    const rng = mulberry32(baseSeed + attempt);
    const candidate = generateRandomRecipe(rng, level);
    if (scoreTastiness(candidate) >= 80) return candidate;
    attempt++;
    if (attempt > 10000) {
      // fallback: return best found (shouldn't happen)
      return candidate;
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 4 — Clue Evaluation
═══════════════════════════════════════════════════════════════ */

function evaluateGuess(guess, answer, guessIndex) {
  // Topping order optimization on first guess
  let toppings = guess.toppings.slice();
  if (guessIndex === 0 && toppings.length > 1) {
    toppings = optimizeToppingOrder(toppings, answer.toppings);
    guess = Object.assign({}, guess, { toppings });
  }

  const tea  = guess.tea  === answer.tea  ? 'correct' : 'wrong';
  const milk = guess.milk === answer.milk ? 'correct' : 'wrong';

  // Syrup: correct / family / wrong
  let syrup;
  if (guess.syrup === answer.syrup) {
    syrup = 'correct';
  } else if (guess.syrup !== null && answer.syrup !== null) {
    const gSyrup = SYRUPS.find(s => s.id === guess.syrup);
    const aSyrup = SYRUPS.find(s => s.id === answer.syrup);
    syrup = (gSyrup && aSyrup && gSyrup.family === aSyrup.family) ? 'family' : 'wrong';
  } else {
    syrup = 'wrong';
  }

  // Sugar directional
  const gi = SUGAR_LEVELS.indexOf(guess.sugar);
  const ai = SUGAR_LEVELS.indexOf(answer.sugar);
  let sugar;
  if (gi === ai) sugar = 'correct';
  else if (gi < ai) sugar = 'sweeter';
  else sugar = 'less_sweet';

  // Ice directional
  const gii = ICE_LEVELS.indexOf(guess.ice);
  const aii = ICE_LEVELS.indexOf(answer.ice);
  let ice;
  if (gii === aii) ice = 'correct';
  else if (gii < aii) ice = 'more_ice';
  else ice = 'less_ice';

  // Toppings (use reordered list)
  const toppingClues = toppings.map(tid => {
    if (answer.toppings.includes(tid)) return { id: tid, state: 'correct' };
    const gT = TOPPINGS.find(x => x.id === tid);
    if (gT) {
      const hasGroupInAnswer = answer.toppings.some(aid => {
        const aT = TOPPINGS.find(x => x.id === aid);
        return aT && aT.group === gT.group;
      });
      if (hasGroupInAnswer) return { id: tid, state: 'group' };
    }
    return { id: tid, state: 'wrong' };
  });

  return { tea, milk, syrup, sugar, ice, toppings: toppingClues, reorderedGuess: guess };
}

function toppingClueScore(state) {
  if (state === 'correct') return 3;
  if (state === 'group')   return 1;
  return 0;
}

function optimizeToppingOrder(guessToppings, answerToppings) {
  // Try all permutations (max 3! = 6), pick highest clue score
  const perms = permutations(guessToppings);
  let best = guessToppings;
  let bestScore = -1;

  for (const perm of perms) {
    const score = perm.reduce((sum, tid) => {
      if (answerToppings.includes(tid)) return sum + 3;
      const gT = TOPPINGS.find(x => x.id === tid);
      if (gT) {
        const inGroup = answerToppings.some(aid => {
          const aT = TOPPINGS.find(x => x.id === aid);
          return aT && aT.group === gT.group;
        });
        if (inGroup) return sum + 1;
      }
      return sum;
    }, 0);
    if (score > bestScore) {
      bestScore = score;
      best = perm;
    }
  }
  return best;
}

function permutations(arr) {
  if (arr.length <= 1) return [arr];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = arr.slice(0, i).concat(arr.slice(i + 1));
    for (const p of permutations(rest)) {
      result.push([arr[i], ...p]);
    }
  }
  return result;
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 5 — Validation
═══════════════════════════════════════════════════════════════ */

function validateSelection(current, levelNum) {
  const cfg = getLevelConfig(levelNum);

  // Hard blocks
  if (!isValid2of3(current)) {
    const count = (current.tea !== null ? 1 : 0)
                + (current.milk !== null ? 1 : 0)
                + (current.syrup !== null ? 1 : 0);
    if (count === 0) return { error: 'Choose at least 2 of Tea, Milk, and Syrup.', roast: null };
    return { error: 'Choose at least 2 of Tea, Milk, and Syrup.', roast: null };
  }
  if (current.toppings.length !== cfg.toppingSlots) {
    return {
      error: `Choose exactly ${cfg.toppingSlots} topping${cfg.toppingSlots > 1 ? 's' : ''}.`,
      roast: null,
    };
  }
  const uniqueToppings = new Set(current.toppings);
  if (uniqueToppings.size !== current.toppings.length) {
    return { error: 'No duplicate toppings.', roast: null };
  }

  // Soft roasts — error is null but roast key is set
  const hasGrassJelly = current.toppings.includes('jelly_grass');
  const hasPassionSyrup = current.syrup === 'passion';
  const hasMilk = current.milk !== null;
  const hasFruitSyrup = current.syrup !== null && SYRUPS.find(s => s.id === current.syrup)?.family === 'fruit';
  const isRoastedTea = current.tea === 'roasted';

  if (hasPassionSyrup && hasMilk) {
    return { error: null, roast: 'roast_passion_milk' };
  }
  if (hasGrassJelly) {
    return { error: null, roast: 'roast_grass_jelly' };
  }
  if (isRoastedTea && hasFruitSyrup) {
    return { error: null, roast: 'roast_roasted_fruit' };
  }
  if (current.sugar === '100%') {
    return { error: null, roast: 'roast_100_sugar' };
  }

  return { error: null, roast: null };
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 6 — Phrase Library
═══════════════════════════════════════════════════════════════ */

const PHRASES = {
  tea_right: [
    "The tea is right. Don't mess up the rest.",
    "Finally. That's the tea I wanted.",
    "Tea: correct. I'm cautiously optimistic.",
    "Oh, you got the tea right. There's hope for you yet.",
    "The tea is correct. Now let's see about everything else.",
    "Tea: yes. That's one thing you didn't ruin.",
    "Good tea choice. I'm writing this down as a miracle.",
    "That's my tea. Don't celebrate yet.",
  ],
  tea_wrong: [
    "Wrong tea. I can taste the difference, you know.",
    "That's not my tea. That's someone else's tea.",
    "Did you just guess? Because this is not it.",
    "Wrong tea. Have we met?",
    "I have a regular order. This tea is not part of it.",
    "No. Different tea. We've been through this.",
  ],
  milk_right: [
    "Milk is right. Don't look so surprised.",
    "The milk is correct. One down, several to go.",
    "Yes, that's the milk. Try to build on this.",
    "Correct milk. I wasn't expecting that.",
    "That's my milk. Now don't ruin the rest.",
    "Milk: right. We're making progress. Slowly.",
  ],
  milk_wrong: [
    "I can tell the difference between milks. This is not the right one.",
    "The milk situation needs fixing.",
    "Wrong milk. Or maybe no milk. I'll let you figure out which.",
    "That's not my milk. That's a stranger's milk.",
    "I don't know who ordered that milk but it wasn't me.",
    "The milk is wrong. Again.",
  ],
  syrup_correct: [
    "The syrup is right. Finally something right.",
    "Perfect syrup. I'm impressed. Don't get used to it.",
    "That's the syrup. You actually listened for once.",
    "Correct syrup. I'm choosing not to make a big deal about how long it took.",
    "Yes. That flavor. Specifically that one. Thank you.",
    "The syrup is right. Mark this moment.",
  ],
  syrup_family: [
    "Right flavor family. Wrong flavor. Still wrong.",
    "You're in the neighborhood but nowhere near my door.",
    "Same family. Different syrup. Not close enough.",
    "That's the right type of syrup. Not the right syrup. There is a difference.",
    "Getting warmer. Not warm. Warmer.",
    "Right family, wrong member. Try harder.",
    "You're on the right shelf. Wrong bottle.",
    "Same category. Not the same flavor. Not even close to the same flavor.",
  ],
  syrup_wrong: [
    "That syrup is not even close to what I want.",
    "Wrong flavor entirely. Very wrong.",
    "That syrup and my order have nothing in common.",
    "I don't know what made you think that was the right flavor but you were mistaken.",
    "That syrup has never been anywhere near my order.",
    "Not that. Not even the category of that.",
  ],
  sugar_correct: [
    "Finally. The right sweetness.",
    "That is exactly how sweet I like it. Don't change it.",
    "Sugar level: correct. I almost can't believe it.",
    "Yes. That sweetness. Specifically that sweetness.",
    "The sugar is right. Now I'm worried about everything else.",
    "Perfect sweetness. First time for everything.",
  ],
  sugar_sweeter: [
    "Sweeter. I know what I like.",
    "This is too light on sugar for what I ordered.",
    "I don't come here for unsweetened tea. More sugar.",
    "Add more sugar. I wasn't being vague when I ordered.",
    "That's not sweet enough. Try again.",
    "Sweeter. Not dramatically. Just more than this.",
  ],
  sugar_less_sweet: [
    "I wanted less sugar than this. Listen next time.",
    "Less sugar. I don't want to go into a coma.",
    "That's too sweet. By a lot.",
    "I can feel this sugar from here. Dial it back.",
    "Way too sweet. I don't know who told you that was acceptable.",
  ],
  ice_correct: [
    "Perfect amount of ice. Rare, but it happened.",
    "That's exactly how I like my ice. Don't change a thing.",
    "Ice level: correct. I'm almost impressed.",
    "Yes. That ice. Exactly that ice.",
    "The ice is right. One less thing to complain about.",
    "Correct ice level. I'll be noting this as a success.",
  ],
  ice_more_ice: [
    "Warmer than I wanted. More ice.",
    "More ice. I'm not asking twice.",
    "This isn't cold enough for me. More ice please. And I use please loosely.",
    "More ice. I want to feel it.",
    "I ordered more ice than this. It's not a complicated request.",
    "This needs more ice. A lot more.",
  ],
  ice_less_ice: [
    "Too much ice. I'm paying for a drink, not ice cubes.",
    "I didn't ask for a glass of ice with a hint of tea.",
    "Ease up on the ice. A lot.",
    "Less ice. I want to taste the drink somewhere in there.",
    "That's mostly ice. I ordered a drink.",
    "Is the ice machine broken or do you just enjoy punishing me? Less ice.",
  ],
  topping_correct: [
    "Right topping. Don't mess it up next time.",
    "Yes. That topping. Exactly that topping.",
    "Correct topping. Finally something I didn't have to repeat.",
    "That's the topping I wanted. I'm cautiously pleased.",
    "Right topping. You're on a roll. Don't get cocky.",
    "That topping is correct. I'm noting this.",
  ],
  topping_group: [
    "You've got the topping type right. Not the flavor.",
    "Same group. Wrong one. There are multiple in that category for a reason.",
    "Right type of topping. Wrong topping. These are different things.",
    "You're in the right aisle. Wrong product.",
    "That's the right category. Pick a different one from it.",
  ],
  topping_wrong: [
    "No. Not that topping. Not even the right type.",
    "Wrong topping entirely.",
    "I didn't ask for that and I never would.",
    "That topping has no business being in my drink.",
    "Wrong. Wrong group. Wrong flavor. Just wrong.",
    "Not that. Not anything near that.",
  ],
  roast_passion_milk: [
    "Passion fruit and milk. Did you want me to send this back or are you doing it on purpose?",
    "Passion fruit is a no-milk situation. Please write that down somewhere.",
    "I've been coming here for years and nobody has ever put milk in my passion fruit. Don't start now.",
    "Passion fruit with milk is not a drink. It's an accident.",
  ],
  roast_grass_jelly: [
    "Grass jelly. You put grass jelly in here. Bold choice. Wrong choice.",
    "Grass jelly has exactly one texture — wrong — and you put it in my drink.",
    "Take the grass jelly out. And apologize.",
    "Grass jelly slips through the straw like something that doesn't want to be eaten. It shouldn't.",
    "The audacity of the grass jelly in this drink. Remove it.",
  ],
  roast_roasted_fruit: [
    "My roasted tea doesn't want fruit in it. Neither do I.",
    "Smoky and fruity together. Who approved this?",
    "I can taste the identity crisis in this drink. No fruit with my hojicha.",
  ],
  roast_100_sugar: [
    "100% sugar. I need you to think about what you've done.",
    "100% sugar. I can't taste anything else. That's the problem.",
    "I ordered boba, not a sugar delivery system.",
    "That's not a sweetness level. That's a threat.",
    "Less sugar. Much less. Start over if you have to.",
  ],
  generic_close: [
    "This combination has no business existing.",
    "I've never seen this combination on a menu. There's a reason for that.",
    "I'm going to pretend this didn't happen and you're going to try again.",
    "Interesting creative choice. Wrong, but interesting.",
    "Nobody ordered this. Not me, not anyone.",
    "I can't tell if you're experimenting or just guessing. Either way, no.",
    "What is this. No really. What is this.",
  ],
  generic_wrong: [
    "This combination has no business existing.",
    "I've never seen this combination on a menu. There's a reason for that.",
    "I'm going to pretend this didn't happen and you're going to try again.",
    "Interesting creative choice. Wrong, but interesting.",
    "Nobody ordered this. Not me, not anyone.",
    "I can't tell if you're experimenting or just guessing. Either way, no.",
    "What is this. No really. What is this.",
  ],
  win: [
    "…Fine. That's correct. You got it.",
    "That's my drink. Finally.",
    "Correct. I'll be back tomorrow.",
    "Yes. All of it. Exactly right. I'm choosing not to celebrate.",
    "You figured it out. It only took you this many guesses.",
    "That's the one. Don't make me repeat it.",
  ],
};

/* ═══════════════════════════════════════════════════════════════
   SECTION 7 — State
═══════════════════════════════════════════════════════════════ */

const state = {
  level:         1,
  date:          '',
  answer:        null,
  guesses:       [],   // [{recipe, clues}]
  solved:        false,
  failed:        false,
  usedPhrases:   {},   // { poolKey: Set<index> }
  current: {
    tea:      null,
    milk:     null,
    syrup:    null,
    sugar:    '50%',
    ice:      'regular',
    toppings: [],
  },
  validationError: null,
  pendingRoast:    null,
};

function resetPhrases() {
  state.usedPhrases = {};
}

function getPhrase(poolKey) {
  const pool = PHRASES[poolKey];
  if (!pool || pool.length === 0) return '';

  if (!state.usedPhrases[poolKey]) {
    state.usedPhrases[poolKey] = new Set();
  }
  const used = state.usedPhrases[poolKey];

  // Reset if pool exhausted
  if (used.size >= pool.length) {
    used.clear();
  }

  let idx;
  do {
    idx = Math.floor(Math.random() * pool.length);
  } while (used.has(idx));

  used.add(idx);
  return pool[idx];
}

function choosePhrase(clues, roastKey) {
  // Roast takes priority
  if (roastKey) return getPhrase(roastKey);

  // Priority scan of clues
  if (clues.syrup === 'family')     return getPhrase('syrup_family');
  if (clues.tea === 'wrong')        return getPhrase('tea_wrong');
  if (clues.milk === 'wrong')       return getPhrase('milk_wrong');
  if (clues.syrup === 'wrong')      return getPhrase('syrup_wrong');
  if (clues.sugar === 'sweeter')    return getPhrase('sugar_sweeter');
  if (clues.sugar === 'less_sweet') return getPhrase('sugar_less_sweet');
  if (clues.ice === 'more_ice')     return getPhrase('ice_more_ice');
  if (clues.ice === 'less_ice')     return getPhrase('ice_less_ice');

  const toppingGroup  = clues.toppings.find(t => t.state === 'group');
  const toppingWrong  = clues.toppings.find(t => t.state === 'wrong');
  if (toppingGroup)   return getPhrase('topping_group');
  if (toppingWrong)   return getPhrase('topping_wrong');

  // All correct (shouldn't reach here after win already handled, but just in case)
  const correctCount = [
    clues.tea === 'correct',
    clues.milk === 'correct',
    clues.syrup === 'correct',
    clues.sugar === 'correct',
    clues.ice === 'correct',
    ...clues.toppings.map(t => t.state === 'correct'),
  ].filter(Boolean).length;

  const total = 5 + clues.toppings.length;
  return correctCount >= total * 0.6 ? getPhrase('generic_close') : getPhrase('generic_wrong');
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 8 — Persistence
═══════════════════════════════════════════════════════════════ */

function getSaveKey(date, level) {
  return `gigi_${date}_L${level}`;
}

function saveState() {
  const key = getSaveKey(state.date, state.level);
  const data = {
    guesses: state.guesses,
    solved:  state.solved,
    failed:  state.failed,
  };
  localStorage.setItem(key, JSON.stringify(data));
  localStorage.setItem('gigi_level', String(state.level));
}

function loadState() {
  const storedLevel = localStorage.getItem('gigi_level');
  if (storedLevel) state.level = parseInt(storedLevel, 10) || 1;
  if (state.level < 1 || state.level > 6) state.level = 1;

  state.date   = getTodayDateString();
  state.answer = getDailyAnswer(state.level);

  const key  = getSaveKey(state.date, state.level);
  const raw  = localStorage.getItem(key);
  if (raw) {
    const saved = JSON.parse(raw);
    state.guesses = saved.guesses || [];
    state.solved  = saved.solved  || false;
    state.failed  = saved.failed  || false;
  } else {
    state.guesses = [];
    state.solved  = false;
    state.failed  = false;
  }

  resetPhrases();

  // Pre-populate current from last guess if any
  if (state.guesses.length > 0) {
    const last = state.guesses[state.guesses.length - 1].recipe;
    state.current = {
      tea:      last.tea,
      milk:     last.milk,
      syrup:    last.syrup,
      sugar:    last.sugar,
      ice:      last.ice,
      toppings: last.toppings.slice(),
    };
  } else {
    state.current = {
      tea: null, milk: null, syrup: null,
      sugar: '50%', ice: 'regular', toppings: [],
    };
  }
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 9 — Colors for cup visual
═══════════════════════════════════════════════════════════════ */

const TEA_COLORS = {
  black:   '#8B6E52',
  green:   '#7DAF5E',
  oolong:  '#B08060',
  jasmine: '#C8B880',
  roasted: '#7A5030',
};

const SYRUP_COLORS = {
  mango:       '#FFB830',
  brown_sugar: '#9B5E30',
  strawberry:  '#E84060',
  osmanthus:   '#F0C060',
  lychee:      '#F8C0C8',
  peach:       '#F0A070',
  thai:        '#E88030',
  rose:        '#E87090',
  matcha:      '#70A850',
  taro:        '#9870B8',
  passion:     '#E0608A',
};

const TOPPING_COLORS = {
  brown_sugar_pearl: '#7A4A28',
  classic_pearl:     '#5C3A28',
  crystal_boba:      '#C8E8E8',
  boba_strawberry:   '#E85070',
  boba_mango:        '#FFB030',
  boba_passion:      '#E86090',
  boba_lychee:       '#F8B0C0',
  boba_coffee:       '#6A4028',
  boba_peach:        '#F09060',
  jelly_mango:       '#F8C838',
  jelly_passion:     '#E070A0',
  jelly_lychee:      '#F8C0D0',
  jelly_coffee:      '#604030',
  jelly_grass:       '#70A848',
  jelly_rainbow:     '#A070D0',
  jelly_strawberry:  '#E84060',
};

/* ═══════════════════════════════════════════════════════════════
   SECTION 10 — UI: Cup Visual
═══════════════════════════════════════════════════════════════ */

function updateCupVisual(current) {
  const cup         = document.getElementById('cup');
  const teaEl       = document.getElementById('cup-tea');
  const milkEl      = document.getElementById('cup-milk');
  const syrupEl     = document.getElementById('cup-syrup-tint');
  const iceEl       = document.getElementById('cup-ice');
  const toppingsEl  = document.getElementById('cup-toppings');
  const sugarLabel  = document.getElementById('cup-sugar-label');

  const cupH = 120; // matches CSS height

  // Ice layer (top of cup, absolute top)
  const iceHeights = { no_ice: 0, less_ice: 10, regular: 18, extra: 26 };
  const iceH = iceHeights[current.ice] || 0;
  iceEl.style.height = iceH + 'px';

  // Topping dots (bottom 18px)
  toppingsEl.innerHTML = '';
  for (const tid of current.toppings) {
    const dot = document.createElement('div');
    dot.className = 'topping-dot';
    dot.style.background = TOPPING_COLORS[tid] || '#888';
    toppingsEl.appendChild(dot);
  }

  // Tea + milk layers
  const hasTea  = current.tea  !== null;
  const hasMilk = current.milk !== null;

  if (hasTea && hasMilk) {
    // Both: milk 30% from bottom (above toppings), tea 30% just above milk
    milkEl.style.bottom = '18px';
    milkEl.style.height = '36px';
    teaEl.style.bottom  = '54px'; // 18 + 36
    teaEl.style.height  = '36px';
    teaEl.style.background = TEA_COLORS[current.tea] || '#C89B7B';
  } else if (hasTea) {
    milkEl.style.height = '0';
    teaEl.style.bottom  = '18px';
    teaEl.style.height  = '54px';
    teaEl.style.background = TEA_COLORS[current.tea] || '#C89B7B';
  } else if (hasMilk) {
    teaEl.style.height  = '0';
    milkEl.style.bottom = '18px';
    milkEl.style.height = '54px';
  } else {
    teaEl.style.height  = '0';
    milkEl.style.height = '0';
  }

  // Syrup tint overlay
  if (current.syrup) {
    syrupEl.style.opacity    = '0.22';
    syrupEl.style.background = SYRUP_COLORS[current.syrup] || '#F0C0A0';
  } else {
    syrupEl.style.opacity = '0';
  }

  // Sugar label
  sugarLabel.textContent = current.sugar || '';
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 11 — UI: Selector Rows
═══════════════════════════════════════════════════════════════ */

const CAT_DOT_COLORS = {
  tea:      'var(--cat-tea)',
  milk:     'var(--cat-milk)',
  syrup:    'var(--cat-syrup)',
  sugar:    'var(--cat-sugar)',
  ice:      'var(--cat-ice)',
  toppings: 'var(--cat-topping)',
};

const ICE_LABELS = {
  no_ice:    'No ice',
  less_ice:  'Less ice',
  regular:   'Regular',
  extra:     'Extra ice',
};

function buildSelectorRow(cat, level) {
  const row   = document.getElementById(`selector-${cat}`);
  const cfg   = getLevelConfig(level);

  // Label
  const labelEl = document.createElement('div');
  labelEl.className = 'selector-row-label';

  const dot = document.createElement('span');
  dot.className = 'cat-dot';
  dot.style.background = CAT_DOT_COLORS[cat];
  labelEl.appendChild(dot);

  let labelText;
  if (cat === 'toppings') {
    labelText = document.createTextNode(`Toppings `);
    labelEl.appendChild(labelText);
    const badge = document.createElement('span');
    badge.className = 'topping-badge';
    badge.id = 'topping-badge';
    badge.textContent = `(0/${cfg.toppingSlots})`;
    labelEl.appendChild(badge);
  } else {
    labelText = document.createTextNode(cat.charAt(0).toUpperCase() + cat.slice(1));
    labelEl.appendChild(labelText);
  }

  row.appendChild(labelEl);

  // Chip list
  const list = document.createElement('div');
  list.className = 'chip-list';
  list.id = `chips-${cat}`;
  row.appendChild(list);

  buildChips(cat, level);
}

function buildChips(cat, level) {
  const list = document.getElementById(`chips-${cat}`);
  list.innerHTML = '';
  const cfg = getLevelConfig(level);

  if (cat === 'tea') {
    addNoneChip(list, 'tea');
    for (const t of getUnlocked(TEAS, level)) {
      addChip(list, 'tea', t.id, t.label);
    }
  } else if (cat === 'milk') {
    addNoneChip(list, 'milk');
    for (const m of getUnlocked(MILKS, level)) {
      addChip(list, 'milk', m.id, m.label);
    }
  } else if (cat === 'syrup') {
    addNoneChip(list, 'syrup');
    for (const s of getUnlocked(SYRUPS, level)) {
      addChip(list, 'syrup', s.id, s.label);
    }
  } else if (cat === 'sugar') {
    for (const s of SUGAR_LEVELS) {
      addChip(list, 'sugar', s, s);
    }
  } else if (cat === 'ice') {
    for (const i of ICE_LEVELS) {
      addChip(list, 'ice', i, ICE_LABELS[i]);
    }
  } else if (cat === 'toppings') {
    for (const t of getUnlocked(TOPPINGS, level)) {
      addChip(list, 'toppings', t.id, t.label);
    }
  }

  refreshChipState(cat);
}

function addNoneChip(list, cat) {
  const chip = document.createElement('button');
  chip.className = 'chip none-chip';
  chip.dataset.cat   = cat;
  chip.dataset.value = '__none__';
  chip.textContent = 'None';
  list.appendChild(chip);
}

function addChip(list, cat, value, label) {
  const chip = document.createElement('button');
  chip.className = 'chip';
  chip.dataset.cat   = cat;
  chip.dataset.value = value;
  chip.textContent = label;
  list.appendChild(chip);
}

function refreshChipState(cat) {
  const list = document.getElementById(`chips-${cat}`);
  if (!list) return;
  const chips = list.querySelectorAll('.chip');

  chips.forEach(chip => {
    const val = chip.dataset.value;
    let selected = false;

    if (cat === 'tea') {
      selected = val === '__none__' ? state.current.tea === null : state.current.tea === val;
    } else if (cat === 'milk') {
      selected = val === '__none__' ? state.current.milk === null : state.current.milk === val;
    } else if (cat === 'syrup') {
      selected = val === '__none__' ? state.current.syrup === null : state.current.syrup === val;
    } else if (cat === 'sugar') {
      selected = state.current.sugar === val;
    } else if (cat === 'ice') {
      selected = state.current.ice === val;
    } else if (cat === 'toppings') {
      selected = state.current.toppings.includes(val);
    }

    chip.classList.toggle('selected', selected);
  });

  // Update topping badge
  if (cat === 'toppings') {
    const badge = document.getElementById('topping-badge');
    const cfg   = getLevelConfig(state.level);
    if (badge) badge.textContent = `(${state.current.toppings.length}/${cfg.toppingSlots})`;
  }
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 12 — UI: Chip click handler + validation
═══════════════════════════════════════════════════════════════ */

function onChipClick(cat, value) {
  const cfg = getLevelConfig(state.level);

  if (cat === 'tea') {
    state.current.tea = value === '__none__' ? null : value;
  } else if (cat === 'milk') {
    state.current.milk = value === '__none__' ? null : value;
  } else if (cat === 'syrup') {
    state.current.syrup = value === '__none__' ? null : value;
  } else if (cat === 'sugar') {
    state.current.sugar = value;
  } else if (cat === 'ice') {
    state.current.ice = value;
  } else if (cat === 'toppings') {
    const idx = state.current.toppings.indexOf(value);
    if (idx >= 0) {
      // Deselect
      state.current.toppings.splice(idx, 1);
    } else {
      if (state.current.toppings.length >= cfg.toppingSlots) {
        // At capacity — shake the chip
        const chip = document.querySelector(`#chips-toppings .chip[data-value="${value}"]`);
        if (chip) {
          chip.classList.remove('shake');
          void chip.offsetWidth; // reflow to restart animation
          chip.classList.add('shake');
          chip.addEventListener('animationend', () => chip.classList.remove('shake'), { once: true });
        }
        return;
      }
      state.current.toppings.push(value);
    }
  }

  refreshChipState(cat);
  onSelectionChange();
}

function onSelectionChange() {
  updateCupVisual(state.current);

  const { error } = validateSelection(state.current, state.level);
  const errEl = document.getElementById('validation-error');
  if (error) {
    errEl.textContent = error;
    errEl.classList.remove('hidden');
    document.getElementById('submit-btn').disabled = true;
  } else {
    errEl.textContent = '';
    errEl.classList.add('hidden');
    document.getElementById('submit-btn').disabled = false;
  }
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 13 — UI: Guess history row
═══════════════════════════════════════════════════════════════ */

function ingredientLabel(recipe) {
  const parts = [];

  const teaObj   = recipe.tea   ? TEAS.find(t => t.id === recipe.tea)     : null;
  const milkObj  = recipe.milk  ? MILKS.find(m => m.id === recipe.milk)   : null;
  const syrupObj = recipe.syrup ? SYRUPS.find(s => s.id === recipe.syrup) : null;

  if (teaObj)  parts.push(teaObj.label);
  else         parts.push('no tea');
  if (milkObj) parts.push(milkObj.label);
  else         parts.push('no milk');
  if (syrupObj) parts.push(syrupObj.label);
  else          parts.push('no syrup');

  parts.push(recipe.sugar);

  const iceMap = { no_ice: 'no ice', less_ice: 'less ice', regular: 'regular ice', extra: 'extra ice' };
  parts.push(iceMap[recipe.ice] || recipe.ice);

  const toppingLabels = recipe.toppings.map(tid => {
    const t = TOPPINGS.find(x => x.id === tid);
    return t ? t.label : tid;
  });
  parts.push(...toppingLabels);

  return parts.join(' · ');
}

function tileClass(state_) {
  const map = {
    correct:    'tile-correct',
    family:     'tile-family',
    wrong:      'tile-wrong',
    group:      'tile-family',
    sweeter:    'tile-more',
    more_ice:   'tile-more',
    less_sweet: 'tile-less',
    less_ice:   'tile-less',
  };
  return map[state_] || 'tile-wrong';
}

function tileSymbol(state_) {
  const map = {
    correct:    '✓',
    family:     '~',
    wrong:      '✗',
    group:      '~',
    sweeter:    '↑',
    more_ice:   '↑',
    less_sweet: '↓',
    less_ice:   '↓',
  };
  return map[state_] || '✗';
}

function buildClueTile(state_) {
  const tile = document.createElement('span');
  tile.className = `tile ${tileClass(state_)}`;
  tile.textContent = tileSymbol(state_);
  return tile;
}

function prependGuessRow(recipe, clues, isOld) {
  const container = document.getElementById('history-rows');

  const row = document.createElement('div');
  row.className = 'guess-row' + (isOld ? ' old' : '');

  // Labels sub-row
  const labelsEl = document.createElement('div');
  labelsEl.className = 'guess-labels';
  labelsEl.textContent = ingredientLabel(recipe);
  row.appendChild(labelsEl);

  // Tiles sub-row
  const tileRow = document.createElement('div');
  tileRow.className = 'tile-row';

  tileRow.appendChild(buildClueTile(clues.tea));
  tileRow.appendChild(buildClueTile(clues.milk));
  tileRow.appendChild(buildClueTile(clues.syrup));
  tileRow.appendChild(buildClueTile(clues.sugar));
  tileRow.appendChild(buildClueTile(clues.ice));
  for (const tc of clues.toppings) {
    tileRow.appendChild(buildClueTile(tc.state));
  }

  row.appendChild(tileRow);
  container.prepend(row);
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 14 — UI: Gigi speech bubble
═══════════════════════════════════════════════════════════════ */

function showGigiPhrase(text, isRoast) {
  const bubble = document.getElementById('speech-bubble');
  bubble.textContent = text;
  bubble.classList.remove('hidden', 'roast');
  if (isRoast) bubble.classList.add('roast');
}

function clearGigiPhrase() {
  const bubble = document.getElementById('speech-bubble');
  bubble.classList.add('hidden');
  bubble.textContent = '';
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 15 — Core game loop
═══════════════════════════════════════════════════════════════ */

function submitGuess() {
  if (state.solved || state.failed) return;

  const { error, roast } = validateSelection(state.current, state.level);
  if (error) return; // submit disabled, shouldn't happen

  clearGigiPhrase();

  const recipe = {
    tea:      state.current.tea,
    milk:     state.current.milk,
    syrup:    state.current.syrup,
    sugar:    state.current.sugar,
    ice:      state.current.ice,
    toppings: state.current.toppings.slice(),
  };

  const guessIndex = state.guesses.length;
  const result     = evaluateGuess(recipe, state.answer, guessIndex);
  const clues      = result;

  // Use reordered recipe if first guess was reordered
  const finalRecipe = result.reorderedGuess || recipe;

  state.guesses.push({ recipe: finalRecipe, clues });

  // Prepend to history + show headers
  document.getElementById('history-headers').classList.remove('hidden');
  prependGuessRow(finalRecipe, clues, false);
  // Fade older rows
  const rows = document.querySelectorAll('.guess-row');
  rows.forEach((r, i) => {
    if (i > 0) r.classList.add('old');
  });

  updateGuessCounter();

  // Check win
  const won = clues.tea === 'correct'
    && clues.milk === 'correct'
    && clues.syrup === 'correct'
    && clues.sugar === 'correct'
    && clues.ice === 'correct'
    && clues.toppings.every(t => t.state === 'correct');

  if (won) {
    state.solved = true;
    showGigiPhrase(getPhrase('win'), false);
    saveState();
    setTimeout(() => showEndState(true), 1200);
    return;
  }

  // Choose Gigi's phrase
  const phrase = choosePhrase(clues, roast);
  showGigiPhrase(phrase, !!roast);

  // Check lose
  if (state.guesses.length >= MAX_GUESSES) {
    state.failed = true;
    saveState();
    setTimeout(() => showEndState(false), 1400);
    return;
  }

  saveState();

  // Pre-fill current from this guess so player only changes what's wrong
  state.current = {
    tea:      finalRecipe.tea,
    milk:     finalRecipe.milk,
    syrup:    finalRecipe.syrup,
    sugar:    finalRecipe.sugar,
    ice:      finalRecipe.ice,
    toppings: finalRecipe.toppings.slice(),
  };
  ['tea','milk','syrup','sugar','ice','toppings'].forEach(cat => refreshChipState(cat));
  updateCupVisual(state.current);
  onSelectionChange();
}

function updateGuessCounter() {
  document.getElementById('guess-counter').textContent =
    `${state.guesses.length} / ${MAX_GUESSES}`;
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 16 — End state + share
═══════════════════════════════════════════════════════════════ */

function recipeToText(recipe) {
  const parts = [];
  const teaObj   = recipe.tea   ? TEAS.find(t => t.id === recipe.tea) : null;
  const milkObj  = recipe.milk  ? MILKS.find(m => m.id === recipe.milk) : null;
  const syrupObj = recipe.syrup ? SYRUPS.find(s => s.id === recipe.syrup) : null;
  if (teaObj)  parts.push(teaObj.label);
  if (milkObj) parts.push(milkObj.label);
  if (syrupObj) parts.push(syrupObj.label);
  parts.push(recipe.sugar + ' sugar');
  const iceLabels = { no_ice: 'no ice', less_ice: 'less ice', regular: 'regular ice', extra: 'extra ice' };
  parts.push(iceLabels[recipe.ice] || recipe.ice);
  for (const tid of recipe.toppings) {
    const t = TOPPINGS.find(x => x.id === tid);
    if (t) parts.push(t.label);
  }
  return parts.join(', ');
}

function generateShareText() {
  const guessCount = state.guesses.length;
  const won  = state.solved;
  const date = state.date;
  const lvl  = state.level;

  const tileMap = {
    correct:    '🟩',
    family:     '🟨',
    group:      '🟨',
    wrong:      '⬜',
    sweeter:    '🟦',
    more_ice:   '🟦',
    less_sweet: '🟫',
    less_ice:   '🟫',
  };

  const lines = [`Gigi ${date} · Level ${lvl} · ${won ? guessCount : 'X'}/${MAX_GUESSES}`, ''];

  for (const { clues } of state.guesses) {
    let row = '';
    row += tileMap[clues.tea] || '⬜';
    row += tileMap[clues.milk] || '⬜';
    row += tileMap[clues.syrup] || '⬜';
    row += tileMap[clues.sugar] || '⬜';
    row += tileMap[clues.ice] || '⬜';
    for (const tc of clues.toppings) {
      row += tileMap[tc.state] || '⬜';
    }
    lines.push(row);
  }

  return lines.join('\n');
}

function showEndState(won) {
  document.getElementById('end-emoji').textContent = won ? '🧋' : '😤';
  document.getElementById('end-title').textContent = won
    ? `Level ${state.level} complete!`
    : "Gigi's drink remains a mystery.";
  document.getElementById('end-body').textContent = won
    ? `You nailed it in ${state.guesses.length} guess${state.guesses.length !== 1 ? 'es' : ''}.`
    : `You ran out of guesses.`;

  const answerEl = document.getElementById('end-answer');
  if (!won) {
    answerEl.textContent = 'The answer was: ' + recipeToText(state.answer);
    answerEl.classList.remove('hidden');
  } else {
    answerEl.classList.add('hidden');
  }

  const nextBtn = document.getElementById('next-level-btn');
  if (won && state.level < 6) {
    nextBtn.classList.remove('hidden');
  } else {
    nextBtn.classList.add('hidden');
  }

  document.getElementById('end-overlay').classList.remove('hidden');
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 17 — Level advancement
═══════════════════════════════════════════════════════════════ */

function advanceLevel() {
  if (state.level >= 6) return;
  state.level++;
  localStorage.setItem('gigi_level', String(state.level));

  document.getElementById('end-overlay').classList.add('hidden');

  // Reset game state for new level
  state.date   = getTodayDateString();
  state.answer = getDailyAnswer(state.level);
  state.guesses = [];
  state.solved  = false;
  state.failed  = false;
  state.current = {
    tea: null, milk: null, syrup: null,
    sugar: '50%', ice: 'regular', toppings: [],
  };
  resetPhrases();

  // Rebuild UI for new level
  buildUI(state.level);
  updateGuessCounter();
  clearGigiPhrase();

  // Clear history
  document.getElementById('history-rows').innerHTML = '';
  document.getElementById('history-headers').classList.add('hidden');

  updateLevelPill();
  updateCupVisual(state.current);
  onSelectionChange();
}

function updateLevelPill() {
  document.getElementById('level-pill').textContent = `Level ${state.level}`;
  const headerCell = document.getElementById('topping-header-cell');
  const cfg = getLevelConfig(state.level);
  if (headerCell) {
    headerCell.textContent = cfg.toppingSlots > 1 ? `Toppings` : 'Topping';
  }
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 18 — Build UI
═══════════════════════════════════════════════════════════════ */

function buildUI(level) {
  const cats = ['tea','milk','syrup','sugar','ice','toppings'];
  for (const cat of cats) {
    const row = document.getElementById(`selector-${cat}`);
    row.innerHTML = '';
    buildSelectorRow(cat, level);
  }
  refreshAllChips();
}

function refreshAllChips() {
  ['tea','milk','syrup','sugar','ice','toppings'].forEach(cat => refreshChipState(cat));
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 19 — initGame
═══════════════════════════════════════════════════════════════ */

function initGame() {
  loadState();

  buildUI(state.level);
  updateLevelPill();
  updateGuessCounter();
  updateCupVisual(state.current);

  // Replay saved guesses into history (old → shown without animation)
  if (state.guesses.length > 0) {
    document.getElementById('history-headers').classList.remove('hidden');
    // Render oldest first, then newest on top
    const orderedOldest = [...state.guesses];
    // We prepend each, so render newest last (it ends up on top)
    for (let i = 0; i < orderedOldest.length; i++) {
      const { recipe, clues } = orderedOldest[i];
      prependGuessRow(recipe, clues, true);
    }
    // Top row is latest — remove old class
    const firstRow = document.querySelector('#history-rows .guess-row');
    if (firstRow) firstRow.classList.remove('old');
  }

  // If already finished, show end state immediately
  if (state.solved) {
    showEndState(true);
  } else if (state.failed) {
    showEndState(false);
  } else {
    onSelectionChange();
  }

  // Disable selectors if game over
  if (state.solved || state.failed) {
    document.getElementById('submit-btn').disabled = true;
  }
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 20 — Event listeners
═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initGame();

  // Delegated click: selector chips
  document.getElementById('selectors-col').addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    if (state.solved || state.failed) return;
    onChipClick(chip.dataset.cat, chip.dataset.value);
  });

  // Submit
  document.getElementById('submit-btn').addEventListener('click', () => {
    if (!state.solved && !state.failed) submitGuess();
  });

  // Legend
  document.getElementById('info-btn').addEventListener('click', () => {
    document.getElementById('legend-overlay').classList.remove('hidden');
  });
  document.getElementById('legend-close-btn').addEventListener('click', () => {
    document.getElementById('legend-overlay').classList.add('hidden');
  });
  document.getElementById('legend-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) {
      e.currentTarget.classList.add('hidden');
    }
  });

  // Share
  document.getElementById('share-btn').addEventListener('click', () => {
    const text = generateShareText();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('share-btn');
        const orig = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = orig, 1800);
      }).catch(() => {
        prompt('Copy this:', text);
      });
    } else {
      prompt('Copy this:', text);
    }
  });

  // Next level
  document.getElementById('next-level-btn').addEventListener('click', () => {
    advanceLevel();
  });

});
