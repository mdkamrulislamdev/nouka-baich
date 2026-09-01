import { BOAT_BOUNDS, KICK } from "@/components/canvas/sceneConfig";
import {
  forEachActiveObstacle,
  isSinkableKind,
  type ObstacleRecord,
} from "@/lib/obstacleWorld";

export type KickSide = -1 | 1;

export type KickPose = {
  active: boolean;
  strength: number;
  side: KickSide;
};

type KickClock = {
  requested: boolean;
  active: boolean;
  elapsed: number;
  cooldownUntil: number;
  side: KickSide;
};

const clock: KickClock = {
  requested: false,
  active: false,
  elapsed: 0,
  cooldownUntil: 0,
  side: 1,
};

function nowMs(): number {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}

export function requestKick(): void {
  clock.requested = true;
}

export function consumeKickRequest(): boolean {
  if (!clock.requested) {
    return false;
  }
  clock.requested = false;
  return true;
}

export function isKickOnCooldown(): boolean {
  return nowMs() < clock.cooldownUntil;
}

export function beginKick(side: KickSide): void {
  clock.active = true;
  clock.elapsed = 0;
  clock.side = side;
  clock.cooldownUntil = nowMs() + KICK.cooldownMs;
}

export function tickKick(dt: number): void {
  if (!clock.active) {
    return;
  }

  clock.elapsed += dt;
  if (clock.elapsed >= KICK.duration) {
    clock.active = false;
    clock.elapsed = 0;
  }
}

export function getKickPose(): KickPose {
  if (!clock.active) {
    return { active: false, strength: 0, side: clock.side };
  }

  const t = Math.min(1, clock.elapsed / KICK.duration);
  let strength = 0;
  if (t < 0.22) {
    strength = t / 0.22;
  } else if (t < 0.48) {
    strength = 1;
  } else {
    strength = 1 - (t - 0.48) / 0.52;
  }

  return { active: true, strength, side: clock.side };
}

export function resetKickCombat(): void {
  clock.requested = false;
  clock.active = false;
  clock.elapsed = 0;
  clock.cooldownUntil = 0;
  clock.side = 1;
}

export function queryKickTarget(laneOffset: number): ObstacleRecord | null {
  const playerHalfX = BOAT_BOUNDS.width * 0.5;
  let best: ObstacleRecord | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  forEachActiveObstacle((obstacle) => {
    if (obstacle.sinking || !isSinkableKind(obstacle.kind)) {
      return;
    }

    const dz = Math.abs(obstacle.z);
    if (dz > KICK.rangeZ) {
      return;
    }

    const gapX =
      Math.abs(obstacle.x - laneOffset) - playerHalfX - obstacle.halfX;
    if (gapX > KICK.rangeX) {
      return;
    }

    const score = Math.max(0, gapX) * 2 + dz;
    if (score < bestScore) {
      bestScore = score;
      best = obstacle;
    }
  });

  return best;
}

export function kickSideToward(
  laneOffset: number,
  target: ObstacleRecord | null,
): KickSide {
  if (!target) {
    return clock.side;
  }
  return target.x >= laneOffset ? 1 : -1;
}
