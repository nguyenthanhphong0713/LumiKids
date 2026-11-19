import { store } from '../core/state.js';
import { eventBus } from '../core/eventBus.js';
import { playDuoDing, playDuoTap, speakWord, unlockAudio } from '../core/audio.js';
import { LESSON_LEVELS, DUO_PRAISES } from '../data/curriculum.data.js';
import { openChestModal } from './chest.module.js';
import { CAREER_CHARACTERS, getLevelMascot } from '../core/characters.js';
import { mountPixiCharacter } from '../core/pixiCharacters.js';

let activeLevel = null;
let wordsCompletedInLesson = 0;
let pendingNextCardTimer = null;
let pathMascotController = null;
let lessonMascotController = null;

// DOM references
let stonesPath = null;
let lessonScreen = null;
let closeLessonBtn = null;
let lessonProgressFill = null;
let instructionText = null;
let lessonCards = null;
let duoFeedbackDrawer = null;
let feedbackTitle = null;
let feedbackWord = null;
let feedbackContinueBtn = null;

export function initLearnDOM() {
  stonesPath = document.getElementById('stonesPath');
  lessonScreen = document.getElementById('lessonScreen');
  closeLessonBtn = document.getElementById('closeLessonBtn');
  lessonProgressFill = document.getElementById('lessonProgressFill');
  instructionText = document.getElementById('instructionText');
  lessonCards = document.getElementById('lessonCards');
  duoFeedbackDrawer = document.getElementById('duoFeedbackDrawer');
  feedbackTitle = document.getElementById('feedbackTitle');
  feedbackWord = document.getElementById('feedbackWord');
  feedbackContinueBtn = document.getElementById('feedbackContinueBtn');

  if (closeLessonBtn) {
    closeLessonBtn.onclick = closeLesson;
  }
}

export function renderSteppingStonesMap() {
  if (!stonesPath) initLearnDOM();
  if (!stonesPath) return;

  if (pathMascotController) {
    pathMascotController.destroy();
    pathMascotController = null;
  }

  stonesPath.innerHTML = '';

  LESSON_LEVELS.forEach((level) => {
    const isCompleted = level.id < store.currentUnlockedLevel;
    const isCurrent = level.id === store.currentUnlockedLevel;
    const isLocked = level.id > store.currentUnlockedLevel;
    const mascot = getLevelMascot(level.id);

    const node = document.createElement('div');
    node.className = `stone-node ${level.offset} ${level.isChest ? 'chest-node' : ''}`;
    if (isCompleted) node.classList.add('completed');
    if (isCurrent) node.classList.add('current');
    if (isLocked) node.classList.add('locked');

    let mascotHtml = '';
    if (isCurrent) {
      mascotHtml = `
        <div class="mascot-follower" title="${mascot.name}">
          <div class="mascot-bubble">${mascot.bubble}</div>
          <div class="pixi-mascot-host" data-char-id="${mascot.id}"></div>
        </div>
      `;
    }

    node.innerHTML = `
      ${mascotHtml}
      <button class="stone-button" aria-label="${level.title}">
        ${isCompleted ? '⭐' : level.badge}
      </button>
      <div class="stone-title">
        <span class="stone-mascot-tag" title="${mascot.name}">
          ${mascot.renderSvg('mascot-svg-mini')}
          <span>${mascot.name}</span>
        </span>
        <span class="stone-title-text">${level.title}</span>
      </div>
    `;

    if (!isLocked) {
      node.addEventListener('click', () => {
        playDuoTap();
        if (level.isChest) {
          openChestModal();
        } else {
          startLesson(level);
        }
      });
    } else {
      node.addEventListener('click', () => {
        playDuoTap();
        speakWord('Finish earlier lessons first!');
      });
    }

    stonesPath.appendChild(node);

    if (isCurrent) {
      const host = node.querySelector('.pixi-mascot-host');
      if (host) {
        if (window.PIXI) {
          pathMascotController = mountPixiCharacter(host, mascot.id, 76);
        } else {
          host.innerHTML = mascot.renderSvg('mascot-svg-main');
        }
      }
    }
  });
}

export function startLesson(level) {
  if (!lessonScreen) initLearnDOM();
  activeLevel = level;
  wordsCompletedInLesson = 0;
  updateLessonProgress();

  const mascot = getLevelMascot(level.id);
  const lessonMascotEl = document.getElementById('lessonMascot');
  if (lessonMascotController) {
    lessonMascotController.destroy();
    lessonMascotController = null;
  }
  if (lessonMascotEl) {
    lessonMascotEl.title = mascot.name;
    if (window.PIXI) {
      lessonMascotController = mountPixiCharacter(lessonMascotEl, mascot.id, 52);
    } else {
      lessonMascotEl.innerHTML = mascot.renderSvg('mascot-svg-lesson');
    }
  }

  if (instructionText) instructionText.textContent = `${mascot.name}: Tap any picture!`;
  hideFeedbackDrawer();
  renderLessonCards(level.words);

  document.body.classList.add('in-lesson');
  const appEl = document.getElementById('app');
  if (appEl) appEl.classList.add('in-lesson');
  if (lessonScreen) lessonScreen.classList.add('active-lesson');
}

function renderLessonCards(words) {
  if (!lessonCards) return;
  lessonCards.innerHTML = '';

  words.forEach((item) => {
    const card = document.createElement('button');
    card.className = 'duo-card';
    card.setAttribute('type', 'button');
    card.setAttribute('aria-label', item.word);

    card.innerHTML = `
      <div class="card-check-badge">✓</div>
      <span class="card-emoji">${item.emoji}</span>
      <span class="card-label">${item.word}</span>
    `;

    card.addEventListener('click', () => handleLessonCardTap(card, item));
    lessonCards.appendChild(card);
  });
}

function handleLessonCardTap(cardElement, wordItem) {
  if (!activeLevel || cardElement.classList.contains('card-done')) return;
  unlockAudio();

  cardElement.classList.add('card-done', 'card-disappearing');
  playDuoDing();
  speakWord(wordItem.word);

  const mascot = getLevelMascot(activeLevel.id);
  if (instructionText) {
    instructionText.textContent = `${mascot.name}: ${wordItem.word}! ${wordItem.emoji}`;
  }

  wordsCompletedInLesson++;
  updateLessonProgress();

  // Only show the Continue / Next Level button once all 4 cards are tapped
  if (wordsCompletedInLesson >= activeLevel.words.length) {
    const randomPraise = DUO_PRAISES[Math.floor(Math.random() * DUO_PRAISES.length)];
    if (feedbackTitle) feedbackTitle.textContent = randomPraise;
    if (feedbackWord) feedbackWord.textContent = `${mascot.praise}`;

    if (pendingNextCardTimer) clearTimeout(pendingNextCardTimer);
    pendingNextCardTimer = setTimeout(() => {
      showFeedbackDrawer();
    }, 380);

    if (feedbackContinueBtn) {
      feedbackContinueBtn.onclick = () => {
        if (pendingNextCardTimer) clearTimeout(pendingNextCardTimer);
        playDuoTap();
        completeLesson();
      };
    }
  }
}

function showFeedbackDrawer() {
  if (duoFeedbackDrawer) duoFeedbackDrawer.classList.add('active-sheet');
}

function hideFeedbackDrawer() {
  if (duoFeedbackDrawer) duoFeedbackDrawer.classList.remove('active-sheet');
}

function updateLessonProgress() {
  if (!lessonProgressFill) return;
  const total = activeLevel ? activeLevel.words.length : 4;
  const pct = Math.min((wordsCompletedInLesson / total) * 100, 100);
  lessonProgressFill.style.width = `${pct}%`;
}

export function closeLesson() {
  if (pendingNextCardTimer) clearTimeout(pendingNextCardTimer);
  if (lessonMascotController) {
    lessonMascotController.destroy();
    lessonMascotController = null;
  }
  hideFeedbackDrawer();
  document.body.classList.remove('in-lesson');
  const appEl = document.getElementById('app');
  if (appEl) appEl.classList.remove('in-lesson');
  if (lessonScreen) lessonScreen.classList.remove('active-lesson');
  if (lessonCards) lessonCards.innerHTML = '';
  activeLevel = null;
}

function completeLesson() {
  hideFeedbackDrawer();
  closeLesson();
  openChestModal();
}

// React to chest closed event: scroll smoothly to newly unlocked stone node
eventBus.on('chest:closed', () => {
  renderSteppingStonesMap();
  setTimeout(() => {
    const activeNode = document.querySelector('.stone-node.current');
    if (activeNode) {
      activeNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 300);
});

export const LearnModule = {
  mount() {
    initLearnDOM();
    renderSteppingStonesMap();
  },
  unmount() {
    if (pathMascotController) {
      pathMascotController.destroy();
      pathMascotController = null;
    }
    closeLesson();
  }
};
