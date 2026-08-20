"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Group } from "three";

import { PALM_MODEL, SCENERY, SCENERY_MODELS, WORLD_SCROLL } from "@/components/canvas/sceneConfig";
import { preparePalm } from "@/components/canvas/world/PalmProp";
import { prepareHut } from "@/components/canvas/world/sceneryPropFactory";
import { detachObject } from "@/lib/dispose";
import { ObjectPool } from "@/lib/ObjectPool";
import { useGltfModel } from "@/lib/gltf";
import { clampGameDelta, isGameplayActive } from "@/lib/gameplay";
import { recycleZPosition, seededRandom } from "@/lib/mathUtils";
import { useGameStore } from "@/store/useGameStore";

const { segmentCount, segmentLength, recycleZ, riverWidth } = WORLD_SCROLL;
const WORLD_LENGTH = segmentCount * segmentLength;
const RIVER_EDGE = riverWidth / 2;

type PooledProp = {
  object: Group;
};

type PropLayer = {
  props: PooledProp[];
  place: (prop: PooledProp, slot: number, z: number) => void;
  seedBase: number;
};

function bankSide(seed: number): -1 | 1 {
  return seededRandom(seed * 3.1) < 0.5 ? -1 : 1;
}

function placePalmNear(prop: PooledProp, slot: number, z: number): void {
  const side = bankSide(slot);
  const outward = 0.7 + seededRandom(slot * 5.7) * 3.4;
  const scale = 0.78 + seededRandom(slot * 4.4) * 0.42;

  prop.object.position.set(side * (RIVER_EDGE + outward), 0, z);
  prop.object.rotation.set(0, seededRandom(slot * 9.1) * Math.PI * 2, 0);
  prop.object.scale.setScalar(scale);
  prop.object.visible = true;
}

function placePalmMid(prop: PooledProp, slot: number, z: number): void {
  const side = bankSide(slot + 17);
  const outward = 2.8 + seededRandom(slot * 5.7) * 3.6;
  const scale = 0.88 + seededRandom(slot * 4.4) * 0.48;

  prop.object.position.set(side * (RIVER_EDGE + outward), 0, z);
  prop.object.rotation.set(0, seededRandom(slot * 9.1) * Math.PI * 2, 0);
  prop.object.scale.setScalar(scale);
  prop.object.visible = true;
}

function placePalmBack(prop: PooledProp, slot: number, z: number): void {
  const side = bankSide(slot + 31);
  const outward = 5.2 + seededRandom(slot * 5.7) * 2.4;
  const scale = 1.0 + seededRandom(slot * 4.4) * 0.55;

  prop.object.position.set(side * (RIVER_EDGE + outward), 0, z);
  prop.object.rotation.set(0, seededRandom(slot * 9.1) * Math.PI * 2, 0);
  prop.object.scale.setScalar(scale);
  prop.object.visible = true;
}

function placeHut(prop: PooledProp, slot: number, z: number): void {
  const side = bankSide(slot + 53);
  const outward = 4.0 + seededRandom(slot * 5.7) * 2.8;
  const scale = 0.95 + seededRandom(slot * 4.4) * 0.25;

  prop.object.position.set(side * (RIVER_EDGE + outward), 0, z);
  prop.object.rotation.set(0, seededRandom(slot * 7.3) * Math.PI * 2, 0);
  prop.object.scale.setScalar(scale);
  prop.object.visible = true;
}

function initialZ(index: number, count: number): number {
  return recycleZ - 6 - (index / Math.max(count - 1, 1)) * (WORLD_LENGTH - 12);
}

function scrollLayer(layer: PropLayer, dz: number): void {
  for (let index = 0; index < layer.props.length; index += 1) {
    const prop = layer.props[index];
    prop.object.position.z += dz;
    const z = prop.object.position.z;
    prop.object.visible = z > -90 && z < 40;
    if (z > recycleZ) {
      const nextZ = recycleZPosition(z, WORLD_LENGTH);
      layer.place(prop, layer.seedBase + index + Math.floor(nextZ), nextZ);
    }
  }
}

export function PooledScenery() {
  const { scene: hutScene } = useGltfModel(SCENERY_MODELS.hut.path);
  const { scene: palmScene } = useGltfModel(PALM_MODEL.path);

  const rootRef = useRef<Group>(null);
  const layersRef = useRef<PropLayer[] | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const palmNearPool = new ObjectPool(
      () => preparePalm(palmScene),
      SCENERY.palmNearCount,
    );
    const palmMidPool = new ObjectPool(
      () => preparePalm(palmScene),
      SCENERY.palmMidCount,
    );
    const palmBackPool = new ObjectPool(
      () => preparePalm(palmScene),
      SCENERY.palmBackCount,
    );
    const hutPool = new ObjectPool(() => prepareHut(hutScene), SCENERY.hutCount);

    const layers: PropLayer[] = [
      { props: [], place: placePalmNear, seedBase: 0 },
      { props: [], place: placePalmMid, seedBase: 300 },
      { props: [], place: placePalmBack, seedBase: 600 },
      { props: [], place: placeHut, seedBase: 900 },
    ];

    const counts = [
      SCENERY.palmNearCount,
      SCENERY.palmMidCount,
      SCENERY.palmBackCount,
      SCENERY.hutCount,
    ];
    const pools = [palmNearPool, palmMidPool, palmBackPool, hutPool];

    for (let layerIndex = 0; layerIndex < layers.length; layerIndex += 1) {
      const layer = layers[layerIndex];
      const count = counts[layerIndex];
      const pool = pools[layerIndex];
      for (let index = 0; index < count; index += 1) {
        const object = pool.acquire();
        root.add(object);
        const prop: PooledProp = { object };
        layer.place(prop, layer.seedBase + index, initialZ(index, count));
        layer.props.push(prop);
      }
    }

    layersRef.current = layers;

    return () => {
      for (const pool of pools) {
        pool.drain(detachObject);
      }
      layersRef.current = null;
    };
  }, [hutScene, palmScene]);

  useFrame((_, delta) => {
    const layers = layersRef.current;
    if (!layers) {
      return;
    }

    const state = useGameStore.getState();
    if (!isGameplayActive(state)) {
      return;
    }

    try {
      const dz = state.speed * clampGameDelta(delta);
      for (const layer of layers) {
        scrollLayer(layer, dz);
      }
    } catch (error) {
      console.error("[PooledScenery] scroll failed:", error);
    }
  });

  return <group ref={rootRef} />;
}
