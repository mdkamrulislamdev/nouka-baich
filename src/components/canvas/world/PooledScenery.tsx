"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Group } from "three";

import { PALM_MODEL, SCENERY, WORLD_SCROLL } from "@/components/canvas/sceneConfig";
import { preparePalm } from "@/components/canvas/world/PalmProp";
import { detachObject } from "@/lib/dispose";
import { ObjectPool } from "@/lib/ObjectPool";
import { useGltfModel } from "@/lib/gltf";
import { isGameplayActive } from "@/lib/gameplay";
import { recycleZPosition, seededRandom } from "@/lib/mathUtils";
import { useGameStore } from "@/store/useGameStore";

const { segmentCount, segmentLength, recycleZ, riverWidth } = WORLD_SCROLL;
const WORLD_LENGTH = segmentCount * segmentLength;
const RIVER_EDGE = riverWidth / 2;

type PooledPalm = {
  object: Group;
};

function placePalm(prop: PooledPalm, slot: number, z: number): void {
  const side: -1 | 1 = seededRandom(slot * 3.1) < 0.5 ? -1 : 1;
  const outward = 2.1 + seededRandom(slot * 5.7) * 3.6;
  const scale = 0.78 + seededRandom(slot * 4.4) * 0.4;

  prop.object.position.set(side * (RIVER_EDGE + outward), 0.72, z);
  prop.object.rotation.set(0, seededRandom(slot * 9.1) * Math.PI * 2, 0);
  prop.object.scale.setScalar(scale);
  prop.object.visible = true;
}

export function PooledScenery() {
  const { scene: palmScene } = useGltfModel(PALM_MODEL.path);
  const rootRef = useRef<Group>(null);
  const propsRef = useRef<PooledPalm[] | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const palmPool = new ObjectPool(() => preparePalm(palmScene), SCENERY.palmCount);
    const props: PooledPalm[] = [];

    for (let index = 0; index < SCENERY.palmCount; index += 1) {
      const object = palmPool.acquire();
      root.add(object);
      const z =
        recycleZ -
        8 -
        (index / Math.max(SCENERY.palmCount - 1, 1)) * (WORLD_LENGTH - 16);
      const prop: PooledPalm = { object };
      placePalm(prop, 100 + index, z);
      props.push(prop);
    }

    propsRef.current = props;

    return () => {
      props.forEach((prop) => {
        detachObject(prop.object);
      });
      palmPool.drain(detachObject);
      propsRef.current = null;
    };
  }, [palmScene]);

  useFrame((_, delta) => {
    const props = propsRef.current;
    if (!props) {
      return;
    }

    const state = useGameStore.getState();
    if (!isGameplayActive(state)) {
      return;
    }

    const dz = state.speed * Math.min(delta, 0.05);

    for (let index = 0; index < props.length; index += 1) {
      const prop = props[index];
      prop.object.position.z += dz;

      if (prop.object.position.z > recycleZ) {
        const nextZ = recycleZPosition(prop.object.position.z, WORLD_LENGTH);
        placePalm(prop, index + Math.floor(nextZ), nextZ);
      }
    }
  });

  return <group ref={rootRef} />;
}
