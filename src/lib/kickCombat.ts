import { BOAT_BOUNDS, KICK, LONGBOAT_RIG, OARS, OAR_HIT } from "@/components/canvas/sceneConfig";
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

const oarStrike = { left: 0, right: 0 };

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

export function beginOarStrike(side: KickSide): void {
  if (side < 0) {
    oarStrike.left = 1;
  } else {
    oarStrike.right = 1;
  }
}

export function tickOarStrike(dt: number): void {
  const decay = Math.exp(-8.5 * dt);
  oarStrike.left *= decay;
  oarStrike.right *= decay;
  if (oarStrike.left < 0.03) {
    oarStrike.left = 0;
  }
  if (oarStrike.right < 0.03) {
    oarStrike.right = 0;
  }
}

export function getOarStrike(side: KickSide): number {
  return side < 0 ? oarStrike.left : oarStrike.right;
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
  oarStrike.left = 0;
  oarStrike.right = 0;
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
    if (obstacle.sinking || obstacle.bumpTimer > 0 || !isSinkableKind(obstacle.kind)) {
      return;
    }

    const dz = Math.abs(obstacle.z);
    if (dz > KICK.rangeZ) {
      return;
    }

    const dx = obstacle.x - laneOffset;
    const gapX = Math.abs(dx) - playerHalfX - obstacle.halfX;
    if (gapX < KICK.minGap || gapX > KICK.rangeX) {
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

type OarHit = { side: KickSide; target: ObstacleRecord };

function pickOarTarget(
  laneOffset: number,
  side: KickSide,
  used: Set<number>,
): ObstacleRecord | null {
  const playerHalfX = BOAT_BOUNDS.width * 0.5;
  let best: ObstacleRecord | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  forEachActiveObstacle((obstacle) => {
    if (
      obstacle.sinking ||
      obstacle.bumpTimer > 0 ||
      !isSinkableKind(obstacle.kind) ||
      used.has(obstacle.id)
    ) {
      return;
    }

    const dx = obstacle.x - laneOffset;
    if (dx * side <= 0) {
      return;
    }
    if (Math.abs(obstacle.z) > OAR_HIT.rangeZ) {
      return;
    }

    const gapX = Math.abs(dx) - playerHalfX - obstacle.halfX;
    if (gapX < KICK.minGap || gapX > OAR_HIT.reachX) {
      return;
    }

    const score = Math.max(0, gapX) + Math.abs(obstacle.z) * 0.35;
    if (score < bestScore) {
      bestScore = score;
      best = obstacle;
    }
  });

  return best;
}

export function queryOarHits(laneOffset: number, phase: number): OarHit[] {
  let maxDip = 0;
  for (let seat = 0; seat < LONGBOAT_RIG.thwartZ.length; seat += 1) {
    const zPhase = Math.sin(phase + seat * OARS.stagger);
    const backward = Math.max(0, -zPhase);
    maxDip = Math.max(maxDip, Math.pow(backward, 0.65));
  }
  if (maxDip < OAR_HIT.dipMin) {
    return [];
  }

  const hits: OarHit[] = [];
  const used = new Set<number>();

  for (const side of [-1, 1] as const) {
    const target = pickOarTarget(laneOffset, side, used);
    if (target) {
      used.add(target.id);
      hits.push({ side, target });
    }
  }

  return hits;
}
