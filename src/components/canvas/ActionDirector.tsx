"use client";

import { useFrame } from "@react-three/fiber";

import {
  BOAT_BOUNDS,
  DRAFT,
  FESTIVAL,
  HEAT_UP,
  INTRO,
  JUICE,
  RIVAL,
  RIVAL_NAMES,
  getLaneLimit,
  heatUpAmount,
} from "@/components/canvas/sceneConfig";
import {
  addSurge,
  getJuice,
  punchFov,
  tickFeverHeat,
} from "@/lib/actionJuice";
import { clamp } from "@/lib/clamp";
import { triggerNearMissShake } from "@/lib/crashFeedback";
import { clampGameDelta, isGameplayActive } from "@/lib/gameplay";
import { isHitStopped, tickHitStop } from "@/lib/hitStop";
import { pickBankLaneX, pickRiverLaneX, seededRandom } from "@/lib/mathUtils";
import {
  forEachActiveObstacle,
  isSinkableKind,
  queueDirectedSpawn,
  type DirectedSpawn,
  type ObstacleRole,
} from "@/lib/obstacleWorld";
import { isStrokeWindow } from "@/lib/strokeWindow";
import { audio } from "@/lib/audio";
import { useGameStore } from "@/store/useGameStore";

function queueRiverThreat(options: {
  kind: DirectedSpawn["kind"];
  role: ObstacleRole;
  z: number;
  playerSpeed: number;
  speedDelta: number;
  heatIndex: number;
  seed: number;
}): void {
  const laneLimit = getLaneLimit();
  const rockSide: -1 | 1 = seededRandom(options.seed * 2.1) < 0.5 ? -1 : 1;
  const x =
    options.kind === "rock"
      ? pickBankLaneX(
          options.seed,
          laneLimit,
          rockSide,
          seededRandom(options.seed * 4.4) < 0.55 ? "lip" : "shoulder",
        )
      : pickRiverLaneX(options.seed, 0, Math.max(0.8, laneLimit - 0.55));
  const moving = options.kind === "racing" || options.kind === "dinghy";
  queueDirectedSpawn({
    kind: options.kind,
    x,
    z: options.z,
    forwardSpeed: moving ? options.playerSpeed + options.speedDelta : 0,
    facing: 1,
    role: options.role,
    heatIndex: options.heatIndex,
    amplitude: options.role === "heat" || options.role === "pace" ? 0.05 : 0.12,
  });
}

function queueRelative(options: {
  kind: DirectedSpawn["kind"];
  role: ObstacleRole;
  laneOffset: number;
  xOff: number;
  z: number;
  playerSpeed: number;
  speedDelta: number;
  heatIndex: number;
}): void {
  const laneLimit = getLaneLimit();
  const rockSide: -1 | 1 = options.xOff >= 0 ? 1 : -1;
  const x =
    options.kind === "rock"
      ? pickBankLaneX(options.z + 8, laneLimit, rockSide, "lip")
      : clamp(options.laneOffset + options.xOff, -laneLimit + 0.5, laneLimit - 0.5);
  const moving = options.kind === "racing" || options.kind === "dinghy";
  queueDirectedSpawn({
    kind: options.kind,
    x,
    z: options.z,
    forwardSpeed: moving ? options.playerSpeed + options.speedDelta : 0,
    facing: 1,
    role: options.role,
    heatIndex: options.heatIndex,
    amplitude: options.role === "heat" || options.role === "pace" ? 0.04 : 0.03,
  });
}

function countHeatBoats(): number {
  let count = 0;
  forEachActiveObstacle((obstacle) => {
    if (obstacle.role === "heat" && !obstacle.sinking) {
      count += 1;
    }
  });
  return count;
}

export function ActionDirector() {
  useFrame((_, delta) => {
    const state = useGameStore.getState();
    const juice = getJuice();

    if (!isGameplayActive(state)) {
      return;
    }

    const rawDt = clampGameDelta(delta);
    const frozen = isHitStopped();
    tickHitStop(rawDt);
    const dt = frozen ? 0 : rawDt;
    juice.runElapsed += rawDt;
    juice.strokeHot = isStrokeWindow();

    const { laneOffset, speed, gameMode, feverCombo, dropFeverCombo, setHeatTimeLeft } =
      state;

    if (dt > 0) {
      const drained = tickFeverHeat(dt, feverCombo);
      if (drained.dropped) {
        dropFeverCombo(drained.combo);
      }
    }

    if (gameMode === "festival") {
      juice.heatTimeLeft = Math.max(0, juice.heatTimeLeft - clampGameDelta(delta));
      setHeatTimeLeft(juice.heatTimeLeft);
    }

    if (gameMode !== "festival" && juice.introIndex < INTRO.beats.length) {
      while (
        juice.introIndex < INTRO.beats.length &&
        juice.runElapsed >= INTRO.beats[juice.introIndex].at
      ) {
        const beat = INTRO.beats[juice.introIndex];
        juice.introIndex += 1;
        queueRelative({
          kind: beat.kind,
          role: beat.role,
          laneOffset,
          xOff: beat.xOff,
          z: beat.z,
          playerSpeed: speed,
          speedDelta: beat.speedDelta,
          heatIndex: beat.heatIndex,
        });
      }
    }

    if (gameMode === "festival" && !juice.heatSeeded) {
      juice.heatSeeded = true;
      juice.introIndex = INTRO.beats.length;
      juice.packNext = 1.8;
      for (let index = 0; index < FESTIVAL.boatCount; index += 1) {
        const seed = juice.eventSeed + index * 17;
        queueRiverThreat({
          kind: "racing",
          role: "heat",
          z: -16 - seededRandom(seed * 2.2) * 32,
          playerSpeed: speed,
          speedDelta: -1.6 + seededRandom(seed * 4.8) * 2.4,
          heatIndex: index,
          seed,
        });
      }
    }

    let hasPace = false;
    let hasFlank = false;
    let rivalGap = Number.POSITIVE_INFINITY;
    let rivalNameBn: string = RIVAL_NAMES[0].bn;
    let rivalNameEn: string = RIVAL_NAMES[0].en;
    let draftTarget = false;

    forEachActiveObstacle((obstacle) => {
      if (obstacle.sinking || obstacle.bumpTimer > 0) {
        return;
      }
      if (!isSinkableKind(obstacle.kind) || obstacle.facing < 0) {
        return;
      }

      if (obstacle.z < -5) {
        obstacle.aheadTracked = true;
      }
      if (obstacle.aheadTracked && !obstacle.passed && obstacle.z > 0.9) {
        obstacle.passed = true;
        punchFov(JUICE.fovPunchOvertake);
        triggerNearMissShake(obstacle.x - laneOffset);
        audio.playSfx("kick", { rate: 1.18, volume: 0.72 });
        audio.playSfx("splash", { rate: 0.78, volume: 0.45 });
        state.triggerOvertake();
      }

      const gapX =
        Math.abs(obstacle.x - laneOffset) - BOAT_BOUNDS.width * 0.5 - obstacle.halfX;
      if (
        obstacle.role === "pace" ||
        obstacle.role === "heat" ||
        (obstacle.z < RIVAL.paceMaxZ && obstacle.z > RIVAL.paceMinZ)
      ) {
        hasPace = true;
      }

      if (
        obstacle.role === "flank" ||
        (obstacle.z < 4 && obstacle.z > -14 && gapX > 0.2 && gapX < 2.4)
      ) {
        hasFlank = true;
      }

      if (obstacle.z < -0.6 && -obstacle.z < rivalGap) {
        rivalGap = -obstacle.z;
        const named =
          obstacle.heatIndex >= 0 && obstacle.heatIndex < RIVAL_NAMES.length
            ? RIVAL_NAMES[obstacle.heatIndex]
            : RIVAL_NAMES[0];
        rivalNameBn = named.bn;
        rivalNameEn = named.en;
      }

      const dx = Math.abs(obstacle.x - laneOffset);
      if (
        obstacle.z >= DRAFT.minZ &&
        obstacle.z <= DRAFT.maxZ &&
        dx <= DRAFT.maxGapX
      ) {
        draftTarget = true;
      }
    });

    juice.rivalGap = Number.isFinite(rivalGap) ? rivalGap : 0;
    juice.rivalNameBn = rivalNameBn;
    juice.rivalNameEn = rivalNameEn;

    if (dt > 0 && draftTarget) {
      juice.drafting = true;
      juice.draftHeat = Math.min(1, juice.draftHeat + dt / DRAFT.readySec);
      const steeredOut = Math.abs(laneOffset - juice.prevLane) > DRAFT.exitSteer;
      if (juice.draftHeat >= 1 && steeredOut) {
        juice.draftHeat = 0.2;
        addSurge(DRAFT.slingshotBoost);
        punchFov(JUICE.fovPunchSlingshot);
        triggerNearMissShake(laneOffset - juice.prevLane);
        audio.playSfx("kick", { rate: 1.32, volume: 0.8 });
        state.triggerSlingshot();
      }
    } else {
      juice.drafting = false;
      juice.draftHeat *= Math.exp(-4.2 * clampGameDelta(delta));
      if (juice.draftHeat < 0.02) {
        juice.draftHeat = 0;
      }
    }
    juice.prevLane = laneOffset;

    juice.packTimer += clampGameDelta(delta);
    const heated = heatUpAmount(juice.runElapsed);
    const packGate = gameMode === "festival" ? 5 : RIVAL.packAfter;
    if (juice.packTimer >= juice.packNext && juice.runElapsed > packGate) {
      juice.packTimer = 0;
      juice.eventSeed += 1;
      juice.packNext =
        gameMode === "festival" && heated > 0.35
          ? FESTIVAL.packMin + seededRandom(juice.eventSeed * 9.1) * FESTIVAL.packSpan
          : 1.5 + seededRandom(juice.eventSeed * 9.1) * 2.8;
      const heatCount = countHeatBoats();
      const eventRoll = seededRandom(juice.eventSeed * 3.3);

      if (gameMode === "festival") {
        const kinds: DirectedSpawn["kind"][] = [
          "racing",
          "racing",
          "log",
          "dinghy",
          "log",
          "racing",
        ];
        const kind = kinds[Math.floor(seededRandom(juice.eventSeed * 5.7) * kinds.length)];
        const asHeat =
          kind === "racing" && heatCount < FESTIVAL.boatCount + 2 && eventRoll < 0.72;
        queueRiverThreat({
          kind,
          role: asHeat ? "heat" : kind === "racing" || kind === "dinghy" ? "flank" : "none",
          z: -12 - seededRandom(juice.eventSeed * 6.4) * 36,
          playerSpeed: speed,
          speedDelta: -2.1 + seededRandom(juice.eventSeed * 8.2) * 3.4,
          heatIndex: asHeat ? heatCount % RIVAL_NAMES.length : -1,
          seed: juice.eventSeed * 13,
        });
      } else {
        if (!hasPace) {
          queueRiverThreat({
            kind: "racing",
            role: "pace",
            z: -11 - seededRandom(juice.eventSeed * 2.4) * 10,
            playerSpeed: speed,
            speedDelta: -RIVAL.paceCatch,
            heatIndex: 0,
            seed: juice.eventSeed * 11,
          });
        }
        if (!hasFlank && eventRoll > 0.28) {
          queueRiverThreat({
            kind: eventRoll > 0.72 ? "dinghy" : "racing",
            role: "flank",
            z: -8 - seededRandom(juice.eventSeed * 4.1) * 16,
            playerSpeed: speed,
            speedDelta: -1.2 + seededRandom(juice.eventSeed * 7.5) * 1.8,
            heatIndex: -1,
            seed: juice.eventSeed * 19,
          });
        }
      }
    }
  }, -1);

  return null;
}
