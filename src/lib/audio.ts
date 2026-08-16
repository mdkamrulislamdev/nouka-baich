import { Howl, Howler } from "howler";

import { AUDIO } from "@/components/canvas/sceneConfig";

export type SfxId = "row" | "splash" | "crash" | "nearMiss";

class SoundManager {
  private bgm: Howl | null = null;
  private readonly sfx = new Map<string, Howl>();
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
  }

  loadBgm(src: string): void {
    this.bgm?.unload();
    this.bgm = new Howl({
      src: [src],
      loop: true,
      volume: AUDIO.musicVolume,
      html5: true,
      preload: true,
    });
    this.bgm.mute(this.musicMuted);
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

  loadSfx(id: SfxId, src: string): void {
    this.sfx.get(id)?.unload();
    this.sfx.set(
      id,
      new Howl({
        src: [src],
        volume: AUDIO.sfxVolume,
        preload: true,
      }),
    );
  }

  playSfx(id: SfxId, options?: { rate?: number; volume?: number }): void {
    if (this.sfxMuted) {
      return;
    }

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
