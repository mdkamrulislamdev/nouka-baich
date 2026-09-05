"use client";

import { useFrame } from "@react-three/fiber";

import { BUMP, INTRO } from "@/components/canvas/sceneConfig";
import { getJuice } from "@/lib/actionJuice";
import { audio } from "@/lib/audio";
import { clearLastCollision, queryObstacleCollision } from "@/lib/collision";
import { resetCrashShake, triggerCrashShake } from "@/lib/crashFeedback";
import { isGameplayActive } from "@/lib/gameplay";
import { beginLogSmash, isSinkableKind, shoveNpcBoat } from "@/lib/obstacleWorld";
import { triggerLogBreakFx } from "@/lib/logBreakFx";
import { useGameStore } from "@/store/useGameStore";

export function CollisionSystem() {
  // Priority 2: after ObstacleSpawner (0) and KickSystem (1).
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

    const side: -1 | 1 = hit.x >= laneOffset ? 1 : -1;
    if (hit.kind === "log" && state.logBreakCharges > 0) {
      if (state.consumeLogBreak()) {
        beginLogSmash(hit, side);
        triggerLogBreakFx(hit.x, hit.y + 0.15, hit.z, side);
        audio.playSfx("crash", { volume: 0.5 });
      }
      return;
    }
    if (
      isSinkableKind(hit.kind) &&
      getJuice().runElapsed < INTRO.graceSec
    ) {
      shoveNpcBoat(hit, side, 1.35, 5.2, 2.4, BUMP.speedMul, BUMP.duration);
      return;
    }

    triggerCrashShake(laneOffset - hit.x);
    audio.playSfx("crash");
    endGame();
  }, 2);

  return null;
}
