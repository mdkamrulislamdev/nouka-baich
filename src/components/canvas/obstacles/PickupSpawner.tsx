"use client";

/* Pooled Three.js pickups are mutated in useFrame, not in React state. */
/* eslint-disable react-hooks/immutability */

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Group } from "three";

import { PICKUPS, getLaneLimit } from "@/components/canvas/sceneConfig";
import { getJuice } from "@/lib/actionJuice";
import { audio } from "@/lib/audio";
import { clampGameDelta, isGameplayActive } from "@/lib/gameplay";
import { forEachActiveObstacle } from "@/lib/obstacleWorld";
import { seededRandom } from "@/lib/mathUtils";
import { detachObject } from "@/lib/dispose";
import {
  createPickup,
  PICKUP_KINDS,
  pickupSpinRate,
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

const PICKUP_ORDER: PickupKind[] = [
  "breaker",
  "haste",
  "bonus",
  "drag",
  "breaker",
  "bonus",
  "haste",
  "drag",
  "bonus",
];

function pickKind(seed: number): PickupKind {
  if (seed >= 24 && seed % 24 === 0) {
    return "ram";
  }
  return PICKUP_ORDER[(seed - 1) % PICKUP_ORDER.length];
}

function pickPickupX(seed: number, attempt: number, kind: PickupKind): number {
  const limit = getLaneLimit() * (kind === "ram" ? 0.86 : 0.94);
  const roll = seededRandom(seed * 7.13 + attempt * 3.91);
  if (roll < 0.34) {
    return -limit * (0.18 + seededRandom(seed * 11.7 + attempt) * 0.82);
  }
  if (roll < 0.68) {
    return limit * (0.18 + seededRandom(seed * 11.7 + attempt) * 0.82);
  }
  return (seededRandom(seed * 19.3 + attempt) * 2 - 1) * limit * 0.4;
}

function pickPickupZ(seed: number, kind: PickupKind): number {
  const base =
    kind === "ram"
      ? PICKUPS.ramSpawnZ
      : seed <= 2
        ? PICKUPS.earlySpawnZ
        : PICKUPS.spawnZ;
  return base + (seededRandom(seed * 2.27) * 2 - 1) * 14;
}

function collectPickup(kind: PickupKind): void {
  const state = useGameStore.getState();
  switch (kind) {
    case "breaker":
      state.collectBreaker();
      audio.playSfx("kick", { rate: 0.92, volume: 0.7 });
      break;
    case "haste":
      state.collectHaste();
      audio.playSfx("row", { rate: 1.4, volume: 0.6 });
      break;
    case "drag":
      state.collectDrag();
      audio.playSfx("splash", { rate: 0.7, volume: 0.5 });
      break;
    case "ram":
      state.collectRam();
      audio.playSfx("crash", { volume: 0.45 });
      break;
    default:
      state.collectBonus();
      audio.playSfx("splash", { rate: 1.35, volume: 0.45 });
      break;
  }
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
    for (let index = 0; index < PICKUPS.poolSize; index += 1) {
      const kind = PICKUP_KINDS[index % PICKUP_KINDS.length];
      const object = createPickup(kind);
      root.add(object);
      slots.push({ kind, object, active: false, x: 0, z: 0 });
    }
    slotsRef.current = slots;
    distanceRef.current = PICKUPS.interval;
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
      distanceRef.current = PICKUPS.interval;
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
      const beat = 0.5 + 0.5 * Math.sin(elapsed * 6.4 + index);
      const pulse = 1.08 + beat * beat * 0.32;
      slot.object.scale.setScalar(pulse);
      slot.object.rotation.y += dt * pickupSpinRate(slot.kind);
      slot.object.position.set(
        slot.x,
        PICKUPS.y + Math.sin(elapsed * 3.2 + index) * 0.16,
        slot.z,
      );

      const collectDx = Math.abs(slot.x - state.laneOffset);
      const collectDz = Math.abs(slot.z);
      if (collectDx < PICKUPS.collectRadius && collectDz < 1.05) {
        collectPickup(slot.kind);
        slot.active = false;
        slot.object.visible = false;
        continue;
      }

      if (slot.z > PICKUPS.recycleZ) {
        slot.active = false;
        slot.object.visible = false;
      }
    }

    if (elapsed < PICKUPS.firstAt) {
      return;
    }

    if (distanceRef.current < PICKUPS.interval) {
      return;
    }
    distanceRef.current -= PICKUPS.interval;
    spawnCountRef.current += 1;

    const seed = spawnCountRef.current;
    const kind = pickKind(seed);
    let free: PickupSlot | null = null;
    for (let index = 0; index < slots.length; index += 1) {
      if (!slots[index].active && slots[index].kind === kind) {
        free = slots[index];
        break;
      }
    }
    if (!free) {
      for (let index = 0; index < slots.length; index += 1) {
        if (!slots[index].active) {
          free = slots[index];
          break;
        }
      }
    }
    if (!free) {
      return;
    }

    const placedZ = pickPickupZ(seed, kind);
    let placedX = pickPickupX(seed, 0, kind);
    let foundClear = isCorridorClear(placedX, placedZ);
    if (!foundClear) {
      for (let attempt = 1; attempt <= 8; attempt += 1) {
        const candidate = pickPickupX(seed, attempt, kind);
        if (isCorridorClear(candidate, placedZ)) {
          placedX = candidate;
          foundClear = true;
          break;
        }
      }
    }
    if (!foundClear) {
      placedX = pickPickupX(seed + 17, 3, kind);
    }

    free.active = true;
    free.x = placedX;
    free.z = placedZ;
    free.object.visible = true;
    free.object.position.set(free.x, PICKUPS.y, free.z);
    free.object.scale.setScalar(1);
  });

  return <group ref={rootRef} />;
}
