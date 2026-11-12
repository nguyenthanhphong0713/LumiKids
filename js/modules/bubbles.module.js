import { store } from '../core/state.js';
import { playCuteBubblePop, speakWord } from '../core/audio.js';
import { BUBBLE_WORDS_POOL, CUTE_BURST_SYMBOLS } from '../data/bubbles.data.js';

let bubbleSpawnInterval = null;
let bubbleScore = 0;
let isBubbleModeActive = false;

// DOM references
let bubbleSky = null;
let bubbleScoreDisplay = null;

export function initBubblesDOM() {
  bubbleSky = document.getElementById('bubbleSky');
  bubbleScoreDisplay = document.getElementById('bubbleScore');
}

export function startBubbleMode() {
  if (!bubbleSky) initBubblesDOM();
  if (!bubbleSky) return;

  isBubbleModeActive = true;
  if (bubbleSpawnInterval) clearInterval(bubbleSpawnInterval);

  // Pre-spawn bubbles at staggered vertical positions
  const existing = bubbleSky.querySelectorAll('.floating-bubble:not(.bubble-popping)');
  if (existing.length < 3) {
    spawnBubble(-2.5);
    spawnBubble(-5.0);
    spawnBubble(0);
  }

  // Continuous spawner runs non-stop
  bubbleSpawnInterval = setInterval(() => {
    if (!isBubbleModeActive || !bubbleSky) return;
    const current = bubbleSky.querySelectorAll('.floating-bubble:not(.bubble-popping)');
    if (current.length < 7) {
      spawnBubble(0);
    }
  }, 1500);
}

export function stopBubbleMode() {
  isBubbleModeActive = false;
  if (bubbleSpawnInterval) {
    clearInterval(bubbleSpawnInterval);
    bubbleSpawnInterval = null;
  }
}

function spawnBubble(preDelaySec = 0) {
  if (!bubbleSky) return;

  const item = BUBBLE_WORDS_POOL[Math.floor(Math.random() * BUBBLE_WORDS_POOL.length)];
  const bubble = document.createElement('div');
  bubble.className = 'floating-bubble';

  bubble.innerHTML = `
    <span class="bubble-emoji">${item.emoji}</span>
    <span class="bubble-label">${item.word}</span>
  `;

  // Random horizontal position (6% to 70%)
  const leftPct = 6 + Math.random() * 66;
  bubble.style.left = `${leftPct}%`;

  const duration = 7.5 + Math.random() * 2.0;
  bubble.style.animationDuration = `${duration}s, 2.6s`;

  if (preDelaySec < 0) {
    bubble.style.animationDelay = `${preDelaySec}s, 0s`;
  }

  let popped = false;
  const onPop = (e) => {
    if (popped) return;
    popped = true;
    e.stopPropagation();
    e.preventDefault();
    popBubble(bubble, item);
  };

  bubble.addEventListener('pointerdown', onPop);
  bubble.addEventListener('click', onPop);

  bubble.addEventListener('animationend', (e) => {
    if (e.animationName === 'bubbleRiseUp') {
      bubble.remove();
    }
  });

  bubbleSky.appendChild(bubble);
}

function popBubble(bubble, item) {
  if (bubble.classList.contains('bubble-popping')) return;
  bubble.classList.add('bubble-popping');

  playCuteBubblePop();
  speakWord(item.word);

  const rect = bubble.getBoundingClientRect();
  const skyRect = bubbleSky ? bubbleSky.getBoundingClientRect() : { left: 0, top: 0 };
  const x = (rect.left + rect.width / 2) - skyRect.left;
  const y = (rect.top + rect.height / 2) - skyRect.top;

  createPopParticles(x, y);
  createPopScoreFloat(x, y);

  bubbleScore++;
  if (bubbleScoreDisplay) {
    bubbleScoreDisplay.textContent = bubbleScore;
  }
  store.gems += 1;

  // Milestone confetti every 10 popped bubbles
  if (bubbleScore % 10 === 0 && typeof confetti === 'function') {
    confetti({
      particleCount: 55,
      spread: 75,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight
      },
      colors: ['#58CC02', '#FFC800', '#1CB0F6', '#FF4B4B', '#CE82FF']
    });
    setTimeout(() => {
      speakWord(`Awesome! ${bubbleScore} bubbles!`);
    }, 320);
  }

  setTimeout(() => {
    bubble.remove();
  }, 230);
}

function createPopParticles(x, y) {
  if (!bubbleSky) return;
  const count = 7;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'pop-particle';
    const symbol = CUTE_BURST_SYMBOLS[Math.floor(Math.random() * CUTE_BURST_SYMBOLS.length)];
    p.textContent = symbol;
    p.style.fontSize = `${1.2 + Math.random() * 0.7}rem`;

    const angle = (i / count) * 2 * Math.PI + (Math.random() - 0.5) * 0.4;
    const dist = 38 + Math.random() * 45;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;

    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.setProperty('--dx', `${dx}px`);
    p.style.setProperty('--dy', `${dy}px`);

    bubbleSky.appendChild(p);
    setTimeout(() => p.remove(), 580);
  }
}

function createPopScoreFloat(x, y) {
  if (!bubbleSky) return;
  const f = document.createElement('div');
  f.className = 'pop-score-float';
  f.textContent = '+1 ⭐';
  f.style.left = `${x - 18}px`;
  f.style.top = `${y - 15}px`;
  bubbleSky.appendChild(f);
  setTimeout(() => f.remove(), 750);
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
