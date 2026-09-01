"use client";

import { useFrame } from "@react-three/fiber";

import { audio } from "@/lib/audio";
import { clampGameDelta, isGameplayActive } from "@/lib/gameplay";
import {
  beginKick,
  consumeKickRequest,
  isKickOnCooldown,
  pickAutoKick,
  queryKickTargets,
  resetKickCombat,
  tickKick,
  type KickSide,
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
        state.setKickHud(false, false, true);
      }
      return;
    }

    const found = queryKickTargets(state.laneOffset);
    const ready = !isKickOnCooldown();
    state.setKickHud(found.left !== null, found.right !== null, ready);

    const intent = consumeKickRequest();
    if (intent === null || !ready) {
      return;
    }

    let side: KickSide;
    let target = null as typeof found.left;

    if (intent === -1) {
      side = -1;
      target = found.left;
    } else if (intent === 1) {
      side = 1;
      target = found.right;
    } else {
      const auto = pickAutoKick(found, state.laneOffset);
      side = auto.side;
      target = auto.target;
    }

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
