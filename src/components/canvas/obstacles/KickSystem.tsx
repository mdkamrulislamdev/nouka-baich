"use client";

import { useFrame } from "@react-three/fiber";

import { BUMP, KICK, OAR_HIT } from "@/components/canvas/sceneConfig";
import { audio } from "@/lib/audio";
import { clampGameDelta, isGameplayActive } from "@/lib/gameplay";
import { triggerNearMissShake } from "@/lib/crashFeedback";
import {
  beginKick,
  beginOarStrike,
  consumeKickRequest,
  isKickOnCooldown,
  pickAutoKick,
  queryKickTargets,
  queryOarHits,
  resetKickCombat,
  tickKick,
  tickOarStrike,
  type KickSide,
} from "@/lib/kickCombat";
import { shoveNpcBoat } from "@/lib/obstacleWorld";
import { getRowingPhase } from "@/lib/rowingClock";
import { useGameStore } from "@/store/useGameStore";

export function KickSystem() {
  useFrame((_, delta) => {
    const dt = clampGameDelta(delta);
    tickKick(dt);
    tickOarStrike(dt);

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
    if (intent !== null && ready) {
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
      beginOarStrike(side);

      if (target && (target.kind === "racing" || target.kind === "dinghy")) {
        shoveNpcBoat(
          target,
          side,
          KICK.knockPop,
          KICK.knockSpeed,
          KICK.knockBack,
          BUMP.speedMul,
          BUMP.duration,
        );
        triggerNearMissShake(side);
        audio.playSfx("bump", { rate: 1.05 + Math.random() * 0.16, volume: 0.88 });
        audio.playSfx("splash", { rate: 0.82 + Math.random() * 0.18, volume: 0.4 });
        state.triggerSink(target.kind);
      }
    }

    const oarHits = queryOarHits(state.laneOffset, getRowingPhase());
    for (let index = 0; index < oarHits.length; index += 1) {
      const hit = oarHits[index];
      if (hit.target.kind !== "racing" && hit.target.kind !== "dinghy") {
        continue;
      }
      shoveNpcBoat(
        hit.target,
        hit.side,
        OAR_HIT.popX,
        OAR_HIT.impulseX,
        OAR_HIT.impulseZ,
        OAR_HIT.speedMul,
        BUMP.duration,
      );
      beginOarStrike(hit.side);
      triggerNearMissShake(hit.side);
      audio.playSfx("bump", { rate: 1.12 + Math.random() * 0.18, volume: 0.78 });
      audio.playSfx("splash", { rate: 1.08 + Math.random() * 0.14, volume: 0.32 });
      state.triggerSink(hit.target.kind);
    }
  }, 1);

  return null;
}
