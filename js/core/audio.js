import { store } from './state.js';
import { eventBus } from './eventBus.js';

/**
 * LumiKids Audio Engine - @pixi/sound + Rich Synthesized WAV Effects & Bilingual SpeechSynthesis
 */
const SAMPLE_RATE = 44100;
let audioContext = null;
let pixiSoundsInitialized = false;

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
let englishFemaleVoice = null;
let vietnameseVoice = null;
let audioUnlocked = false;
let activeUtterance = null; // Guard against WebKit / Chromium Garbage Collection bug

function getPixiSound() {
  return typeof window !== 'undefined' && window.PIXI && window.PIXI.sound
    ? window.PIXI.sound
    : null;
}

/**
 * Build a 16-bit PCM mono WAV ArrayBuffer from a sample generator (t in seconds -> [-1, 1])
 */
function buildWavBuffer(durationSec, sampleFn) {
  const numSamples = Math.floor(SAMPLE_RATE * durationSec);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeStr = (offset, str) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);           // PCM chunk size
  view.setUint16(20, 1, true);            // PCM format
  view.setUint16(22, 1, true);            // Mono
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const raw = sampleFn(t, durationSec);
    const clamped = Math.max(-1, Math.min(1, raw));
    view.setInt16(44 + i * 2, clamped * 0x7fff, true);
  }

  return buffer;
}

/**
 * Helper for smooth bell/marimba note with warm 2nd & 3rd harmonics
 */
function bellTone(t, start, dur, freq, amp = 0.5) {
  const lt = t - start;
  if (lt < 0 || lt > dur) return 0;
  const attack = Math.min(1, lt / 0.008);
  const decay = Math.exp(-lt * (5.5 / dur));
  const fundamental = Math.sin(2 * Math.PI * freq * lt);
  const harmonic2 = 0.35 * Math.sin(2 * Math.PI * freq * 2 * lt) * Math.exp(-lt * 8);
  const harmonic3 = 0.14 * Math.sin(2 * Math.PI * freq * 3 * lt) * Math.exp(-lt * 12);
  return amp * attack * decay * (fundamental + harmonic2 + harmonic3);
}

/**
 * Register all rich synthesized sound effects into @pixi/sound
 */
function initPixiSounds() {
  if (pixiSoundsInitialized) return;
  const pixiSound = getPixiSound();
  if (!pixiSound) return;

  try {
    const register = (alias, wavBuffer) => {
      if (!pixiSound.exists(alias)) {
        pixiSound.add(alias, { source: wavBuffer, preload: true });
      }
    };

    // 1. Duolingo-style warm two-tone marimba chime (D5 -> A5)
    register('duo-ding', buildWavBuffer(0.45, (t) => {
      return bellTone(t, 0, 0.22, 587.33, 0.45) + bellTone(t, 0.08, 0.36, 880.0, 0.52);
    }));

    // 2. Crisp tactile wooden-pop tap
    register('duo-tap', buildWavBuffer(0.09, (t) => {
      const env = Math.min(1, t / 0.003) * Math.exp(-t * 48);
      const freq = 420 * Math.exp(-t * 14) + 140;
      const body = Math.sin(2 * Math.PI * freq * t);
      const click = 0.25 * Math.sin(2 * Math.PI * 1150 * t) * Math.exp(-t * 90);
      return 0.55 * env * (body + click);
    }));

    // 3. Soft squishy rubber spring (step 1 & step 2)
    register('squish-1', buildWavBuffer(0.28, (t) => {
      const env = Math.min(1, t / 0.008) * Math.exp(-t * 11);
      const freq = 260 - 90 * Math.exp(-t * 18) + 180 * (1 - Math.exp(-t * 9)) * Math.sin(2 * Math.PI * 14 * t) * 0.25;
      return 0.6 * env * (Math.sin(2 * Math.PI * freq * t) + 0.25 * Math.sin(4 * Math.PI * freq * t));
    }));

    register('squish-2', buildWavBuffer(0.28, (t) => {
      const env = Math.min(1, t / 0.008) * Math.exp(-t * 11);
      const freq = 330 - 110 * Math.exp(-t * 18) + 210 * (1 - Math.exp(-t * 9)) * Math.sin(2 * Math.PI * 16 * t) * 0.25;
      return 0.6 * env * (Math.sin(2 * Math.PI * freq * t) + 0.25 * Math.sin(4 * Math.PI * freq * t));
    }));

    // 4. Rarity tier upgrade arpeggios (Golden Rare & Celestial Epic)
    register('rarity-1', buildWavBuffer(0.55, (t) => {
      return bellTone(t, 0, 0.3, 523.25, 0.38)
        + bellTone(t, 0.075, 0.32, 659.25, 0.4)
        + bellTone(t, 0.15, 0.38, 783.99, 0.45);
    }));

    register('rarity-2', buildWavBuffer(0.65, (t) => {
      return bellTone(t, 0, 0.3, 587.33, 0.35)
        + bellTone(t, 0.07, 0.3, 739.99, 0.38)
        + bellTone(t, 0.14, 0.32, 880.0, 0.42)
        + bellTone(t, 0.21, 0.42, 1174.66, 0.46);
    }));

    // 5. Celebratory Victory Fanfare (C5 -> E5 -> G5 -> C6 chord)
    register('victory-fanfare', buildWavBuffer(0.8, (t) => {
      return bellTone(t, 0, 0.35, 523.25, 0.35)
        + bellTone(t, 0.09, 0.38, 659.25, 0.36)
        + bellTone(t, 0.18, 0.42, 783.99, 0.38)
        + bellTone(t, 0.28, 0.5, 1046.5, 0.45)
        + bellTone(t, 0.28, 0.5, 523.25, 0.2);
    }));

    // 6. Crystalline Gem Ping
    register('gem-ping', buildWavBuffer(0.2, (t) => {
      return bellTone(t, 0, 0.19, 1760, 0.32) + bellTone(t, 0.01, 0.17, 2637, 0.18);
    }));

    // 7. Juicy Soap Bubble / Car Pop
    register('bubble-pop', buildWavBuffer(0.16, (t) => {
      const env = Math.min(1, t / 0.004) * Math.exp(-t * 24);
      const sweepFreq = 320 + 680 * (1 - Math.exp(-t * 32));
      const bloop = Math.sin(2 * Math.PI * sweepFreq * t);
      const sparkle = bellTone(t, 0.015, 0.12, 1480, 0.28);
      return 0.55 * env * bloop + sparkle;
    }));

    // Sync mute state
    if (!store.soundEnabled) {
      pixiSound.muteAll();
    } else {
      pixiSound.unmuteAll();
    }

    pixiSoundsInitialized = true;
  } catch (e) {}
}

// Keep @pixi/sound mute state synced with store.soundEnabled
eventBus.on('state:soundEnabled', (enabled) => {
  const pixiSound = getPixiSound();
  if (!pixiSound) return;
  try {
    if (enabled) pixiSound.unmuteAll();
    else pixiSound.muteAll();
  } catch (e) {}
});

export function initAudioContext() {
  try {
    const pixiSound = getPixiSound();
    if (pixiSound && pixiSound.context && pixiSound.context.audioContext) {
      audioContext = pixiSound.context.audioContext;
    } else if (!audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioContext = new AudioCtx();
      }
    }
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }
    initPixiSounds();
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

function playPixiAlias(alias, options = {}) {
  if (!store.soundEnabled) return false;
  initAudioContext();
  const pixiSound = getPixiSound();
  if (pixiSound && pixiSound.exists(alias)) {
    try {
      pixiSound.play(alias, options);
      return true;
    } catch (e) {}
  }
  return false;
}

// Iconic Duolingo Two-Tone Ding: D5 -> A5
export function playDuoDing() {
  if (!store.soundEnabled) return;
  if (playPixiAlias('duo-ding', { volume: 0.75 })) return;
}

// Snappy tactile button tap sound
export function playDuoTap() {
  if (!store.soundEnabled) return;
  if (playPixiAlias('duo-tap', { volume: 0.65, speed: 0.96 + Math.random() * 0.08 })) return;
}

// Soft squishy rubber & spring wobble sound
export function playSquishSpring(step) {
  if (!store.soundEnabled) return;
  const alias = step === 1 ? 'squish-1' : 'squish-2';
  playPixiAlias(alias, { volume: 0.75 });
}

// Rarity Tier Upgraded Musical Fanfare Chime
export function playRarityUpgrade(tier) {
  if (!store.soundEnabled) return;
  const alias = tier === 1 ? 'rarity-1' : 'rarity-2';
  playPixiAlias(alias, { volume: 0.8 });
}

// Victory fanfare chime played upon chest opening
export function playVictoryFanfare() {
  if (!store.soundEnabled) return;
  playPixiAlias('victory-fanfare', { volume: 0.85 });
}

// High crystalline ping when bouncing gem strikes top counter
export function playGemPing() {
  if (!store.soundEnabled) return;
  playPixiAlias('gem-ping', { volume: 0.55, speed: 0.92 + Math.random() * 0.2 });
}

// Cute Soap Bubble / Car Pop Synthesizer
export function playCuteBubblePop() {
  if (!store.soundEnabled) return;
  playPixiAlias('bubble-pop', { volume: 0.8, speed: 0.92 + Math.random() * 0.18 });
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
