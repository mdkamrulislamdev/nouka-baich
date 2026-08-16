"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Group } from "three";

import { PALM_MODEL, WORLD_SCROLL } from "@/components/canvas/sceneConfig";
import { preparePalm } from "@/components/canvas/world/PalmProp";
import {
  createHutProp,
  createSceneryResources,
  createTreeProp,
  disposeSceneryResources,
  type SceneryKind,
} from "@/components/canvas/world/sceneryFactory";
import { ObjectPool } from "@/lib/ObjectPool";
import { useGameStore } from "@/store/useGameStore";

const { segmentCount, segmentLength, recycleZ, riverWidth } = WORLD_SCROLL;
const WORLD_LENGTH = segmentCount * segmentLength;
const RIVER_EDGE = riverWidth / 2;

const POOL_COUNTS = {
  tree: 20,
  palm: 12,
  hut: 8,
} as const;

type PooledProp = {
  object: Group;
  kind: SceneryKind;
};

function seededRandom(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function placeProp(prop: PooledProp, slot: number, z: number): void {
  const side: -1 | 1 = seededRandom(slot * 3.1) < 0.5 ? -1 : 1;
  const minOut = prop.kind === "hut" ? 4.2 : 2.1;
  const span = prop.kind === "hut" ? 2.2 : 3.6;
  const outward = minOut + seededRandom(slot * 5.7) * span;
  const scale =
    prop.kind === "hut"
      ? 0.85 + seededRandom(slot * 2.2) * 0.25
      : 0.78 + seededRandom(slot * 4.4) * 0.4;

  prop.object.position.set(side * (RIVER_EDGE + outward), 0.72, z);
  prop.object.rotation.set(0, seededRandom(slot * 9.1) * Math.PI * 2, 0);
  prop.object.scale.setScalar(scale);
  prop.object.visible = true;
}

function recycleZPosition(currentZ: number): number {
  return currentZ - WORLD_LENGTH;
}

export function PooledScenery() {
  const { scene: palmScene } = useGLTF(PALM_MODEL.path);
  const rootRef = useRef<Group>(null);
  const propsRef = useRef<PooledProp[] | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const resources = createSceneryResources();
    const treePool = new ObjectPool(() => createTreeProp(resources), POOL_COUNTS.tree);
    const hutPool = new ObjectPool(() => createHutProp(resources), POOL_COUNTS.hut);
    const palmPool = new ObjectPool(() => preparePalm(palmScene), POOL_COUNTS.palm);
    const props: PooledProp[] = [];

    const spawn = (
      pool: ObjectPool<Group>,
      kind: SceneryKind,
      count: number,
      startSlot: number,
    ) => {
      for (let index = 0; index < count; index += 1) {
        const object = pool.acquire();
        root.add(object);
        const slot = startSlot + index;
        const z =
          recycleZ -
          8 -
          (index / Math.max(count - 1, 1)) * (WORLD_LENGTH - 16);
        const prop: PooledProp = { object, kind };
        placeProp(prop, slot, z);
        props.push(prop);
      }
    };

    spawn(treePool, "tree", POOL_COUNTS.tree, 0);
    spawn(palmPool, "palm", POOL_COUNTS.palm, 100);
    spawn(hutPool, "hut", POOL_COUNTS.hut, 200);
    propsRef.current = props;

    return () => {
      props.forEach((prop) => {
        root.remove(prop.object);
      });
      treePool.drain(() => undefined);
      palmPool.drain(() => undefined);
      hutPool.drain(() => undefined);
      disposeSceneryResources(resources);
      propsRef.current = null;
    };
  }, [palmScene]);

  useFrame((_, delta) => {
    const props = propsRef.current;
    if (!props) {
      return;
    }

    const { status, speed } = useGameStore.getState();
    if (status !== "PLAYING") {
      return;
    }

    const dz = speed * Math.min(delta, 0.05);

    for (let index = 0; index < props.length; index += 1) {
      const prop = props[index];
      prop.object.position.z += dz;

      if (prop.object.position.z > recycleZ) {
        const nextZ = recycleZPosition(prop.object.position.z);
        placeProp(prop, index + Math.floor(nextZ), nextZ);
      }
    }
  });

  return <group ref={rootRef} />;
}

useGLTF.preload(PALM_MODEL.path);
