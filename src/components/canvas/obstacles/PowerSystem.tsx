"use client";

import { useFrame } from "@react-three/fiber";

import { POWERS } from "@/components/canvas/sceneConfig";
import { audio } from "@/lib/audio";
import { clampGameDelta, isGameplayActive } from "@/lib/gameplay";
import { beginLogSmash, forEachActiveObstacle } from "@/lib/obstacleWorld";
import { triggerLogBreakFx } from "@/lib/logBreakFx";
import { triggerRockBreakFx } from "@/lib/rockBreakFx";
import { isRamActive, tickPowers } from "@/lib/powerUps";
import { useGameStore } from "@/store/useGameStore";

let lastRamSfx = 0;

export function PowerSystem() {
  useFrame((_, delta) => {
    const state = useGameStore.getState();
    if (!isGameplayActive(state)) {
      return;
    }

    const dt = clampGameDelta(delta);
    tickPowers(dt);
    if (!isRamActive()) {
      return;
    }

    const lane = state.laneOffset;
    forEachActiveObstacle((obstacle) => {
      if (obstacle.sinking || obstacle.smash) {
        return;
      }
      if (obstacle.z > 0.45 || obstacle.z < -POWERS.ramAhead) {
        return;
      }
      if (Math.abs(obstacle.x - lane) > POWERS.ramWidth + obstacle.halfX) {
        return;
      }

      const dx = obstacle.x - lane;
      const side: -1 | 1 = dx >= 0 ? 1 : -1;
      beginLogSmash(obstacle, side);
      if (obstacle.kind === "rock") {
        triggerRockBreakFx(obstacle.x, obstacle.y + 0.25, obstacle.z, side);
      } else {
        triggerLogBreakFx(obstacle.x, obstacle.y + 0.2, obstacle.z, side);
      }
      const now = performance.now();
      if (now - lastRamSfx > 90) {
        lastRamSfx = now;
        audio.playSfx("crash", { rate: 1.15, volume: 0.32 });
      }
    });
  }, 1);

  return null;
}
