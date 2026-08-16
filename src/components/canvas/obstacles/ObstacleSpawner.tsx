"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Group, Vector3 } from "three";

import {
  DINGHY_OBSTACLE,
  LOG_OBSTACLE,
  OBSTACLE_SPAWN,
  ROCK_MODEL,
  getLaneLimit,
} from "@/components/canvas/sceneConfig";
import {
  createDinghyObstacle,
  createDinghyResources,
  disposeDinghyResources,
  DINGHY_EXTENTS,
} from "@/components/canvas/obstacles/dinghyFactory";
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
import { ObjectPool } from "@/lib/ObjectPool";
import { clamp } from "@/lib/clamp";
import {
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
  object: Group;
  record: ObstacleRecord;
};

const worldSize = new Vector3();

function seededRandom(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function pickSpawnKind(seed: number): ObstacleKind {
  const roll = seededRandom(seed * 1.7);
  if (roll < 0.28) {
    return "rock";
  }
  if (roll < 0.5) {
    return "log";
  }
  if (roll < 0.74) {
    return "dinghy";
  }
  return "marker";
}

function syncObstacle(item: PooledObstacle): void {
  const { record, object } = item;
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

function placeMarker(record: ObstacleRecord, seed: number, z: number): void {
  const laneLimit = getLaneLimit();
  record.active = true;
  record.x = (seededRandom(seed) * 2 - 1) * laneLimit * OBSTACLE_SPAWN.laneScale;
  record.y = OBSTACLE_SPAWN.y;
  record.z = z;
  record.rotY = seededRandom(seed * 2.2) * Math.PI * 2;
  record.scale = 0.9 + seededRandom(seed * 4.1) * 0.25;
  record.halfX = MARKER_EXTENTS.halfX * record.scale;
  record.halfY = MARKER_EXTENTS.halfY * record.scale;
  record.halfZ = MARKER_EXTENTS.halfZ * record.scale;
  record.forwardSpeed = 0;
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

function placeDinghy(record: ObstacleRecord, seed: number, z: number): void {
  const laneLimit = getLaneLimit();
  const scale = 0.88 + seededRandom(seed * 4.4) * 0.22;
  record.active = true;
  record.scale = scale;
  record.x =
    (seededRandom(seed) * 2 - 1) * laneLimit * OBSTACLE_SPAWN.dinghyLaneScale;
  record.y = DINGHY_OBSTACLE.y;
  record.z = z;
  record.rotY = (seededRandom(seed * 2.8) - 0.5) * 0.08;
  record.forwardSpeed =
    DINGHY_OBSTACLE.minSpeed +
    seededRandom(seed * 5.1) *
      (DINGHY_OBSTACLE.maxSpeed - DINGHY_OBSTACLE.minSpeed);
  record.halfX = DINGHY_EXTENTS.halfX * scale;
  record.halfY = DINGHY_EXTENTS.halfY * scale;
  record.halfZ = DINGHY_EXTENTS.halfZ * scale;
}

export function ObstacleSpawner() {
  const { scene: rockScene } = useGLTF(ROCK_MODEL.path);
  const rootRef = useRef<Group>(null);
  const itemsRef = useRef<PooledObstacle[] | null>(null);
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
    const items: PooledObstacle[] = [];

    const fillPool = (
      pool: ObjectPool<Group>,
      kind: ObstacleKind,
      count: number,
      idOffset: number,
    ) => {
      for (let index = 0; index < count; index += 1) {
        const object = pool.acquire();
        const record = createObstacleRecord(idOffset + index, kind);
        root.add(object);
        registerObstacle(record);
        items.push({ object, record });
      }
    };

    fillPool(markerPool, "marker", OBSTACLE_SPAWN.poolSize, 0);
    fillPool(rockPool, "rock", OBSTACLE_SPAWN.rockPoolSize, 100);
    fillPool(logPool, "log", OBSTACLE_SPAWN.logPoolSize, 200);
    fillPool(dinghyPool, "dinghy", OBSTACLE_SPAWN.dinghyPoolSize, 300);

    itemsRef.current = items;
    distanceRef.current = OBSTACLE_SPAWN.interval * 0.35;
    spawnCountRef.current = 0;

    return () => {
      items.forEach((item) => {
        item.record.active = false;
        root.remove(item.object);
      });
      markerPool.drain(() => undefined);
      rockPool.drain(() => undefined);
      logPool.drain(() => undefined);
      dinghyPool.drain(() => undefined);
      disposeMarkerResources(resources);
      disposeLogResources(logResources);
      disposeDinghyResources(dinghyResources);
      clearObstacles();
      itemsRef.current = null;
    };
  }, [rockScene]);

  useFrame((_, delta) => {
    const items = itemsRef.current;
    if (!items) {
      return;
    }

    const { status, speed } = useGameStore.getState();
    if (status !== "PLAYING") {
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
      if (obstacle.z > OBSTACLE_SPAWN.recycleZ) {
        obstacle.active = false;
      }
    });

    while (distanceRef.current >= OBSTACLE_SPAWN.interval) {
      distanceRef.current -= OBSTACLE_SPAWN.interval;
      spawnCountRef.current += 1;
      const slot = acquirePreferredObstacle(
        pickSpawnKind(spawnCountRef.current),
      );
      if (!slot) {
        break;
      }
      if (slot.kind === "rock") {
        placeRock(slot, spawnCountRef.current, OBSTACLE_SPAWN.spawnZ);
      } else if (slot.kind === "log") {
        placeLog(slot, spawnCountRef.current, OBSTACLE_SPAWN.spawnZ);
      } else if (slot.kind === "dinghy") {
        placeDinghy(slot, spawnCountRef.current, OBSTACLE_SPAWN.spawnZ);
      } else {
        placeMarker(slot, spawnCountRef.current, OBSTACLE_SPAWN.spawnZ);
      }
    }

    for (let index = 0; index < items.length; index += 1) {
      syncObstacle(items[index]);
    }
  });

  return <group ref={rootRef} />;
}

useGLTF.preload(ROCK_MODEL.path);
