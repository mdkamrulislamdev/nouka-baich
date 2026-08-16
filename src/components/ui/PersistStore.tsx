"use client";

import { useEffect } from "react";

import { audio } from "@/lib/audio";
import {
  loadPersistedSettings,
  persistedKey,
  savePersistedSettings,
} from "@/lib/persistence";
import { useGameStore } from "@/store/useGameStore";

export function PersistStore() {
  useEffect(() => {
    const saved = loadPersistedSettings();
    if (saved) {
      useGameStore.setState(saved);
      audio.setMusicMuted(saved.musicMuted);
      audio.setSfxMuted(saved.sfxMuted);
    }

    return useGameStore.subscribe(
      (state) =>
        persistedKey({
          highScore: state.highScore,
          musicMuted: state.musicMuted,
          sfxMuted: state.sfxMuted,
          graphicsQuality: state.graphicsQuality,
        }),
      () => {
        const state = useGameStore.getState();
        savePersistedSettings({
          highScore: state.highScore,
          musicMuted: state.musicMuted,
          sfxMuted: state.sfxMuted,
          graphicsQuality: state.graphicsQuality,
        });
      },
    );
  }, []);

  return null;
}
