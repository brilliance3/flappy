import { getBgmEnabled, getSoundEnabled } from "../utils/storage";
import { BGM_VOLUME, SFX_VOLUME, type BgmKey, type SoundKey } from "./audioTypes";

type Wave = OscillatorType;

interface BgmTrack {
  /** Seconds per sequencer step. */
  stepDur: number;
  /** MIDI notes for the melody voice (null = rest). */
  melody: (number | null)[];
  /** MIDI notes for the bass voice (null = rest), sampled on every 4th step. */
  bass: (number | null)[];
  /** Sustained chord roots for the atmosphere pad, sampled every 8th step. */
  pad: (number | null)[];
  melodyWave: Wave;
  bassWave: Wave;
  padWave: Wave;
  melodyGain: number;
  bassGain: number;
  padGain: number;
  noteDur: number;
  /** Add a quiet delayed repeat of each melody note (spacey echo). */
  echo?: boolean;
}

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Per-mode background tracks, synthesised at runtime so the game ships no audio
 * assets. Each has its own key, tempo, instrument timbres and an atmosphere
 * pad: Sky = bright & breezy major, Space = slow minor drone with echo, Ocean =
 * mellow flowing lydian.
 */
const BGM_TRACKS: Record<BgmKey, BgmTrack> = {
  sky: {
    stepDur: 0.19,
    melody: [
      72, 76, 79, 76, 81, 79, 76, 72, 74, 77, 81, 77, 79, 76, 74, 72,
    ],
    bass: [48, 52, 50, 53],
    pad: [60, 65], // C, F chord roots — airy
    melodyWave: "triangle",
    bassWave: "sine",
    padWave: "sine",
    melodyGain: 0.2,
    bassGain: 0.26,
    padGain: 0.05,
    noteDur: 0.17,
  },
  space: {
    stepDur: 0.34,
    melody: [
      69, null, 72, null, 76, null, 74, 71, 69, null, 67, null, 72, null, 69,
      null,
    ],
    bass: [45, 43, 41, 43],
    pad: [33, 40], // very low A drone + E
    melodyWave: "sine",
    bassWave: "triangle",
    padWave: "sawtooth",
    melodyGain: 0.18,
    bassGain: 0.24,
    padGain: 0.04,
    noteDur: 0.5,
    echo: true,
  },
  ocean: {
    stepDur: 0.26,
    melody: [
      74, 76, 78, 81, 78, 76, 74, 69, 71, 74, 78, 74, 76, 74, 71, 69,
    ],
    bass: [50, 54, 52, 49],
    pad: [50, 57], // D, A — gentle swell
    melodyWave: "triangle",
    bassWave: "sine",
    padWave: "sine",
    melodyGain: 0.18,
    bassGain: 0.24,
    padGain: 0.06,
    noteDur: 0.34,
  },
};

/**
 * Tiny synth-based audio engine. All sounds are generated procedurally with the
 * Web Audio API. Safe to use even when audio is unavailable — every entry point
 * is guarded and swallows errors.
 */
class AudioManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private bgmBus: GainNode | null = null;

  private soundEnabled = getSoundEnabled();
  private bgmEnabled = getBgmEnabled();

  private currentBgm: BgmKey | null = null;
  /** Last mode whose BGM started — themes the SFX even after BGM stops. */
  private themeMode: BgmKey = "sky";
  private schedulerId: number | null = null;
  private nextNoteTime = 0;
  private step = 0;
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

        this.bgmBus = this.ctx.createGain();
        this.bgmBus.gain.value = BGM_VOLUME;
        this.bgmBus.connect(this.master);

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
    this.currentBgm = mode;
    this.themeMode = mode;
    if (!this.bgmEnabled || !this.ctx) return;
    this.startScheduler();
  }

  private startScheduler(): void {
    if (!this.ctx || this.schedulerId !== null || !this.currentBgm) return;
    this.step = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.08;
    this.schedulerId = window.setInterval(() => this.scheduleAhead(), 25);
  }

  private scheduleAhead(): void {
    if (!this.ctx || !this.currentBgm) return;
    const track = BGM_TRACKS[this.currentBgm];
    while (this.nextNoteTime < this.ctx.currentTime + 0.12) {
      this.playBgmStep(track, this.step, this.nextNoteTime);
      this.nextNoteTime += track.stepDur;
      this.step++;
    }
  }

  private playBgmStep(track: BgmTrack, step: number, time: number): void {
    if (!this.ctx || !this.bgmBus) return;

    // Melody (+ optional spacey echo).
    const m = track.melody[step % track.melody.length];
    if (m !== null) {
      this.bgmNote(
        midiToFreq(m),
        time,
        track.noteDur,
        track.melodyWave,
        track.melodyGain,
      );
      if (track.echo) {
        this.bgmNote(
          midiToFreq(m),
          time + track.stepDur * 0.5,
          track.noteDur,
          track.melodyWave,
          track.melodyGain * 0.35,
        );
      }
    }

    // Bass, every 4th step.
    if (step % 4 === 0) {
      const b = track.bass[(step / 4) % track.bass.length | 0];
      if (b !== null && b !== undefined) {
        this.bgmNote(
          midiToFreq(b),
          time,
          track.noteDur * 1.6,
          track.bassWave,
          track.bassGain,
        );
      }
    }

    // Atmosphere pad: a sustained root + fifth chord every 8th step.
    if (step % 8 === 0) {
      const p = track.pad[(step / 8) % track.pad.length | 0];
      if (p !== null && p !== undefined) {
        const sustain = track.stepDur * 8;
        this.bgmNote(midiToFreq(p), time, sustain, track.padWave, track.padGain);
        this.bgmNote(
          midiToFreq(p + 7),
          time,
          sustain,
          track.padWave,
          track.padGain * 0.7,
        );
      }
    }
  }

  private bgmNote(
    freq: number,
    start: number,
    dur: number,
    type: Wave,
    gain: number,
  ): void {
    if (!this.ctx || !this.bgmBus) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(gain, start + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g);
    g.connect(this.bgmBus);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  }

  stopBgm(): void {
    if (this.schedulerId !== null) {
      clearInterval(this.schedulerId);
      this.schedulerId = null;
    }
    this.currentBgm = null;
  }

  /** Pause the music without forgetting which track was playing. */
  pauseBgm(): void {
    if (this.schedulerId !== null) {
      clearInterval(this.schedulerId);
      this.schedulerId = null;
    }
  }

  /** Resume after a pause if BGM is still enabled and a track is selected. */
  resumeBgm(): void {
    if (!this.bgmEnabled || !this.currentBgm) return;
    this.startScheduler();
  }

  /* ---------- Settings ---------- */

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  setBgmEnabled(enabled: boolean): void {
    this.bgmEnabled = enabled;
    if (!enabled) {
      this.pauseBgm();
    } else if (this.currentBgm) {
      this.startScheduler();
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
