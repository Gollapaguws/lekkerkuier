import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// ─── Cleanup DOM between tests ──────────────────────────
afterEach(() => {
  cleanup();
});

// ─── Mock localStorage ──────────────────────────────────
const store: Record<string, string> = {};
const localStorageMock: Storage = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
  get length() { return Object.keys(store).length; },
  key: (i: number) => Object.keys(store)[i] ?? null,
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// clear store between tests
afterEach(() => localStorageMock.clear());

// ─── Mock HTMLAudioElement ──────────────────────────────
// The Player component creates <audio> elements that jsdom can't play.
// Provide a minimal mock so React can render audio without errors.
beforeAll(() => {
  class MockAudio {
    src = '';
    volume = 1;
    paused = true;
    currentTime = 0;
    duration = NaN;
    autoplay = false;
    preload = '';
    crossOrigin: string | null = null;

    play() { this.paused = false; return Promise.resolve(); }
    pause() { this.paused = true; }
    load() {}
    addEventListener() {}
    removeEventListener() {}
    canPlayType() { return 'probably'; }
  }

  Object.defineProperty(window, 'HTMLAudioElement', {
    value: MockAudio,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(window, 'Audio', {
    value: MockAudio,
    writable: true,
    configurable: true,
  });
});

// ─── Mock AudioContext ──────────────────────────────────
beforeAll(() => {
  class MockAudioContext {
    state = 'running';
    sampleRate = 44100;
    createAnalyser() {
      return {
        fftSize: 2048,
        frequencyBinCount: 1024,
        connect() {},
        disconnect() {},
        getByteFrequencyData() {},
        getByteTimeDomainData() {},
      };
    }
    createMediaElementSource() {
      return {
        connect() {},
        disconnect() {},
      };
    }
    close() { return Promise.resolve(); }
    resume() { return Promise.resolve(); }
  }

  Object.defineProperty(window, 'AudioContext', {
    value: MockAudioContext,
    writable: true,
    configurable: true,
  });

  (window as any).webkitAudioContext = MockAudioContext;
});

// ─── Mock fetch globally ────────────────────────────────
// Individual tests can override with vi.fn() as needed
vi.stubGlobal('fetch', vi.fn());
