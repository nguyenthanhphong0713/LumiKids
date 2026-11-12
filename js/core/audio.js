import { store } from './state.js';

/**
 * LumiKids Audio Engine - Web Audio API Synthesis & Bilingual SpeechSynthesis
 */
let audioContext = null;
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
let englishFemaleVoice = null;
let vietnameseVoice = null;
let audioUnlocked = false;
let activeUtterance = null; // Guard against WebKit / Chromium Garbage Collection bug

export function initAudioContext() {
  try {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioContext = new AudioCtx();
      }
    }
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }
  } catch (e) {}
}

export function unlockAudio() {
  initAudioContext();
  if (audioContext) {
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }
    // WebKit mobile audio unlock: play 1-sample silent buffer
    try {
      const buffer = audioContext.createBuffer(1, 1, 22050);
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(0);
    } catch (e) {}
  }

  // Mobile SpeechSynthesis unlock
  if (synth) {
    try {
      if (synth.paused) synth.resume();
      if (!audioUnlocked) {
        const dummy = new SpeechSynthesisUtterance(' ');
        dummy.volume = 0.01;
        synth.speak(dummy);
      }
    } catch (e) {}
  }
  audioUnlocked = true;
}

// Iconic Duolingo Two-Tone Ding: D5 (587.33Hz) -> A5 (880.00Hz)
export function playDuoDing() {
  if (!store.soundEnabled) return;
  initAudioContext();
  if (!audioContext) return;

  try {
    if (audioContext.state === 'suspended') audioContext.resume();
    const now = audioContext.currentTime;

    // Note 1: D5 (587.33 Hz)
    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.35, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc1.connect(gain1);
    gain1.connect(audioContext.destination);
    osc1.start(now);
    osc1.stop(now + 0.13);

    // Note 2: A5 (880 Hz) - iconic high chime
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.08);
    gain2.gain.setValueAtTime(0.4, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    osc2.connect(gain2);
    gain2.connect(audioContext.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.4);
  } catch (e) {}
}

// Snappy tactile button tap sound
export function playDuoTap() {
  if (!store.soundEnabled) return;
  initAudioContext();
  if (!audioContext) return;

  try {
    if (audioContext.state === 'suspended') audioContext.resume();
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.06);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  } catch (e) {}
}

// Soft squishy rubber & spring wobble sound
export function playSquishSpring(step) {
  if (!store.soundEnabled) return;
  initAudioContext();
  if (!audioContext) return;

  try {
    if (audioContext.state === 'suspended') audioContext.resume();
    const now = audioContext.currentTime;

    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    osc1.type = 'sine';
    const startFreq = step === 1 ? 280 : 340;
    osc1.frequency.setValueAtTime(startFreq, now);
    osc1.frequency.exponentialRampToValueAtTime(startFreq * 0.55, now + 0.08);
    osc1.frequency.exponentialRampToValueAtTime(startFreq * 1.5, now + 0.22);

    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc1.connect(gain1);
    gain1.connect(audioContext.destination);
    osc1.start(now);
    osc1.stop(now + 0.26);
  } catch (e) {}
}

// Rarity Tier Upgraded Musical Fanfare Chime
export function playRarityUpgrade(tier) {
  if (!store.soundEnabled) return;
  initAudioContext();
  if (!audioContext) return;

  const chord = tier === 1 
    ? [523.25, 659.25, 783.99] // C5 -> E5 -> G5 (Golden Rare)
    : [587.33, 739.99, 880.00, 1174.66]; // D5 -> F#5 -> A5 -> D6 (Celestial Epic)

  chord.forEach((freq, idx) => {
    setTimeout(() => {
      try {
        if (audioContext.state === 'suspended') audioContext.resume();
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = tier === 1 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.32, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start(now);
        osc.stop(now + 0.32);
      } catch (e) {}
    }, idx * 75);
  });
}

// Victory fanfare chime played upon chest opening
export function playVictoryFanfare() {
  if (!store.soundEnabled) return;
  initAudioContext();
  if (!audioContext) return;

  const notes = [
    { freq: 523.25, delay: 0 },    // C5
    { freq: 659.25, delay: 90 },   // E5
    { freq: 783.99, delay: 180 },  // G5
    { freq: 1046.50, delay: 280 }  // C6
  ];

  notes.forEach((item) => {
    setTimeout(() => {
      try {
        if (audioContext.state === 'suspended') audioContext.resume();
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(item.freq, now);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start(now);
        osc.stop(now + 0.38);
      } catch (e) {}
    }, item.delay);
  });
}

// High crystalline ping when bouncing gem strikes top counter
export function playGemPing() {
  if (!store.soundEnabled) return;
  initAudioContext();
  if (!audioContext) return;

  try {
    if (audioContext.state === 'suspended') audioContext.resume();
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'sine';
    const pitch = 1800 + Math.random() * 400;
    osc.frequency.setValueAtTime(pitch, now);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  } catch (e) {}
}

// Cute Soap Bubble Pop Synthesizer
export function playCuteBubblePop() {
  if (!store.soundEnabled) return;
  initAudioContext();
  if (!audioContext) return;

  try {
    if (audioContext.state === 'suspended') audioContext.resume();
    const now = audioContext.currentTime;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(860, now + 0.08);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(now);
    osc.stop(now + 0.13);

    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1250, now + 0.02);
    osc2.frequency.exponentialRampToValueAtTime(1600, now + 0.09);

    gain2.gain.setValueAtTime(0.2, now + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc2.connect(gain2);
    gain2.connect(audioContext.destination);
    osc2.start(now + 0.02);
    osc2.stop(now + 0.15);
  } catch (e) {}
}

const FEMALE_VOICE_PREFERENCES = [
  'Samantha', 'Ava', 'Allison', 'Victoria', 'Karen', 'Moira',
  'Google US English', 'Jenny', 'Aria', 'Zira', 'en-US-Neural2-F'
];

export function selectBestFemaleVoice() {
  if (!synth) return;
  try {
    const voices = synth.getVoices();
    if (!voices || voices.length === 0) return;

    // 1. English Female Voice
    const englishVoices = voices.filter(v => v.lang && (v.lang.toLowerCase().startsWith('en')));

    for (const pref of FEMALE_VOICE_PREFERENCES) {
      const found = englishVoices.find(v => v.name && v.name.toLowerCase().includes(pref.toLowerCase()));
      if (found) {
        englishFemaleVoice = found;
        break;
      }
    }

    if (!englishFemaleVoice) {
      const genericFemale = englishVoices.find(v => {
        const n = (v.name + ' ' + (v.gender || '')).toLowerCase();
        return n.includes('female') || n.includes('woman') || n.includes('girl');
      });
      englishFemaleVoice = genericFemale || englishVoices[0] || voices[0];
    }

    // 2. Vietnamese Voice
    const viVoices = voices.filter(v => v.lang && (v.lang.toLowerCase().startsWith('vi') || v.lang.toLowerCase().includes('vie')));
    if (viVoices.length > 0) {
      const viFemale = viVoices.find(v => {
        const n = (v.name + ' ' + (v.gender || '')).toLowerCase();
        return n.includes('female') || n.includes('nu') || n.includes('nữ') || n.includes('mai') || n.includes('linh') || n.includes('an') || n.includes('hoaimy');
      });
      vietnameseVoice = viFemale || viVoices[0];
    }
  } catch (e) {}
}

if (synth) {
  selectBestFemaleVoice();
  if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = selectBestFemaleVoice;
  }
  // Mobile browsers often load voices asynchronously without triggering onvoiceschanged
  setTimeout(selectBestFemaleVoice, 300);
  setTimeout(selectBestFemaleVoice, 1200);
}

export function speakWord(text, onFinished, lang = 'en') {
  if (!store.soundEnabled) {
    if (onFinished) setTimeout(onFinished, 100);
    return;
  }

  unlockAudio();

  if (!synth) {
    if (onFinished) setTimeout(onFinished, 150);
    return;
  }

  // Cancel prior utterances safely
  try {
    if (synth.speaking || synth.pending) {
      synth.cancel();
    }
  } catch (e) {}

  // 40ms timeout prevents iOS Safari cancel() race condition
  setTimeout(() => {
    try {
      if (synth.paused) synth.resume();

      if (!englishFemaleVoice || !vietnameseVoice) {
        selectBestFemaleVoice();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      activeUtterance = utterance; // Keep active reference to prevent Garbage Collection bug

      const isVietnamese = (lang === 'vi' || lang === 'vi-VN');

      if (isVietnamese) {
        if (vietnameseVoice) utterance.voice = vietnameseVoice;
        utterance.lang = 'vi-VN';
        utterance.rate = 0.92;
        utterance.pitch = 1.05;
      } else {
        if (englishFemaleVoice) utterance.voice = englishFemaleVoice;
        utterance.lang = 'en-US';
        utterance.rate = 0.95;
        utterance.pitch = 1.15;
      }
      utterance.volume = 1.0;

      let hasCompleted = false;
      let safetyTimer = null;

      const completeOnce = () => {
        if (!hasCompleted) {
          hasCompleted = true;
          activeUtterance = null;
          if (safetyTimer) clearTimeout(safetyTimer);
          if (onFinished) onFinished();
        }
      };

      utterance.onend = () => completeOnce();
      utterance.onerror = () => completeOnce();

      const maxDuration = Math.max(600, text.length * 90 + 400);
      safetyTimer = setTimeout(completeOnce, maxDuration);

      synth.speak(utterance);
      if (synth.paused) synth.resume();
    } catch (e) {
      if (onFinished) onFinished();
    }
  }, 40);
}
