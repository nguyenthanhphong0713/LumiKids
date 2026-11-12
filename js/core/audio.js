import { store } from './state.js';

/**
 * LumiKids Audio Engine - Web Audio API Synthesis & Bilingual SpeechSynthesis
 */
let audioContext = null;
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
let englishFemaleVoice = null;
let vietnameseVoice = null;
let audioUnlocked = false;

export function initAudioContext() {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      audioContext = new AudioCtx();
    }
  }
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

export function unlockAudio() {
  initAudioContext();
  if (synth) {
    try {
      if (synth.paused) synth.resume();
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
  const voices = synth.getVoices();
  if (!voices || voices.length === 0) return;

  // 1. English Female Voice
  const englishVoices = voices.filter(v => v.lang && (v.lang.startsWith('en') || v.lang.startsWith('en_')));

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
}

if (synth) {
  selectBestFemaleVoice();
  if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = selectBestFemaleVoice;
  }
}

export function speakWord(text, onFinished, lang = 'en') {
  if (!store.soundEnabled || !synth) {
    if (onFinished) setTimeout(onFinished, 150);
    return;
  }

  unlockAudio();

  // Immediately cancel previous utterance
  try {
    synth.cancel();
  } catch (e) {}

  if (!englishFemaleVoice || !vietnameseVoice) {
    selectBestFemaleVoice();
  }

  try {
    if (synth.paused) synth.resume();
  } catch (e) {}

  const utterance = new SpeechSynthesisUtterance(text);
  const isVietnamese = (lang === 'vi' || lang === 'vi-VN');

  if (isVietnamese) {
    if (vietnameseVoice) utterance.voice = vietnameseVoice;
    utterance.lang = 'vi-VN';
    utterance.rate = 0.92;
    utterance.pitch = 1.1;
  } else {
    if (englishFemaleVoice) utterance.voice = englishFemaleVoice;
    utterance.lang = 'en-US';
    utterance.rate = 1.05;
    utterance.pitch = 1.25;
  }
  utterance.volume = 1.0;

  let hasCompleted = false;
  let safetyTimer = null;

  const completeOnce = () => {
    if (!hasCompleted) {
      hasCompleted = true;
      if (safetyTimer) clearTimeout(safetyTimer);
      if (onFinished) onFinished();
    }
  };

  utterance.onend = () => completeOnce();
  utterance.onerror = () => completeOnce();

  const maxDuration = Math.max(500, text.length * 80 + 300);
  safetyTimer = setTimeout(completeOnce, maxDuration);

  try {
    synth.speak(utterance);
    if (synth.paused) synth.resume();
  } catch (e) {
    completeOnce();
  }
}
