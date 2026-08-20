"use client";

import { useFrame } from "@react-three/fiber";

import {
  clearLastCollision,
  queryObstacleCollision,
} from "@/lib/collision";
import { resetCrashShake, triggerCrashShake } from "@/lib/crashFeedback";
import { audio } from "@/lib/audio";
import { isGameplayActive } from "@/lib/gameplay";
import { useGameStore } from "@/store/useGameStore";

export function CollisionSystem() {
  // Priority 1: run after ObstacleSpawner (priority 0) so world boxes are fresh.
  useFrame(() => {
    const state = useGameStore.getState();
    const { status, laneOffset, endGame } = state;
    if (!isGameplayActive(state)) {
      if (status === "MENU") {
        resetCrashShake();
      }
      clearLastCollision();
      return;
    }

    const hit = queryObstacleCollision(laneOffset);
    if (!hit) {
      return;
    }

    triggerCrashShake(laneOffset - hit.x);
    audio.playSfx("crash");
    endGame();
  }, 1);

  return null;
}
