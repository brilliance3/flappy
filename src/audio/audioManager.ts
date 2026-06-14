import { getBgmEnabled, getSoundEnabled } from "../utils/storage";
import { BGM_VOLUME, SFX_VOLUME, type BgmKey, type SoundKey } from "./audioTypes";

type Wave = OscillatorType;

/**
 * Background-music tracks shipped as MP3 files under `public/bgm/`. One is
 * chosen at random each time the music starts, and a fresh random track plays
 * when the current one ends — so every run sounds different.
 */
const BGM_FILES = [
  "racing-1.mp3",
  "racing-2.mp3",
  "racing-3.mp3",
  "racing-4.mp3",
  "racing-5.mp3",
  "racing-6.mp3",
];

function bgmUrl(file: string): string {
  // Files live in `public/bgm/`, served from the site root.
  return `/bgm/${file}`;
}

/**
 * Tiny synth-based audio engine. All sounds are generated procedurally with the
 * Web Audio API. Safe to use even when audio is unavailable — every entry point
 * is guarded and swallows errors.
 */
class AudioManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfxBus: GainNode | null = null;

  private soundEnabled = getSoundEnabled();
  private bgmEnabled = getBgmEnabled();

  /** True while a run wants music playing (independent of mute/pause). */
  private bgmActive = false;
  /** Last mode that started a run — themes the SFX. */
  private themeMode: BgmKey = "sky";
  /** HTMLAudio element that streams the current random MP3 track. */
  private bgmAudio: HTMLAudioElement | null = null;
  private noise: AudioBuffer | null = null;

  /** Must be called from a user gesture to satisfy autoplay policies. */
  unlock(): void {
    try {
      if (!this.ctx) {
        const Ctor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!Ctor) return;
        this.ctx = new Ctor();
        this.master = this.ctx.createGain();
        this.master.gain.value = 1;
        this.master.connect(this.ctx.destination);

        this.sfxBus = this.ctx.createGain();
        this.sfxBus.gain.value = SFX_VOLUME;
        this.sfxBus.connect(this.master);

        this.noise = this.buildNoiseBuffer(this.ctx);
      }
      if (this.ctx.state === "suspended") {
        void this.ctx.resume();
      }
    } catch {
      /* audio unsupported — stay silent */
    }
  }

  private buildNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const length = Math.floor(ctx.sampleRate * 0.3);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /* ---------- One-shot sound effects ---------- */

  play(sound: SoundKey): void {
    if (!this.soundEnabled || !this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;
    const mode = this.themeMode;

    switch (sound) {
      case "tap":
        // Sky = airy chirp, Space = laser blip, Ocean = water bloop.
        if (mode === "sky") {
          this.tone(720, t, 0.1, "triangle", 0.45, 1180);
        } else if (mode === "space") {
          this.tone(900, t, 0.12, "sawtooth", 0.32, 220);
        } else {
          this.tone(520, t, 0.13, "sine", 0.5, 240);
          this.tone(300, t + 0.02, 0.1, "sine", 0.25, 180);
        }
        break;

      case "score":
        // A short upward flourish, voiced per mode.
        if (mode === "space") {
          this.tone(660, t, 0.07, "square", 0.28);
          this.tone(990, t + 0.06, 0.07, "square", 0.28);
          this.tone(1320, t + 0.12, 0.12, "square", 0.28);
        } else if (mode === "ocean") {
          this.tone(740, t, 0.09, "sine", 0.34, 880);
          this.tone(1100, t + 0.08, 0.14, "sine", 0.3, 1240);
        } else {
          this.tone(880, t, 0.08, "triangle", 0.34, 990);
          this.tone(1320, t + 0.07, 0.12, "triangle", 0.34, 1480);
        }
        break;

      case "hit":
        // Sky = soft poof, Space = zap+explosion, Ocean = splash.
        if (mode === "space") {
          this.tone(240, t, 0.22, "sawtooth", 0.5, 60);
          this.burst(t, 0.28, 0.5, 1400);
        } else if (mode === "ocean") {
          this.tone(180, t, 0.2, "sine", 0.45, 90);
          this.burst(t, 0.32, 0.4, 600);
        } else {
          this.tone(200, t, 0.16, "triangle", 0.45, 80);
          this.burst(t, 0.16, 0.3, 900);
        }
        break;

      case "gameover": {
        // Descending three-note motif in the mode's timbre.
        const wave: Wave =
          mode === "space" ? "sawtooth" : mode === "ocean" ? "sine" : "triangle";
        this.tone(440, t, 0.2, wave, 0.4, 392);
        this.tone(330, t + 0.18, 0.22, wave, 0.4, 294);
        this.tone(220, t + 0.38, 0.4, wave, 0.4, 174);
        break;
      }

      case "button":
        this.tone(520, t, 0.05, "triangle", 0.32, 680);
        break;
    }
  }

  private tone(
    freq: number,
    start: number,
    dur: number,
    type: Wave,
    gain: number,
    freqEnd?: number,
  ): void {
    if (!this.ctx || !this.sfxBus) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (freqEnd !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(1, freqEnd),
        start + dur,
      );
    }
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(gain, start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g);
    g.connect(this.sfxBus);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  }

  private burst(
    start: number,
    dur: number,
    gain: number,
    cutoff = 900,
  ): void {
    if (!this.ctx || !this.sfxBus || !this.noise) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    src.connect(filter);
    filter.connect(g);
    g.connect(this.sfxBus);
    src.start(start);
    src.stop(start + dur + 0.05);
  }

  /* ---------- Background music ---------- */

  playBgm(mode: BgmKey): void {
    this.themeMode = mode;
    this.bgmActive = true;
    if (!this.bgmEnabled) return;
    this.startRandomTrack();
  }

  /** Reuse a single audio element; pick a fresh random track and play it. */
  private startRandomTrack(): void {
    if (!this.bgmAudio) {
      this.bgmAudio = new Audio();
      // When a track ends, roll the next random one (keeps the run lively).
      this.bgmAudio.addEventListener("ended", () => {
        if (this.bgmActive && this.bgmEnabled) this.startRandomTrack();
      });
    }
    const file = this.pickRandomTrack();
    this.bgmAudio.src = bgmUrl(file);
    this.bgmAudio.volume = BGM_VOLUME;
    void this.bgmAudio.play().catch(() => {
      /* autoplay blocked or load error — stay silent */
    });
  }

  /** Random track, avoiding an immediate repeat when more than one exists. */
  private lastTrack: string | null = null;
  private pickRandomTrack(): string {
    if (BGM_FILES.length === 1) return BGM_FILES[0];
    let file = this.lastTrack;
    while (file === this.lastTrack) {
      file = BGM_FILES[Math.floor(Math.random() * BGM_FILES.length)];
    }
    this.lastTrack = file;
    return file!;
  }

  stopBgm(): void {
    this.bgmActive = false;
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
    }
  }

  /** Pause the music without forgetting that a run is active. */
  pauseBgm(): void {
    this.bgmAudio?.pause();
  }

  /** Resume after a pause if BGM is still enabled and a run is active. */
  resumeBgm(): void {
    if (!this.bgmEnabled || !this.bgmActive || !this.bgmAudio) return;
    void this.bgmAudio.play().catch(() => {
      /* ignore */
    });
  }

  /* ---------- Settings ---------- */

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  setBgmEnabled(enabled: boolean): void {
    this.bgmEnabled = enabled;
    if (!enabled) {
      this.pauseBgm();
    } else if (this.bgmActive) {
      // If a track was already loaded, resume it; otherwise start a new one.
      if (this.bgmAudio && this.bgmAudio.src) this.resumeBgm();
      else this.startRandomTrack();
    }
  }

  isSoundEnabled(): boolean {
    return this.soundEnabled;
  }
  isBgmEnabled(): boolean {
    return this.bgmEnabled;
  }
}

/** Shared singleton used across the app. */
export const audioManager = new AudioManager();
