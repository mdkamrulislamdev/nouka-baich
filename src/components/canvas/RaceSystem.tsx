"use client";

import { useFrame } from "@react-three/fiber";

import { FESTIVAL, SPRINT } from "@/components/canvas/sceneConfig";
import { getJuice } from "@/lib/actionJuice";
import { isGameplayActive } from "@/lib/gameplay";
import {
  forEachActiveObstacle,
  isSinkableKind,
} from "@/lib/obstacleWorld";
import { useGameStore } from "@/store/useGameStore";

function festivalPlace(distance: number): number {
  const entries: { id: number; meters: number }[] = [{ id: -1, meters: distance }];
  forEachActiveObstacle((obstacle) => {
    if (obstacle.role !== "heat" || obstacle.sinking || !isSinkableKind(obstacle.kind)) {
      return;
    }
    entries.push({ id: obstacle.id, meters: distance - obstacle.z });
  });
  entries.sort((a, b) => b.meters - a.meters);
  const rank = entries.findIndex((entry) => entry.id === -1);
  return Math.min(FESTIVAL.boatCount + 1, Math.max(1, rank + 1));
}

export function RaceSystem() {
  useFrame(() => {
    const state = useGameStore.getState();
    if (!isGameplayActive(state)) {
      return;
    }

    if (state.gameMode === "sprint" && state.distance >= SPRINT.targetDistance) {
      useGameStore.getState().finishRace();
      return;
    }

    if (state.gameMode === "festival" && getJuice().heatTimeLeft <= 0) {
      useGameStore.getState().finishRace(festivalPlace(state.distance));
    }
  });

  return null;
}
