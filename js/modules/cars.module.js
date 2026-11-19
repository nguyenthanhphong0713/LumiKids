import { store } from '../core/state.js';
import { playCuteBubblePop, speakWord } from '../core/audio.js';
import { CAR_WORDS_POOL, CAR_COLOR_PALETTES, CAR_BURST_COLORS } from '../data/cars.data.js';

const LANE_COUNT = 5;
const MAX_ACTIVE_CARS = 8;
const SPAWN_INTERVAL_MS = 900;

let pixiApp = null;
let roadLayer = null;
let carsLayer = null;
let fxLayer = null;

let carSpawnInterval = null;
let carsScore = 0;
let isCarsModeActive = false;

let activeCars = [];
let activeParticles = [];
let activeFloatTexts = [];

let carsStage = null;
let carsScoreDisplay = null;

export function initCarsDOM() {
  carsStage = document.getElementById('carsStage');
  carsScoreDisplay = document.getElementById('carsScore');
}

function getRoadMetrics(width, height) {
  const grassPad = Math.max(12, Math.min(26, height * 0.04));
  const roadTop = grassPad;
  const roadHeight = Math.max(150, height - grassPad * 2);
  const laneHeight = roadHeight / LANE_COUNT;
  return { width, height, grassPad, roadTop, roadHeight, laneHeight };
}

function drawRoad(width, height) {
  const PIXI = window.PIXI;
  if (!roadLayer || !PIXI) return;

  roadLayer.removeChildren();
  const { grassPad, roadTop, roadHeight, laneHeight } = getRoadMetrics(width, height);

  const g = new PIXI.Graphics();

  // Top & bottom grass shoulders
  g.rect(0, 0, width, grassPad).fill(0x86EFAC);
  g.rect(0, roadTop + roadHeight, width, height - (roadTop + roadHeight)).fill(0x86EFAC);

  // Asphalt highway surface
  g.rect(0, roadTop, width, roadHeight).fill(0x334155);

  // Outer yellow curb lines
  g.rect(0, roadTop, width, 4).fill(0xFACC15);
  g.rect(0, roadTop + roadHeight - 4, width, 4).fill(0xFACC15);

  // Subtle alternating lane shading + dashed white dividers
  for (let i = 0; i < LANE_COUNT; i++) {
    const laneY = roadTop + i * laneHeight;
    if (i % 2 === 1) {
      g.rect(0, laneY, width, laneHeight).fill({ color: 0x1E293B, alpha: 0.25 });
    }

    if (i > 0) {
      const dashW = 28;
      const gapW = 22;
      for (let x = 10; x < width; x += dashW + gapW) {
        g.roundRect(x, laneY - 2, dashW, 4, 2).fill({ color: 0xFFFFFF, alpha: 0.65 });
      }
    }
  }

  roadLayer.addChild(g);
}

function createCarGraphic(palette) {
  const PIXI = window.PIXI;
  const carArt = new PIXI.Container();
  const g = new PIXI.Graphics();

  // Ground shadow
  g.roundRect(-52, 18, 104, 14, 7).fill({ color: 0x0F172A, alpha: 0.35 });

  // Main car body (facing right: +X)
  g.roundRect(-48, -6, 96, 30, 11).fill(palette.body);

  // Cabin / roof
  g.roundRect(-28, -24, 52, 22, 9).fill(palette.roof);

  // Windows
  g.roundRect(-22, -20, 18, 13, 4).fill(0xE0F2FE);
  g.roundRect(2, -20, 18, 13, 4).fill(0xE0F2FE);

  // Racing stripe
  g.roundRect(-46, 5, 92, 5, 2).fill({ color: palette.stripe, alpha: 0.85 });

  // Front headlight (+X) & rear taillight (-X)
  g.roundRect(41, 1, 7, 10, 3).fill(0xFEF08A);
  g.roundRect(-48, 2, 6, 9, 3).fill(0xEF4444);

  // Wheels
  g.circle(-26, 23, 11).fill(0x1E293B);
  g.circle(-26, 23, 5).fill(0xCBD5E1);
  g.circle(26, 23, 11).fill(0x1E293B);
  g.circle(26, 23, 5).fill(0xCBD5E1);

  carArt.addChild(g);
  return carArt;
}

function createWordBadge(item) {
  const PIXI = window.PIXI;
  const badge = new PIXI.Container();

  const label = new PIXI.Text({
    text: `${item.emoji} ${item.word}`,
    style: {
      fontFamily: 'Nunito, -apple-system, BlinkMacSystemFont, sans-serif',
      fontSize: 15,
      fontWeight: '900',
      fill: 0x1E293B
    }
  });
  label.anchor.set(0.5);

  const padX = 12;
  const pillW = Math.max(72, label.width + padX * 2);
  const pillH = 26;

  const bg = new PIXI.Graphics();
  bg.roundRect(-pillW / 2, -pillH / 2, pillW, pillH, 13)
    .fill(0xFFFFFF)
    .stroke({ width: 2.5, color: 0x38BDF8 });

  badge.addChild(bg);
  badge.addChild(label);
  return badge;
}

function isLaneEntryClear(laneIndex, direction, stageWidth) {
  const minGap = 150;
  for (const car of activeCars) {
    if (car.laneIndex !== laneIndex || car.popped) continue;
    if (direction === 1 && car.container.x < minGap) return false;
    if (direction === -1 && car.container.x > stageWidth - minGap) return false;
  }
  return true;
}

function spawnCar(initialProgress = 0) {
  const PIXI = window.PIXI;
  if (!pixiApp || !carsLayer || !PIXI || !isCarsModeActive) return;

  const width = pixiApp.screen.width;
  const height = pixiApp.screen.height;
  if (width <= 0 || height <= 0) return;

  const { roadTop, laneHeight } = getRoadMetrics(width, height);

  // Pick a lane that has room at its spawn edge
  const candidateLanes = [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5);
  let chosenLane = -1;
  for (const lane of candidateLanes) {
    const dir = lane % 2 === 0 ? 1 : -1;
    if (initialProgress > 0 || isLaneEntryClear(lane, dir, width)) {
      chosenLane = lane;
      break;
    }
  }
  if (chosenLane === -1) return;

  const direction = chosenLane % 2 === 0 ? 1 : -1;
  const item = CAR_WORDS_POOL[Math.floor(Math.random() * CAR_WORDS_POOL.length)];
  const palette = CAR_COLOR_PALETTES[Math.floor(Math.random() * CAR_COLOR_PALETTES.length)];

  const carContainer = new PIXI.Container();
  const carScale = Math.min(1.05, Math.max(0.68, laneHeight / 92));
  carContainer.scale.set(carScale);

  const carArt = createCarGraphic(palette);
  carArt.scale.x = direction;
  carArt.y = 12;

  const wordBadge = createWordBadge(item);
  wordBadge.y = -24;

  carContainer.addChild(carArt);
  carContainer.addChild(wordBadge);

  const startX = direction === 1 ? -75 : width + 75;
  const endX = direction === 1 ? width + 85 : -85;
  const xPos = initialProgress > 0
    ? startX + (endX - startX) * initialProgress
    : startX;

  carContainer.x = xPos;
  carContainer.y = roadTop + chosenLane * laneHeight + laneHeight * 0.5;

  carContainer.eventMode = 'static';
  carContainer.cursor = 'pointer';
  carContainer.hitArea = new PIXI.Rectangle(-65, -45, 130, 88);

  const carEntity = {
    container: carContainer,
    laneIndex: chosenLane,
    direction,
    speed: (125 + Math.random() * 75) * direction,
    item,
    popped: false,
    popElapsed: 0
  };

  carContainer.on('pointerdown', (e) => {
    e.stopPropagation();
    popCar(carEntity);
  });

  carsLayer.addChild(carContainer);
  activeCars.push(carEntity);
}

function spawnBurstParticles(x, y) {
  const PIXI = window.PIXI;
  if (!fxLayer || !PIXI) return;

  const count = 10;
  for (let i = 0; i < count; i++) {
    const color = CAR_BURST_COLORS[Math.floor(Math.random() * CAR_BURST_COLORS.length)];
    const p = new PIXI.Graphics();
    const radius = 5 + Math.random() * 5;
    p.circle(0, 0, radius).fill(color);
    p.x = x;
    p.y = y;

    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const speed = 110 + Math.random() * 110;

    fxLayer.addChild(p);
    activeParticles.push({
      graphic: p,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: 0.48
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
      fill: 0xFFC800,
      stroke: { color: 0x1E293B, width: 4 }
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

function popCar(carEntity) {
  if (carEntity.popped) return;
  carEntity.popped = true;
  carEntity.container.eventMode = 'none';

  playCuteBubblePop();
  speakWord(carEntity.item.word);

  const { x, y } = carEntity.container;
  spawnBurstParticles(x, y);
  spawnScoreFloat(x, y);

  carsScore++;
  if (carsScoreDisplay) {
    carsScoreDisplay.textContent = carsScore;
  }
  store.gems += 1;

  if (carsScore % 10 === 0 && typeof confetti === 'function' && carsStage) {
    const rect = carsStage.getBoundingClientRect();
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
      speakWord(`Awesome! ${carsScore} cars!`);
    }, 320);
  }
}

function updateTick(ticker) {
  if (!pixiApp || !isCarsModeActive) return;

  const dt = Math.min(ticker.deltaMS, 50) / 1000;
  const width = pixiApp.screen.width;
  const { roadTop, laneHeight } = getRoadMetrics(width, pixiApp.screen.height);

  // Update cars
  for (let i = activeCars.length - 1; i >= 0; i--) {
    const car = activeCars[i];
    if (car.popped) {
      car.popElapsed += dt;
      const progress = Math.min(1, car.popElapsed / 0.22);
      const baseScale = Math.min(1.05, Math.max(0.68, laneHeight / 92));
      car.container.scale.set(baseScale * (1 + progress * 0.45));
      car.container.alpha = 1 - progress;
      if (progress >= 1) {
        car.container.destroy({ children: true });
        activeCars.splice(i, 1);
      }
      continue;
    }

    car.container.x += car.speed * dt;
    car.container.y = roadTop + car.laneIndex * laneHeight + laneHeight * 0.5;

    const outRight = car.direction === 1 && car.container.x > width + 110;
    const outLeft = car.direction === -1 && car.container.x < -110;
    if (outRight || outLeft) {
      car.container.destroy({ children: true });
      activeCars.splice(i, 1);
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

export async function startCarsMode() {
  if (!carsStage) initCarsDOM();
  if (!carsStage || !window.PIXI) return;

  isCarsModeActive = true;

  // Ensure layout has non-zero dimensions on mobile before initializing PixiJS
  if (carsStage.clientWidth === 0 || carsStage.clientHeight === 0) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    if (!isCarsModeActive) return;
  }

  if (!pixiApp) {
    const app = new window.PIXI.Application();
    await app.init({
      resizeTo: carsStage,
      backgroundAlpha: 0,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true
    });

    // Guard if user switched away while PixiJS was initializing
    if (!isCarsModeActive) {
      app.destroy(true, { children: true });
      return;
    }

    pixiApp = app;
    carsStage.innerHTML = '';
    carsStage.appendChild(pixiApp.canvas);

    roadLayer = new window.PIXI.Container();
    carsLayer = new window.PIXI.Container();
    fxLayer = new window.PIXI.Container();

    pixiApp.stage.addChild(roadLayer);
    pixiApp.stage.addChild(carsLayer);
    pixiApp.stage.addChild(fxLayer);

    drawRoad(pixiApp.screen.width, pixiApp.screen.height);
    pixiApp.renderer.on('resize', (w, h) => {
      drawRoad(w, h);
    });

    pixiApp.ticker.add(updateTick);
  }

  if (carSpawnInterval) clearInterval(carSpawnInterval);

  // Pre-spawn a few cars so the 5-lane highway is immediately lively
  if (activeCars.length < 3) {
    spawnCar(0.18);
    spawnCar(0.48);
    spawnCar(0.75);
  }

  carSpawnInterval = setInterval(() => {
    if (!isCarsModeActive || !pixiApp) return;
    if (activeCars.length < MAX_ACTIVE_CARS) {
      spawnCar(0);
    }
  }, SPAWN_INTERVAL_MS);
}

export function stopCarsMode() {
  isCarsModeActive = false;
  if (carSpawnInterval) {
    clearInterval(carSpawnInterval);
    carSpawnInterval = null;
  }

  activeCars = [];
  activeParticles = [];
  activeFloatTexts = [];

  if (pixiApp) {
    pixiApp.destroy(true, { children: true });
    pixiApp = null;
    roadLayer = null;
    carsLayer = null;
    fxLayer = null;
  }
}

export const CarsModule = {
  mount() {
    initCarsDOM();
    startCarsMode();
  },
  unmount() {
    stopCarsMode();
  }
};
