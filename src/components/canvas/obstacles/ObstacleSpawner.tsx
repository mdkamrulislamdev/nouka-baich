"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Group } from "three";

import {
  OBSTACLE_SPAWN,
  getLaneLimit,
} from "@/components/canvas/sceneConfig";
import {
  createMarkerObstacle,
  createMarkerResources,
  disposeMarkerResources,
  MARKER_EXTENTS,
} from "@/components/canvas/obstacles/markerFactory";
import { ObjectPool } from "@/lib/ObjectPool";
import {
  acquireIdleObstacle,
  clearObstacles,
  forEachActiveObstacle,
  registerObstacle,
  type ObstacleRecord,
} from "@/lib/obstacleWorld";
import { useGameStore } from "@/store/useGameStore";

type PooledMarker = {
  object: Group;
  record: ObstacleRecord;
};

function seededRandom(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function syncMarker(item: PooledMarker): void {
  const { record, object } = item;
  object.visible = record.active;
  if (!record.active) {
    return;
  }
  object.position.set(record.x, record.y, record.z);
  object.rotation.y = record.rotY;
  object.scale.setScalar(record.scale);
}

function placeMarker(record: ObstacleRecord, seed: number, z: number): void {
  const laneLimit = getLaneLimit();
  const x = (seededRandom(seed) * 2 - 1) * laneLimit * OBSTACLE_SPAWN.laneScale;
  record.active = true;
  record.kind = "marker";
  record.x = x;
  record.y = OBSTACLE_SPAWN.y;
  record.z = z;
  record.rotY = seededRandom(seed * 2.2) * Math.PI * 2;
  record.scale = 0.9 + seededRandom(seed * 4.1) * 0.25;
  record.halfX = MARKER_EXTENTS.halfX * record.scale;
  record.halfY = MARKER_EXTENTS.halfY * record.scale;
  record.halfZ = MARKER_EXTENTS.halfZ * record.scale;
}

export function ObstacleSpawner() {
  const rootRef = useRef<Group>(null);
  const itemsRef = useRef<PooledMarker[] | null>(null);
  const distanceRef = useRef(0);
  const spawnCountRef = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const resources = createMarkerResources();
    const pool = new ObjectPool(
      () => createMarkerObstacle(resources),
      OBSTACLE_SPAWN.poolSize,
    );
    const items: PooledMarker[] = [];

    for (let index = 0; index < OBSTACLE_SPAWN.poolSize; index += 1) {
      const object = pool.acquire();
      const record: ObstacleRecord = {
        id: index,
        kind: "marker",
        active: false,
        x: 0,
        y: OBSTACLE_SPAWN.y,
        z: 0,
        rotY: 0,
        scale: 1,
        halfX: MARKER_EXTENTS.halfX,
        halfY: MARKER_EXTENTS.halfY,
        halfZ: MARKER_EXTENTS.halfZ,
      };
      root.add(object);
      registerObstacle(record);
      items.push({ object, record });
    }

    itemsRef.current = items;
    distanceRef.current = OBSTACLE_SPAWN.interval * 0.35;
    spawnCountRef.current = 0;

    return () => {
      items.forEach((item) => {
        item.record.active = false;
        root.remove(item.object);
      });
      pool.drain(() => undefined);
      disposeMarkerResources(resources);
      clearObstacles();
      itemsRef.current = null;
    };
  }, []);

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
      obstacle.z += dz;
      if (obstacle.z > OBSTACLE_SPAWN.recycleZ) {
        obstacle.active = false;
      }
    });

    while (distanceRef.current >= OBSTACLE_SPAWN.interval) {
      distanceRef.current -= OBSTACLE_SPAWN.interval;
      const slot = acquireIdleObstacle("marker");
      if (!slot) {
        break;
      }
      spawnCountRef.current += 1;
      placeMarker(slot, spawnCountRef.current, OBSTACLE_SPAWN.spawnZ);
    }

    for (let index = 0; index < items.length; index += 1) {
      syncMarker(items[index]);
    }
  });

  return <group ref={rootRef} />;
}
