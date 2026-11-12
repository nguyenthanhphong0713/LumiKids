import { store } from '../core/state.js';
import { playDuoDing, playDuoTap, speakWord, unlockAudio } from '../core/audio.js';
import { NUMBERS_DATA } from '../data/numbers.data.js';

let numberCurrentLang = 'en';
let isAutoCounting = false;
let autoCountTimer = null;

// DOM references
let langEnBtn = null;
let langViBtn = null;
let autoCountBtn = null;
let autoCountIcon = null;
let autoCountText = null;
let numbersGrid = null;

export function initNumbersDOM() {
  langEnBtn = document.getElementById('langEnBtn');
  langViBtn = document.getElementById('langViBtn');
  autoCountBtn = document.getElementById('autoCountBtn');
  autoCountIcon = document.getElementById('autoCountIcon');
  autoCountText = document.getElementById('autoCountText');
  numbersGrid = document.getElementById('numbersGrid');

  if (langEnBtn) langEnBtn.onclick = () => setNumbersLanguage('en');
  if (langViBtn) langViBtn.onclick = () => setNumbersLanguage('vi');
  if (autoCountBtn) autoCountBtn.onclick = toggleAutoCount;
}

export function renderNumbersGrid() {
  if (!numbersGrid) initNumbersDOM();
  if (!numbersGrid) return;

  numbersGrid.innerHTML = '';

  NUMBERS_DATA.forEach((item, index) => {
    const card = document.createElement('button');
    card.className = 'number-card';
    card.setAttribute('type', 'button');
    card.setAttribute('data-num', item.num);
    card.setAttribute('data-index', index);
    card.style.setProperty('--num-color', item.color);
    card.style.setProperty('--num-shadow', item.shadow);

    const emojisHtml = Array(item.num).fill(item.emoji).join(' ');
    const wordLabel = numberCurrentLang === 'vi' ? item.vi : item.en;
    const descLabel = numberCurrentLang === 'vi' ? item.descVi : item.descEn;

    card.innerHTML = `
      <div class="num-digit">${item.num}</div>
      <div class="num-objects">${emojisHtml}</div>
      <div class="num-word-label">${wordLabel}</div>
      <div class="num-desc-label">${descLabel}</div>
    `;

    card.addEventListener('click', (e) => {
      e.preventDefault();
      if (isAutoCounting) stopAutoCount();
      handleNumberTap(item, card);
    });

    numbersGrid.appendChild(card);
  });
}

function handleNumberTap(item, card) {
  unlockAudio();
  playDuoDing();

  card.classList.remove('number-speaking');
  void card.offsetWidth;
  card.classList.add('number-speaking');
  setTimeout(() => card.classList.remove('number-speaking'), 500);

  const wordToSpeak = numberCurrentLang === 'vi' ? item.vi : item.en;
  speakWord(wordToSpeak, null, numberCurrentLang);

  if (item.num === 10 && typeof confetti === 'function') {
    const rect = card.getBoundingClientRect();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight
      },
      colors: [item.color, '#FFC800', '#1CB0F6', '#58CC02']
    });
  }
}

export function setNumbersLanguage(lang) {
  if (numberCurrentLang === lang) return;
  playDuoTap();
  numberCurrentLang = lang;

  if (lang === 'vi') {
    if (langViBtn) langViBtn.classList.add('active');
    if (langEnBtn) langEnBtn.classList.remove('active');
    if (autoCountText) {
      autoCountText.textContent = isAutoCounting ? 'Dừng đọc ⏹️' : 'Đọc lần lượt 1 - 10';
    }
    speakWord('Tiếng Việt!', null, 'vi');
  } else {
    if (langEnBtn) langEnBtn.classList.add('active');
    if (langViBtn) langViBtn.classList.remove('active');
    if (autoCountText) {
      autoCountText.textContent = isAutoCounting ? 'Stop Counting ⏹️' : 'Count 1 to 10';
    }
    speakWord('English!', null, 'en');
  }

  updateNumberCardLabels();
}

function updateNumberCardLabels() {
  if (!numbersGrid) return;
  const cards = numbersGrid.querySelectorAll('.number-card');
  cards.forEach((card, idx) => {
    const item = NUMBERS_DATA[idx];
    if (!item) return;
    const wordEl = card.querySelector('.num-word-label');
    const descEl = card.querySelector('.num-desc-label');
    if (wordEl) wordEl.textContent = numberCurrentLang === 'vi' ? item.vi : item.en;
    if (descEl) descEl.textContent = numberCurrentLang === 'vi' ? item.descVi : item.descEn;
  });
}

export function toggleAutoCount() {
  if (isAutoCounting) {
    stopAutoCount();
  } else {
    startAutoCount();
  }
}

export function startAutoCount() {
  unlockAudio();
  isAutoCounting = true;
  if (autoCountBtn) {
    autoCountBtn.classList.add('counting-active');
    if (autoCountIcon) autoCountIcon.textContent = '⏹️';
    if (autoCountText) autoCountText.textContent = numberCurrentLang === 'vi' ? 'Dừng đọc ⏹️' : 'Stop Counting ⏹️';
  }

  runAutoCountStep(0);
}

export function stopAutoCount() {
  isAutoCounting = false;
  if (autoCountTimer) {
    clearTimeout(autoCountTimer);
    autoCountTimer = null;
  }
  if (autoCountBtn) {
    autoCountBtn.classList.remove('counting-active');
    if (autoCountIcon) autoCountIcon.textContent = '▶️';
    if (autoCountText) autoCountText.textContent = numberCurrentLang === 'vi' ? 'Đọc lần lượt 1 - 10' : 'Count 1 to 10';
  }
  if (numbersGrid) {
    numbersGrid.querySelectorAll('.number-card').forEach(c => c.classList.remove('number-speaking'));
  }
}

function runAutoCountStep(index) {
  if (!isAutoCounting) return;

  if (index >= NUMBERS_DATA.length) {
    stopAutoCount();
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 65,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
    playDuoDing();
    const finishMessage = numberCurrentLang === 'vi' ? 'Tuyệt vời! Bé đã đếm xong 10 số!' : 'Awesome! You counted from one to ten!';
    speakWord(finishMessage, null, numberCurrentLang);
    return;
  }

  const item = NUMBERS_DATA[index];
  const cards = numbersGrid ? numbersGrid.querySelectorAll('.number-card') : [];
  const card = cards[index];

  if (card) {
    cards.forEach(c => c.classList.remove('number-speaking'));
    card.classList.add('number-speaking');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  playDuoDing();
  const wordToSpeak = numberCurrentLang === 'vi' ? item.vi : item.en;
  speakWord(wordToSpeak, () => {
    if (!isAutoCounting) return;
    autoCountTimer = setTimeout(() => {
      runAutoCountStep(index + 1);
    }, 550);
  }, numberCurrentLang);
}

export const NumbersModule = {
  mount() {
    initNumbersDOM();
    renderNumbersGrid();
  },
  unmount() {
    stopAutoCount();
  }
};
