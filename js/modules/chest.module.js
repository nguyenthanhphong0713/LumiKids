import { store } from '../core/state.js';
import { eventBus } from '../core/eventBus.js';
import {
  unlockAudio,
  playDuoDing,
  playSquishSpring,
  playRarityUpgrade,
  playVictoryFanfare,
  playGemPing,
  speakWord
} from '../core/audio.js';
import { CHEST_TREASURES } from '../data/curriculum.data.js';
import { mountPixiChest, launchPixiGemsPhysics } from '../core/pixiChest.js';

let chestTapCount = 0;
let isChestOpened = false;
let pixiChestController = null;
let pixiGemsController = null;
let tabChestController = null;

// DOM references for chest modal elements
let celebrationModal = null;
let chestModalCard = null;
let chestShockwave = null;
let chestBloomFlash = null;
let chestPhysicsCanvas = null;
let modalTopGems = null;
let modalGemCount = null;
let rarityBadge = null;
let rarityBadgeIcon = null;
let rarityBadgeText = null;
let modalTitle = null;
let interactiveChest = null;
let chestGraphic = null;
let tapIndicators = null;
let dot1 = null;
let dot2 = null;
let dot3 = null;
let chestInstruction = null;
let rewardBadges = null;
let continueBtn = null;

export function initChestModalElements() {
  celebrationModal = document.getElementById('celebrationModal');
  chestModalCard = document.getElementById('chestModalCard');
  chestShockwave = document.getElementById('chestShockwave');
  chestBloomFlash = document.getElementById('chestBloomFlash');
  chestPhysicsCanvas = document.getElementById('chestPhysicsCanvas');
  modalTopGems = document.getElementById('modalTopGems');
  modalGemCount = document.getElementById('modalGemCount');
  rarityBadge = document.getElementById('rarityBadge');
  rarityBadgeIcon = document.getElementById('rarityBadgeIcon');
  rarityBadgeText = document.getElementById('rarityBadgeText');
  modalTitle = document.getElementById('modalTitle');
  interactiveChest = document.getElementById('interactiveChest');
  chestGraphic = document.getElementById('chestGraphic');
  tapIndicators = document.getElementById('tapIndicators');
  dot1 = document.getElementById('dot1');
  dot2 = document.getElementById('dot2');
  dot3 = document.getElementById('dot3');
  chestInstruction = document.getElementById('chestInstruction');
  rewardBadges = document.getElementById('rewardBadges');
  continueBtn = document.getElementById('continueBtn');

  if (interactiveChest) {
    interactiveChest.onclick = handleChestTap;
  }
  if (continueBtn) {
    continueBtn.onclick = onContinueAfterCelebration;
  }
}

function triggerFullscreenShockwave(gradientStyle) {
  if (!chestShockwave) return;
  chestShockwave.style.background = gradientStyle;
  chestShockwave.classList.remove('trigger-wave');
  void chestShockwave.offsetWidth;
  chestShockwave.classList.add('trigger-wave');
}

function destroyActivePixiEffects() {
  if (pixiGemsController) {
    pixiGemsController.destroy();
    pixiGemsController = null;
  }
  if (pixiChestController) {
    pixiChestController.destroy();
    pixiChestController = null;
  }
}

export function openChestModal() {
  initChestModalElements();
  chestTapCount = 0;
  isChestOpened = false;

  destroyActivePixiEffects();
  if (chestPhysicsCanvas) chestPhysicsCanvas.innerHTML = '';

  if (modalGemCount) {
    modalGemCount.textContent = store.gems;
  }

  // Initial Tier 0: COMMON
  if (chestModalCard) chestModalCard.className = 'duo-modal-card tier-common-card';
  if (rarityBadge) rarityBadge.className = 'rarity-tier-badge tier-common';
  if (rarityBadgeIcon) rarityBadgeIcon.textContent = '📦';
  if (rarityBadgeText) rarityBadgeText.textContent = 'COMMON CHEST';

  if (interactiveChest) interactiveChest.className = 'interactive-chest-box';
  if (chestGraphic) {
    chestGraphic.className = 'chest-3d-graphic';
    if (window.PIXI) {
      pixiChestController = mountPixiChest(chestGraphic, 140);
      pixiChestController.setTier('common');
    } else {
      chestGraphic.textContent = '🎁';
    }
  }
  if (modalTitle) modalTitle.textContent = 'Reward Chest! 🎁';
  if (chestInstruction) {
    chestInstruction.textContent = 'Tap to upgrade rarity! ⭐';
    chestInstruction.style.display = 'block';
  }

  if (tapIndicators) tapIndicators.style.display = 'flex';
  if (dot1) dot1.className = 'tap-dot active';
  if (dot2) dot2.className = 'tap-dot';
  if (dot3) dot3.className = 'tap-dot';

  if (rewardBadges) rewardBadges.style.display = 'none';
  if (continueBtn) continueBtn.style.display = 'none';

  if (celebrationModal) celebrationModal.classList.add('active');
  playDuoDing();
  speakWord('Tap to upgrade and open the chest!');
}

function handleChestTap() {
  if (isChestOpened) return;
  unlockAudio();

  chestTapCount++;

  if (chestTapCount === 1) {
    // TAP 1: SQUISH WIGGLE & UPGRADE COMMON -> RARE
    interactiveChest.className = 'interactive-chest-box squish-1';
    chestModalCard.className = 'duo-modal-card tier-rare-card';

    rarityBadge.className = 'rarity-tier-badge tier-rare';
    rarityBadgeIcon.textContent = '⭐';
    rarityBadgeText.textContent = 'RARE CHEST!';

    dot2.className = 'tap-dot active';

    if (pixiChestController) {
      pixiChestController.playSquish('rare');
    }

    playSquishSpring(1);
    playRarityUpgrade(1);

    triggerFullscreenShockwave('radial-gradient(circle, rgba(255, 200, 0, 0.78) 0%, rgba(255, 160, 0, 0.45) 45%, transparent 75%)');

    chestInstruction.textContent = 'Awesome! Tap to upgrade to EPIC! 🌟';
    speakWord('Rare Chest!');

  } else if (chestTapCount === 2) {
    // TAP 2: SQUISH WIGGLE & UPGRADE RARE -> EPIC
    interactiveChest.className = 'interactive-chest-box squish-2';
    chestModalCard.className = 'duo-modal-card tier-epic-card';

    rarityBadge.className = 'rarity-tier-badge tier-epic';
    rarityBadgeIcon.textContent = '👑';
    rarityBadgeText.textContent = 'EPIC CHEST!';

    dot3.className = 'tap-dot dot-epic';

    if (pixiChestController) {
      pixiChestController.playSquish('epic');
    }

    playSquishSpring(2);
    playRarityUpgrade(2);

    triggerFullscreenShockwave('radial-gradient(circle, rgba(206, 130, 255, 0.88) 0%, rgba(28, 176, 246, 0.5) 45%, transparent 75%)');

    chestInstruction.textContent = 'EPIC RARITY! Tap to burst open! 🚀';
    speakWord('Epic Chest!');

  } else if (chestTapCount >= 3) {
    // TAP 3: SCALE UP, DISSOLVE & PIXIJS GEMS BURST
    isChestOpened = true;

    interactiveChest.className = 'interactive-chest-box burst-dissolve';

    if (chestBloomFlash) {
      chestBloomFlash.classList.remove('active-flash');
      void chestBloomFlash.offsetWidth;
      chestBloomFlash.classList.add('active-flash');
    }

    triggerFullscreenShockwave('radial-gradient(circle, rgba(255, 255, 255, 0.98) 0%, rgba(255, 215, 0, 0.6) 40%, rgba(206, 130, 255, 0.45) 65%, transparent 80%)');

    playVictoryFanfare();

    setTimeout(() => {
      const prize = CHEST_TREASURES[Math.floor(Math.random() * CHEST_TREASURES.length)];
      if (pixiChestController) {
        pixiChestController.playBurstOpen(prize);
      } else if (chestGraphic) {
        chestGraphic.textContent = prize;
      }
      chestGraphic.className = 'chest-3d-graphic prize-revealed';
      interactiveChest.className = 'interactive-chest-box opened';

      modalTitle.textContent = 'EPIC TREASURE! 🌟';
      chestInstruction.style.display = 'none';
      tapIndicators.style.display = 'none';

      launchBouncingGems();

      if (typeof confetti === 'function') {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#58CC02', '#FFC800', '#1CB0F6', '#FF4B4B', '#CE82FF']
        });

        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 60,
            origin: { x: 0.1, y: 0.7 }
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 60,
            origin: { x: 0.9, y: 0.7 }
          });
        }, 320);
      }

      speakWord('Awesome! You unlocked the Epic Treasure!');

      setTimeout(() => {
        rewardBadges.style.display = 'flex';
        continueBtn.style.display = 'block';
      }, 800);
    }, 350);
  }
}

function launchBouncingGems() {
  if (!chestPhysicsCanvas) return;

  const chestRect = interactiveChest.getBoundingClientRect();
  const startX = chestRect.left + chestRect.width / 2;
  const startY = chestRect.top + chestRect.height / 2;

  const cardRect = chestModalCard.getBoundingClientRect();
  const floorY = Math.min(window.innerHeight - 70, cardRect.bottom - 20);

  const targetRect = modalTopGems.getBoundingClientRect();
  const targetX = targetRect.left + targetRect.width / 2;
  const targetY = targetRect.top + targetRect.height / 2;

  const gemsCount = 18;
  const startGemNum = store.gems;
  const totalBonusGems = 20;

  if (pixiGemsController) {
    pixiGemsController.destroy();
    pixiGemsController = null;
  }

  pixiGemsController = launchPixiGemsPhysics(chestPhysicsCanvas, {
    startX,
    startY,
    floorY,
    targetX,
    targetY,
    count: gemsCount,
    onGemArrived: (arrivedCount) => {
      playGemPing();
      if (modalTopGems) {
        modalTopGems.classList.add('counter-bump');
        setTimeout(() => modalTopGems.classList.remove('counter-bump'), 120);
      }
      const currentVal = Math.min(
        startGemNum + totalBonusGems,
        startGemNum + Math.round((arrivedCount / gemsCount) * totalBonusGems)
      );
      if (modalGemCount) modalGemCount.textContent = currentVal;
      store.gems = currentVal;
    },
    onAllDone: () => {
      pixiGemsController = null;
    }
  });
}

function onContinueAfterCelebration() {
  destroyActivePixiEffects();
  if (celebrationModal) celebrationModal.classList.remove('active');

  // Advance level & award gems
  store.currentUnlockedLevel = Math.min(10, store.currentUnlockedLevel + 1);
  store.gems += 20;

  playDuoDing();
  eventBus.emit('chest:closed');
}

export const ChestModule = {
  mount() {
    initChestModalElements();
  },
  unmount() {
    destroyActivePixiEffects();
  },
  mountTab() {
    const tabChestEl = document.querySelector('#openMysteryChestCard .big-chest-graphic');
    if (tabChestEl && window.PIXI) {
      if (tabChestController) tabChestController.destroy();
      tabChestController = mountPixiChest(tabChestEl, 96);
      tabChestController.setTier('rare');
    }
  },
  unmountTab() {
    if (tabChestController) {
      tabChestController.destroy();
      tabChestController = null;
    }
  },
  open: openChestModal
};
