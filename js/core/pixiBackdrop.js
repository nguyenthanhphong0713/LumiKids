/**
 * Shared PixiJS v8 Ambient Scene & Tap Sparkle Layer for Learn, Words, Numbers & Chests Tabs
 */
const THEME_PALETTES = {
  pathScreen: {
    skyTop: 0xE0F7FA,
    skyBottom: 0xF0FDF4,
    hillColor: 0xBBF7D0,
    orbColors: [0x58CC02, 0x38BDF8, 0xFFC800, 0xFFFFFF]
  },
  wordsScreen: {
    skyTop: 0xEFF6FF,
    skyBottom: 0xFAF5FF,
    hillColor: 0xDDD6FE,
    orbColors: [0x38BDF8, 0xCE82FF, 0xF472B6, 0xFFC800]
  },
  numbersScreen: {
    skyTop: 0xFFFBEB,
    skyBottom: 0xF0FDF4,
    hillColor: 0xFDE68A,
    orbColors: [0xFF9600, 0x58CC02, 0x1CB0F6, 0xFF4B4B]
  },
  chestsScreen: {
    skyTop: 0xFEFCE8,
    skyBottom: 0xFFF7ED,
    hillColor: 0xFED7AA,
    orbColors: [0xFFC800, 0xFF9600, 0xCE82FF, 0x58CC02]
  }
};

let pixiApp = null;
let bgLayer = null;
let fxLayer = null;
let isMounted = false;
let currentThemeKey = 'pathScreen';

let floatingOrbs = [];
let burstParticles = [];
let stageEl = null;

function drawBackdropScene(width, height) {
  const PIXI = window.PIXI;
  if (!bgLayer || !PIXI) return;

  bgLayer.removeChildren();
  floatingOrbs = [];

  const theme = THEME_PALETTES[currentThemeKey] || THEME_PALETTES.pathScreen;

  const g = new PIXI.Graphics();
  g.rect(0, 0, width, height * 0.55).fill({ color: theme.skyTop, alpha: 0.6 });
  g.rect(0, height * 0.55, width, height * 0.45).fill({ color: theme.skyBottom, alpha: 0.7 });

  // Soft rolling hills at the bottom
  g.ellipse(width * 0.25, height - 10, width * 0.55, 70).fill({ color: theme.hillColor, alpha: 0.45 });
  g.ellipse(width * 0.8, height, width * 0.55, 85).fill({ color: theme.hillColor, alpha: 0.35 });
  bgLayer.addChild(g);

  // Floating pastel sparkles/orbs
  const orbCount = 12;
  for (let i = 0; i < orbCount; i++) {
    const color = theme.orbColors[i % theme.orbColors.length];
    const orb = new PIXI.Graphics();
    const radius = 6 + (i % 4) * 4;
    orb.circle(0, 0, radius).fill({ color, alpha: 0.28 });
    orb.x = Math.random() * width;
    orb.y = Math.random() * height;
    bgLayer.addChild(orb);

    floatingOrbs.push({
      graphic: orb,
      speedY: 14 + Math.random() * 18,
      phase: Math.random() * Math.PI * 2,
      baseX: orb.x
    });
  }
}

function updateTick(ticker) {
  if (!pixiApp || !isMounted) return;
  const dt = Math.min(ticker.deltaMS, 50) / 1000;
  const width = pixiApp.screen.width;
  const height = pixiApp.screen.height;

  for (const orb of floatingOrbs) {
    orb.phase += dt * 1.4;
    orb.graphic.y -= orb.speedY * dt;
    orb.graphic.x = orb.baseX + Math.sin(orb.phase) * 14;
    if (orb.graphic.y < -20) {
      orb.graphic.y = height + 20;
      orb.baseX = Math.random() * width;
    }
  }

  for (let i = burstParticles.length - 1; i >= 0; i--) {
    const p = burstParticles[i];
    p.life += dt;
    const progress = Math.min(1, p.life / p.maxLife);
    p.graphic.x += p.vx * dt;
    p.graphic.y += p.vy * dt;
    p.graphic.alpha = 1 - progress;
    p.graphic.scale.set(1 - progress * 0.5);
    if (progress >= 1) {
      p.graphic.destroy();
      burstParticles.splice(i, 1);
    }
  }
}

export const PixiBackdrop = {
  async mount(themeKey = 'pathScreen') {
    currentThemeKey = themeKey;
    stageEl = document.getElementById('pixiBackdropStage');
    if (!stageEl || !window.PIXI) return;

    isMounted = true;

    if (!pixiApp) {
      const app = new window.PIXI.Application();
      await app.init({
        resizeTo: stageEl,
        backgroundAlpha: 0,
        antialias: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true
      });

      if (!isMounted) {
        app.destroy(true, { children: true });
        return;
      }

      pixiApp = app;
      stageEl.innerHTML = '';
      stageEl.appendChild(pixiApp.canvas);

      bgLayer = new window.PIXI.Container();
      fxLayer = new window.PIXI.Container();
      pixiApp.stage.addChild(bgLayer);
      pixiApp.stage.addChild(fxLayer);

      drawBackdropScene(pixiApp.screen.width, pixiApp.screen.height);
      pixiApp.renderer.on('resize', (w, h) => {
        drawBackdropScene(w, h);
      });
      pixiApp.ticker.add(updateTick);
    } else {
      drawBackdropScene(pixiApp.screen.width, pixiApp.screen.height);
    }
  },

  unmount() {
    isMounted = false;
    floatingOrbs = [];
    burstParticles = [];
    if (pixiApp) {
      pixiApp.destroy(true, { children: true });
      pixiApp = null;
      bgLayer = null;
      fxLayer = null;
    }
  },

  emitSparkles(clientX, clientY) {
    const PIXI = window.PIXI;
    if (!pixiApp || !fxLayer || !PIXI || !isMounted || !stageEl) return;

    const rect = stageEl.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const theme = THEME_PALETTES[currentThemeKey] || THEME_PALETTES.pathScreen;

    const count = 8;
    for (let i = 0; i < count; i++) {
      const color = theme.orbColors[Math.floor(Math.random() * theme.orbColors.length)];
      const p = new PIXI.Graphics();
      p.circle(0, 0, 4 + Math.random() * 4).fill(color);
      p.x = x;
      p.y = y;

      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const speed = 75 + Math.random() * 85;
      fxLayer.addChild(p);

      burstParticles.push({
        graphic: p,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 0.42
      });
    }
  }
};
