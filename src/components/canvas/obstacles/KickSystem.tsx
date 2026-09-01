"use client";

import { useFrame } from "@react-three/fiber";

import { audio } from "@/lib/audio";
import { clampGameDelta, isGameplayActive } from "@/lib/gameplay";
import {
  beginKick,
  consumeKickRequest,
  isKickOnCooldown,
  kickSideToward,
  queryKickTarget,
  resetKickCombat,
  tickKick,
} from "@/lib/kickCombat";
import { beginObstacleSink } from "@/lib/obstacleWorld";
import { useGameStore } from "@/store/useGameStore";

export function KickSystem() {
  // After ObstacleSpawner (0), before CollisionSystem (2) so a hit this
  // frame starts sinking and cannot also crash the player.
  useFrame((_, delta) => {
    tickKick(clampGameDelta(delta));

    const state = useGameStore.getState();
    if (!isGameplayActive(state)) {
      consumeKickRequest();
      if (state.status === "MENU" || state.status === "GAMEOVER") {
        resetKickCombat();
        state.setKickHud(false, true);
      }
      return;
    }

    const target = queryKickTarget(state.laneOffset);
    const ready = !isKickOnCooldown();
    state.setKickHud(target !== null, ready);

    if (!consumeKickRequest()) {
      return;
    }
    if (!ready) {
      return;
    }

    const side = kickSideToward(state.laneOffset, target);
    beginKick(side);
    audio.playSfx("kick", { rate: 0.88 + Math.random() * 0.18, volume: 0.55 });

    if (!target) {
      return;
    }

    beginObstacleSink(target, side);
    if (target.kind === "racing" || target.kind === "dinghy") {
      state.triggerSink(target.kind);
    }
    audio.playSfx("crash", { rate: 1.18 + Math.random() * 0.12, volume: 0.42 });
  }, 1);

  return null;
}
