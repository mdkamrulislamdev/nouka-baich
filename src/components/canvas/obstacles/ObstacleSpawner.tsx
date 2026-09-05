"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Group, Vector3 } from "three";

import {
  DINGHY_OBSTACLE,
  LOG_OBSTACLE,
  RACING_BOAT_OBSTACLE,
  OBSTACLE_SPAWN,
  ROCK_MODEL,
  BOAT_MODEL,
  SCENERY_MODELS,
  DIFFICULTY_PRESETS,
  INTRO,
  KICK,
  BUMP,
  type Difficulty,
  getLaneLimit,
  getSpawnInterval,
} from "@/components/canvas/sceneConfig";
import {
  createDinghyObstacle,
  createRacingBoatObstacle,
  DINGHY_EXTENTS,
  RACING_BOAT_EXTENTS,
} from "@/components/canvas/obstacles/npcBoatFactory";
import {
  createLogObstacle,
  createLogResources,
  disposeLogResources,
  LOG_EXTENTS,
} from "@/components/canvas/obstacles/logFactory";
import {
  createMarkerObstacle,
  createMarkerResources,
  disposeMarkerResources,
  MARKER_EXTENTS,
} from "@/components/canvas/obstacles/markerFactory";
import { prepareRock } from "@/components/canvas/obstacles/rockFactory";
import { detachObject } from "@/lib/dispose";
import { ObjectPool } from "@/lib/ObjectPool";
import { useGltfModel } from "@/lib/gltf";
import { clamp } from "@/lib/clamp";
import { clampGameDelta, isGameplayActive } from "@/lib/gameplay";
import { seededRandom } from "@/lib/mathUtils";
import { getJuice } from "@/lib/actionJuice";
import { isHitStopped } from "@/lib/hitStop";
import {
  acquireIdleObstacle,
  acquirePreferredObstacle,
  clearObstacles,
  createObstacleRecord,
  drainDirectedSpawns,
  forEachActiveObstacle,
  registerObstacle,
  resetObstacleCombat,
  type DirectedSpawn,
  type ObstacleKind,
  type ObstacleRecord,
} from "@/lib/obstacleWorld";
import { useGameStore } from "@/store/useGameStore";

type PooledObstacle = {
  object: Group | null;
  record: ObstacleRecord;
};

type ObstaclePools = Record<ObstacleKind, ObjectPool<Group>>;

const worldSize = new Vector3();
const worldCenter = new Vector3();
const MAX_SPAWNS_PER_FRAME = 2;

/** Bias obstacle X toward river edges instead of the center lane. */
function laneX(seed: number, laneLimit: number, laneScale: number): number {
  const sideRoll = seededRandom(seed * 3.77);
  const magnitude = 0.28 + seededRandom(seed * 5.19) ** 0.42 * 0.72;
  const sign: -1 | 1 = sideRoll < 0.5 ? -1 : 1;
  return sign * magnitude * laneLimit * laneScale;
}

function laneXUniform(seed: number, laneLimit: number, laneScale: number): number {
  return (seededRandom(seed) * 2 - 1) * laneLimit * laneScale;
}

function pickSpawnKind(
  seed: number,
  level: number,
  difficulty: Difficulty,
): ObstacleKind {
  const roll = seededRandom(seed * 1.7);
  const preset = DIFFICULTY_PRESETS[difficulty];
  const levelT = Math.min(1, Math.max(0, (level - 1) / 3));

  if (difficulty === "easy") {
    if (roll < 0.32) return "rock";
    if (roll < 0.56) return "log";
    if (roll < 0.78) return "dinghy";
    return "racing";
  }

  if (difficulty === "hard") {
    const racingEnd = 0.82 - 0.04 * levelT;
    if (roll < 0.18) return "rock";
    if (roll < 0.34) return "log";
    if (roll < 0.5) return "dinghy";
    if (roll < racingEnd) return "racing";
    return "marker";
  }

  // medium
  const racingEnd = 0.9 - 0.06 * levelT;
  if (roll < 0.24) return "rock";
  if (roll < 0.44) return "log";
  if (roll < 0.6) return "dinghy";
  if (roll < racingEnd) return "racing";
  if (preset.skipMarkers) return "log";
  return "marker";
}

function getPool(pools: ObstaclePools, kind: ObstacleKind): ObjectPool<Group> {
  return pools[kind];
}

function findItem(
  items: PooledObstacle[],
  record: ObstacleRecord,
): PooledObstacle | undefined {
  return items.find((item) => item.record === record);
}

function activateObstacle(
  item: PooledObstacle,
  pools: ObstaclePools,
  root: Group,
): void {
  if (item.object) {
    return;
  }

  item.object = getPool(pools, item.record.kind).acquire();
  item.object.visible = true;
  root.add(item.object);
}

function recycleObstacle(item: PooledObstacle, pools: ObstaclePools): void {
  item.record.active = false;
  resetObstacleCombat(item.record);

  const object = item.object;
  if (!object) {
    return;
  }

  object.visible = false;
  object.position.set(0, -999, 0);
  object.rotation.set(0, 0, 0);
  object.scale.setScalar(1);
  getPool(pools, item.record.kind).release(object);
  item.object = null;
}

function syncObstacle(item: PooledObstacle): void {
  const { record, object } = item;
  if (!object) {
    return;
  }

  object.visible = record.active;
  if (!record.active) {
    return;
  }

  object.position.set(record.x, record.y, record.z);
  object.rotation.set(record.rotX, record.rotY, record.rotZ);
  object.scale.setScalar(record.scale);

  // Cheap AABB from recorded half-extents — avoid setFromObject() every frame
  // (that walks full GLTF meshes and causes multi-second freezes on production).
  if (record.worldBox) {
    worldCenter.set(record.x, record.y + record.halfY, record.z);
    worldSize.set(record.halfX * 2, record.halfY * 2, record.halfZ * 2);
    record.worldBox.setFromCenterAndSize(worldCenter, worldSize);
  }
}

function placeMarkerAt(
  record: ObstacleRecord,
  seed: number,
  x: number,
  z: number,
  scaleFactor = 1,
): void {
  resetObstacleCombat(record);
  record.active = true;
  record.x = x;
  record.y = OBSTACLE_SPAWN.y;
  record.z = z;
  record.rotY = seededRandom(seed * 2.2) * Math.PI * 2;
  record.scale = (0.72 + seededRandom(seed * 4.1) * 0.18) * scaleFactor;
  record.halfX = MARKER_EXTENTS.halfX * record.scale;
  record.halfY = MARKER_EXTENTS.halfY * record.scale;
  record.halfZ = MARKER_EXTENTS.halfZ * record.scale;
  record.forwardSpeed = 0;
}

const MARKER_CLUSTER_OFFSETS: readonly number[][] = [
  [-1.05, 1.05],
  [-1.2, 0, 1.2],
  [-1.35, -0.45, 0.45, 1.35],
];

function spawnMarkerCluster(
  items: PooledObstacle[],
  pools: ObstaclePools,
  root: Group,
  seed: number,
  z: number,
  level: number,
): boolean {
  const r = seededRandom(seed * 11.3);
  // Phase 13: bias toward larger lane-block patterns as level increases.
  const t = Math.min(1, Math.max(0, (level - 1) / 4));
  const w2 = 0.6 - 0.45 * t; // length-2 pattern weight
  const w4 = 0.05 + 0.45 * t; // length-4 pattern weight
  const w3 = Math.max(0, 1 - w2 - w4); // length-3 weight

  let patternIndex = 2;
  if (r < w2) {
    patternIndex = 0;
  } else if (r < w2 + w3) {
    patternIndex = 1;
  }
  const pattern = MARKER_CLUSTER_OFFSETS[patternIndex];
  const laneLimit = getLaneLimit();
  const centerX = laneXUniform(seed, laneLimit, OBSTACLE_SPAWN.laneScale);
  const slots: ObstacleRecord[] = [];

  for (let index = 0; index < pattern.length; index += 1) {
    const slot = acquireIdleObstacle("marker");
    if (!slot) {
      break;
    }
    slots.push(slot);
  }

  if (slots.length < 2) {
    return false;
  }

  for (let index = 0; index < slots.length; index += 1) {
    const slot = slots[index];
    const item = findItem(items, slot);
    if (item) {
      activateObstacle(item, pools, root);
    }
    placeMarkerAt(
      slot,
      seed + index * 17,
      clamp(centerX + pattern[index], -laneLimit, laneLimit),
      z + (seededRandom(seed * 3.7 + index) - 0.5) * 1.4,
      0.92 + seededRandom(seed * 5.9 + index) * 0.12,
    );
  }

  return true;
}

function placeRock(record: ObstacleRecord, seed: number, z: number): void {
  resetObstacleCombat(record);
  const laneLimit = getLaneLimit();
  const scale = 0.62 + seededRandom(seed * 5.2) * 0.32;
  record.active = true;
  record.x = laneX(seed, laneLimit, OBSTACLE_SPAWN.rockLaneScale);
  record.y = ROCK_MODEL.embedY;
  record.z = z;
  record.rotY = seededRandom(seed * 3.4) * Math.PI * 2;
  record.scale = scale;
  record.halfX = ROCK_MODEL.targetWidth * 0.45 * scale;
  record.halfY = ROCK_MODEL.targetWidth * 0.35 * scale;
  record.halfZ = ROCK_MODEL.targetWidth * 0.45 * scale;
  record.forwardSpeed = 0;
}

function placeLog(record: ObstacleRecord, seed: number, z: number): void {
  resetObstacleCombat(record);
  const laneLimit = getLaneLimit();
  const scale = 0.85 + seededRandom(seed * 4.8) * 0.3;
  const halfLength = LOG_EXTENTS.halfX * scale;
  const travelLimit = Math.max(0.6, laneLimit - halfLength);
  const amplitude = 1.35 + seededRandom(seed * 2.6) * 1.7;
  const maxOrigin = Math.max(0, travelLimit - amplitude);

  record.active = true;
  record.scale = scale;
  record.originX = laneX(seed, maxOrigin, 1);
  record.amplitude = Math.min(amplitude, travelLimit);
  record.phase = seededRandom(seed * 6.1) * Math.PI * 2;
  record.angularSpeed = 0.65 + seededRandom(seed * 3.3) * 0.7;
  record.y = LOG_OBSTACLE.y;
  record.z = z;
  record.rotY = (seededRandom(seed * 8.2) - 0.5) * 0.35;
  record.x = record.originX + Math.sin(record.phase) * record.amplitude;
  record.halfX = halfLength;
  record.halfY = LOG_EXTENTS.halfY * scale;
  record.halfZ = LOG_EXTENTS.halfZ * scale;
  record.forwardSpeed = 0;
}

function placeRacingBoat(record: ObstacleRecord, seed: number, z: number): void {
  resetObstacleCombat(record);
  const laneLimit = getLaneLimit();
  const scale = 0.88 + seededRandom(seed * 4.8) * 0.28;
  const oncoming =
    seededRandom(seed * 9.37) < RACING_BOAT_OBSTACLE.oncomingChance;

  record.active = true;
  record.scale = scale;
  record.y = RACING_BOAT_OBSTACLE.y;
  record.z = oncoming ? z : RACING_BOAT_OBSTACLE.sameDirSpawnZ;
  record.facing = oncoming ? -1 : 1;

  record.halfX = RACING_BOAT_EXTENTS.halfX * scale;
  record.halfY = RACING_BOAT_EXTENTS.halfY * scale;
  record.halfZ = RACING_BOAT_EXTENTS.halfZ * scale;

  const travelLimit = Math.max(0.6, laneLimit - record.halfX);
  const amplitude = 0.18 + seededRandom(seed * 2.6) * 0.28;
  const maxOrigin = Math.max(0, travelLimit - amplitude);

  record.originX = laneX(seed, maxOrigin, 1);
  record.amplitude = Math.min(amplitude, maxOrigin);
  record.phase = seededRandom(seed * 6.1) * Math.PI * 2;
  record.angularSpeed = 0.85 + seededRandom(seed * 3.3) * 0.8;

  record.x = record.originX + Math.sin(record.phase) * record.amplitude;
  const heading = oncoming ? Math.PI : 0;
  record.rotY = heading + (seededRandom(seed * 8.2) - 0.5) * 0.12;

  if (oncoming) {
    record.forwardSpeed =
      RACING_BOAT_OBSTACLE.oncomingMinSpeed +
      seededRandom(seed * 5.1) *
        (RACING_BOAT_OBSTACLE.oncomingMaxSpeed -
          RACING_BOAT_OBSTACLE.oncomingMinSpeed);
  } else {
    record.forwardSpeed =
      RACING_BOAT_OBSTACLE.sameDirMinSpeed +
      seededRandom(seed * 5.1) *
        (RACING_BOAT_OBSTACLE.sameDirMaxSpeed -
          RACING_BOAT_OBSTACLE.sameDirMinSpeed);
  }
  record.cruiseSpeed = record.forwardSpeed;
}

function placeDinghy(record: ObstacleRecord, seed: number, z: number): void {
  resetObstacleCombat(record);
  const laneLimit = getLaneLimit();
  const scale = 0.88 + seededRandom(seed * 4.4) * 0.22;
  record.active = true;
  record.scale = scale;
  record.y = DINGHY_OBSTACLE.y;
  record.z = z;
  record.halfX = DINGHY_EXTENTS.halfX * scale;
  record.halfY = DINGHY_EXTENTS.halfY * scale;
  record.halfZ = DINGHY_EXTENTS.halfZ * scale;
  const travelLimit = Math.max(0.6, laneLimit - record.halfX);
  const amplitude = 0.08 + seededRandom(seed * 2.6) * 0.18;
  const maxOrigin = Math.max(0, travelLimit - amplitude);
  record.originX = laneX(seed, maxOrigin, 1);
  record.amplitude = Math.min(amplitude, maxOrigin);
  record.phase = seededRandom(seed * 6.1) * Math.PI * 2;
  record.angularSpeed = 0.45 + seededRandom(seed * 3.3) * 0.6;
  record.x = record.originX + Math.sin(record.phase) * record.amplitude;
  record.rotY = Math.sin(record.phase) * 0.045;
  record.facing = 1;
  record.forwardSpeed =
    DINGHY_OBSTACLE.minSpeed +
    seededRandom(seed * 5.1) *
      (DINGHY_OBSTACLE.maxSpeed - DINGHY_OBSTACLE.minSpeed);
  record.cruiseSpeed = record.forwardSpeed;
}

function placeDirected(record: ObstacleRecord, spawn: DirectedSpawn): void {
  resetObstacleCombat(record);
  record.active = true;
  record.role = spawn.role;
  record.heatIndex = spawn.heatIndex;
  record.passed = false;
  record.aheadTracked = spawn.z < -5;
  record.x = spawn.x;
  record.originX = spawn.x;
  record.z = spawn.z;
  record.forwardSpeed = spawn.forwardSpeed;
  record.cruiseSpeed = spawn.forwardSpeed;
  record.facing = spawn.facing;
  record.amplitude = spawn.amplitude;
  record.phase = 0;
  record.angularSpeed = spawn.role === "flank" ? 0.32 : 0.5;
  record.rotX = 0;
  record.rotZ = 0;

  if (spawn.kind === "racing") {
    const scale = 0.96;
    record.scale = scale;
    record.y = RACING_BOAT_OBSTACLE.y;
    record.halfX = RACING_BOAT_EXTENTS.halfX * scale;
    record.halfY = RACING_BOAT_EXTENTS.halfY * scale;
    record.halfZ = RACING_BOAT_EXTENTS.halfZ * scale;
    record.rotY = spawn.facing < 0 ? Math.PI : 0;
    return;
  }

  if (spawn.kind === "dinghy") {
    const scale = 0.92;
    record.scale = scale;
    record.y = DINGHY_OBSTACLE.y;
    record.halfX = DINGHY_EXTENTS.halfX * scale;
    record.halfY = DINGHY_EXTENTS.halfY * scale;
    record.halfZ = DINGHY_EXTENTS.halfZ * scale;
    record.rotY = 0;
    return;
  }

  if (spawn.kind === "rock") {
    const scale = 0.72;
    record.scale = scale;
    record.y = ROCK_MODEL.embedY;
    record.rotY = spawn.x * 0.35;
    record.halfX = ROCK_MODEL.targetWidth * 0.45 * scale;
    record.halfY = ROCK_MODEL.targetWidth * 0.35 * scale;
    record.halfZ = ROCK_MODEL.targetWidth * 0.45 * scale;
    record.forwardSpeed = 0;
    record.cruiseSpeed = 0;
    return;
  }

  const scale = 0.95;
  record.scale = scale;
  record.y = LOG_OBSTACLE.y;
  record.rotY = -0.12;
  record.halfX = LOG_EXTENTS.halfX * scale;
  record.halfY = LOG_EXTENTS.halfY * scale;
  record.halfZ = LOG_EXTENTS.halfZ * scale;
  record.forwardSpeed = 0;
  record.cruiseSpeed = 0;
}

function consumeDirectedSpawns(
  items: PooledObstacle[],
  pools: ObstaclePools,
  root: Group,
): void {
  const requests = drainDirectedSpawns();
  for (let index = 0; index < requests.length; index += 1) {
    const spawn = requests[index];
    const slot = acquireIdleObstacle(spawn.kind);
    if (!slot) {
      continue;
    }
    const item = findItem(items, slot);
    if (item) {
      activateObstacle(item, pools, root);
    }
    placeDirected(slot, spawn);
  }
}

export function ObstacleSpawner() {
  const { scene: rockScene } = useGltfModel(ROCK_MODEL.path);
  const { scene: boatScene } = useGltfModel(BOAT_MODEL.path);
  const { scene: rowerScene } = useGltfModel(SCENERY_MODELS.rower.path);
  const rootRef = useRef<Group>(null);
  const itemsRef = useRef<PooledObstacle[] | null>(null);
  const poolsRef = useRef<ObstaclePools | null>(null);
  const distanceRef = useRef(0);
  const spawnCountRef = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const resources = createMarkerResources();
    const logResources = createLogResources();
    const markerPool = new ObjectPool(
      () => createMarkerObstacle(resources),
      OBSTACLE_SPAWN.poolSize,
    );
    const rockPool = new ObjectPool(
      () => prepareRock(rockScene),
      OBSTACLE_SPAWN.rockPoolSize,
    );
    const logPool = new ObjectPool(
      () => createLogObstacle(logResources),
      OBSTACLE_SPAWN.logPoolSize,
    );
    const dinghyPool = new ObjectPool(
      () => createDinghyObstacle(boatScene, rowerScene),
      OBSTACLE_SPAWN.dinghyPoolSize,
    );
    const racingPool = new ObjectPool(
      () => createRacingBoatObstacle(boatScene, rowerScene),
      OBSTACLE_SPAWN.racingPoolSize,
    );
    const pools: ObstaclePools = {
      marker: markerPool,
      rock: rockPool,
      log: logPool,
      dinghy: dinghyPool,
      racing: racingPool,
    };
    const items: PooledObstacle[] = [];

    const reserveSlots = (
      kind: ObstacleKind,
      count: number,
      idOffset: number,
    ) => {
      for (let index = 0; index < count; index += 1) {
        const record = createObstacleRecord(idOffset + index, kind);
        registerObstacle(record);
        items.push({ object: null, record });
      }
    };

    reserveSlots("marker", OBSTACLE_SPAWN.poolSize, 0);
    reserveSlots("rock", OBSTACLE_SPAWN.rockPoolSize, 100);
    reserveSlots("log", OBSTACLE_SPAWN.logPoolSize, 200);
    reserveSlots("dinghy", OBSTACLE_SPAWN.dinghyPoolSize, 300);
    reserveSlots("racing", OBSTACLE_SPAWN.racingPoolSize, 400);

    poolsRef.current = pools;
    itemsRef.current = items;
    distanceRef.current = OBSTACLE_SPAWN.interval * 0.35;
    spawnCountRef.current = 0;

    return () => {
      items.forEach((item) => {
        if (item.object) {
          detachObject(item.object);
        }
      });
      markerPool.drain(detachObject);
      rockPool.drain(detachObject);
      logPool.drain(detachObject);
      dinghyPool.drain(detachObject);
      racingPool.drain(detachObject);
      disposeMarkerResources(resources);
      disposeLogResources(logResources);
      clearObstacles();
      itemsRef.current = null;
      poolsRef.current = null;
    };
  }, [rockScene, boatScene, rowerScene]);

  useFrame((_, delta) => {
    try {
    const items = itemsRef.current;
    const pools = poolsRef.current;
    const root = rootRef.current;
    if (!items || !pools || !root) {
      return;
    }

    const state = useGameStore.getState();
    const { status, speed, level, difficulty } = state;
    if (status === "MENU") {
      for (let index = 0; index < items.length; index += 1) {
        recycleObstacle(items[index], pools);
      }
      distanceRef.current = OBSTACLE_SPAWN.interval * 0.35;
      spawnCountRef.current = 0;
      return;
    }

    if (!isGameplayActive(state)) {
      return;
    }

    const dtRaw = clampGameDelta(delta);
    const dt = isHitStopped() ? 0 : dtRaw;
    const dz = speed * dt;
    distanceRef.current += dz;

    consumeDirectedSpawns(items, pools, root);

    forEachActiveObstacle((obstacle) => {
      if (obstacle.sinking) {
        if (obstacle.smash || obstacle.kind === "log") {
          obstacle.smashT += dt / 0.56;
          const t = Math.min(1, obstacle.smashT);
          const burst = 1 - (1 - t) * (1 - t);
          obstacle.y = obstacle.sinkStartY + burst * 0.9 - t * t * 1.55;
          obstacle.x += obstacle.sinkSide * 3.6 * dt;
          obstacle.z += 1.2 * dt;
          obstacle.rotZ = obstacle.sinkSide * burst * 2.7;
          obstacle.rotX = burst * 1.9;
          obstacle.rotY += dt * 9.5;
          obstacle.scale = Math.max(0.04, obstacle.smashScale * (1 - t * 0.94));
          if (t >= 1) {
            const item = findItem(items, obstacle);
            if (item) {
              recycleObstacle(item, pools);
            }
          }
          return;
        }
        obstacle.sinkT += dt / KICK.sinkDuration;
        const t = Math.min(1, obstacle.sinkT);
        const ease = t * 0.25 + t * t * 0.75;
        const remain = 1 - t;
        const travelLimit = Math.max(0.4, getLaneLimit() - obstacle.halfX);
        obstacle.y = obstacle.sinkStartY - ease * KICK.sinkDepth;
        obstacle.x = clamp(
          obstacle.x + obstacle.sinkSide * KICK.knockSpeed * dt * remain,
          -travelLimit,
          travelLimit,
        );
        obstacle.originX = obstacle.x;
        obstacle.z += KICK.knockBack * dt * remain;
        obstacle.rotZ = obstacle.sinkSide * t * 0.55;
        obstacle.rotX = t * 0.22;
        if (t >= 1) {
          const item = findItem(items, obstacle);
          if (item) {
            recycleObstacle(item, pools);
          }
        }
        return;
      }

      const relativeSpeed = Math.max(2.2, speed - obstacle.forwardSpeed);
      obstacle.z += relativeSpeed * dt;

      const laneLimit = getLaneLimit();
      const travelLimit = Math.max(0.4, laneLimit - obstacle.halfX);

      if (
        (obstacle.role === "heat" || obstacle.role === "pace") &&
        obstacle.bumpTimer <= 0
      ) {
        if (obstacle.z > 7.5) {
          obstacle.forwardSpeed = speed + 3.4;
        } else if (obstacle.z < -26) {
          obstacle.forwardSpeed = speed - 3.2;
        } else if (obstacle.cruiseSpeed !== 0) {
          obstacle.forwardSpeed +=
            (obstacle.cruiseSpeed - obstacle.forwardSpeed) *
            (1 - Math.exp(-1.15 * dt));
        }
      }

      if (obstacle.bumpTimer > 0) {
        obstacle.bumpTimer = Math.max(0, obstacle.bumpTimer - dt);
        obstacle.x = clamp(
          obstacle.x + obstacle.knockVx * dt,
          -travelLimit,
          travelLimit,
        );
        obstacle.originX = obstacle.x;
        obstacle.z += obstacle.knockVz * dt;
        const damp = Math.exp(-BUMP.knockDecay * dt);
        obstacle.knockVx *= damp;
        obstacle.knockVz *= damp;
        obstacle.rotZ =
          obstacle.sinkSide *
          Math.sin(obstacle.bumpTimer * 16) *
          0.2 *
          Math.min(1, obstacle.bumpTimer * 2);
      } else if (
        obstacle.kind === "log" ||
        obstacle.kind === "racing" ||
        obstacle.kind === "dinghy"
      ) {
        obstacle.phase += obstacle.angularSpeed * dt;
        obstacle.x = clamp(
          obstacle.originX + Math.sin(obstacle.phase) * obstacle.amplitude,
          -travelLimit,
          travelLimit,
        );
        if (obstacle.kind === "racing") {
          const heading = obstacle.facing < 0 ? Math.PI : 0;
          obstacle.rotY = heading + Math.sin(obstacle.phase) * 0.08;
        } else if (obstacle.kind === "dinghy") {
          obstacle.rotY = Math.sin(obstacle.phase) * 0.045;
        }
      }
      if (obstacle.z > OBSTACLE_SPAWN.recycleZ) {
        if (obstacle.role === "heat") {
          obstacle.z = 8.5;
          obstacle.passed = true;
          return;
        }
        const item = findItem(items, obstacle);
        if (item) {
          recycleObstacle(item, pools);
        }
      }
    });

    const interval = getSpawnInterval(level, difficulty, state.distance);
    let spawnsThisFrame = 0;
    const introHold = getJuice().runElapsed < INTRO.holdSpawnUntil;
    while (
      !introHold &&
      distanceRef.current >= interval &&
      spawnsThisFrame < MAX_SPAWNS_PER_FRAME
    ) {
      distanceRef.current -= interval;
      spawnCountRef.current += 1;
      spawnsThisFrame += 1;
      const kind = pickSpawnKind(spawnCountRef.current, level, difficulty);

      if (kind === "marker") {
        if (
          !spawnMarkerCluster(
            items,
            pools,
            root,
            spawnCountRef.current,
            OBSTACLE_SPAWN.spawnZ,
            level,
          )
        ) {
          const fallback = acquirePreferredObstacle("log");
          if (!fallback) {
            break;
          }
          const fallbackItem = findItem(items, fallback);
          if (fallbackItem) {
            activateObstacle(fallbackItem, pools, root);
          }
          placeLog(fallback, spawnCountRef.current, OBSTACLE_SPAWN.spawnZ);
        }
        continue;
      }

      const slot = acquirePreferredObstacle(kind);
      if (!slot) {
        break;
      }

      const item = findItem(items, slot);
      if (item) {
        activateObstacle(item, pools, root);
      }

      const seed = spawnCountRef.current;
      const laneLimit = getLaneLimit();
      const markerXFallback = clamp(
        laneXUniform(seed, laneLimit, OBSTACLE_SPAWN.laneScale),
        -laneLimit,
        laneLimit,
      );

      if (slot.kind === "rock") {
        placeRock(slot, seed, OBSTACLE_SPAWN.spawnZ);
      } else if (slot.kind === "log") {
        placeLog(slot, seed, OBSTACLE_SPAWN.spawnZ);
      } else if (slot.kind === "dinghy") {
        placeDinghy(slot, seed, OBSTACLE_SPAWN.spawnZ);
      } else if (slot.kind === "racing") {
        placeRacingBoat(slot, seed, OBSTACLE_SPAWN.spawnZ);
      } else {
        // Fallback if we ran out of rock/log/dinghy/racing slots.
        placeMarkerAt(slot, seed, markerXFallback, OBSTACLE_SPAWN.spawnZ);
      }
    }

    for (let index = 0; index < items.length; index += 1) {
      syncObstacle(items[index]);
    }
    } catch (error) {
      console.error("[ObstacleSpawner] frame failed:", error);
    }
  }, 0);

  return <group ref={rootRef} />;
}
