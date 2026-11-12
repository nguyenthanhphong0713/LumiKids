import { store } from './core/state.js';
import { eventBus } from './core/eventBus.js';
import { playDuoTap, unlockAudio } from './core/audio.js';

import { LearnModule } from './modules/learn.module.js';
import { BubblesModule } from './modules/bubbles.module.js';
import { WordsModule } from './modules/words.module.js';
import { NumbersModule } from './modules/numbers.module.js';
import { ChestModule } from './modules/chest.module.js';

// DOM Elements
const brandBtn = document.getElementById('brandBtn');
const streakDisplay = document.getElementById('streakCount');
const gemDisplay = document.getElementById('gemCount');
const heartsDisplay = document.getElementById('heartsCount');
const soundToggle = document.getElementById('soundToggle');
const bottomNav = document.getElementById('bottomNav');
const openMysteryChestCard = document.getElementById('openMysteryChestCard');

// Module mapping per tab
const MODULES = {
  pathScreen: LearnModule,
  bubblesScreen: BubblesModule,
  wordsScreen: WordsModule,
  numbersScreen: NumbersModule,
  chestsScreen: {
    mount() {},
    unmount() {}
  }
};

let activeTabId = 'pathScreen';

export function switchTab(targetTabId) {
  playDuoTap();

  // 1. Unmount previous active module
  if (MODULES[activeTabId] && typeof MODULES[activeTabId].unmount === 'function') {
    MODULES[activeTabId].unmount();
  }

  // 2. Update navigation active state
  document.querySelectorAll('.nav-tab').forEach((tab) => {
    tab.classList.toggle('active', tab.getAttribute('data-tab') === targetTabId);
  });

  // 3. Update screen view visibility
  document.querySelectorAll('.tab-screen').forEach((screen) => {
    screen.classList.toggle('active-tab', screen.id === targetTabId);
  });

  // 4. Mount target module
  activeTabId = targetTabId;
  store.currentTab = targetTabId;

  if (MODULES[targetTabId] && typeof MODULES[targetTabId].mount === 'function') {
    MODULES[targetTabId].mount();
  }
}

// Global Event Listeners & State Sync
function initGlobalEvents() {
  // Brand button returns to Learn path
  if (brandBtn) {
    brandBtn.addEventListener('click', () => switchTab('pathScreen'));
  }

  // Bottom Nav switcher
  if (bottomNav) {
    bottomNav.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('.nav-tab');
      if (tabBtn) {
        const targetTab = tabBtn.getAttribute('data-tab');
        switchTab(targetTab);
      }
    });
  }

  // Mystery Chest card in chests tab
  if (openMysteryChestCard) {
    openMysteryChestCard.addEventListener('click', () => {
      ChestModule.open();
    });
  }

  // Sound toggle button
  if (soundToggle) {
    soundToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      store.soundEnabled = !store.soundEnabled;
      updateSoundUI();
      playDuoTap();
    });
  }

  // Reactive State Subscribers
  eventBus.on('state:gems', (val) => {
    if (gemDisplay) gemDisplay.textContent = val;
  });

  eventBus.on('state:streak', (val) => {
    if (streakDisplay) streakDisplay.textContent = val;
  });

  eventBus.on('state:soundEnabled', () => {
    updateSoundUI();
  });

  // Gesture handling for mobile toddlers
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('touchmove', (e) => {
    if (!e.target.closest('.tab-screen')) {
      e.preventDefault();
    }
  }, { passive: false });

  // First interaction audio unlock
  ['click', 'touchstart', 'touchend', 'pointerdown'].forEach((evt) => {
    window.addEventListener(evt, unlockAudio, { once: true, passive: true });
  });
}

function updateSoundUI() {
  if (!soundToggle) return;
  soundToggle.textContent = store.soundEnabled ? '🔊' : '🔇';
  soundToggle.style.borderColor = store.soundEnabled ? '#E5E5E5' : '#FF4B4B';
}

function syncInitialState() {
  if (gemDisplay) gemDisplay.textContent = store.gems;
  if (streakDisplay) streakDisplay.textContent = store.streak;
  if (heartsDisplay) heartsDisplay.textContent = store.hearts;
  updateSoundUI();
}

// Service Worker Registration
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js?v=2.6.1')
        .then((reg) => reg.update())
        .catch(() => {});

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    });
  }
}

// Bootstrap Application
window.addEventListener('DOMContentLoaded', () => {
  ChestModule.mount();
  initGlobalEvents();
  syncInitialState();

  // Initialize and mount default tab (Learn Path)
  LearnModule.mount();

  initServiceWorker();
});
