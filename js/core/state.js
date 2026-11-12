import { eventBus } from './eventBus.js';

/**
 * LumiKids Reactive Global Store with LocalStorage Persistence
 */
// Ensure sound is active by default
try {
  if (localStorage.getItem('lumikids_sound') === 'false') {
    localStorage.setItem('lumikids_sound', 'true');
  }
} catch (e) {}

const initialData = {
  currentUnlockedLevel: parseInt(localStorage.getItem('lumikids_level') || '1', 10),
  streak: parseInt(localStorage.getItem('lumikids_streak') || '3', 10),
  gems: parseInt(localStorage.getItem('lumikids_gems') || '120', 10),
  hearts: 5,
  soundEnabled: true,
  currentTab: 'pathScreen'
};

export const store = new Proxy(initialData, {
  set(target, prop, value) {
    target[prop] = value;

    // Persistent storage
    if (prop === 'currentUnlockedLevel') {
      localStorage.setItem('lumikids_level', value);
    } else if (prop === 'streak') {
      localStorage.setItem('lumikids_streak', value);
    } else if (prop === 'gems') {
      localStorage.setItem('lumikids_gems', value);
    } else if (prop === 'soundEnabled') {
      localStorage.setItem('lumikids_sound', value);
    }

    // Emit reactive event
    eventBus.emit(`state:${prop}`, value);
    eventBus.emit('state:changed', { key: prop, value });
    return true;
  }
});
