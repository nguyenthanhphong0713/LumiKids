import { store } from '../core/state.js';
import { playDuoDing, speakWord } from '../core/audio.js';
import { LESSON_LEVELS } from '../data/curriculum.data.js';

let wordsGrid = null;

export function initWordsDOM() {
  wordsGrid = document.getElementById('wordsGrid');
}

export function renderWordsShelf() {
  if (!wordsGrid) initWordsDOM();
  if (!wordsGrid) return;

  wordsGrid.innerHTML = '';

  const availableLevels = LESSON_LEVELS.filter(lvl => lvl.id <= store.currentUnlockedLevel);

  availableLevels.forEach(lvl => {
    lvl.words.forEach(item => {
      const tile = document.createElement('div');
      tile.className = 'word-card-tile';
      tile.innerHTML = `
        <span class="tile-emoji">${item.emoji}</span>
        <span class="tile-name">${item.word}</span>
        <span class="tile-speaker">🔊 Listen</span>
      `;
      tile.addEventListener('click', () => {
        playDuoDing();
        speakWord(item.word);
        tile.style.transform = 'scale(1.08)';
        setTimeout(() => tile.style.transform = '', 200);
      });
      wordsGrid.appendChild(tile);
    });
  });
}

export const WordsModule = {
  mount() {
    initWordsDOM();
    renderWordsShelf();
  },
  unmount() {}
};
