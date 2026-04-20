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
  { id: 'mango',       label: 'Mango',         family: 'fruit',    unlocksAt: 1, milkRule: 'flexible'       },
  { id: 'brown_sugar', label: 'Brown Sugar',   family: 'milk_based', unlocksAt: 1, milkRule: 'needs_milk'     },
  { id: 'strawberry',  label: 'Strawberry',    family: 'fruit',    unlocksAt: 1, milkRule: 'flexible'       },
  { id: 'osmanthus',   label: 'Osmanthus',     family: 'floral',   unlocksAt: 1, milkRule: 'needs_tea_milk' },
  { id: 'lychee',      label: 'Lychee',        family: 'fruit',    unlocksAt: 1, milkRule: 'flexible'       },
  { id: 'peach',       label: 'Peach',         family: 'fruit',    unlocksAt: 2, milkRule: 'flexible'       },
  { id: 'thai',        label: 'Thai',          family: 'milk_based', unlocksAt: 2, milkRule: 'needs_milk'     },
  { id: 'rose',        label: 'Rose',          family: 'floral',   unlocksAt: 4, milkRule: 'flexible'       },
  { id: 'matcha',      label: 'Matcha',        family: 'milk_based', unlocksAt: 4, milkRule: 'needs_milk'     },
  { id: 'taro',        label: 'Taro',          family: 'milk_based', unlocksAt: 5, milkRule: 'needs_milk'     },
  { id: 'passion',     label: 'Passion Fruit', family: 'fruit',    unlocksAt: 6, milkRule: 'never_milk'     },
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

const MAX_GUESSES = 5;

const LEVELS = [
  { level: 1, toppingSlots: 1 },
  { level: 2, toppingSlots: 1 },
  { level: 3, toppingSlots: 1 },
  { level: 4, toppingSlots: 2 },
  { level: 5, toppingSlots: 2 },
  { level: 6, toppingSlots: 3 },
];

const GIGI_MOODS = {
  idle:  'img/gigi-idle.png',
  happy: 'img/gigi-happy.png',
  cool:  'img/gigi-cool.png',
  smug:  'img/gigi-smug.png',
  dead:  'img/gigi-dead.png',
};

const GIGI_DIALOGUE = {
  failure: [
    "You failed. I'm not mad, just disappointed.",
    "That was painful to watch.",
    "Let's pretend this never happened.",
    "A for effort. F for everything else.",
    "Skill issue.",
    "I've seen toddlers do better. I'm not kidding.",
    "Did you even try? Be honest.",
    "Please tell me you were distracted.",
  ],
  levelSuccess: [
    "Finally. Took you long enough.",
    "Not bad. Don't get used to it.",
    "Huh. You have a brain after all.",
    "Okay. That was lucky.",
  ],
  gameComplete: [
    "Not bad. For a human.",
    "I didn't think you'd make it. And yet.",
    "Six drinks. One champion. Me, for putting up with you.",
    "All six levels. You've peaked. It's all downhill from here.",
  ],
};

const gigiLastShown = { failure: -1, levelSuccess: -1, gameComplete: -1 };

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
    if (family === 'fruit')      return 28;
    if (family === 'floral')     return 25;
    if (family === 'milk_based') return -10;
    if (family === 'roasted')    return 10;
  }

  if (!hasTea && hasMilk && hasSyrup) {
    // Milk + Syrup
    if (family === 'milk_based') return 30;
    if (family === 'fruit')   return 10;
    if (family === 'floral')  return 16;
    if (family === 'roasted') return 8;
  }

  if (hasTea && hasMilk && hasSyrup) {
    // Full combo
    if (family === 'milk_based') return 28;
    if (family === 'fruit')   return 26;
    if (family === 'floral')  return 25;
    if (family === 'roasted') return 24;
  }

  return 0;
}

// Axis 2 — Tea × syrup affinity (max 20)
// Skipped (20 pts) if no tea or no syrup
const TEA_SYRUP_AFFINITY = {
  black:   { fruit: 16, milk_based: 18, floral: 12, roasted: 17 },
  green:   { fruit: 19, milk_based:  8, floral: 18, roasted: 10 },
  oolong:  { fruit: 14, milk_based: 14, floral: 20, roasted: 15 },
  jasmine: { fruit: 18, milk_based:  7, floral: 19, roasted:  8 },
  roasted: { fruit: -8, milk_based: 20, floral:  9, roasted: 18 },
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

function getOrCreateSessionSeed() {
  let seed = localStorage.getItem('gigi_session_seed');
  if (!seed) {
    seed = String(Math.floor(Math.random() * 2147483647) + 1);
    localStorage.setItem('gigi_session_seed', seed);
  }
  return seed;
}

function getDailyAnswer(level) {
  const sessionSeed = getOrCreateSessionSeed();
  const baseSeed = hashString(sessionSeed + ':' + level);
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

  // Toppings (use reordered list) — count-aware group hints
  // 1. Count how many of each group the answer has
  const answerGroupCounts = {};
  for (const aid of answer.toppings) {
    const aT = TOPPINGS.find(x => x.id === aid);
    if (aT) answerGroupCounts[aT.group] = (answerGroupCounts[aT.group] || 0) + 1;
  }
  // 2. Subtract exact matches so they don't also consume a 'group' slot
  const remainingGroupCounts = Object.assign({}, answerGroupCounts);
  for (const tid of toppings) {
    if (answer.toppings.includes(tid)) {
      const gT = TOPPINGS.find(x => x.id === tid);
      if (gT) remainingGroupCounts[gT.group] = (remainingGroupCounts[gT.group] || 0) - 1;
    }
  }
  // 3. Assign clues — correct first, then group (consuming remaining slots), then wrong
  const toppingClues = toppings.map(tid => {
    if (answer.toppings.includes(tid)) return { id: tid, state: 'correct' };
    const gT = TOPPINGS.find(x => x.id === tid);
    if (gT && (remainingGroupCounts[gT.group] || 0) > 0) {
      remainingGroupCounts[gT.group]--;
      return { id: tid, state: 'group' };
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
    // Count-aware: track remaining group slots after exact matches
    const agc = {};
    for (const aid of answerToppings) {
      const aT = TOPPINGS.find(x => x.id === aid);
      if (aT) agc[aT.group] = (agc[aT.group] || 0) + 1;
    }
    const rgc = Object.assign({}, agc);
    for (const tid of perm) {
      if (answerToppings.includes(tid)) {
        const gT = TOPPINGS.find(x => x.id === tid);
        if (gT) rgc[gT.group] = (rgc[gT.group] || 0) - 1;
      }
    }
    const score = perm.reduce((sum, tid) => {
      if (answerToppings.includes(tid)) return sum + 3;
      const gT = TOPPINGS.find(x => x.id === tid);
      if (gT && (rgc[gT.group] || 0) > 0) {
        rgc[gT.group]--;
        return sum + 1;
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

  // Collect all applicable wrong-ingredient pools, then pick one randomly.
  // This prevents the same ingredient dominating when multiple are wrong.
  const candidates = [];
  if (clues.syrup === 'family')     candidates.push('syrup_family');
  if (clues.tea === 'wrong')        candidates.push('tea_wrong');
  if (clues.milk === 'wrong')       candidates.push('milk_wrong');
  if (clues.syrup === 'wrong')      candidates.push('syrup_wrong');
  if (clues.sugar === 'sweeter')    candidates.push('sugar_sweeter');
  if (clues.sugar === 'less_sweet') candidates.push('sugar_less_sweet');
  if (clues.ice === 'more_ice')     candidates.push('ice_more_ice');
  if (clues.ice === 'less_ice')     candidates.push('ice_less_ice');

  const toppingGroup = clues.toppings.find(t => t.state === 'group');
  const toppingWrong = clues.toppings.find(t => t.state === 'wrong');
  if (toppingGroup) candidates.push('topping_group');
  if (toppingWrong) candidates.push('topping_wrong');

  if (candidates.length > 0) {
    const poolKey = candidates[Math.floor(Math.random() * candidates.length)];
    return getPhrase(poolKey);
  }

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

function getSaveKey(level) {
  const seed = getOrCreateSessionSeed();
  return `gigi_${seed}_L${level}`;
}

function saveState() {
  const key = getSaveKey(state.level);
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

  const key  = getSaveKey(state.level);
  const raw  = localStorage.getItem(key);
  if (raw) {
    const saved = JSON.parse(raw);
    // Never restore a failed state — player always gets a fresh try on reload
    if (saved.failed) {
      localStorage.removeItem(key);
      state.guesses = [];
      state.solved  = false;
      state.failed  = false;
    } else {
      state.guesses = saved.guesses || [];
      state.solved  = saved.solved  || false;
      state.failed  = false;
    }
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
   SECTION 9 — BobaCup wiring
═══════════════════════════════════════════════════════════════ */

let cupInstance = null;

const ICE_TO_BOBA  = { no_ice: 'none', less_ice: 'less', regular: 'regular', extra: 'extra' };

function mapSyrup(s) {
  if (!s) return 'none';
  const overrides = { passion: 'passion-fruit' };
  return overrides[s] || s.replace(/_/g, '-');
}

function toBobaState(cur) {
  return {
    tea:      cur.tea   || 'none',
    milk:     cur.milk  || 'none',
    syrup:    mapSyrup(cur.syrup),
    sugar:    cur.sugar ? cur.sugar.replace('%', '') : '50',
    ice:      ICE_TO_BOBA[cur.ice] || 'regular',
    toppings: (cur.toppings || []).map(t => t.replace(/_/g, '-')),
  };
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 10 — UI: Cup Visual
═══════════════════════════════════════════════════════════════ */

function updateCupVisual(current) {
  if (!cupInstance) return;
  cupInstance.update(toBobaState(current));
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 11 — UI: Selector Rows
═══════════════════════════════════════════════════════════════ */

function warningIcon() {
  return '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><circle cx="6" cy="6" r="5.5" stroke="currentColor"/><path d="M6 3v3.5M6 8.5v.5" stroke="currentColor" stroke-linecap="round"/></svg>';
}

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

const ALL_CATS = ['tea', 'milk', 'syrup', 'sugar', 'ice', 'toppings'];

function getSummaryText(cat) {
  const cfg = getLevelConfig(state.level);
  if (cat === 'tea') {
    if (!state.current.tea) return 'None selected';
    const t = TEAS.find(x => x.id === state.current.tea);
    return t ? t.label : state.current.tea;
  }
  if (cat === 'milk') {
    if (!state.current.milk) return 'None selected';
    const m = MILKS.find(x => x.id === state.current.milk);
    return m ? m.label : state.current.milk;
  }
  if (cat === 'syrup') {
    if (!state.current.syrup) return 'None selected';
    const s = SYRUPS.find(x => x.id === state.current.syrup);
    return s ? s.label : state.current.syrup;
  }
  if (cat === 'sugar') return state.current.sugar;
  if (cat === 'ice') return ICE_LABELS[state.current.ice] || state.current.ice;
  if (cat === 'toppings') {
    const count = state.current.toppings.length;
    const max = cfg.toppingSlots;
    if (count === 0) return 'None selected';
    const labels = state.current.toppings.map(tid => {
      const t = TOPPINGS.find(x => x.id === tid);
      return t ? t.label : tid;
    });
    return `${labels.join(', ')}  (${count}/${max})`;
  }
  return '';
}

function toggleAccordion(cat, forceClose) {
  const list   = document.getElementById(`chips-${cat}`);
  const header = document.querySelector(`#selector-${cat} .selector-row-header`);
  if (!list || !header) return;

  const isOpen = !list.classList.contains('chip-list--collapsed');

  if (forceClose || isOpen) {
    list.classList.add('chip-list--collapsed');
    header.classList.remove('open');
  } else {
    // Close every other accordion first
    ALL_CATS.forEach(c => {
      if (c === cat) return;
      const l = document.getElementById(`chips-${c}`);
      const h = document.querySelector(`#selector-${c} .selector-row-header`);
      if (l) l.classList.add('chip-list--collapsed');
      if (h) h.classList.remove('open');
    });
    list.classList.remove('chip-list--collapsed');
    header.classList.add('open');
  }
  updateToppingWarning();
}

function updateBaseGroupHint() {
  const c = state.current;
  const count = (c.tea !== null ? 1 : 0) + (c.milk !== null ? 1 : 0) + (c.syrup !== null ? 1 : 0);
  const group = document.getElementById('base-group');
  const hint  = document.getElementById('base-group-hint');
  if (!group || !hint) return;
  if (count >= 2) {
    group.classList.remove('warn');
    hint.classList.add('hidden');
  } else {
    group.classList.add('warn');
    hint.innerHTML = `${warningIcon()} Pick at least 2 of Tea, Milk, or Syrup (${count} chosen)`;
    hint.classList.remove('hidden');
  }
}

function updateToppingWarning() {
  const cfg    = getLevelConfig(state.level);
  const count  = state.current.toppings.length;
  const isValid = count === cfg.toppingSlots;

  const group  = document.getElementById('toppings-group');
  const header = document.querySelector('#selector-toppings .selector-row-header');
  const hint   = document.getElementById('toppings-hint-closed');

  if (isValid) {
    group?.classList.remove('warn');
    header?.classList.remove('warn');
    header?.removeAttribute('aria-invalid');
    header?.removeAttribute('aria-describedby');
    hint?.classList.add('hidden');
  } else {
    group?.classList.add('warn');
    header?.classList.add('warn');
    header?.setAttribute('aria-invalid', 'true');
    header?.setAttribute('aria-describedby', 'toppings-hint-closed');
    if (hint) {
      hint.innerHTML = `${warningIcon()} Pick exactly 1 topping`;
      hint.classList.remove('hidden');
    }
  }
}

function buildSelectorRow(cat, level) {
  const row = document.getElementById(`selector-${cat}`);
  row.innerHTML = '';

  // Accordion header
  const header = document.createElement('div');
  header.className = 'selector-row-header';
  header.dataset.cat = cat;

  const left = document.createElement('div');
  left.className = 'selector-row-header-left';
  const dot = document.createElement('span');
  dot.className = 'cat-dot';
  dot.style.background = CAT_DOT_COLORS[cat];
  left.appendChild(dot);
  const textCol = document.createElement('div');
  textCol.className = 'selector-row-text';
  const nameSpan = document.createElement('span');
  nameSpan.className = 'cat-name';
  nameSpan.textContent = cat === 'toppings' ? 'Toppings' : cat.charAt(0).toUpperCase() + cat.slice(1);
  textCol.appendChild(nameSpan);
  const summary = document.createElement('span');
  summary.className = 'selector-value';
  summary.id = `summary-${cat}`;
  textCol.appendChild(summary);
  left.appendChild(textCol);
  header.appendChild(left);

  const right = document.createElement('div');
  right.className = 'selector-row-header-right';
  const chevron = document.createElement('span');
  chevron.className = 'selector-chevron';
  right.appendChild(chevron);
  header.appendChild(right);

  row.appendChild(header);

  // Chip list — collapsed by default
  const list = document.createElement('div');
  list.className = cat === 'toppings'
    ? 'chip-list chip-list--checklist chip-list--collapsed'
    : 'chip-list chip-list--collapsed';
  list.id = `chips-${cat}`;
  row.appendChild(list);

  buildChips(cat, level);
}

function buildChips(cat, level) {
  const list = document.getElementById(`chips-${cat}`);
  if (!list) return;
  list.innerHTML = '';

  if (cat === 'tea') {
    addNoneChip(list, 'tea');
    for (const t of getUnlocked(TEAS, level)) addChip(list, 'tea', t.id, t.label);
  } else if (cat === 'milk') {
    addNoneChip(list, 'milk');
    for (const m of getUnlocked(MILKS, level)) addChip(list, 'milk', m.id, m.label);
  } else if (cat === 'syrup') {
    addNoneChip(list, 'syrup');
    for (const s of getUnlocked(SYRUPS, level)) addChip(list, 'syrup', s.id, s.label, s.family);
  } else if (cat === 'sugar') {
    for (const s of SUGAR_LEVELS) addChip(list, 'sugar', s, s);
  } else if (cat === 'ice') {
    for (const i of ICE_LEVELS) addChip(list, 'ice', i, ICE_LABELS[i]);
  } else if (cat === 'toppings') {
    // 1. Topping checkbox items
    for (const t of getUnlocked(TOPPINGS, level)) addToppingCheckbox(list, t.id, t.label, t.group);

    // 2. Count hint — at-capacity confirmation only
    const hint = document.createElement('div');
    hint.id = 'topping-hint';
    list.appendChild(hint);
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

function addChip(list, cat, value, label, family) {
  const chip = document.createElement('button');
  chip.className = 'chip';
  chip.dataset.cat   = cat;
  chip.dataset.value = value;
  chip.textContent = label;
  if (family) chip.dataset.family = family;
  list.appendChild(chip);
}

function addToppingCheckbox(list, value, label, group) {
  const item = document.createElement('div');
  item.className = 'topping-check-item';
  item.dataset.cat   = 'toppings';
  item.dataset.value = value;
  if (group) item.dataset.family = group;

  const box = document.createElement('span');
  box.className = 'check-box';
  item.appendChild(box);

  const lbl = document.createElement('span');
  lbl.className = 'check-label';
  lbl.textContent = label;
  item.appendChild(lbl);

  list.appendChild(item);
}

function refreshChipState(cat) {
  const list = document.getElementById(`chips-${cat}`);
  if (!list) return;
  const chips = list.querySelectorAll('.chip, .topping-check-item');

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

  // Update topping hint text — at-capacity confirmation only
  if (cat === 'toppings') {
    const hint = document.getElementById('topping-hint');
    const cfg  = getLevelConfig(state.level);
    const count = state.current.toppings.length;
    const max   = cfg.toppingSlots;
    if (hint) {
      if (count >= max) {
        hint.textContent = `${max} of ${max} selected`;
        hint.classList.add('full');
        hint.classList.remove('flash');
      } else {
        hint.textContent = '';
        hint.classList.remove('full', 'flash');
      }
    }
  }

  // Update summary text in accordion header
  const summaryEl = document.getElementById(`summary-${cat}`);
  if (summaryEl) {
    summaryEl.textContent = getSummaryText(cat);
    const isEmpty = (cat === 'tea'      && state.current.tea === null)
                 || (cat === 'milk'     && state.current.milk === null)
                 || (cat === 'syrup'    && state.current.syrup === null)
                 || (cat === 'toppings' && state.current.toppings.length === 0);
    summaryEl.dataset.empty = isEmpty ? 'true' : 'false';
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
        // At capacity — shake the chip list, pulse selected chips, flash hint
        const chipList = document.getElementById('chips-toppings');
        if (chipList) {
          chipList.classList.remove('shake');
          void chipList.offsetWidth;
          chipList.classList.add('shake');
          chipList.addEventListener('animationend', () => chipList.classList.remove('shake'), { once: true });

          // Pulse all currently selected chips
          chipList.querySelectorAll('.chip.selected').forEach(c => {
            c.classList.remove('chip-pulse');
            void c.offsetWidth;
            c.classList.add('chip-pulse');
            c.addEventListener('animationend', () => c.classList.remove('chip-pulse'), { once: true });
          });
        }

        // Flash the hint text
        const hint = document.getElementById('topping-hint');
        if (hint) {
          hint.classList.remove('flash');
          void hint.offsetWidth;
          hint.classList.add('flash');
          setTimeout(() => {
            hint.classList.remove('flash');
            hint.classList.add('full');
          }, 600);
        }
        return;
      }
      state.current.toppings.push(value);
    }
  }

  refreshChipState(cat);
  onSelectionChange();

  // Close accordion after picking a radio-style category;
  // close toppings automatically when all slots are filled
  if (cat !== 'toppings') {
    toggleAccordion(cat, true);
  } else if (state.current.toppings.length >= getLevelConfig(state.level).toppingSlots) {
    toggleAccordion('toppings', true);
  }
}

function onSelectionChange() {
  updateCupVisual(state.current);
  updateBaseGroupHint();
  updateToppingWarning();

  const { error } = validateSelection(state.current, state.level);
  document.getElementById('submit-btn').disabled = !!error;
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

  const teaObj   = recipe.tea   ? TEAS.find(t => t.id === recipe.tea)     : null;
  const milkObj  = recipe.milk  ? MILKS.find(m => m.id === recipe.milk)   : null;
  const syrupObj = recipe.syrup ? SYRUPS.find(s => s.id === recipe.syrup) : null;
  const iceMap   = { no_ice: 'no ice', less_ice: 'less ice', regular: 'regular', extra: 'extra ice' };

  const cols = [
    { label: teaObj   ? teaObj.label   : 'none',             clue: clues.tea   },
    { label: milkObj  ? milkObj.label  : 'none',             clue: clues.milk  },
    { label: syrupObj ? syrupObj.label : 'none',             clue: clues.syrup },
    { label: recipe.sugar,                                    clue: clues.sugar },
    { label: iceMap[recipe.ice] || recipe.ice,                clue: clues.ice   },
    ...clues.toppings.map((tc, i) => {
      const t = TOPPINGS.find(x => x.id === recipe.toppings[i]);
      return { label: t ? t.label : recipe.toppings[i], clue: tc.state };
    }),
  ];

  cols.forEach(({ label, clue }, colIdx) => {
    const col = document.createElement('div');
    col.className = 'guess-col';

    const labelEl = document.createElement('span');
    labelEl.className = 'guess-col-label';
    labelEl.textContent = label;

    const tileEl = buildClueTile(clue);
    tileEl.style.animationDelay = `${colIdx * 100}ms`;

    col.appendChild(labelEl);
    col.appendChild(tileEl);
    row.appendChild(col);
  });

  container.prepend(row);
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 14 — UI: Gigi speech bubble
═══════════════════════════════════════════════════════════════ */

function showGigiPhrase(text, isRoast) {
  const speechEl = document.getElementById('gigi-speech');
  const textEl   = document.getElementById('gigi-speech-text');
  if (!speechEl || !textEl) return;
  textEl.textContent = text;
  speechEl.classList.remove('hidden');
  // Replay pop-in animation
  speechEl.classList.remove('gigi-speech--enter');
  void speechEl.offsetWidth;
  speechEl.classList.add('gigi-speech--enter');
  // Roast tint
  speechEl.querySelector('.gigi-speech-bubble')?.classList.toggle('roast', !!isRoast);
}

function clearGigiPhrase() {
  const speechEl = document.getElementById('gigi-speech');
  const textEl   = document.getElementById('gigi-speech-text');
  if (textEl) textEl.textContent = '';
  if (speechEl) speechEl.classList.add('hidden');
}

function setGigiMood(mood, selector = '.gigi-img') {
  const src = GIGI_MOODS[mood];
  if (!src) return;
  document.querySelectorAll(selector).forEach(img => { img.src = src; });
}

function playGigiAnimation(animClass, wrapperSelector = '#gigi-header') {
  const el = document.querySelector(wrapperSelector);
  if (!el) return;
  el.classList.remove(animClass);
  void el.offsetWidth;
  el.classList.add(animClass);
}

function flashGigiMood(mood, durationMs = 3000) {
  setGigiMood(mood);
  setTimeout(() => setGigiMood('idle'), durationMs);
}

function pickGigiLine(category) {
  const pool = GIGI_DIALOGUE[category];
  if (!pool || pool.length === 0) return '';
  if (pool.length === 1) return pool[0];
  let idx;
  do { idx = Math.floor(Math.random() * pool.length); }
  while (idx === gigiLastShown[category]);
  gigiLastShown[category] = idx;
  return pool[idx];
}

function getTotalGuesses() {
  const n = parseInt(localStorage.getItem('gigi_total_guesses') || '0', 10);
  return n > 0 ? n : null;
}

function accumulateGuesses(count) {
  const prev = parseInt(localStorage.getItem('gigi_total_guesses') || '0', 10);
  localStorage.setItem('gigi_total_guesses', String(prev + count));
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 15 — Core game loop
═══════════════════════════════════════════════════════════════ */

function submitGuess() {
  if (state.solved || state.failed) return;

  const { error, roast } = validateSelection(state.current, state.level);
  if (error) return; // submit disabled, shouldn't happen

  // ── Lock button immediately ──
  const btn = document.getElementById('submit-btn');
  if (btn) btn.disabled = true;

  // ── Pre-compute everything synchronously ──
  const recipe = {
    tea:      state.current.tea,
    milk:     state.current.milk,
    syrup:    state.current.syrup,
    sugar:    state.current.sugar,
    ice:      state.current.ice,
    toppings: state.current.toppings.slice(),
  };

  const guessIndex  = state.guesses.length;
  const result      = evaluateGuess(recipe, state.answer, guessIndex);
  const clues       = result;
  const finalRecipe = result.reorderedGuess || recipe;

  const won = clues.tea === 'correct'
    && clues.milk === 'correct'
    && clues.syrup === 'correct'
    && clues.sugar === 'correct'
    && clues.ice === 'correct'
    && clues.toppings.every(t => t.state === 'correct');

  const phrase   = won ? getPhrase('win') : choosePhrase(clues, roast);
  const isRoast  = won ? false : !!roast;
  const gigiAnim = won ? 'gigi-hop' : 'gigi-shake';

  // ── Phase 1: Dismiss current speech bubble (0ms) ──
  const speechEl = document.getElementById('gigi-speech');
  if (speechEl && !speechEl.classList.contains('hidden')) {
    speechEl.classList.add('dismissing');
    setTimeout(() => {
      speechEl.classList.add('hidden');
      speechEl.classList.remove('dismissing');
    }, 280);
  }

  // ── Phase 2: Cup anticipation (150ms) ──
  setTimeout(() => {
    document.getElementById('cup-wrap').classList.add('cup-anticipating');
  }, 150);

  // ── Phase 3: Shake + counter-skew slosh (350ms) ──
  setTimeout(() => {
    const cupWrap = document.getElementById('cup-wrap');
    const cupSvg  = document.getElementById('cup-svg-container');
    cupWrap.classList.remove('cup-anticipating');
    cupWrap.classList.add('cup-shaking');
    cupSvg.classList.add('cup-sloshing');
  }, 350);

  // ── Phase 3b: Verdict reveal — prepend guess row, tiles stagger (500ms) ──
  setTimeout(() => {
    document.getElementById('history-headers').classList.remove('hidden');
    prependGuessRow(finalRecipe, clues, false);
    document.querySelectorAll('.guess-row').forEach((r, i) => {
      if (i > 0) r.classList.add('old');
    });
    updateGuessCounter();
  }, 500);

  // ── Phase 4: Settle (1070ms — after shake completes: 350 + 720) ──
  setTimeout(() => {
    const cupWrap = document.getElementById('cup-wrap');
    const cupSvg  = document.getElementById('cup-svg-container');
    cupWrap.classList.remove('cup-shaking');
    cupWrap.classList.add('cup-settling');
    cupSvg.classList.remove('cup-sloshing');
    cupWrap.addEventListener('animationend', () => cupWrap.classList.remove('cup-settling'), { once: true });
  }, 1070);

  // ── Phase 4b: Blend liquid color (1110ms) ──
  setTimeout(() => {
    if (cupInstance) cupInstance.startBlend(280);
  }, 1110);

  // ── Phase 5: Gigi reaction (1110ms) ──
  setTimeout(() => {
    playGigiAnimation(gigiAnim, '#gigi-header');
  }, 1110);

  // ── Phase 6: New speech bubble (1750ms — ~460ms pause after settle ends) ──
  setTimeout(() => {
    const speechEl = document.getElementById('gigi-speech');
    if (speechEl) speechEl.classList.add('serve-enter');
    showGigiPhrase(phrase, isRoast);
    if (speechEl) {
      speechEl.addEventListener('animationend', () => speechEl.classList.remove('serve-enter'), { once: true });
    }
  }, 1750);

  // ── Finalize: state updates (2050ms) ──
  setTimeout(() => {
    state.guesses.push({ recipe: finalRecipe, clues });

    if (won) {
      state.solved = true;
      accumulateGuesses(state.guesses.length);
      saveState();
      setTimeout(() => showEndState(true), 700);
      return;
    }

    if (state.guesses.length >= MAX_GUESSES) {
      state.failed = true;
      // Don't persist failed state — clear progress so a reload gives a fresh try
      localStorage.removeItem(getSaveKey(state.level));
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
    if (btn) btn.disabled = false;
    updateCupVisual(state.current);
    onSelectionChange();
  }, 1400);
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
  // Hide all sub-popups
  ['popup-failure', 'popup-success', 'popup-complete'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById('end-overlay').classList.remove('hidden');

  function popInThen(popup, followupAnim) {
    const gigiEl = popup.querySelector('.gigi-wrapper');
    if (!gigiEl) return;
    gigiEl.classList.remove('gigi-pop-in');
    void gigiEl.offsetWidth;
    gigiEl.classList.add('gigi-pop-in');
    setTimeout(() => {
      gigiEl.classList.remove('gigi-pop-in');
      playGigiAnimation(followupAnim, '#' + popup.id + ' .gigi-wrapper');
    }, 450);
  }

  if (!won) {
    // ── Failure popup ──
    const popup = document.getElementById('popup-failure');
    popup.classList.remove('hidden');
    document.getElementById('failure-speech-text').textContent = pickGigiLine('failure');
    document.getElementById('failure-answer').textContent = recipeToText(state.answer);
    popInThen(popup, 'gigi-droop');

  } else if (state.level < 6) {
    // ── Level success popup ──
    const popup = document.getElementById('popup-success');
    popup.classList.remove('hidden');
    document.getElementById('success-speech-text').textContent = pickGigiLine('levelSuccess');
    document.getElementById('success-subtext').textContent = `Level ${state.level} complete`;
    document.getElementById('success-answer').textContent = recipeToText(state.answer);
    popInThen(popup, 'gigi-hop');

  } else {
    // ── Game complete popup ──
    const popup = document.getElementById('popup-complete');
    popup.classList.remove('hidden');
    document.getElementById('complete-speech-text').textContent = pickGigiLine('gameComplete');
    const totalGuesses = getTotalGuesses();
    document.getElementById('stat-guesses').textContent = totalGuesses ?? '—';
    document.getElementById('stat-hints').textContent = '—';
    popInThen(popup, 'gigi-hop');
  }
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
  if (cupInstance) cupInstance.clearBlend();
  updateCupVisual(state.current);
  onSelectionChange();
}

function restartGame() {
  if (!confirm('Restart from Level 1? All progress will be lost.')) return;

  // Clear all saves for the current session across every level
  const oldSeed = localStorage.getItem('gigi_session_seed');
  if (oldSeed) {
    for (let l = 1; l <= 6; l++) {
      localStorage.removeItem(`gigi_${oldSeed}_L${l}`);
    }
  }
  // Generate a fresh session seed so all levels get new drinks
  localStorage.setItem('gigi_session_seed', String(Math.floor(Math.random() * 2147483647) + 1));
  localStorage.setItem('gigi_level', '1');
  localStorage.removeItem('gigi_total_guesses');

  state.level   = 1;
  state.guesses = [];
  state.solved  = false;
  state.failed  = false;
  state.answer  = getDailyAnswer(1);
  state.current = { tea: null, milk: null, syrup: null, sugar: '50%', ice: 'regular', toppings: [] };
  resetPhrases();

  document.getElementById('end-overlay').classList.add('hidden');
  document.getElementById('history-rows').innerHTML = '';
  document.getElementById('history-headers').classList.add('hidden');
  document.getElementById('submit-btn').disabled = false;
  buildUI(state.level);
  updateLevelPill();
  updateGuessCounter();
  clearGigiPhrase();
  updateCupVisual(state.current);
  onSelectionChange();
}

function retryLevel() {
  document.getElementById('end-overlay').classList.add('hidden');

  state.guesses = [];
  state.solved  = false;
  state.failed  = false;
  state.current = {
    tea: null, milk: null, syrup: null,
    sugar: '50%', ice: 'regular', toppings: [],
  };
  // answer stays the same — same date + level seed
  resetPhrases();

  document.getElementById('history-rows').innerHTML = '';
  document.getElementById('history-headers').classList.add('hidden');
  document.getElementById('submit-btn').disabled = false;
  buildUI(state.level);
  updateGuessCounter();
  clearGigiPhrase();
  if (cupInstance) cupInstance.clearBlend();
  updateCupVisual(state.current);
  onSelectionChange();
}

function updateLevelPill() {
  document.getElementById('level-pill').textContent = `Level ${state.level}`;
  const headersEl = document.getElementById('history-headers');
  const cfg = getLevelConfig(state.level);
  // Remove old topping header cells and rebuild for the current level
  headersEl.querySelectorAll('.topping-header-cell').forEach(el => el.remove());
  for (let i = 0; i < cfg.toppingSlots; i++) {
    const span = document.createElement('span');
    span.className = 'topping-header-cell';
    span.textContent = `Topping ${i + 1}`;
    headersEl.appendChild(span);
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

  // Mount illustrated SVG cup (once on first init)
  if (!cupInstance) {
    cupInstance = BobaCup.mount(
      document.getElementById('cup-svg-container'),
      { sugarLabelEl: document.getElementById('cup-sugar-label') }
    );
  }
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

  // Delegated click: accordion headers + chips
  document.getElementById('selectors-col').addEventListener('click', e => {
    const header = e.target.closest('.selector-row-header');
    if (header) {
      toggleAccordion(header.dataset.cat);
      return;
    }
    const chip = e.target.closest('.chip') || e.target.closest('.topping-check-item');
    if (!chip) return;
    if (state.solved || state.failed) return;
    onChipClick(chip.dataset.cat, chip.dataset.value);
  });

  // Submit
  document.getElementById('submit-btn').addEventListener('click', () => {
    if (!state.solved && !state.failed) submitGuess();
  });

  // Legend — auto-show before the very first round
  if (state.level === 1 && state.guesses.length === 0 && !state.solved && !state.failed) {
    document.getElementById('legend-overlay').classList.remove('hidden');
  }

  function openLegend()  { document.getElementById('legend-overlay').classList.remove('hidden'); }
  function closeLegend() { document.getElementById('legend-overlay').classList.add('hidden'); }

  document.getElementById('info-btn').addEventListener('click', openLegend);
  document.getElementById('legend-close-btn').addEventListener('click', closeLegend);

  // Press 'i' to toggle the legend (during gameplay, not on first auto-show)
  document.addEventListener('keydown', e => {
    if (e.key === 'i' || e.key === 'I') {
      const overlay = document.getElementById('legend-overlay');
      overlay.classList.toggle('hidden');
    }
  });

  // Share (all three popups use the same share logic)
  function handleShare(btnId) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener('click', () => {
      const text = generateShareText();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          const orig = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(() => btn.textContent = orig, 1800);
        }).catch(() => { prompt('Copy this:', text); });
      } else {
        prompt('Copy this:', text);
      }
    });
  }
  handleShare('share-btn');
  handleShare('share-btn-success');
  handleShare('share-btn-complete');

  // Play again (game complete popup)
  document.getElementById('restart-complete-btn').addEventListener('click', () => {
    restartGame();
  });

  // Restart game (back to level 1)
  document.getElementById('restart-btn').addEventListener('click', () => {
    restartGame();
  });

  // Retry (fail state only)
  document.getElementById('retry-btn').addEventListener('click', () => {
    retryLevel();
  });

  // Next level
  document.getElementById('next-level-btn').addEventListener('click', () => {
    advanceLevel();
  });

});
