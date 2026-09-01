import { BOAT_BOUNDS, KICK } from "@/components/canvas/sceneConfig";
import {
  forEachActiveObstacle,
  isSinkableKind,
  type ObstacleRecord,
} from "@/lib/obstacleWorld";

export type KickSide = -1 | 1;
/** `0` = auto: hit the nearest boat on either side. */
export type KickIntent = KickSide | 0;

export type KickPose = {
  active: boolean;
  strength: number;
  side: KickSide;
};

export type KickTargets = {
  left: ObstacleRecord | null;
  right: ObstacleRecord | null;
};

type KickClock = {
  pending: KickIntent | null;
  active: boolean;
  elapsed: number;
  cooldownUntil: number;
  side: KickSide;
};

const clock: KickClock = {
  pending: null,
  active: false,
  elapsed: 0,
  cooldownUntil: 0,
  side: 1,
};

const targets: KickTargets = {
  left: null,
  right: null,
};

/** Boats this close to the player center can be hit from either side. */
const SIDE_OVERLAP = 0.35;

function nowMs(): number {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}

export function requestKick(side: KickIntent = 0): void {
  clock.pending = side;
}

export function consumeKickRequest(): KickIntent | null {
  const pending = clock.pending;
  clock.pending = null;
  return pending;
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
  clock.pending = null;
  clock.active = false;
  clock.elapsed = 0;
  clock.cooldownUntil = 0;
  clock.side = 1;
}

function scoreTarget(gapX: number, dz: number): number {
  return Math.max(0, gapX) * 2 + dz;
}

/**
 * One pass over active boats. Reuses a module-level result — copy fields
 * before the next query if you need to keep them.
 */
export function queryKickTargets(laneOffset: number): KickTargets {
  targets.left = null;
  targets.right = null;
  let leftScore = Number.POSITIVE_INFINITY;
  let rightScore = Number.POSITIVE_INFINITY;
  const playerHalfX = BOAT_BOUNDS.width * 0.5;

  forEachActiveObstacle((obstacle) => {
    if (obstacle.sinking || !isSinkableKind(obstacle.kind)) {
      return;
    }

    const dz = Math.abs(obstacle.z);
    if (dz > KICK.rangeZ) {
      return;
    }

    const dx = obstacle.x - laneOffset;
    const gapX = Math.abs(dx) - playerHalfX - obstacle.halfX;
    if (gapX > KICK.rangeX) {
      return;
    }

    const score = scoreTarget(gapX, dz);
    if (dx <= SIDE_OVERLAP && score < leftScore) {
      leftScore = score;
      targets.left = obstacle;
    }
    if (dx >= -SIDE_OVERLAP && score < rightScore) {
      rightScore = score;
      targets.right = obstacle;
    }
  });

  return targets;
}

export function pickAutoKick(
  found: KickTargets,
  laneOffset: number,
): { side: KickSide; target: ObstacleRecord | null } {
  const { left, right } = found;
  if (left && right) {
    if (left === right) {
      const side: KickSide = left.x < laneOffset ? -1 : 1;
      return { side, target: left };
    }
    const leftGap = Math.abs(left.x - laneOffset);
    const rightGap = Math.abs(right.x - laneOffset);
    if (leftGap <= rightGap) {
      return { side: -1, target: left };
    }
    return { side: 1, target: right };
  }
  if (left) {
    return { side: -1, target: left };
  }
  if (right) {
    return { side: 1, target: right };
  }
  return { side: clock.side, target: null };
}
