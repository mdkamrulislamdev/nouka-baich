"use client";

import { useFrame } from "@react-three/fiber";

import { SPRINT } from "@/components/canvas/sceneConfig";
import { isGameplayActive } from "@/lib/gameplay";
import { useGameStore } from "@/store/useGameStore";

export function RaceSystem() {
  useFrame(() => {
    const state = useGameStore.getState();
    if (!isGameplayActive(state) || state.gameMode !== "sprint") {
      return;
    }

    if (state.distance >= SPRINT.targetDistance) {
      useGameStore.getState().finishRace();
    }
  });

  return null;
}
