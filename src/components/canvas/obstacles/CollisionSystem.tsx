"use client";

import { useFrame } from "@react-three/fiber";

import {
  clearLastCollision,
  queryObstacleCollision,
} from "@/lib/collision";
import { resetCrashShake, triggerCrashShake } from "@/lib/crashFeedback";
import { audio } from "@/lib/audio";
import { useGameStore } from "@/store/useGameStore";

export function CollisionSystem() {
  useFrame(() => {
    const { status, laneOffset, endGame } = useGameStore.getState();
    if (status !== "PLAYING") {
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
  });

  return null;
}
