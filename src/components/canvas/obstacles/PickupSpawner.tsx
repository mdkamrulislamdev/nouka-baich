"use client";

/* Pooled Three.js pickups are mutated in useFrame, not in React state. */
/* eslint-disable react-hooks/immutability */

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Group } from "three";

import { INTRO, PICKUPS } from "@/components/canvas/sceneConfig";
import { getJuice } from "@/lib/actionJuice";
import { audio } from "@/lib/audio";
import { clampGameDelta, isGameplayActive } from "@/lib/gameplay";
import {
  forEachActiveObstacle,
} from "@/lib/obstacleWorld";
import { seededRandom } from "@/lib/mathUtils";
import { detachObject } from "@/lib/dispose";
import {
  createPickup,
  type PickupKind,
} from "@/components/canvas/obstacles/pickupFactory";
import { useGameStore } from "@/store/useGameStore";

function isCorridorClear(x: number, z: number): boolean {
  let clear = true;
  forEachActiveObstacle((obstacle) => {
    if (
      obstacle.kind !== "log" &&
      obstacle.kind !== "rock" &&
      obstacle.kind !== "marker"
    ) {
      return;
    }
    if (
      Math.abs(obstacle.x - x) < PICKUPS.clearX &&
      Math.abs(obstacle.z - z) < PICKUPS.clearZ
    ) {
      clear = false;
    }
  });
  return clear;
}

type PickupSlot = {
  kind: PickupKind;
  object: Group;
  active: boolean;
  x: number;
  z: number;
};

export function PickupSpawner() {
  const rootRef = useRef<Group>(null);
  const slotsRef = useRef<PickupSlot[] | null>(null);
  const distanceRef = useRef(0);
  const spawnCountRef = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const slots: PickupSlot[] = [];
    const half = Math.ceil(PICKUPS.poolSize / 2);
    for (let index = 0; index < PICKUPS.poolSize; index += 1) {
      const kind: PickupKind = index < half ? "breaker" : "bonus";
      const object = createPickup(kind);
      root.add(object);
      slots.push({ kind, object, active: false, x: 0, z: 0 });
    }
    slotsRef.current = slots;
    distanceRef.current = PICKUPS.interval * 0.4;
    spawnCountRef.current = 0;

    return () => {
      slots.forEach((slot) => detachObject(slot.object));
      slotsRef.current = null;
    };
  }, []);

  useFrame((_, delta) => {
    const slots = slotsRef.current;
    if (!slots) {
      return;
    }

    const state = useGameStore.getState();
    if (state.status === "MENU") {
      for (let index = 0; index < slots.length; index += 1) {
        const slot = slots[index];
        slot.active = false;
        slot.object.visible = false;
        slot.object.position.set(0, -8, 0);
      }
      distanceRef.current = PICKUPS.interval * 0.4;
      spawnCountRef.current = 0;
      return;
    }

    if (!isGameplayActive(state)) {
      return;
    }

    const dt = clampGameDelta(delta);
    const dz = state.speed * dt;
    distanceRef.current += dz;
    const elapsed = getJuice().runElapsed;

    for (let index = 0; index < slots.length; index += 1) {
      const slot = slots[index];
      if (!slot.active) {
        continue;
      }
      slot.z += dz;
      slot.object.position.set(slot.x, PICKUPS.y, slot.z);
      slot.object.rotation.y += dt * (slot.kind === "breaker" ? 1.8 : 2.6);
      const pulse = 1.12 + Math.sin(elapsed * 4.6 + index) * 0.16;
      slot.object.scale.setScalar(pulse);
      slot.object.position.y =
        PICKUPS.y + Math.sin(elapsed * 3.8 + index) * 0.2;

      const collectDx = Math.abs(slot.x - state.laneOffset);
      const collectDz = Math.abs(slot.z);
      if (collectDx < PICKUPS.collectRadius && collectDz < 1.35) {
        if (slot.kind === "breaker") {
          state.collectBreaker();
          audio.playSfx("kick", { rate: 0.92, volume: 0.7 });
        } else {
          state.collectBonus();
          audio.playSfx("splash", { rate: 1.35, volume: 0.45 });
        }
        slot.active = false;
        slot.object.visible = false;
        continue;
      }

      if (slot.z > PICKUPS.recycleZ) {
        slot.active = false;
        slot.object.visible = false;
      }
    }

    if (elapsed < INTRO.holdSpawnUntil) {
      return;
    }

    if (distanceRef.current < PICKUPS.interval) {
      return;
    }
    distanceRef.current -= PICKUPS.interval;
    spawnCountRef.current += 1;

    const seed = spawnCountRef.current;
    const wantBreaker = seededRandom(seed * 2.17) < PICKUPS.breakerChance;
    const kind: PickupKind = wantBreaker ? "breaker" : "bonus";
    let free: PickupSlot | null = null;
    for (let index = 0; index < slots.length; index += 1) {
      if (!slots[index].active && slots[index].kind === kind) {
        free = slots[index];
        break;
      }
    }
    if (!free) {
      return;
    }

    const candidatesX = kind === "breaker" ? [0, 0.85, -0.85, 1.4, -1.4] : [
      (seededRandom(seed * 4.1) - 0.5) * PICKUPS.bonusSpread * 2,
    ];
    const candidatesZ =
      kind === "breaker"
        ? [PICKUPS.spawnZ, PICKUPS.spawnZ - 14, PICKUPS.spawnZ - 28]
        : [PICKUPS.spawnZ];

    let placedX = candidatesX[0];
    let placedZ = candidatesZ[0];
    let foundClear = kind !== "breaker";
    if (kind === "breaker") {
      outer: for (let zi = 0; zi < candidatesZ.length; zi += 1) {
        for (let xi = 0; xi < candidatesX.length; xi += 1) {
          if (isCorridorClear(candidatesX[xi], candidatesZ[zi])) {
            placedX = candidatesX[xi];
            placedZ = candidatesZ[zi];
            foundClear = true;
            break outer;
          }
        }
      }
    }
    if (!foundClear) {
      return;
    }

    free.active = true;
    free.x = placedX;
    free.z = placedZ;
    free.object.visible = true;
    free.object.position.set(free.x, PICKUPS.y, free.z);
  });

  return <group ref={rootRef} />;
}
