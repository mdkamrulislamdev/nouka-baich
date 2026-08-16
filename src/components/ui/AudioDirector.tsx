"use client";

import { useEffect } from "react";

import { AUDIO } from "@/components/canvas/sceneConfig";
import { audio } from "@/lib/audio";
import { useGameStore } from "@/store/useGameStore";

export function AudioDirector() {
  useEffect(() => {
    audio.loadBgm(AUDIO.bgmPath);

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
      audio.stopBgm();
    };
  }, []);

  return null;
}
