/**
 * LumiKids PixiJS v8 Treasure Chest & Gems Physics Renderer
 */

const TIER_STYLES = {
  common: {
    wood: 0xB45309,
    woodDark: 0x78350F,
    trim: 0xCBD5E1,
    trimDark: 0x64748B,
    gem: 0x38BDF8,
    rayColor: 0xFDE68A,
    rayAlpha: 0.25,
    sparkleColor: 0xFEF08A
  },
  rare: {
    wood: 0xD97706,
    woodDark: 0x92400E,
    trim: 0xFACC15,
    trimDark: 0xCA8A04,
    gem: 0x38BDF8,
    rayColor: 0xFACC15,
    rayAlpha: 0.45,
    sparkleColor: 0xFACC15
  },
  epic: {
    wood: 0x7E22CE,
    woodDark: 0x581C87,
    trim: 0xFACC15,
    trimDark: 0xA855F7,
    gem: 0xF472B6,
    rayColor: 0xCE82FF,
    rayAlpha: 0.55,
    sparkleColor: 0x38BDF8
  }
};

function drawGodRays(raysContainer, color, alpha) {
  const PIXI = window.PIXI;
  raysContainer.removeChildren();
  const g = new PIXI.Graphics();
  const rayCount = 8;
  for (let i = 0; i < rayCount; i++) {
    const a1 = (i / rayCount) * Math.PI * 2;
    const a2 = a1 + Math.PI / (rayCount * 1.4);
    g.moveTo(0, 0)
      .lineTo(Math.cos(a1) * 72, Math.sin(a1) * 72)
      .lineTo(Math.cos(a2) * 72, Math.sin(a2) * 72)
      .closePath()
      .fill({ color, alpha });
  }
  raysContainer.addChild(g);
}

function drawChestArtwork(baseContainer, lidContainer, style, isOpen = false) {
  const PIXI = window.PIXI;
  baseContainer.removeChildren();
  lidContainer.removeChildren();

  const baseG = new PIXI.Graphics();
  // Ground shadow
  baseG.ellipse(0, 32, 42, 9).fill({ color: 0x0F172A, alpha: 0.22 });

  // Chest body
  baseG.roundRect(-36, -6, 72, 36, 8).fill(style.wood).stroke({ width: 3, color: style.woodDark });
  // Vertical metal/gold straps
  baseG.roundRect(-24, -6, 8, 36, 2).fill(style.trim);
  baseG.roundRect(16, -6, 8, 36, 2).fill(style.trim);
  // Top rim
  baseG.roundRect(-39, -9, 78, 8, 4).fill(style.trim).stroke({ width: 2, color: style.trimDark });

  if (isOpen) {
    // Glowing golden interior
    baseG.roundRect(-30, -7, 60, 8, 3).fill(0xFEF08A);
  }

  // Center lock clasp
  baseG.roundRect(-9, -11, 18, 18, 5).fill(style.trim).stroke({ width: 2, color: style.trimDark });
  baseG.circle(0, -2, 4.5).fill(style.gem);
  baseContainer.addChild(baseG);

  // Chest lid
  const lidG = new PIXI.Graphics();
  lidG.roundRect(-38, -28, 76, 24, 14).fill(style.wood).stroke({ width: 3, color: style.woodDark });
  // Lid straps
  lidG.roundRect(-24, -28, 8, 22, 3).fill(style.trim);
  lidG.roundRect(16, -28, 8, 22, 3).fill(style.trim);
  // Lid highlight
  lidG.roundRect(-28, -24, 56, 5, 2.5).fill({ color: 0xFFFFFF, alpha: 0.3 });
  lidContainer.addChild(lidG);
}

export function mountPixiChest(containerEl, size = 140) {
  let destroyed = false;
  let app = null;
  let root = null;
  let raysContainer = null;
  let chestGroup = null;
  let baseContainer = null;
  let lidContainer = null;
  let fxContainer = null;
  let prizeText = null;

  let currentTier = 'common';
  let isOpened = false;
  let squishTimer = 0;
  let squishStrength = 1;
  let activeFx = [];

  const spawnBurst = (color, count = 12, withRing = true) => {
    const PIXI = window.PIXI;
    if (!fxContainer || !PIXI) return;

    if (withRing) {
      const ring = new PIXI.Graphics();
      ring.circle(0, 0, 18).stroke({ width: 4, color });
      fxContainer.addChild(ring);
      activeFx.push({ type: 'ring', g: ring, life: 0, maxLife: 0.45 });
    }

    for (let i = 0; i < count; i++) {
      const p = new PIXI.Graphics();
      p.star(0, 0, 4, 6 + Math.random() * 4, 3).fill(color);
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const speed = 75 + Math.random() * 75;
      fxContainer.addChild(p);
      activeFx.push({
        type: 'star',
        g: p,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 0.55
      });
    }
  };

  const applyTier = (tier) => {
    currentTier = tier;
    if (!raysContainer || !baseContainer || !lidContainer) return;
    const style = TIER_STYLES[tier] || TIER_STYLES.common;
    drawGodRays(raysContainer, style.rayColor, style.rayAlpha);
    drawChestArtwork(baseContainer, lidContainer, style, isOpened);
  };

  const start = async () => {
    const PIXI = window.PIXI;
    if (!containerEl || !PIXI) return;

    const localApp = new window.PIXI.Application();
    await localApp.init({
      width: size,
      height: size,
      backgroundAlpha: 0,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true
    });

    if (destroyed) {
      localApp.destroy(true, { children: true });
      return;
    }

    app = localApp;
    containerEl.innerHTML = '';
    containerEl.appendChild(app.canvas);

    root = new PIXI.Container();
    root.position.set(size / 2, size / 2);
    root.scale.set(size / 140);
    app.stage.addChild(root);

    raysContainer = new PIXI.Container();
    chestGroup = new PIXI.Container();
    baseContainer = new PIXI.Container();
    lidContainer = new PIXI.Container();
    fxContainer = new PIXI.Container();

    chestGroup.addChild(baseContainer);
    chestGroup.addChild(lidContainer);

    root.addChild(raysContainer);
    root.addChild(chestGroup);
    root.addChild(fxContainer);

    applyTier(currentTier);

    let elapsed = 0;
    app.ticker.add((ticker) => {
      if (destroyed) return;
      const dt = Math.min(ticker.deltaMS, 50) / 1000;
      elapsed += dt;

      raysContainer.rotation += dt * (currentTier === 'epic' ? 0.9 : 0.45);

      if (squishTimer > 0) {
        squishTimer = Math.max(0, squishTimer - dt);
        const p = 1 - squishTimer / 0.42;
        const wave = Math.sin(p * Math.PI * 3) * (1 - p) * 0.25 * squishStrength;
        chestGroup.scale.set(1 + wave, 1 - wave);
        chestGroup.rotation = Math.sin(p * Math.PI * 4) * (1 - p) * 0.12;
      } else {
        chestGroup.scale.set(1, 1);
        chestGroup.rotation = Math.sin(elapsed * 2.4) * 0.03;
        chestGroup.y = Math.sin(elapsed * 2.8) * 2.5;
      }

      if (isOpened) {
        lidContainer.y = -14;
        lidContainer.rotation = -0.22;
        if (prizeText) {
          prizeText.y = -24 + Math.sin(elapsed * 3.5) * 4;
          prizeText.scale.set(1 + Math.sin(elapsed * 3) * 0.06);
        }
      } else {
        lidContainer.y = 0;
        lidContainer.rotation = 0;
      }

      for (let i = activeFx.length - 1; i >= 0; i--) {
        const fx = activeFx[i];
        fx.life += dt;
        const progress = Math.min(1, fx.life / fx.maxLife);
        if (fx.type === 'ring') {
          fx.g.scale.set(1 + progress * 2.6);
          fx.g.alpha = 1 - progress;
        } else {
          fx.g.x += fx.vx * dt;
          fx.g.y += fx.vy * dt;
          fx.g.rotation += dt * 5;
          fx.g.alpha = 1 - progress;
          fx.g.scale.set(1 - progress * 0.5);
        }
        if (progress >= 1) {
          fx.g.destroy();
          activeFx.splice(i, 1);
        }
      }
    });
  };

  start();

  return {
    setTier(tier) {
      isOpened = false;
      if (prizeText) {
        prizeText.destroy();
        prizeText = null;
      }
      applyTier(tier);
    },
    playSquish(tier) {
      applyTier(tier);
      squishTimer = 0.42;
      squishStrength = tier === 'epic' ? 1.3 : 1.0;
      const style = TIER_STYLES[tier] || TIER_STYLES.rare;
      spawnBurst(style.sparkleColor, 12, true);
    },
    playBurstOpen(prizeEmoji) {
      const PIXI = window.PIXI;
      isOpened = true;
      applyTier('epic');
      squishTimer = 0.42;
      squishStrength = 1.4;
      spawnBurst(0xFACC15, 18, true);
      spawnBurst(0x38BDF8, 12, false);

      if (PIXI && chestGroup) {
        if (prizeText) prizeText.destroy();
        prizeText = new PIXI.Text({
          text: prizeEmoji,
          style: { fontSize: 52 }
        });
        prizeText.anchor.set(0.5);
        prizeText.position.set(0, -24);
        chestGroup.addChild(prizeText);
      }
    },
    destroy() {
      destroyed = true;
      activeFx = [];
      if (app) {
        app.destroy(true, { children: true });
        app = null;
      }
    }
  };
}

function createDiamondGemGraphic() {
  const PIXI = window.PIXI;
  const g = new PIXI.Graphics();
  // Faceted cyan diamond
  g.poly([0, -14, 13, -4, 0, 14, -13, -4]).fill(0x38BDF8).stroke({ width: 2, color: 0xE0F2FE });
  g.poly([0, -14, 7, -4, 0, 14, -7, -4]).fill({ color: 0x7DD3FC, alpha: 0.7 });
  g.poly([-6, -8, 0, -13, 4, -7]).fill({ color: 0xFFFFFF, alpha: 0.85 });
  return g;
}

/**
 * Launches bouncing PixiJS diamond gems that fly into the top counter
 */
export function launchPixiGemsPhysics(stageHostEl, { startX, startY, floorY, targetX, targetY, count = 18, onGemArrived, onAllDone }) {
  let destroyed = false;
  let app = null;

  const start = async () => {
    const PIXI = window.PIXI;
    if (!stageHostEl || !PIXI) {
      if (onAllDone) onAllDone();
      return;
    }

    const localApp = new PIXI.Application();
    await localApp.init({
      resizeTo: window,
      backgroundAlpha: 0,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true
    });

    if (destroyed) {
      localApp.destroy(true, { children: true });
      return;
    }

    app = localApp;
    stageHostEl.innerHTML = '';
    stageHostEl.appendChild(app.canvas);

    const gems = [];
    const bursts = [];

    for (let i = 0; i < count; i++) {
      const gemG = createDiamondGemGraphic();
      gemG.x = startX + (Math.random() - 0.5) * 20;
      gemG.y = startY + (Math.random() - 0.5) * 20;
      const scale = 0.85 + Math.random() * 0.35;
      gemG.scale.set(scale);
      app.stage.addChild(gemG);

      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
      const speed = 520 + Math.random() * 540;
      gems.push({
        g: gemG,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 2100,
        bounceCount: 0,
        maxBounces: 2 + Math.floor(Math.random() * 2),
        state: 'bounce',
        pauseLeft: 0,
        pauseDelay: 0.1 + i * 0.045,
        vRot: (Math.random() - 0.5) * 12
      });
    }

    let arrivedCount = 0;

    app.ticker.add((ticker) => {
      if (destroyed) return;
      const dt = Math.min(ticker.deltaMS, 50) / 1000;
      let allFinished = true;

      for (const p of gems) {
        if (p.state === 'arrived') continue;
        allFinished = false;

        if (p.state === 'bounce') {
          p.g.x += p.vx * dt;
          p.g.y += p.vy * dt;
          p.vy += p.gravity * dt;
          p.g.rotation += p.vRot * dt;

          if (p.g.y >= floorY) {
            p.g.y = floorY;
            p.vy = -p.vy * 0.54;
            p.vx *= 0.75;
            p.bounceCount++;
            if (p.bounceCount >= p.maxBounces || Math.abs(p.vy) < 90) {
              p.state = 'pause';
              p.pauseLeft = p.pauseDelay;
            }
          }
        } else if (p.state === 'pause') {
          p.pauseLeft -= dt;
          if (p.pauseLeft <= 0) {
            p.state = 'fly';
          }
        } else if (p.state === 'fly') {
          const dx = targetX - p.g.x;
          const dy = targetY - p.g.y;
          const dist = Math.hypot(dx, dy);
          const factor = Math.min(1, dt * 11);
          p.g.x += dx * factor;
          p.g.y += dy * factor;
          p.g.rotation += 14 * dt;

          if (dist < 32) {
            p.state = 'arrived';
            p.g.visible = false;
            arrivedCount++;

            // Mini arrival star burst
            for (let s = 0; s < 5; s++) {
              const star = new PIXI.Graphics();
              star.circle(0, 0, 3.5).fill(0x38BDF8);
              star.x = targetX;
              star.y = targetY;
              app.stage.addChild(star);
              const a = (s / 5) * Math.PI * 2;
              bursts.push({
                g: star,
                vx: Math.cos(a) * 90,
                vy: Math.sin(a) * 90,
                life: 0,
                maxLife: 0.3
              });
            }

            if (onGemArrived) onGemArrived(arrivedCount);
          }
        }
      }

      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.life += dt;
        const progress = Math.min(1, b.life / b.maxLife);
        b.g.x += b.vx * dt;
        b.g.y += b.vy * dt;
        b.g.alpha = 1 - progress;
        if (progress >= 1) {
          b.g.destroy();
          bursts.splice(i, 1);
        }
      }

      if (allFinished && bursts.length === 0) {
        destroyed = true;
        app.destroy(true, { children: true });
        app = null;
        if (onAllDone) onAllDone();
      }
    });
  };

  start();

  return {
    destroy() {
      destroyed = true;
      if (app) {
        app.destroy(true, { children: true });
        app = null;
      }
    }
  };
}
