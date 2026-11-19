/**
 * LumiKids PixiJS v8 Career Character Renderer
 * Draws & animates Bác sĩ (doctor), Vận động viên (athlete), Kĩ sư (engineer), and Cô giáo (teacher)
 * in a 100x100 logical coordinate space scaled to target size.
 */

function drawChibiHeadBase(headContainer, hairColor = 0x1E293B) {
  const PIXI = window.PIXI;
  const g = new PIXI.Graphics();

  // Face
  g.circle(50, 42, 22).fill(0xFFDFBA);

  // Hair bangs
  g.moveTo(28, 38)
    .bezierCurveTo(36, 26, 64, 26, 72, 38)
    .bezierCurveTo(66, 32, 58, 30, 50, 32)
    .bezierCurveTo(42, 30, 34, 32, 28, 38)
    .fill(hairColor);

  // Rosy cheeks
  g.circle(34, 48, 3.5).fill({ color: 0xFFAAA6, alpha: 0.65 });
  g.circle(66, 48, 3.5).fill({ color: 0xFFAAA6, alpha: 0.65 });

  // Cute smile
  g.moveTo(45, 50).quadraticCurveTo(50, 55, 55, 50).stroke({ width: 2.2, color: 0xA0522D, cap: 'round' });

  headContainer.addChild(g);

  // Blinking eyes sub-container
  const eyes = new PIXI.Container();
  eyes.position.set(50, 42);
  const eg = new PIXI.Graphics();
  eg.circle(-9, 0, 2.7).fill(0x1E293B);
  eg.circle(9, 0, 2.7).fill(0x1E293B);
  eg.circle(-8, -1, 1).fill(0xFFFFFF);
  eg.circle(10, -1, 1).fill(0xFFFFFF);
  eyes.addChild(eg);
  headContainer.addChild(eyes);

  return eyes;
}

function buildDoctorCharacter(root) {
  const PIXI = window.PIXI;

  // Hair back
  const hairBack = new PIXI.Graphics();
  hairBack.moveTo(26, 44).bezierCurveTo(24, 18, 76, 18, 74, 44)
    .bezierCurveTo(70, 30, 58, 26, 50, 26)
    .bezierCurveTo(42, 26, 30, 30, 26, 44)
    .fill(0x1E293B);
  root.addChild(hairBack);

  // Body & white lab coat
  const body = new PIXI.Graphics();
  body.moveTo(34, 64).quadraticCurveTo(50, 61, 66, 64).lineTo(70, 90).lineTo(30, 90).closePath()
    .fill(0xFFFFFF)
    .stroke({ width: 1.8, color: 0xCBD5E1 });
  // Cyan scrub collar
  body.moveTo(43, 64).lineTo(50, 74).lineTo(57, 64).closePath().fill(0x06B6D4);
  // Stethoscope tube
  body.moveTo(38, 66).quadraticCurveTo(40, 80, 50, 80).quadraticCurveTo(60, 80, 62, 66)
    .stroke({ width: 2.5, color: 0x64748B, cap: 'round' });
  // Friendly waving hand
  body.circle(28, 74, 5).fill(0xFFDFBA);
  body.circle(26, 70, 2.5).fill(0xFFDFBA);
  root.addChild(body);

  // Bouncing stethoscope resonator
  const stetho = new PIXI.Graphics();
  stetho.circle(50, 80, 4.4).fill(0x0284C7);
  stetho.circle(50, 80, 1.9).fill(0xE0F2FE);
  root.addChild(stetho);

  // Head + headband mirror
  const head = new PIXI.Container();
  head.pivot.set(50, 58);
  head.position.set(50, 58);
  const eyes = drawChibiHeadBase(head, 0x1E293B);

  const headband = new PIXI.Graphics();
  headband.moveTo(28, 32).quadraticCurveTo(50, 27, 72, 32).stroke({ width: 2.8, color: 0x94A3B8 });
  headband.circle(50, 29, 5.5).fill(0xE2E8F0).stroke({ width: 1.8, color: 0x0284C7 });
  head.addChild(headband);

  const mirrorGlint = new PIXI.Graphics();
  mirrorGlint.circle(50, 29, 2.5).fill(0x38BDF8);
  head.addChild(mirrorGlint);
  root.addChild(head);

  // Pulsing heart
  const heart = new PIXI.Text({ text: '❤️', style: { fontSize: 14 } });
  heart.anchor.set(0.5);
  heart.position.set(74, 22);
  root.addChild(heart);

  return (t) => {
    head.rotation = Math.sin(t * 2.4) * 0.045;
    stetho.y = Math.sin(t * 4.5) * 1.8;
    mirrorGlint.alpha = 0.6 + 0.4 * Math.sin(t * 3.5);
    const pulse = 1 + 0.18 * Math.max(0, Math.sin(t * 4.2));
    heart.scale.set(pulse);
    const blinkCycle = t % 3.4;
    eyes.scale.y = (blinkCycle > 3.1 && blinkCycle < 3.28) ? 0.12 : 1;
  };
}

function buildEngineerCharacter(root) {
  const PIXI = window.PIXI;

  // Hair back
  const hairBack = new PIXI.Graphics();
  hairBack.moveTo(27, 44).bezierCurveTo(26, 22, 74, 22, 73, 44).fill(0x334155);
  root.addChild(hairBack);

  // Body & bright orange safety vest
  const body = new PIXI.Graphics();
  body.moveTo(34, 64).quadraticCurveTo(50, 61, 66, 64).lineTo(70, 90).lineTo(30, 90).closePath()
    .fill(0x2563EB);
  // Orange vest panels
  body.moveTo(34, 64).lineTo(44, 64).lineTo(44, 90).lineTo(31, 90).closePath().fill(0xF97316);
  body.moveTo(56, 64).lineTo(66, 64).lineTo(69, 90).lineTo(56, 90).closePath().fill(0xF97316);
  // Reflective stripes
  body.rect(32, 76, 12, 3.5).fill(0xFEF08A);
  body.rect(56, 76, 12, 3.5).fill(0xFEF08A);
  root.addChild(body);

  // Animated wrench arm
  const arm = new PIXI.Container();
  arm.position.set(66, 66);
  const armG = new PIXI.Graphics();
  armG.moveTo(0, 0).lineTo(12, -10).stroke({ width: 5, color: 0xF97316, cap: 'round' });
  armG.circle(13, -11, 4.2).fill(0xFFDFBA);
  // Wrench
  armG.moveTo(13, -11).lineTo(20, -20).stroke({ width: 3.2, color: 0x94A3B8, cap: 'round' });
  armG.circle(21, -21, 4).stroke({ width: 2.4, color: 0x64748B });
  arm.addChild(armG);
  root.addChild(arm);

  // Head + yellow hard hat
  const head = new PIXI.Container();
  head.pivot.set(50, 58);
  head.position.set(50, 58);
  const eyes = drawChibiHeadBase(head, 0x334155);

  const helmet = new PIXI.Graphics();
  helmet.moveTo(25, 34).bezierCurveTo(27, 13, 73, 13, 75, 34).closePath().fill(0xFACC15);
  helmet.roundRect(22, 32, 56, 5.5, 3).fill(0xEAB308);
  head.addChild(helmet);

  const headlamp = new PIXI.Graphics();
  headlamp.circle(50, 23, 4.5).fill(0xFEF08A).stroke({ width: 1.8, color: 0xCA8A04 });
  head.addChild(headlamp);
  root.addChild(head);

  // Spinning gear prop
  const gear = new PIXI.Text({ text: '⚙️', style: { fontSize: 15 } });
  gear.anchor.set(0.5);
  gear.position.set(20, 24);
  root.addChild(gear);

  return (t) => {
    head.rotation = Math.sin(t * 2.2) * 0.04;
    arm.rotation = Math.sin(t * 3.8) * 0.22;
    gear.rotation = t * 1.6;
    headlamp.alpha = 0.75 + 0.25 * Math.sin(t * 4);
    const blinkCycle = t % 3.6;
    eyes.scale.y = (blinkCycle > 3.3 && blinkCycle < 3.48) ? 0.12 : 1;
  };
}

function buildAthleteCharacter(root) {
  const PIXI = window.PIXI;

  // Hair back
  const hairBack = new PIXI.Graphics();
  hairBack.moveTo(27, 44).bezierCurveTo(26, 20, 74, 20, 73, 44).fill(0x7C2D12);
  root.addChild(hairBack);

  // Sporty red jersey
  const body = new PIXI.Graphics();
  body.moveTo(34, 64).quadraticCurveTo(50, 61, 66, 64).lineTo(70, 90).lineTo(30, 90).closePath()
    .fill(0xEF4444);
  body.moveTo(43, 64).lineTo(50, 72).lineTo(57, 64).closePath().fill(0xFFFFFF);
  // Gold star on chest
  body.star(50, 80, 5, 6, 3).fill(0xFACC15);
  root.addChild(body);

  // Pumping arm with golden trophy
  const arm = new PIXI.Container();
  arm.position.set(66, 68);
  const armG = new PIXI.Graphics();
  armG.moveTo(0, 0).lineTo(12, -12).stroke({ width: 5, color: 0xEF4444, cap: 'round' });
  armG.circle(13, -13, 4.2).fill(0xFFDFBA);
  arm.addChild(armG);
  const trophy = new PIXI.Text({ text: '🏆', style: { fontSize: 17 } });
  trophy.anchor.set(0.5);
  trophy.position.set(17, -23);
  arm.addChild(trophy);
  root.addChild(arm);

  // Head + sporty sweatband
  const head = new PIXI.Container();
  head.pivot.set(50, 58);
  head.position.set(50, 58);
  const eyes = drawChibiHeadBase(head, 0x7C2D12);

  const sweatband = new PIXI.Graphics();
  sweatband.roundRect(28, 28, 44, 6, 3).fill(0xEF4444);
  sweatband.roundRect(28, 30, 44, 2, 1).fill(0xFFFFFF);
  head.addChild(sweatband);
  root.addChild(head);

  // Energetic sparkle
  const sparkle = new PIXI.Text({ text: '✨', style: { fontSize: 14 } });
  sparkle.anchor.set(0.5);
  sparkle.position.set(20, 26);
  root.addChild(sparkle);

  return (t) => {
    head.rotation = Math.sin(t * 2.8) * 0.05;
    arm.y = 68 + Math.sin(t * 5.2) * 3.5;
    arm.rotation = Math.sin(t * 5.2) * 0.14;
    sparkle.y = 26 + Math.sin(t * 4.5) * 3;
    sparkle.scale.set(0.9 + 0.2 * Math.sin(t * 4.5));
    const blinkCycle = t % 3.2;
    eyes.scale.y = (blinkCycle > 2.9 && blinkCycle < 3.08) ? 0.12 : 1;
  };
}

function buildTeacherCharacter(root) {
  const PIXI = window.PIXI;

  // Ponytail & hair back
  const hairBack = new PIXI.Graphics();
  hairBack.circle(68, 28, 7).fill(0xFF4B4B);
  hairBack.ellipse(76, 36, 8, 14).fill(0x4A2810);
  hairBack.moveTo(26, 44).bezierCurveTo(24, 18, 76, 18, 74, 44)
    .lineTo(68, 62).bezierCurveTo(68, 45, 60, 28, 50, 28)
    .bezierCurveTo(40, 28, 32, 45, 32, 62).closePath().fill(0x4A2810);
  root.addChild(hairBack);

  // Teal teacher outfit
  const body = new PIXI.Graphics();
  body.moveTo(34, 64).quadraticCurveTo(50, 61, 66, 64).lineTo(70, 90).lineTo(30, 90).closePath().fill(0x0D9488);
  body.moveTo(43, 64).lineTo(50, 75).lineTo(57, 64).closePath().fill(0xFFFFFF);
  body.poly([48, 74, 52, 74, 51, 84, 49, 84]).fill(0xE11D48);
  root.addChild(body);

  // Animated pointer stick
  const arm = new PIXI.Container();
  arm.position.set(64, 68);
  const armG = new PIXI.Graphics();
  armG.moveTo(0, 0).lineTo(20, -24).stroke({ width: 3, color: 0xD97706, cap: 'round' });
  armG.star(20, -25, 4, 5, 2).fill(0xFBBF24);
  arm.addChild(armG);
  root.addChild(arm);

  // Head + glasses
  const head = new PIXI.Container();
  head.pivot.set(50, 58);
  head.position.set(50, 58);
  const eyes = drawChibiHeadBase(head, 0x4A2810);

  const glasses = new PIXI.Graphics();
  glasses.roundRect(34, 37, 13, 10, 3).stroke({ width: 2.3, color: 0xE11D48 });
  glasses.roundRect(53, 37, 13, 10, 3).stroke({ width: 2.3, color: 0xE11D48 });
  glasses.moveTo(47, 42).lineTo(53, 42).stroke({ width: 2.3, color: 0xE11D48 });
  head.addChild(glasses);
  root.addChild(head);

  const star = new PIXI.Text({ text: '⭐', style: { fontSize: 13 } });
  star.anchor.set(0.5);
  star.position.set(18, 24);
  root.addChild(star);

  return (t) => {
    head.rotation = Math.sin(t * 2.3) * 0.04;
    arm.rotation = Math.sin(t * 3.5) * 0.16;
    star.y = 24 + Math.sin(t * 3.2) * 3;
    const blinkCycle = t % 3.5;
    eyes.scale.y = (blinkCycle > 3.2 && blinkCycle < 3.38) ? 0.12 : 1;
  };
}

const BUILDERS = {
  doctor: buildDoctorCharacter,
  engineer: buildEngineerCharacter,
  athlete: buildAthleteCharacter,
  teacher: buildTeacherCharacter
};

/**
 * Mounts an animated PixiJS v8 career mascot into a target DOM container.
 * Returns a controller with { destroy() } to prevent WebGL context leaks.
 */
export function mountPixiCharacter(containerEl, charId, size = 76) {
  let destroyed = false;
  let app = null;

  const start = async () => {
    const PIXI = window.PIXI;
    if (!containerEl || !PIXI) return;

    const localApp = new PIXI.Application();
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

    const root = new PIXI.Container();
    root.scale.set(size / 100);
    app.stage.addChild(root);

    const builder = BUILDERS[charId] || BUILDERS.doctor;
    const animateFn = builder(root);

    let elapsed = 0;
    app.ticker.add((ticker) => {
      if (destroyed) return;
      elapsed += Math.min(ticker.deltaMS, 50) / 1000;
      root.y = Math.sin(elapsed * 2.6) * 2.2;
      if (animateFn) animateFn(elapsed);
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
