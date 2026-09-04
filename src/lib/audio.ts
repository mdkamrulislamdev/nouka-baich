import { Howl, Howler } from "howler";

import { AUDIO } from "@/components/canvas/sceneConfig";

export type SfxId = "row" | "splash" | "crash" | "nearMiss" | "kick" | "bump";

const SFX_COOLDOWN_MS: Record<SfxId, number> = {
  row: 95,
  splash: 120,
  crash: 0,
  nearMiss: 200,
  kick: 180,
  bump: 140,
};

if (typeof window !== "undefined") {
  Howler.html5PoolSize = 24;
}

class SoundManager {
  private bgm: Howl | null = null;
  private wind: Howl | null = null;
  private water: Howl | null = null;
  private readonly sfx = new Map<SfxId, Howl>();
  private readonly lastPlayed = new Map<SfxId, number>();
  private musicMuted = false;
  private sfxMuted = false;
  private unlocked = false;

  unlock(): void {
    if (this.unlocked || typeof window === "undefined") {
      return;
    }

    Howler.mute(false);
    this.unlocked = true;
  }

  isMusicMuted(): boolean {
    return this.musicMuted;
  }

  isSfxMuted(): boolean {
    return this.sfxMuted;
  }

  setMusicMuted(muted: boolean): void {
    this.musicMuted = muted;
    this.bgm?.mute(muted);
    if (muted) {
      this.bgm?.pause();
    } else if (this.unlocked) {
      this.playBgm();
    }
  }

  setSfxMuted(muted: boolean): void {
    this.sfxMuted = muted;
    this.wind?.mute(muted);
    this.water?.mute(muted);
    if (muted) {
      this.wind?.pause();
      this.water?.pause();
    }
  }

  loadBgm(src: string): void {
    this.bgm?.unload();
    this.bgm = new Howl({
      src: [src],
      loop: true,
      volume: AUDIO.musicVolume,
      html5: false,
      preload: true,
    });
    this.bgm.mute(this.musicMuted);
  }

  loadWind(src: string): void {
    this.wind?.unload();
    this.wind = new Howl({
      src: [src],
      loop: true,
      volume: 0,
      html5: false,
      preload: true,
    });
    this.wind.mute(this.sfxMuted);
  }

  loadWater(src: string): void {
    this.water?.unload();
    this.water = new Howl({
      src: [src],
      loop: true,
      volume: 0,
      html5: false,
      preload: true,
    });
    this.water.mute(this.sfxMuted);
  }

  playBgm(): void {
    if (!this.bgm || this.musicMuted) {
      return;
    }
    if (!this.bgm.playing()) {
      this.bgm.play();
    }
  }

  stopBgm(): void {
    this.bgm?.stop();
  }

  playWind(): void {
    if (!this.wind || this.sfxMuted) {
      return;
    }
    if (!this.wind.playing()) {
      this.wind.play();
    }
  }

  stopWind(): void {
    this.wind?.stop();
  }

  playWater(): void {
    if (!this.water || this.sfxMuted) {
      return;
    }
    if (!this.water.playing()) {
      this.water.play();
    }
  }

  stopWater(): void {
    this.water?.stop();
  }

  setAmbientMix(windVolume: number, windRate: number, waterVolume: number): void {
    if (this.wind) {
      this.wind.volume(this.sfxMuted ? 0 : windVolume);
      this.wind.rate(windRate);
    }
    if (this.water) {
      this.water.volume(this.sfxMuted ? 0 : waterVolume);
    }
  }

  loadSfx(id: SfxId, src: string): void {
    this.sfx.get(id)?.unload();
    this.sfx.set(
      id,
      new Howl({
        src: [src],
        volume: AUDIO.sfxVolume,
        html5: false,
        preload: true,
        pool: 3,
      }),
    );
  }

  unload(): void {
    this.bgm?.unload();
    this.bgm = null;
    this.wind?.unload();
    this.wind = null;
    this.water?.unload();
    this.water = null;
    this.sfx.forEach((sound) => {
      sound.unload();
    });
    this.sfx.clear();
    this.lastPlayed.clear();
  }

  playSfx(id: SfxId, options?: { rate?: number; volume?: number }): void {
    if (this.sfxMuted) {
      return;
    }

    const now =
      typeof performance === "undefined" ? Date.now() : performance.now();
    const last = this.lastPlayed.get(id) ?? 0;
    if (now - last < SFX_COOLDOWN_MS[id]) {
      return;
    }
    this.lastPlayed.set(id, now);

    const sound = this.sfx.get(id);
    if (!sound) {
      return;
    }

    const playId = sound.play();
    if (options?.rate !== undefined) {
      sound.rate(options.rate, playId);
    }
    if (options?.volume !== undefined) {
      sound.volume(options.volume, playId);
    }
  }
}

export const audio = new SoundManager();
