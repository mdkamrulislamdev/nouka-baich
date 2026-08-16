"use client";

import { useEffect } from "react";

import { AUDIO } from "@/components/canvas/sceneConfig";
import { audio } from "@/lib/audio";
import { useGameStore } from "@/store/useGameStore";

export function AudioDirector() {
  useEffect(() => {
    audio.loadBgm(AUDIO.bgmPath);
    audio.loadSfx("row", AUDIO.sfx.row);
    audio.loadSfx("splash", AUDIO.sfx.splash);
    audio.loadSfx("crash", AUDIO.sfx.crash);
    audio.loadSfx("nearMiss", AUDIO.sfx.nearMiss);

    const unsubscribe = useGameStore.subscribe(
      (state) => state.status,
      (status) => {
        if (status === "PLAYING") {
          audio.playBgm();
          return;
        }
        audio.stopBgm();
      },
    );

    return () => {
      unsubscribe();
      audio.unload();
    };
  }, []);

  return null;
}
