"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { InstancedMesh, Object3D } from "three";

import { SCENERY, WORLD_SCROLL } from "@/components/canvas/sceneConfig";
import { HUT_LOCAL, TREE_LOCAL } from "@/components/canvas/world/sceneryFactory";
import { isGameplayActive } from "@/lib/gameplay";
import { useGameStore } from "@/store/useGameStore";

const { segmentCount, segmentLength, recycleZ, riverWidth } = WORLD_SCROLL;
const WORLD_LENGTH = segmentCount * segmentLength;
const RIVER_EDGE = riverWidth / 2;

const dummy = new Object3D();
const local = new Object3D();

type ScenerySlot = {
  x: number;
  y: number;
  z: number;
  rotY: number;
  scale: number;
  lean: number;
};

function seededRandom(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function recycleZPosition(currentZ: number): number {
  return currentZ - WORLD_LENGTH;
}

function placeOnBank(
  slot: ScenerySlot,
  seed: number,
  minOut: number,
  span: number,
  y: number,
  scaleMin: number,
  scaleSpan: number,
  z: number,
): void {
  const side: -1 | 1 = seededRandom(seed * 3.1) < 0.5 ? -1 : 1;
  const outward = minOut + seededRandom(seed * 5.7) * span;
  slot.x = side * (RIVER_EDGE + outward);
  slot.y = y;
  slot.z = z;
  slot.rotY = seededRandom(seed * 9.1) * Math.PI * 2;
  slot.scale = scaleMin + seededRandom(seed * 4.4) * scaleSpan;
  slot.lean = (seededRandom(seed * 7.3) - 0.5) * 0.35;
}

function createSlots(
  count: number,
  startSeed: number,
  minOut: number,
  span: number,
  y: number,
  scaleMin: number,
  scaleSpan: number,
): ScenerySlot[] {
  const slots: ScenerySlot[] = [];
  for (let index = 0; index < count; index += 1) {
    const slot: ScenerySlot = {
      x: 0,
      y: 0,
      z: 0,
      rotY: 0,
      scale: 1,
      lean: 0,
    };
    const z =
      recycleZ - 8 - (index / Math.max(count - 1, 1)) * (WORLD_LENGTH - 16);
    placeOnBank(slot, startSeed + index, minOut, span, y, scaleMin, scaleSpan, z);
    slots.push(slot);
  }
  return slots;
}

function writePart(
  mesh: InstancedMesh,
  index: number,
  slot: ScenerySlot,
  localPosition: readonly [number, number, number],
  localRotY = 0,
  extraLean = 0,
): void {
  dummy.position.set(slot.x, slot.y, slot.z);
  dummy.rotation.set(0, slot.rotY, 0);
  dummy.scale.setScalar(slot.scale);
  dummy.updateMatrix();

  local.position.set(localPosition[0], localPosition[1], localPosition[2]);
  local.rotation.set(extraLean, localRotY, 0);
  local.scale.set(1, 1, 1);
  local.updateMatrix();

  dummy.matrix.multiply(local.matrix);
  mesh.setMatrixAt(index, dummy.matrix);
}

function commitInstances(mesh: InstancedMesh | null): void {
  if (!mesh) {
    return;
  }
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();
}

function scrollSlots(slots: ScenerySlot[], dz: number, startSeed: number, place: (slot: ScenerySlot, seed: number, z: number) => void): void {
  for (let index = 0; index < slots.length; index += 1) {
    const slot = slots[index];
    slot.z += dz;
    if (slot.z > recycleZ) {
      const nextZ = recycleZPosition(slot.z);
      place(slot, startSeed + index + Math.floor(nextZ), nextZ);
    }
  }
}

export function InstancedScenery() {
  const trunkRef = useRef<InstancedMesh>(null);
  const crownRef = useRef<InstancedMesh>(null);
  const topRef = useRef<InstancedMesh>(null);
  const bushRef = useRef<InstancedMesh>(null);
  const wallRef = useRef<InstancedMesh>(null);
  const roofRef = useRef<InstancedMesh>(null);
  const doorRef = useRef<InstancedMesh>(null);
  const grassRef = useRef<InstancedMesh>(null);

  const treesRef = useRef<ScenerySlot[] | null>(null);
  const hutsRef = useRef<ScenerySlot[] | null>(null);
  const grassRefSlots = useRef<ScenerySlot[] | null>(null);

  useFrame((_, delta) => {
    if (!treesRef.current) {
      treesRef.current = createSlots(SCENERY.treeCount, 0, 2.1, 3.6, 0.72, 0.78, 0.4);
    }
    if (!hutsRef.current) {
      hutsRef.current = createSlots(SCENERY.hutCount, 200, 4.2, 2.2, 0.72, 0.85, 0.25);
    }
    if (!grassRefSlots.current) {
      grassRefSlots.current = createSlots(SCENERY.grassCount, 400, 0.55, 5.8, 0.62, 0.55, 0.7);
    }

    const state = useGameStore.getState();
    if (isGameplayActive(state)) {
      const dz = state.speed * Math.min(delta, 0.05);
      scrollSlots(treesRef.current, dz, 0, (slot, seed, z) => {
        placeOnBank(slot, seed, 2.1, 3.6, 0.72, 0.78, 0.4, z);
      });
      scrollSlots(hutsRef.current, dz, 200, (slot, seed, z) => {
        placeOnBank(slot, seed, 4.2, 2.2, 0.72, 0.85, 0.25, z);
      });
      scrollSlots(grassRefSlots.current, dz, 400, (slot, seed, z) => {
        placeOnBank(slot, seed, 0.55, 5.8, 0.62, 0.55, 0.7, z);
      });
    }

    const trees = treesRef.current;
    const trunk = trunkRef.current;
    const crown = crownRef.current;
    const top = topRef.current;
    const bush = bushRef.current;
    if (trunk && crown && top && bush) {
      for (let index = 0; index < trees.length; index += 1) {
        const slot = trees[index];
        writePart(trunk, index, slot, TREE_LOCAL.trunk);
        writePart(crown, index, slot, TREE_LOCAL.crown);
        writePart(top, index, slot, TREE_LOCAL.top);
        writePart(bush, index, slot, TREE_LOCAL.bush);
      }
      commitInstances(trunk);
      commitInstances(crown);
      commitInstances(top);
      commitInstances(bush);
    }

    const huts = hutsRef.current;
    const wall = wallRef.current;
    const roof = roofRef.current;
    const door = doorRef.current;
    if (wall && roof && door) {
      for (let index = 0; index < huts.length; index += 1) {
        const slot = huts[index];
        writePart(wall, index, slot, HUT_LOCAL.wall);
        writePart(roof, index, slot, HUT_LOCAL.roof, HUT_LOCAL.roofRotationY);
        writePart(door, index, slot, HUT_LOCAL.door);
      }
      commitInstances(wall);
      commitInstances(roof);
      commitInstances(door);
    }

    const grassSlots = grassRefSlots.current;
    const grass = grassRef.current;
    if (grass) {
      for (let index = 0; index < grassSlots.length; index += 1) {
        const slot = grassSlots[index];
        writePart(grass, index, slot, [0, 0.22, 0], 0, slot.lean);
      }
      commitInstances(grass);
    }
  });

  return (
    <group>
      <instancedMesh
        ref={trunkRef}
        args={[undefined, undefined, SCENERY.treeCount]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.11, 0.18, 1.4, 5]} />
        <meshStandardMaterial color="#5c3a22" roughness={0.88} metalness={0.02} />
      </instancedMesh>
      <instancedMesh
        ref={crownRef}
        args={[undefined, undefined, SCENERY.treeCount]}
        castShadow
        receiveShadow
      >
        <coneGeometry args={[1.15, 2.15, 6]} />
        <meshStandardMaterial color="#2d6a33" roughness={0.78} metalness={0.03} />
      </instancedMesh>
      <instancedMesh
        ref={topRef}
        args={[undefined, undefined, SCENERY.treeCount]}
        castShadow
        receiveShadow
      >
        <coneGeometry args={[0.78, 1.45, 6]} />
        <meshStandardMaterial color="#3d8c42" roughness={0.74} metalness={0.03} />
      </instancedMesh>
      <instancedMesh
        ref={bushRef}
        args={[undefined, undefined, SCENERY.treeCount]}
        castShadow
        receiveShadow
      >
        <icosahedronGeometry args={[0.42, 0]} />
        <meshStandardMaterial color="#3a7a38" roughness={0.82} metalness={0.02} />
      </instancedMesh>

      <instancedMesh
        ref={wallRef}
        args={[undefined, undefined, SCENERY.hutCount]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1.9, 1.15, 1.5]} />
        <meshStandardMaterial color="#c9b07a" roughness={0.86} metalness={0.04} />
      </instancedMesh>
      <instancedMesh
        ref={roofRef}
        args={[undefined, undefined, SCENERY.hutCount]}
        castShadow
        receiveShadow
      >
        <coneGeometry args={[1.55, 0.95, 4]} />
        <meshStandardMaterial color="#8a4e24" roughness={0.9} metalness={0.02} />
      </instancedMesh>
      <instancedMesh
        ref={doorRef}
        args={[undefined, undefined, SCENERY.hutCount]}
        receiveShadow
      >
        <boxGeometry args={[0.38, 0.72, 0.08]} />
        <meshStandardMaterial color="#3d2a18" roughness={0.8} metalness={0.05} />
      </instancedMesh>

      <instancedMesh
        ref={grassRef}
        args={[undefined, undefined, SCENERY.grassCount]}
        receiveShadow
      >
        <coneGeometry args={[0.07, 0.48, 3]} />
        <meshStandardMaterial color="#4d8a3c" roughness={0.9} metalness={0.02} />
      </instancedMesh>
    </group>
  );
}
