import { store } from '../core/state.js';
import { eventBus } from '../core/eventBus.js';
import { playDuoDing, playDuoTap, speakWord, unlockAudio } from '../core/audio.js';
import { LESSON_LEVELS, DUO_PRAISES } from '../data/curriculum.data.js';
import { openChestModal } from './chest.module.js';

let activeLevel = null;
let wordsCompletedInLesson = 0;
let pendingNextCardTimer = null;

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

  stonesPath.innerHTML = '';

  LESSON_LEVELS.forEach((level) => {
    const isCompleted = level.id < store.currentUnlockedLevel;
    const isCurrent = level.id === store.currentUnlockedLevel;
    const isLocked = level.id > store.currentUnlockedLevel;

    const node = document.createElement('div');
    node.className = `stone-node ${level.offset} ${level.isChest ? 'chest-node' : ''}`;
    if (isCompleted) node.classList.add('completed');
    if (isCurrent) node.classList.add('current');
    if (isLocked) node.classList.add('locked');

    let mascotHtml = '';
    if (isCurrent) {
      mascotHtml = `
        <div class="mascot-follower">
          <div class="mascot-bubble">START!</div>
          🦉
        </div>
      `;
    }

    node.innerHTML = `
      ${mascotHtml}
      <button class="stone-button" aria-label="${level.title}">
        ${isCompleted ? '⭐' : level.badge}
      </button>
      <div class="stone-title">${level.title}</div>
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
  });
}

export function startLesson(level) {
  if (!lessonScreen) initLearnDOM();
  activeLevel = level;
  wordsCompletedInLesson = 0;
  updateLessonProgress();

  if (instructionText) instructionText.textContent = `Tap any picture!`;
  hideFeedbackDrawer();
  renderLessonCards(level.words);

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
  unlockAudio();

  document.querySelectorAll('.duo-card').forEach(c => c.classList.remove('card-selected'));
  cardElement.classList.add('card-selected');

  playDuoDing();
  speakWord(wordItem.word);

  const randomPraise = DUO_PRAISES[Math.floor(Math.random() * DUO_PRAISES.length)];
  if (feedbackTitle) feedbackTitle.textContent = randomPraise;
  if (feedbackWord) feedbackWord.textContent = `${wordItem.word} ${wordItem.emoji}`;
  showFeedbackDrawer();

  if (pendingNextCardTimer) clearTimeout(pendingNextCardTimer);
  pendingNextCardTimer = setTimeout(() => {
    if (cardElement.classList.contains('card-selected') && !cardElement.classList.contains('card-done')) {
      completeCardAndAdvance(cardElement);
    }
  }, 3500);

  if (feedbackContinueBtn) {
    feedbackContinueBtn.onclick = () => {
      if (pendingNextCardTimer) clearTimeout(pendingNextCardTimer);
      completeCardAndAdvance(cardElement);
    };
  }
}

function completeCardAndAdvance(cardElement) {
  hideFeedbackDrawer();
  playDuoTap();

  if (!cardElement.classList.contains('card-done')) {
    cardElement.classList.remove('card-selected');
    cardElement.classList.add('card-done');
    wordsCompletedInLesson++;
    updateLessonProgress();

    if (wordsCompletedInLesson >= activeLevel.words.length) {
      setTimeout(completeLesson, 400);
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
  hideFeedbackDrawer();
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
    closeLesson();
  }
};
