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
  getLaneLimit,
  getSpawnInterval,
} from "@/components/canvas/sceneConfig";
import {
  createDinghyObstacle,
  createDinghyResources,
  disposeDinghyResources,
  DINGHY_EXTENTS,
} from "@/components/canvas/obstacles/dinghyFactory";
import {
  createRacingBoatObstacle,
  createRacingBoatResources,
  disposeRacingBoatResources,
  RACING_BOAT_EXTENTS,
} from "@/components/canvas/obstacles/racingBoatFactory";
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
import { isGameplayActive } from "@/lib/gameplay";
import { seededRandom } from "@/lib/mathUtils";
import {
  acquireIdleObstacle,
  acquirePreferredObstacle,
  clearObstacles,
  createObstacleRecord,
  forEachActiveObstacle,
  registerObstacle,
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

function pickSpawnKind(seed: number): ObstacleKind {
  const roll = seededRandom(seed * 1.7);
  if (roll < 0.28) {
    return "rock";
  }
  if (roll < 0.5) {
    return "log";
  }
  if (roll < 0.64) {
    return "dinghy";
  }
  if (roll < 0.82) {
    return "racing";
  }
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
  object.rotation.y = record.rotY;
  object.scale.setScalar(record.scale);

  if (record.worldBox) {
    object.updateWorldMatrix(true, false);
    record.worldBox.setFromObject(object);
    record.worldBox.getSize(worldSize);
    record.halfX = worldSize.x * 0.5;
    record.halfY = worldSize.y * 0.5;
    record.halfZ = worldSize.z * 0.5;
  }
}

function placeMarkerAt(
  record: ObstacleRecord,
  seed: number,
  x: number,
  z: number,
  scaleFactor = 1,
): void {
  record.active = true;
  record.x = x;
  record.y = OBSTACLE_SPAWN.y;
  record.z = z;
  record.rotY = seededRandom(seed * 2.2) * Math.PI * 2;
  record.scale = (0.9 + seededRandom(seed * 4.1) * 0.25) * scaleFactor;
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
): boolean {
  const pattern =
    MARKER_CLUSTER_OFFSETS[
      Math.floor(seededRandom(seed * 11.3) * MARKER_CLUSTER_OFFSETS.length)
    ];
  const laneLimit = getLaneLimit();
  const centerX =
    (seededRandom(seed) * 2 - 1) * laneLimit * OBSTACLE_SPAWN.laneScale;
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
  const laneLimit = getLaneLimit();
  record.active = true;
  record.x =
    (seededRandom(seed) * 2 - 1) * laneLimit * OBSTACLE_SPAWN.rockLaneScale;
  record.y = ROCK_MODEL.embedY;
  record.z = z;
  record.rotY = seededRandom(seed * 3.4) * Math.PI * 2;
  record.scale = 0.78 + seededRandom(seed * 5.2) * 0.4;
  record.forwardSpeed = 0;
}

function placeLog(record: ObstacleRecord, seed: number, z: number): void {
  const laneLimit = getLaneLimit();
  const scale = 0.85 + seededRandom(seed * 4.8) * 0.3;
  const halfLength = LOG_EXTENTS.halfX * scale;
  const travelLimit = Math.max(0.6, laneLimit - halfLength);
  const amplitude = 1.35 + seededRandom(seed * 2.6) * 1.7;
  const maxOrigin = Math.max(0, travelLimit - amplitude);

  record.active = true;
  record.scale = scale;
  record.originX = (seededRandom(seed) * 2 - 1) * maxOrigin;
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
  const laneLimit = getLaneLimit();
  const scale = 0.88 + seededRandom(seed * 4.8) * 0.28;

  record.active = true;
  record.scale = scale;
  record.y = RACING_BOAT_OBSTACLE.y;
  record.z = z;

  record.halfX = RACING_BOAT_EXTENTS.halfX * scale;
  record.halfY = RACING_BOAT_EXTENTS.halfY * scale;
  record.halfZ = RACING_BOAT_EXTENTS.halfZ * scale;

  const travelLimit = Math.max(0.6, laneLimit - record.halfX);
  const amplitude = 0.55 + seededRandom(seed * 2.6) * 0.95;
  const maxOrigin = Math.max(0, travelLimit - amplitude);

  record.originX = (seededRandom(seed) * 2 - 1) * maxOrigin;
  record.amplitude = Math.min(amplitude, maxOrigin);
  record.phase = seededRandom(seed * 6.1) * Math.PI * 2;
  record.angularSpeed = 0.85 + seededRandom(seed * 3.3) * 0.8;

  record.x = record.originX + Math.sin(record.phase) * record.amplitude;
  record.rotY = (seededRandom(seed * 8.2) - 0.5) * 0.18;

  record.forwardSpeed =
    RACING_BOAT_OBSTACLE.minSpeed +
    seededRandom(seed * 5.1) *
      (RACING_BOAT_OBSTACLE.maxSpeed - RACING_BOAT_OBSTACLE.minSpeed);
}

function placeDinghy(record: ObstacleRecord, seed: number, z: number): void {
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
  record.originX = (seededRandom(seed) * 2 - 1) * maxOrigin;
  record.amplitude = Math.min(amplitude, maxOrigin);
  record.phase = seededRandom(seed * 6.1) * Math.PI * 2;
  record.angularSpeed = 0.45 + seededRandom(seed * 3.3) * 0.6;
  record.x = record.originX + Math.sin(record.phase) * record.amplitude;
  record.rotY = Math.sin(record.phase) * 0.045;
  record.forwardSpeed =
    DINGHY_OBSTACLE.minSpeed +
    seededRandom(seed * 5.1) *
      (DINGHY_OBSTACLE.maxSpeed - DINGHY_OBSTACLE.minSpeed);
}

export function ObstacleSpawner() {
  const { scene: rockScene } = useGltfModel(ROCK_MODEL.path);
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
    const dinghyResources = createDinghyResources();
    const racingResources = createRacingBoatResources();
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
      () => createDinghyObstacle(dinghyResources),
      OBSTACLE_SPAWN.dinghyPoolSize,
    );
    const racingPool = new ObjectPool(
      () => createRacingBoatObstacle(racingResources),
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
      disposeMarkerResources(resources);
      disposeLogResources(logResources);
      disposeDinghyResources(dinghyResources);
      disposeRacingBoatResources(racingResources);
      clearObstacles();
      itemsRef.current = null;
      poolsRef.current = null;
    };
  }, [rockScene]);

  useFrame((_, delta) => {
    const items = itemsRef.current;
    const pools = poolsRef.current;
    const root = rootRef.current;
    if (!items || !pools || !root) {
      return;
    }

    const state = useGameStore.getState();
    const { status, speed, level } = state;
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

    const dt = Math.min(delta, 0.05);
    const dz = speed * dt;
    distanceRef.current += dz;

    forEachActiveObstacle((obstacle) => {
      const relativeSpeed = Math.max(2.2, speed - obstacle.forwardSpeed);
      obstacle.z += relativeSpeed * dt;
      if (obstacle.kind === "log") {
        obstacle.phase += obstacle.angularSpeed * dt;
        const laneLimit = getLaneLimit();
        const travelLimit = Math.max(
          0.4,
          laneLimit - obstacle.halfX,
        );
        obstacle.x = clamp(
          obstacle.originX + Math.sin(obstacle.phase) * obstacle.amplitude,
          -travelLimit,
          travelLimit,
        );
      }
      if (obstacle.kind === "racing") {
        obstacle.phase += obstacle.angularSpeed * dt;
        const laneLimit = getLaneLimit();
        const travelLimit = Math.max(
          0.4,
          laneLimit - obstacle.halfX,
        );
        obstacle.x = clamp(
          obstacle.originX + Math.sin(obstacle.phase) * obstacle.amplitude,
          -travelLimit,
          travelLimit,
        );
        obstacle.rotY = Math.sin(obstacle.phase) * 0.08;
      }
      if (obstacle.kind === "dinghy") {
        obstacle.phase += obstacle.angularSpeed * dt;
        const laneLimit = getLaneLimit();
        const travelLimit = Math.max(
          0.4,
          laneLimit - obstacle.halfX,
        );
        obstacle.x = clamp(
          obstacle.originX + Math.sin(obstacle.phase) * obstacle.amplitude,
          -travelLimit,
          travelLimit,
        );
        obstacle.rotY = Math.sin(obstacle.phase) * 0.045;
      }
      if (obstacle.z > OBSTACLE_SPAWN.recycleZ) {
        const item = findItem(items, obstacle);
        if (item) {
          recycleObstacle(item, pools);
        }
      }
    });

    const interval = getSpawnInterval(level);
    while (distanceRef.current >= interval) {
      distanceRef.current -= interval;
      spawnCountRef.current += 1;
      const kind = pickSpawnKind(spawnCountRef.current);

      if (kind === "marker") {
        if (
          !spawnMarkerCluster(
            items,
            pools,
            root,
            spawnCountRef.current,
            OBSTACLE_SPAWN.spawnZ,
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
        (seededRandom(seed) * 2 - 1) * laneLimit * OBSTACLE_SPAWN.laneScale,
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
  });

  return <group ref={rootRef} />;
}
