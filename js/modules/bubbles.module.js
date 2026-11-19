import { store } from '../core/state.js';
import { playCuteBubblePop, speakWord } from '../core/audio.js';
import { BUBBLE_WORDS_POOL } from '../data/bubbles.data.js';

const MAX_ACTIVE_BUBBLES = 8;
const SPAWN_INTERVAL_MS = 1050;

const BUBBLE_TINTS = [
  { fill: 0xBAE6FD, rim: 0x38BDF8 },
  { fill: 0xDDD6FE, rim: 0xA78BFA },
  { fill: 0xFBCFE8, rim: 0xF472B6 },
  { fill: 0xBBF7D0, rim: 0x4ADE80 },
  { fill: 0xFEF08A, rim: 0xFACC15 }
];

const BURST_COLORS = [0x38BDF8, 0xA78BFA, 0xF472B6, 0x58CC02, 0xFFC800];

let pixiApp = null;
let skyLayer = null;
let bubblesLayer = null;
let fxLayer = null;

let bubbleSpawnInterval = null;
let bubbleScore = 0;
let isBubbleModeActive = false;

let activeBubbles = [];
let activeClouds = [];
let activeParticles = [];
let activeFloatTexts = [];

let bubbleSky = null;
let bubbleScoreDisplay = null;

export function initBubblesDOM() {
  bubbleSky = document.getElementById('bubbleSky');
  bubbleScoreDisplay = document.getElementById('bubbleScore');
}

function drawSkyBackground(width, height) {
  const PIXI = window.PIXI;
  if (!skyLayer || !PIXI) return;

  skyLayer.removeChildren();
  activeClouds = [];

  const bg = new PIXI.Graphics();
  // Soft sky bands
  bg.rect(0, 0, width, height * 0.45).fill(0xBAE6FD);
  bg.rect(0, height * 0.45, width, height * 0.35).fill(0xE0F2FE);
  bg.rect(0, height * 0.8, width, height * 0.2).fill(0xDCFCE7);

  // Smiling sun in top-right corner
  const sunX = Math.max(60, width - 56);
  const sunY = 58;
  bg.circle(sunX, sunY, 38).fill({ color: 0xFDE047, alpha: 0.35 });
  bg.circle(sunX, sunY, 26).fill(0xFACC15);

  skyLayer.addChild(bg);

  // Fluffy drifting clouds
  const cloudCount = 4;
  for (let i = 0; i < cloudCount; i++) {
    const cloud = new PIXI.Graphics();
    cloud.circle(0, 0, 22).fill({ color: 0xFFFFFF, alpha: 0.85 });
    cloud.circle(22, -6, 26).fill({ color: 0xFFFFFF, alpha: 0.85 });
    cloud.circle(46, 0, 20).fill({ color: 0xFFFFFF, alpha: 0.85 });
    cloud.roundRect(-16, 4, 78, 20, 10).fill({ color: 0xFFFFFF, alpha: 0.85 });

    cloud.x = (width / cloudCount) * i + Math.random() * 40;
    cloud.y = 48 + (i % 2) * 52 + Math.random() * 20;
    const scale = 0.75 + (i % 3) * 0.18;
    cloud.scale.set(scale);

    skyLayer.addChild(cloud);
    activeClouds.push({
      graphic: cloud,
      speed: 12 + Math.random() * 14
    });
  }
}

function createBubbleGraphic(tint, radius) {
  const PIXI = window.PIXI;
  const g = new PIXI.Graphics();

  // Translucent glossy bubble sphere
  g.circle(0, 0, radius)
    .fill({ color: tint.fill, alpha: 0.42 })
    .stroke({ width: 3, color: 0xFFFFFF, alpha: 0.9 });

  // Inner rim glow
  g.circle(0, 0, radius - 3)
    .stroke({ width: 2, color: tint.rim, alpha: 0.38 });

  // Top-left specular highlight
  g.ellipse(-radius * 0.34, -radius * 0.36, radius * 0.24, radius * 0.13)
    .fill({ color: 0xFFFFFF, alpha: 0.85 });
  g.circle(-radius * 0.52, -radius * 0.14, radius * 0.08)
    .fill({ color: 0xFFFFFF, alpha: 0.75 });

  return g;
}

function spawnBubble(initialProgress = 0) {
  const PIXI = window.PIXI;
  if (!pixiApp || !bubblesLayer || !PIXI || !isBubbleModeActive) return;

  const width = pixiApp.screen.width;
  const height = pixiApp.screen.height;
  if (width <= 0 || height <= 0) return;

  const item = BUBBLE_WORDS_POOL[Math.floor(Math.random() * BUBBLE_WORDS_POOL.length)];
  const tint = BUBBLE_TINTS[Math.floor(Math.random() * BUBBLE_TINTS.length)];
  const radius = Math.max(46, Math.min(58, width * 0.13));

  const container = new PIXI.Container();
  const bubbleBg = createBubbleGraphic(tint, radius);

  const emojiText = new PIXI.Text({
    text: item.emoji,
    style: {
      fontSize: Math.round(radius * 0.78)
    }
  });
  emojiText.anchor.set(0.5);
  emojiText.y = -radius * 0.2;

  const wordLabel = new PIXI.Text({
    text: item.word,
    style: {
      fontFamily: 'Nunito, -apple-system, BlinkMacSystemFont, sans-serif',
      fontSize: 14,
      fontWeight: '900',
      fill: 0x1E293B
    }
  });
  wordLabel.anchor.set(0.5);

  const pillW = Math.max(64, wordLabel.width + 18);
  const pillH = 24;
  const wordPill = new PIXI.Graphics();
  wordPill.roundRect(-pillW / 2, -pillH / 2, pillW, pillH, 12)
    .fill({ color: 0xFFFFFF, alpha: 0.95 })
    .stroke({ width: 2, color: tint.rim, alpha: 0.7 });

  const pillGroup = new PIXI.Container();
  pillGroup.y = radius * 0.44;
  pillGroup.addChild(wordPill);
  pillGroup.addChild(wordLabel);

  container.addChild(bubbleBg);
  container.addChild(emojiText);
  container.addChild(pillGroup);

  const margin = radius + 14;
  const baseX = margin + Math.random() * Math.max(40, width - margin * 2);
  const startY = height + radius + 20;
  const endY = -radius - 30;

  container.x = baseX;
  container.y = initialProgress > 0
    ? startY + (endY - startY) * initialProgress
    : startY;

  container.eventMode = 'static';
  container.cursor = 'pointer';
  container.hitArea = new PIXI.Circle(0, 0, radius + 12);

  const entity = {
    container,
    baseX,
    radius,
    speedY: 115 + Math.random() * 55, // Fast & lively upward rise
    wobblePhase: Math.random() * Math.PI * 2,
    wobbleSpeed: 2.2 + Math.random() * 1.2,
    wobbleAmp: 12 + Math.random() * 10,
    item,
    popped: false,
    popElapsed: 0
  };

  container.on('pointerdown', (e) => {
    e.stopPropagation();
    popBubble(entity);
  });

  bubblesLayer.addChild(container);
  activeBubbles.push(entity);
}

function spawnBurstParticles(x, y) {
  const PIXI = window.PIXI;
  if (!fxLayer || !PIXI) return;

  const count = 9;
  for (let i = 0; i < count; i++) {
    const color = BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)];
    const p = new PIXI.Graphics();
    p.circle(0, 0, 5 + Math.random() * 5).fill(color);
    p.x = x;
    p.y = y;

    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const speed = 100 + Math.random() * 105;

    fxLayer.addChild(p);
    activeParticles.push({
      graphic: p,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: 0.46
    });
  }
}

function spawnScoreFloat(x, y) {
  const PIXI = window.PIXI;
  if (!fxLayer || !PIXI) return;

  const txt = new PIXI.Text({
    text: '+1 ⭐',
    style: {
      fontFamily: 'Nunito, -apple-system, BlinkMacSystemFont, sans-serif',
      fontSize: 22,
      fontWeight: '900',
      fill: 0x58CC02,
      stroke: { color: 0xFFFFFF, width: 4 }
    }
  });
  txt.anchor.set(0.5);
  txt.x = x;
  txt.y = y - 10;

  fxLayer.addChild(txt);
  activeFloatTexts.push({
    text: txt,
    life: 0,
    maxLife: 0.7
  });
}

function popBubble(entity) {
  if (entity.popped) return;
  entity.popped = true;
  entity.container.eventMode = 'none';

  playCuteBubblePop();
  speakWord(entity.item.word);

  const { x, y } = entity.container;
  spawnBurstParticles(x, y);
  spawnScoreFloat(x, y);

  bubbleScore++;
  if (bubbleScoreDisplay) {
    bubbleScoreDisplay.textContent = bubbleScore;
  }
  store.gems += 1;

  if (bubbleScore % 10 === 0 && typeof confetti === 'function' && bubbleSky) {
    const rect = bubbleSky.getBoundingClientRect();
    confetti({
      particleCount: 55,
      spread: 75,
      origin: {
        x: (rect.left + x) / window.innerWidth,
        y: (rect.top + y) / window.innerHeight
      },
      colors: ['#58CC02', '#FFC800', '#1CB0F6', '#FF4B4B', '#CE82FF']
    });
    setTimeout(() => {
      speakWord(`Awesome! ${bubbleScore} bubbles!`);
    }, 320);
  }
}

function updateTick(ticker) {
  if (!pixiApp || !isBubbleModeActive) return;

  const dt = Math.min(ticker.deltaMS, 50) / 1000;
  const width = pixiApp.screen.width;

  // Drift clouds
  for (const c of activeClouds) {
    c.graphic.x += c.speed * dt;
    if (c.graphic.x > width + 90) {
      c.graphic.x = -90;
    }
  }

  // Update bubbles
  for (let i = activeBubbles.length - 1; i >= 0; i--) {
    const b = activeBubbles[i];
    if (b.popped) {
      b.popElapsed += dt;
      const progress = Math.min(1, b.popElapsed / 0.2);
      b.container.scale.set(1 + progress * 0.55);
      b.container.alpha = 1 - progress;
      if (progress >= 1) {
        b.container.destroy({ children: true });
        activeBubbles.splice(i, 1);
      }
      continue;
    }

    b.wobblePhase += b.wobbleSpeed * dt;
    b.container.y -= b.speedY * dt;
    b.container.x = b.baseX + Math.sin(b.wobblePhase) * b.wobbleAmp;

    if (b.container.y < -b.radius - 40) {
      b.container.destroy({ children: true });
      activeBubbles.splice(i, 1);
    }
  }

  // Update burst particles
  for (let i = activeParticles.length - 1; i >= 0; i--) {
    const p = activeParticles[i];
    p.life += dt;
    const progress = Math.min(1, p.life / p.maxLife);
    p.graphic.x += p.vx * dt;
    p.graphic.y += p.vy * dt;
    p.graphic.alpha = 1 - progress;
    p.graphic.scale.set(1 - progress * 0.6);
    if (progress >= 1) {
      p.graphic.destroy();
      activeParticles.splice(i, 1);
    }
  }

  // Update floating +1 score texts
  for (let i = activeFloatTexts.length - 1; i >= 0; i--) {
    const ft = activeFloatTexts[i];
    ft.life += dt;
    const progress = Math.min(1, ft.life / ft.maxLife);
    ft.text.y -= 55 * dt;
    ft.text.alpha = progress < 0.25 ? progress / 0.25 : 1 - (progress - 0.25) / 0.75;
    if (progress >= 1) {
      ft.text.destroy();
      activeFloatTexts.splice(i, 1);
    }
  }
}

export async function startBubbleMode() {
  if (!bubbleSky) initBubblesDOM();
  if (!bubbleSky || !window.PIXI) return;

  isBubbleModeActive = true;

  if (bubbleSky.clientWidth === 0 || bubbleSky.clientHeight === 0) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    if (!isBubbleModeActive) return;
  }

  if (!pixiApp) {
    const app = new window.PIXI.Application();
    await app.init({
      resizeTo: bubbleSky,
      backgroundAlpha: 0,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true
    });

    if (!isBubbleModeActive) {
      app.destroy(true, { children: true });
      return;
    }

    pixiApp = app;
    bubbleSky.innerHTML = '';
    bubbleSky.appendChild(pixiApp.canvas);

    skyLayer = new window.PIXI.Container();
    bubblesLayer = new window.PIXI.Container();
    fxLayer = new window.PIXI.Container();

    pixiApp.stage.addChild(skyLayer);
    pixiApp.stage.addChild(bubblesLayer);
    pixiApp.stage.addChild(fxLayer);

    drawSkyBackground(pixiApp.screen.width, pixiApp.screen.height);
    pixiApp.renderer.on('resize', (w, h) => {
      drawSkyBackground(w, h);
    });

    pixiApp.ticker.add(updateTick);
  }

  if (bubbleSpawnInterval) clearInterval(bubbleSpawnInterval);

  if (activeBubbles.length < 3) {
    spawnBubble(0.22);
    spawnBubble(0.5);
    spawnBubble(0.76);
  }

  bubbleSpawnInterval = setInterval(() => {
    if (!isBubbleModeActive || !pixiApp) return;
    if (activeBubbles.length < MAX_ACTIVE_BUBBLES) {
      spawnBubble(0);
    }
  }, SPAWN_INTERVAL_MS);
}

export function stopBubbleMode() {
  isBubbleModeActive = false;
  if (bubbleSpawnInterval) {
    clearInterval(bubbleSpawnInterval);
    bubbleSpawnInterval = null;
  }

  activeBubbles = [];
  activeClouds = [];
  activeParticles = [];
  activeFloatTexts = [];

  if (pixiApp) {
    pixiApp.destroy(true, { children: true });
    pixiApp = null;
    skyLayer = null;
    bubblesLayer = null;
    fxLayer = null;
  }
}

export const BubblesModule = {
  mount() {
    initBubblesDOM();
    startBubbleMode();
  },
  unmount() {
    stopBubbleMode();
  }
};
