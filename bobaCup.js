/* bobaCup.js — illustrated SVG boba cup module
 * Exposes window.BobaCup = { mount(container, options) }
 * Returns { update(drinkState), replay(), destroy() }
 *
 * drinkState shape:
 *   { tea, milk, syrup, sugar, ice, toppings }
 *   tea/milk/syrup: 'none' or ingredient key (hyphens, e.g. 'brown-sugar')
 *   sugar: '0'|'25'|'50'|'75'|'100'
 *   ice: 'none'|'less'|'regular'|'extra'
 *   toppings: string[] of topping keys (hyphens)
 */
window.BobaCup = (function () {

  /* ── Constants ──────────────────────────────────────────────── */

  const COLORS = {
    tea: {
      black:   '#5a3a1f',
      green:   '#8aa860',
      oolong:  '#b07a3a',
      jasmine: '#d4c68a',
      roasted: '#6b4a2a'
    },
    milk: {
      cow: '#f5ecd8',
      oat: '#e8d9b8',
      soy: '#ede0c0'
    },
    syrup: {
      mango:           '#f0a830',
      'brown-sugar':   '#6b3a1a',
      strawberry:      '#e06088',
      osmanthus:       '#e8c060',
      lychee:          '#f4d0d8',
      peach:           '#f5a878',
      thai:            '#e8754a',
      rose:            '#d08098',
      matcha:          '#7a9848',
      taro:            '#b890c8',
      'passion-fruit': '#f0c048'
    },
    toppings: {
      'brown-sugar-pearl': { type: 'pearl',   fill: '#3a1f10', shine: '#7a4525' },
      'classic-pearl':     { type: 'pearl',   fill: '#1a1210', shine: '#443028' },
      'crystal-boba':      { type: 'crystal', fill: '#e8f0f0', shine: '#ffffff', stroke: '#9bafb0' },
      'boba-strawberry':   { type: 'popping', fill: '#d82c48', shine: '#ff8098', stroke: '#8a1528' },
      'boba-mango':        { type: 'popping', fill: '#f5c418', shine: '#ffe878', stroke: '#a8820a' },
      'boba-passion':      { type: 'popping', fill: '#ff8028', shine: '#ffc078', stroke: '#a84810' },
      'boba-lychee':       { type: 'popping', fill: '#fbeef2', shine: '#ffffff', stroke: '#c8a0b0' },
      'boba-coffee':       { type: 'popping', fill: '#5a3018', shine: '#a06838', stroke: '#2a1508' },
      'boba-peach':        { type: 'popping', fill: '#f585a0', shine: '#ffc0d0', stroke: '#b04060' }
    },
    stroke:        '#3d2817',
    iceFill:       '#d6ecf2',
    iceHighlight:  '#f5fbfc',
    cup:           '#fdfaf2',
    lid:           '#fdfaf2',
    straw:         '#e8806f',
    strawStripe:   '#fdfaf2'
  };

  const JELLY_COLORS = {
    'jelly-mango':      { fill: '#f0a020', shine: '#ffd870' },
    'jelly-passion':    { fill: '#e8c040', shine: '#ffe088' },
    'jelly-lychee':     { fill: '#f0d8dc', shine: '#ffffff' },
    'jelly-coffee':     { fill: '#7a4a25', shine: '#b08050' },
    'jelly-strawberry': { fill: '#d83860', shine: '#ff98b0' }
  };

  const GRASS_JELLY = {
    fill:           '#1a1510',
    edge:           '#0a0805',
    highlight:      '#6a5840',
    slimeHighlight: '#a89868'
  };

  const RAINBOW_COLORS = ['#e02838', '#ffffff', '#f5d028'];

  const ICE_POOL = [
    { x: 90,  y: 90,  size: 24, r: 12  },
    { x: 130, y: 120, size: 22, r: -15 },
    { x: 58,  y: 105, size: 22, r: -8  },
    { x: 148, y: 85,  size: 19, r: 6   },
    { x: 108, y: 148, size: 20, r: 22  },
    { x: 68,  y: 140, size: 21, r: -20 },
    { x: 48,  y: 82,  size: 18, r: 18  },
    { x: 138, y: 152, size: 19, r: -10 },
    { x: 95,  y: 115, size: 20, r: 4   },
    { x: 155, y: 135, size: 18, r: 14  }
  ];

  const ICE_COUNT = { none: 0, less: 3, regular: 6, extra: 10 };

  const TOPPING_SLOTS = [
    { x: 48,  y: 247, rot: -15 }, { x: 66,  y: 240, rot: 20  }, { x: 82,  y: 248, rot: -8  },
    { x: 100, y: 242, rot: 35  }, { x: 116, y: 249, rot: -25 }, { x: 134, y: 241, rot: 12  },
    { x: 152, y: 247, rot: -40 }, { x: 56,  y: 230, rot: 50  }, { x: 74,  y: 232, rot: -30 },
    { x: 92,  y: 228, rot: 15  }, { x: 110, y: 232, rot: -50 }, { x: 128, y: 230, rot: 25  },
    { x: 146, y: 232, rot: -10 }, { x: 64,  y: 218, rot: 45  }, { x: 86,  y: 220, rot: -22 },
    { x: 106, y: 218, rot: 60  }, { x: 124, y: 220, rot: -35 }, { x: 142, y: 218, rot: 8   },
    { x: 78,  y: 208, rot: -55 }, { x: 100, y: 206, rot: 30  }, { x: 122, y: 208, rot: -18 }
  ];

  const LIQ_TOP        = 72;
  const LIQ_BOTTOM     = 255;
  const POUR_STREAM_X  = 88;
  const POUR_STREAM_TOP = 62;

  const TOPPING_DRIFT = { x: 3.5, y: 2.2, rot: 7   };
  const ICE_DRIFT     = { x: 2.0, y: 1.2, rot: 3.5 };

  /* ── Pure helpers ───────────────────────────────────────────── */

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function assignSlots(toppings) {
    const out = [];
    const pieceIdx = {};
    toppings.forEach(t => pieceIdx[t] = 0);
    TOPPING_SLOTS.forEach((slot, i) => {
      const k = toppings[i % toppings.length];
      out.push({ slot, toppingKey: k, seedIdx: i, pieceIdx: pieceIdx[k]++, globalIdx: i });
    });
    return out;
  }

  function toppingSvgAt(toppingKey, x, y, rot, seedIdx, pieceIdx) {
    const s   = COLORS.stroke;
    const cfg = COLORS.toppings[toppingKey];

    if (cfg) {
      const r = 6.5 + (seedIdx % 3) * 0.6;
      if (cfg.type === 'pearl') {
        return `<circle cx="${x}" cy="${y}" r="${r}" fill="${cfg.fill}" stroke="${s}" stroke-width="1.1"/>
                <circle cx="${x - r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.28}" fill="${cfg.shine}" opacity="0.6"/>`;
      }
      if (cfg.type === 'crystal') {
        return `<circle cx="${x}" cy="${y}" r="${r}" fill="${cfg.fill}" stroke="${cfg.stroke}" stroke-width="1.1" opacity="0.82"/>
                <circle cx="${x - r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.3}" fill="${cfg.shine}" opacity="0.9"/>`;
      }
      if (cfg.type === 'popping') {
        return `<circle cx="${x}" cy="${y}" r="${r}" fill="${cfg.fill}" stroke="${cfg.stroke}" stroke-width="1.1" opacity="0.92"/>
                <circle cx="${x}" cy="${y + r * 0.15}" r="${r * 0.45}" fill="${cfg.stroke}" opacity="0.38"/>
                <circle cx="${x - r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.28}" fill="${cfg.shine}" opacity="0.85"/>`;
      }
    }

    if (toppingKey === 'jelly-grass') {
      const dims = [{ w: 18, h: 12 }, { w: 14, h: 16 }, { w: 19, h: 11 }, { w: 13, h: 17 }, { w: 20, h: 12 }, { w: 15, h: 14 }];
      const d  = dims[seedIdx % dims.length];
      const rx = 3 + (seedIdx % 3);
      return `<g transform="translate(${x} ${y}) rotate(${rot})">
        <rect x="${-d.w/2 - 0.5}" y="${-d.h/2 - 0.5}" width="${d.w + 1}" height="${d.h + 1}" rx="${rx + 0.5}" fill="${GRASS_JELLY.edge}" opacity="0.6"/>
        <rect x="${-d.w/2}" y="${-d.h/2}" width="${d.w}" height="${d.h}" rx="${rx}" fill="${GRASS_JELLY.fill}" stroke="${GRASS_JELLY.edge}" stroke-width="1.2"/>
        <ellipse cx="${-d.w/2 + d.w*0.3}" cy="${-d.h/2 + d.h*0.3}" rx="${d.w*0.25}" ry="${d.h*0.18}" fill="${GRASS_JELLY.slimeHighlight}" opacity="0.55"/>
        <ellipse cx="${-d.w/2 + d.w*0.28}" cy="${-d.h/2 + d.h*0.28}" rx="${d.w*0.12}" ry="${d.h*0.08}" fill="#d8c890" opacity="0.75"/>
      </g>`;
    }

    const dims = [{ w: 12, h: 7 }, { w: 8, h: 10 }, { w: 11, h: 6 }, { w: 7, h: 11 }, { w: 13, h: 7 }, { w: 9, h: 9 }];
    const d = dims[seedIdx % dims.length];

    if (toppingKey === 'jelly-rainbow') {
      const color = RAINBOW_COLORS[pieceIdx % 3];
      const shine = color === '#ffffff' ? '#e8e8e8' : '#ffffff';
      return `<g transform="translate(${x} ${y}) rotate(${rot})">
        <rect x="${-d.w/2}" y="${-d.h/2}" width="${d.w}" height="${d.h}" rx="2" fill="${color}" stroke="${s}" stroke-width="1"/>
        <rect x="${-d.w/2 + 1.5}" y="${-d.h/2 + 1}" width="${d.w*0.35}" height="1.3" rx="0.6" fill="${shine}" opacity="${color === '#ffffff' ? 0.5 : 0.7}"/>
      </g>`;
    }

    const jc = JELLY_COLORS[toppingKey];
    if (jc) {
      return `<g transform="translate(${x} ${y}) rotate(${rot})">
        <rect x="${-d.w/2}" y="${-d.h/2}" width="${d.w}" height="${d.h}" rx="2" fill="${jc.fill}" stroke="${s}" stroke-width="1"/>
        <rect x="${-d.w/2 + 1.5}" y="${-d.h/2 + 1}" width="${d.w*0.35}" height="1.3" rx="0.6" fill="${jc.shine}" opacity="0.7"/>
      </g>`;
    }

    return '';
  }

  function iceCubeSvg(p, offsetX, offsetY, extraRot) {
    const s  = COLORS.stroke;
    const hs = p.size / 2;
    return `<g transform="translate(${p.x + offsetX} ${p.y + offsetY}) rotate(${p.r + extraRot})">
      <rect x="${-hs}" y="${-hs}" width="${p.size}" height="${p.size}" rx="4" fill="${COLORS.iceFill}" stroke="${s}" stroke-width="1.6" opacity="0.88"/>
      <rect x="${-hs + 3}" y="${-hs + 3}" width="${p.size * 0.35}" height="2.5" rx="1" fill="${COLORS.iceHighlight}" opacity="0.95"/>
      <rect x="${-hs + 3}" y="${-hs + 7}" width="${p.size * 0.2}" height="1.5" rx="0.75" fill="${COLORS.iceHighlight}" opacity="0.8"/>
    </g>`;
  }

  function buildLiquidSvg(pouredLayers, partialTopFrac) {
    if (pouredLayers.length === 0) return { defs: '', body: '' };
    const n      = pouredLayers.length;
    const fullH  = LIQ_BOTTOM - LIQ_TOP;
    const layerH = fullH / n;
    const currentSurfaceY = LIQ_BOTTOM - (n - 1) * layerH - partialTopFrac * layerH;
    const topDown = [...pouredLayers].reverse();
    const stops = [];
    stops.push({ off: 0, color: topDown[0].color });
    topDown.forEach((c, i) => { stops.push({ off: (i + 0.5) / n, color: c.color }); });
    stops.push({ off: 1, color: topDown[n - 1].color });
    const stopsXml = stops.map(st => `<stop offset="${(st.off * 100).toFixed(2)}%" stop-color="${st.color}"/>`).join('');
    const gradId   = 'bcLG';
    const defs     = `<linearGradient id="${gradId}" x1="0" y1="${LIQ_TOP}" x2="0" y2="${LIQ_BOTTOM}" gradientUnits="userSpaceOnUse">${stopsXml}</linearGradient>`;
    const h        = LIQ_BOTTOM - currentSurfaceY;
    let body = `<rect x="20" y="${currentSurfaceY}" width="160" height="${h}" fill="url(#${gradId})" clip-path="url(#bcCupInside)"/>`;
    body += `<ellipse cx="100" cy="${currentSurfaceY}" rx="75" ry="2.2" fill="#ffffff" opacity="0.25" clip-path="url(#bcCupInside)"/>`;
    return { defs, body, currentSurfaceY };
  }

  function buildPourStream(toY, streamColor, phase) {
    const streamWidthBase = 9;
    const wobble  = Math.sin(phase * 0.06) * 0.8;
    const wobble2 = Math.cos(phase * 0.09) * 0.6;
    const x       = POUR_STREAM_X;
    const topY    = POUR_STREAM_TOP;
    const streamH = toY - topY;
    if (streamH <= 0) return '';
    const midY     = topY + streamH * 0.5;
    const leftTop  = x - streamWidthBase / 2;
    const rightTop = x + streamWidthBase / 2;
    const leftMid  = x - streamWidthBase / 2 - wobble;
    const rightMid = x + streamWidthBase / 2 + wobble2;
    const leftBot  = x - streamWidthBase / 2 + wobble2;
    const rightBot = x + streamWidthBase / 2 - wobble;
    const streamPath = `M ${leftTop} ${topY} L ${leftMid} ${midY} L ${leftBot} ${toY} L ${rightBot} ${toY} L ${rightMid} ${midY} L ${rightTop} ${topY} Z`;
    const splashSize = 7 + Math.sin(phase * 0.1) * 1.2;
    return `<path d="${streamPath}" fill="${streamColor}" opacity="0.95" clip-path="url(#bcCupInside)"/>
      <ellipse cx="${x}" cy="${toY}" rx="${splashSize}" ry="${splashSize * 0.3}" fill="${streamColor}" opacity="0.8" clip-path="url(#bcCupInside)"/>
      <rect x="${x - streamWidthBase / 2 + 1.5}" y="${topY + 3}" width="2" height="${streamH - 10}" fill="#ffffff" opacity="0.18" clip-path="url(#bcCupInside)"/>`;
  }

  function liquidsForState(st) {
    const arr = [];
    if (st.syrup !== 'none') arr.push({ key: 'syrup', color: COLORS.syrup[st.syrup],  id: st.syrup });
    if (st.milk  !== 'none') arr.push({ key: 'milk',  color: COLORS.milk[st.milk],    id: st.milk  });
    if (st.tea   !== 'none') arr.push({ key: 'tea',   color: COLORS.tea[st.tea],      id: st.tea   });
    return arr;
  }

  function liquidsEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i].key !== b[i].key || a[i].id !== b[i].id) return false;
    }
    return true;
  }

  /* ── mount() — creates a cup instance ──────────────────────── */

  function mount(container, options) {
    options = options || {};

    if (!container) {
      console.warn('BobaCup: container not found');
      return { update() {}, replay() {}, destroy() {} };
    }

    // Per-instance state
    const state = {
      tea: 'none', milk: 'none', syrup: 'none',
      sugar: '50', ice: 'regular', toppings: []
    };
    const rendered = {
      tea: 'none', milk: 'none', syrup: 'none',
      ice: 'regular', toppings: []
    };
    const animState = {
      liquids: [], pouringLayer: null, items: [],
      activeActionIdx: 0, actionStart: 0, pendingActions: []
    };
    const blendState = { active: false, color: '#000', start: 0, duration: 250 };
    let animHandle = null;
    let idlePhase  = 0;

    /* ── Timeline planner ─────────────────────────────────────── */

    function planTimeline() {
      const actions = [];
      const targetLiquids   = liquidsForState(state);
      const renderedLiquids = liquidsForState(rendered);
      const liquidsChanged  = !liquidsEqual(targetLiquids, renderedLiquids);
      const targetToppings  = state.toppings.slice();
      const renderedToppings = rendered.toppings.slice();
      const toppingsChanged = JSON.stringify(targetToppings) !== JSON.stringify(renderedToppings);
      const targetIce   = state.ice;
      const renderedIce = rendered.ice;
      const iceChanged  = targetIce !== renderedIce;

      if (liquidsChanged) {
        actions.push({ type: 'clearLiquids' });
        if (animState.items.length > 0) {
          actions.push({ type: 'clearPlaced' });
        }
        const POUR_MS  = 650;
        const PAUSE_MS = 180;
        targetLiquids.forEach((lq, i) => {
          actions.push({
            type: 'pourLayer', layerId: lq.id, layerKey: lq.key,
            layerIndex: i, totalLayers: targetLiquids.length,
            color: lq.color, duration: POUR_MS
          });
          if (i < targetLiquids.length - 1) {
            actions.push({ type: 'pause', duration: PAUSE_MS });
          }
        });
        actions.push({ type: 'pause', duration: 180 });
        if (targetToppings.length > 0) {
          const assignments = assignSlots(targetToppings);
          const byType = {};
          targetToppings.forEach(t => byType[t] = []);
          assignments.forEach(a => byType[a.toppingKey].push(a));
          targetToppings.forEach(t => {
            const shuffled = shuffle(byType[t]);
            shuffled.forEach(a => actions.push({ type: 'addTopping', assignment: a, delay: 50 }));
            actions.push({ type: 'pause', duration: 60 });
          });
        }
        if (ICE_COUNT[targetIce] > 0) {
          const iceOrder = shuffle(Array.from({ length: ICE_COUNT[targetIce] }, (_, i) => i));
          iceOrder.forEach(idx => {
            actions.push({ type: 'addIce', iceIdx: idx, delay: 45 });
          });
        }
      } else if (toppingsChanged || iceChanged) {
        const removed = renderedToppings.filter(t => !targetToppings.includes(t));
        const added   = targetToppings.filter(t => !renderedToppings.includes(t));
        if (removed.length > 0) {
          actions.push({ type: 'removeToppings', keys: removed });
        }
        if (added.length > 0) {
          const newAssignments = assignSlots(targetToppings);
          added.forEach(newKey => {
            const slotsForThis = newAssignments.filter(a => a.toppingKey === newKey);
            const shuffled = shuffle(slotsForThis);
            shuffled.forEach(a => actions.push({ type: 'addTopping', assignment: a, delay: 45 }));
            actions.push({ type: 'pause', duration: 50 });
          });
          actions.push({ type: 'rebalanceToppings', assignments: newAssignments });
        } else if (removed.length > 0) {
          const newAssignments = assignSlots(targetToppings);
          actions.push({ type: 'rebalanceToppings', assignments: newAssignments });
        }
        if (iceChanged) {
          const oldCount = ICE_COUNT[renderedIce];
          const newCount = ICE_COUNT[targetIce];
          if (newCount < oldCount) {
            actions.push({ type: 'removeIce', from: newCount, to: oldCount });
          } else if (newCount > oldCount) {
            const newIndices = shuffle(Array.from({ length: newCount - oldCount }, (_, i) => oldCount + i));
            newIndices.forEach(idx => {
              actions.push({ type: 'addIce', iceIdx: idx, delay: 45 });
            });
          }
        }
      }
      return actions;
    }

    /* ── Animation engine ─────────────────────────────────────── */

    function processActionStart(action, now) {
      if (action.type === 'clearLiquids') {
        animState.liquids = [];
      } else if (action.type === 'clearPlaced') {
        animState.items = [];
      } else if (action.type === 'pourLayer') {
        animState.pouringLayer = {
          layerKey: action.layerKey, layerId: action.layerId,
          layerIndex: action.layerIndex, totalLayers: action.totalLayers,
          color: action.color, startTime: now, duration: action.duration
        };
      } else if (action.type === 'addTopping') {
        animState.items.push({
          kind: 'topping', toppingKey: action.assignment.toppingKey,
          slot: action.assignment.slot, seedIdx: action.assignment.seedIdx,
          pieceIdx: action.assignment.pieceIdx, placedAt: now,
          phaseSeed: Math.random() * Math.PI * 2, freqSeed: Math.random()
        });
      } else if (action.type === 'addIce') {
        const p = ICE_POOL[action.iceIdx];
        animState.items.push({
          kind: 'ice', iceIdx: action.iceIdx, icePos: p,
          placedAt: now, phaseSeed: Math.random() * Math.PI * 2, freqSeed: Math.random()
        });
      } else if (action.type === 'removeToppings') {
        animState.items = animState.items.filter(it =>
          it.kind !== 'topping' || !action.keys.includes(it.toppingKey)
        );
      } else if (action.type === 'removeIce') {
        animState.items = animState.items.filter(it =>
          it.kind !== 'ice' || it.iceIdx < action.from
        );
      } else if (action.type === 'rebalanceToppings') {
        const existing = animState.items.filter(it => it.kind === 'topping');
        const newItems = action.assignments.map(a => {
          const match = existing.find(it => it.toppingKey === a.toppingKey && it.pieceIdx === a.pieceIdx);
          return {
            kind: 'topping', toppingKey: a.toppingKey, slot: a.slot,
            seedIdx: a.seedIdx, pieceIdx: a.pieceIdx,
            placedAt:  match ? match.placedAt  : now,
            phaseSeed: match ? match.phaseSeed : Math.random() * Math.PI * 2,
            freqSeed:  match ? match.freqSeed  : Math.random()
          };
        });
        const iceItems = animState.items.filter(it => it.kind === 'ice');
        animState.items = [...newItems, ...iceItems];
      }
    }

    function actionDuration(action) {
      if (action.type === 'pourLayer') return action.duration;
      if (action.type === 'pause')     return action.duration;
      if (action.type === 'addTopping' || action.type === 'addIce') return action.delay;
      if (action.type === 'removeToppings' || action.type === 'removeIce') return 120;
      return 0;
    }

    function computeBlend() {
      if (animState.liquids.length === 0) return null;
      const weights = { tea: 0.5, milk: 0.7, syrup: 3.0 };
      let r2 = 0, g2 = 0, b2 = 0, total = 0;
      for (const liq of animState.liquids) {
        const w = weights[liq.key] || 1.0;
        const n = parseInt(liq.color.replace('#', ''), 16);
        const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
        r2 += r * r * w;  g2 += g * g * w;  b2 += b * b * w;
        total += w;
      }
      if (total === 0) return null;
      const r = Math.round(Math.sqrt(r2 / total));
      const g = Math.round(Math.sqrt(g2 / total));
      const b = Math.round(Math.sqrt(b2 / total));
      return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
    }

    function startTimeline(actions) {
      animState.pendingActions  = actions;
      animState.activeActionIdx = 0;
      animState.actionStart     = performance.now();
      if (!animHandle) { animHandle = requestAnimationFrame(tick); }
    }

    function tick(now) {
      const actions = animState.pendingActions;
      while (animState.activeActionIdx < actions.length) {
        const action  = actions[animState.activeActionIdx];
        const elapsed = now - animState.actionStart;
        const dur     = actionDuration(action);
        if (!action._started) {
          action._started = true;
          processActionStart(action, now);
        }
        if (action.type === 'pourLayer') {
          if (elapsed >= dur) {
            animState.liquids.push({ key: action.layerKey, id: action.layerId, color: action.color });
            animState.pouringLayer = null;
            animState.activeActionIdx++;
            animState.actionStart = now;
            continue;
          }
          break;
        } else {
          if (elapsed >= dur) {
            animState.activeActionIdx++;
            animState.actionStart = now;
            continue;
          }
          break;
        }
      }

      const timelineDone = animState.activeActionIdx >= actions.length && !animState.pouringLayer;
      if (timelineDone && animState.pendingActions.length > 0) {
        rendered.tea      = state.tea;
        rendered.milk     = state.milk;
        rendered.syrup    = state.syrup;
        rendered.ice      = state.ice;
        rendered.toppings = state.toppings.slice();
        animState.pendingActions = [];
      }

      renderFrame(now);
      idlePhase  = now * 0.001;
      animHandle = requestAnimationFrame(tick);
    }

    /* ── Render ───────────────────────────────────────────────── */

    function renderFrame(now) {
      const fullLayers   = animState.liquids.slice();
      let partialTopFrac = 1;

      if (animState.pouringLayer) {
        const pl = animState.pouringLayer;
        const t  = Math.min(1, (now - pl.startTime) / pl.duration);
        fullLayers.push({ key: pl.layerKey, color: pl.color, id: pl.layerId });
        partialTopFrac = easeOutCubic(t);
      }

      const liq = buildLiquidSvg(fullLayers, partialTopFrac);

      let streamSvg = '';
      if (animState.pouringLayer) {
        const pl = animState.pouringLayer;
        const t  = Math.min(1, (now - pl.startTime) / pl.duration);
        const n  = fullLayers.length;
        const fullH   = LIQ_BOTTOM - LIQ_TOP;
        const layerH  = fullH / n;
        const surfaceY = LIQ_BOTTOM - (n - 1) * layerH - easeOutCubic(t) * layerH;
        const streamOpacity = t < 0.88 ? 1 : Math.max(0, 1 - (t - 0.88) / 0.12);
        if (streamOpacity > 0) {
          streamSvg = `<g opacity="${streamOpacity.toFixed(2)}">${buildPourStream(surfaceY, pl.color, now * 0.5)}</g>`;
        }
      }

      const DROP_DURATION  = 220;
      const toppingItems   = animState.items.filter(it => it.kind === 'topping');
      const iceItems       = animState.items.filter(it => it.kind === 'ice');

      function renderItem(it, isIce) {
        const sinceDrop   = now - it.placedAt;
        const dropT       = Math.min(1, sinceDrop / DROP_DURATION);
        const dropEased   = easeOutCubic(dropT);
        const dropOffset  = (1 - dropEased) * -30;
        const dropOpacity = dropEased;
        let driftX = 0, driftY = 0, driftRot = 0;
        if (dropT >= 1) {
          const phase = idlePhase + it.phaseSeed;
          const freq  = it.freqSeed || 0.5;
          const fx    = 0.5 + freq * 0.7;
          const fy    = 0.35 + freq * 0.5;
          const mag   = isIce ? ICE_DRIFT : TOPPING_DRIFT;
          driftX   = Math.sin(phase * fx) * mag.x;
          driftY   = Math.cos(phase * fy) * mag.y;
          driftRot = Math.sin(phase * 0.35 + it.phaseSeed) * mag.rot;
        }
        if (it.kind === 'topping') {
          const x   = it.slot.x + driftX;
          const y   = it.slot.y + dropOffset + driftY;
          const rot = it.slot.rot + driftRot;
          return `<g opacity="${dropOpacity.toFixed(2)}">${toppingSvgAt(it.toppingKey, x, y, rot, it.seedIdx, it.pieceIdx)}</g>`;
        } else {
          return `<g opacity="${dropOpacity.toFixed(2)}">${iceCubeSvg(it.icePos, driftX, dropOffset + driftY, driftRot)}</g>`;
        }
      }

      const toppingSvg = toppingItems.map(it => renderItem(it, false)).join('');
      const iceSvg     = iceItems.map(it => renderItem(it, true)).join('');

      const cupPath = `M 20 60 L 180 60 L 166 250 Q 166 258 158 258 L 42 258 Q 34 258 34 250 Z`;
      const lidPath = `M 16 60 Q 16 48 28 48 L 172 48 Q 184 48 184 60 Z`;
      const s       = COLORS.stroke;
      const strawSvg = `
        <g transform="translate(118 -4) rotate(12)">
          <path d="M -7 8 Q -7 0 0 0 Q 7 0 7 8 L 7 128 L -7 128 Z" fill="${COLORS.straw}" stroke="${s}" stroke-width="1.4" stroke-linejoin="round"/>
          <rect x="-7" y="28" width="14" height="6" fill="${COLORS.strawStripe}" opacity="0.8"/>
          <rect x="-7" y="56" width="14" height="6" fill="${COLORS.strawStripe}" opacity="0.8"/>
          <rect x="-7" y="84" width="14" height="6" fill="${COLORS.strawStripe}" opacity="0.8"/>
        </g>`;
      const shineSvg = `<path d="M 42 80 Q 40 160 48 240" stroke="#ffffff" stroke-width="4" fill="none" opacity="0.5" stroke-linecap="round"/>`;

      let blendRectSvg = '';
      if (blendState.active) {
        const elapsed = performance.now() - blendState.start;
        const opacity = easeOutCubic(Math.min(1, elapsed / blendState.duration));
        blendRectSvg = `<rect x="20" y="${LIQ_TOP}" width="160" height="${LIQ_BOTTOM - LIQ_TOP}" fill="${blendState.color}" opacity="${opacity.toFixed(3)}" clip-path="url(#bcCupInside)"/>`;
      }

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 320" width="100%" height="100%" role="img" aria-label="Boba drink preview">
  <defs>
    <clipPath id="bcCupInside"><path d="M 22 62 L 178 62 L 164 248 Q 164 254 158 254 L 42 254 Q 36 254 36 248 Z"/></clipPath>
    ${liq.defs}
  </defs>
  ${strawSvg}
  <path d="${cupPath}" fill="${COLORS.cup}" stroke="${s}" stroke-width="2.2" stroke-linejoin="round"/>
  ${liq.body}
  ${blendRectSvg}
  ${streamSvg}
  <g clip-path="url(#bcCupInside)">${toppingSvg}</g>
  ${shineSvg}
  <g clip-path="url(#bcCupInside)">${iceSvg}</g>
  <path d="${cupPath}" fill="none" stroke="${s}" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="${lidPath}" fill="${COLORS.lid}" stroke="${s}" stroke-width="2"/>
  <line x1="16" y1="60" x2="184" y2="60" stroke="${s}" stroke-width="1.5"/>
</svg>`;

      container.innerHTML = svg;
    }

    /* ── Public API ───────────────────────────────────────────── */

    function update(drinkState) {
      const newTea   = drinkState.tea   || 'none';
      const newMilk  = drinkState.milk  || 'none';
      const newSyrup = drinkState.syrup || 'none';

      // Clear blend when a liquid ingredient changes
      if (blendState.active && (newTea !== state.tea || newMilk !== state.milk || newSyrup !== state.syrup)) {
        blendState.active = false;
      }

      state.tea    = newTea;
      state.milk   = newMilk;
      state.syrup  = newSyrup;
      state.sugar  = drinkState.sugar  || '50';
      state.ice    = drinkState.ice    || 'regular';
      state.toppings = (drinkState.toppings || []).slice();

      if (options.sugarLabelEl) {
        options.sugarLabelEl.textContent = state.sugar + '%';
      }

      const actions = planTimeline();
      if (actions.length > 0) {
        startTimeline(actions);
      } else {
        renderFrame(performance.now());
      }
    }

    function replay() {
      rendered.tea      = 'none';
      rendered.milk     = 'none';
      rendered.syrup    = 'none';
      rendered.ice      = 'regular';
      rendered.toppings = [];
      animState.liquids = [];
      animState.items   = [];
      const actions = planTimeline();
      if (actions.length > 0) startTimeline(actions);
    }

    function destroy() {
      if (animHandle) cancelAnimationFrame(animHandle);
      animHandle = null;
      container.innerHTML = '';
    }

    // Kick off the rAF loop so idle drift runs even before the first update
    animHandle = requestAnimationFrame(tick);

    function startBlend(durationMs) {
      const color = computeBlend();
      if (!color) return;
      blendState.active   = true;
      blendState.color    = color;
      blendState.duration = durationMs || 250;
      blendState.start    = performance.now();
    }

    function clearBlend() {
      blendState.active = false;
    }

    return { update, replay, destroy, startBlend, clearBlend };
  }

  return { mount };

})();
