"use client";

import { useFrame } from "@react-three/fiber";

import { POWERS } from "@/components/canvas/sceneConfig";
import { audio } from "@/lib/audio";
import { clampGameDelta, isGameplayActive } from "@/lib/gameplay";
import {
  beginLogSmash,
  forEachActiveObstacle,
} from "@/lib/obstacleWorld";
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
      if (obstacle.z > 1.2 || obstacle.z < -POWERS.ramAhead) {
        return;
      }
      if (Math.abs(obstacle.x - lane) > POWERS.ramWidth + obstacle.halfX) {
        return;
      }

      const side: -1 | 1 = obstacle.x >= lane ? 1 : -1;
      beginLogSmash(obstacle, side);
      const now = performance.now();
      if (now - lastRamSfx > 90) {
        lastRamSfx = now;
        audio.playSfx("crash", { rate: 1.15, volume: 0.32 });
      }
    });
  }, 1);

  return null;
}
