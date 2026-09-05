"use client";

import { useFrame } from "@react-three/fiber";

import {
  BOAT_BOUNDS,
  BUMP,
  JUICE,
  KICK,
  NPC_KICK,
  STROKE,
  getGraceSec,
} from "@/components/canvas/sceneConfig";
import { addSurge, getJuice, punchFov } from "@/lib/actionJuice";
import { audio } from "@/lib/audio";
import { clampGameDelta, isGameplayActive } from "@/lib/gameplay";
import { triggerNearMissShake } from "@/lib/crashFeedback";
import { triggerHitStop } from "@/lib/hitStop";
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
import { triggerLogBreakFx } from "@/lib/logBreakFx";
import {
  beginLogSmash,
  forEachActiveObstacle,
  isSinkableKind,
  shoveNpcBoat,
} from "@/lib/obstacleWorld";
import { shovePlayer } from "@/lib/playerImpulse";
import { isStrokeWindow } from "@/lib/strokeWindow";
import { useGameStore } from "@/store/useGameStore";

function tickNpcKicks(dt: number, laneOffset: number): void {
  const juice = getJuice();
  const state = useGameStore.getState();
  const playerHalfX = BOAT_BOUNDS.width * 0.5;
  let warning = false;

  if (juice.runElapsed < getGraceSec(state.gameMode)) {
    juice.npcKickWarn = false;
    return;
  }

  forEachActiveObstacle((obstacle) => {
    if (
      !isSinkableKind(obstacle.kind) ||
      obstacle.sinking ||
      obstacle.bumpTimer > 0 ||
      obstacle.facing < 0
    ) {
      return;
    }

    obstacle.npcKickCool = Math.max(0, obstacle.npcKickCool - dt);

    const dz = Math.abs(obstacle.z);
    const dx = obstacle.x - laneOffset;
    const gapX = Math.abs(dx) - playerHalfX - obstacle.halfX;
    const inRange =
      dz <= NPC_KICK.rangeZ && gapX > 0.08 && gapX <= NPC_KICK.rangeX;
    const side: KickSide = dx >= 0 ? 1 : -1;

    if (!inRange && obstacle.npcKickT <= 0) {
      return;
    }

    if (obstacle.npcKickT <= 0) {
      if (!inRange || obstacle.npcKickCool > 0) {
        return;
      }
      obstacle.npcKickT = 0.001;
      obstacle.sinkSide = side;
    }

    obstacle.npcKickT += dt;
    const wind = Math.min(1, obstacle.npcKickT / NPC_KICK.windup);
    obstacle.rotZ = -side * wind * 0.28;
    warning = true;

    if (obstacle.npcKickT < NPC_KICK.windup) {
      return;
    }

    obstacle.npcKickT = 0;
    obstacle.npcKickCool = NPC_KICK.cooldown;
    obstacle.rotZ = 0;

    const stillClose =
      Math.abs(obstacle.z) <= NPC_KICK.rangeZ &&
      gapX > 0.08 &&
      gapX <= NPC_KICK.dodgeGap;

    if (!stillClose) {
      state.triggerDodge();
      audio.playSfx("nearMiss", { volume: 0.4 });
      return;
    }

    const shoveDir: KickSide = dx >= 0 ? -1 : 1;
    shovePlayer(shoveDir, NPC_KICK.impulse, 0.18);
    punchFov(JUICE.fovPunchShove);
    triggerNearMissShake(shoveDir);
    audio.playSfx("kick", { rate: 0.82, volume: 0.7 });
    audio.playSfx("bump", { volume: 0.45 });
  });

  juice.npcKickWarn = warning;
}

export function KickSystem() {
  useFrame((_, delta) => {
    const dt = clampGameDelta(delta);
    tickKick(dt);

    const state = useGameStore.getState();
    if (!isGameplayActive(state)) {
      consumeKickRequest();
      if (state.status === "MENU" || state.status === "GAMEOVER") {
        resetKickCombat();
        state.setKickHud(false, false, true);
        getJuice().npcKickWarn = false;
      }
      return;
    }

    const canBreakLogs = state.logBreakCharges > 0;
    const found = queryKickTargets(state.laneOffset, canBreakLogs);
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

      if (isStrokeWindow()) {
        punchFov(JUICE.fovPunchStroke);
        addSurge(STROKE.boost);
        audio.playSfx("row", { rate: 1.25, volume: 0.55 });
        state.triggerPerfectStroke();
      }

      if (!target) {
        audio.playSfx("kick", { rate: 1.05, volume: 0.4 });
      } else if (target.kind === "log") {
        if (state.consumeLogBreak()) {
          beginLogSmash(target, side);
          triggerLogBreakFx(target.x, target.y + 0.15, target.z, side);
          punchFov(JUICE.fovPunchShove);
          audio.playSfx("crash", { volume: 0.55 });
          audio.playSfx("splash", { rate: 0.7, volume: 0.4 });
        }
      } else if (target.kind === "racing" || target.kind === "dinghy") {
        shoveNpcBoat(
          target,
          side,
          KICK.knockPop,
          KICK.knockSpeed,
          KICK.knockBack,
          BUMP.speedMul,
          BUMP.duration,
        );
        triggerHitStop(JUICE.hitStopSec);
        punchFov(JUICE.fovPunchShove);
        triggerNearMissShake(side);
        audio.playSfx("kick", { rate: 1.05 + Math.random() * 0.16, volume: 0.88 });
        audio.playSfx("splash", { rate: 0.82 + Math.random() * 0.18, volume: 0.4 });
        state.triggerSink(target.kind);
      }
    }

    tickNpcKicks(dt, state.laneOffset);
  }, 1);

  return null;
}
