"use client";

import { useEffect } from "react";

import { AUDIO } from "@/components/canvas/sceneConfig";
import { audio } from "@/lib/audio";
import { useGameStore } from "@/store/useGameStore";

export function AudioDirector() {
  useEffect(() => {
    audio.loadBgm(AUDIO.bgmPath);
    audio.loadWind(AUDIO.windPath);
    audio.loadWater(AUDIO.waterPath);
    audio.loadSfx("row", AUDIO.sfx.row);
    audio.loadSfx("splash", AUDIO.sfx.splash);
    audio.loadSfx("crash", AUDIO.sfx.crash);
    audio.loadSfx("nearMiss", AUDIO.sfx.nearMiss);
    audio.loadSfx("kick", AUDIO.sfx.kick);
    audio.loadSfx("bump", AUDIO.sfx.bump);

    const unsubscribe = useGameStore.subscribe(
      (state) => state.status,
      (status) => {
        if (status === "PLAYING") {
          audio.playBgm();
          audio.playWind();
          audio.playWater();
          return;
        }
        if (status === "PAUSED") {
          audio.playBgm();
          audio.stopWind();
          audio.stopWater();
          return;
        }
        audio.stopBgm();
        audio.stopWind();
        audio.stopWater();
      },
    );

    return () => {
      unsubscribe();
      audio.unload();
    };
  }, []);

  return null;
}
