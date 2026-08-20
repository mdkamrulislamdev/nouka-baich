"use client";

import { useFrame } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import { type Group } from "three";

import { ObstacleSpawner } from "@/components/canvas/obstacles/ObstacleSpawner";
import { FinishLine } from "@/components/canvas/world/FinishLine";
import { PooledScenery } from "@/components/canvas/world/PooledScenery";
import { RiverBankMesh } from "@/components/canvas/world/RiverBankMesh";
import { RiverWater } from "@/components/canvas/world/RiverWater";
import { WORLD_SCROLL } from "@/components/canvas/sceneConfig";
import { clampGameDelta, isGameplayActive } from "@/lib/gameplay";
import { useGameStore } from "@/store/useGameStore";

const { segmentCount, segmentLength, recycleZ } = WORLD_SCROLL;

function initialSegmentZ(index: number): number {
  return (1 - index) * segmentLength - segmentLength * 0.5;
}

export function ScrollingWorld() {
  const segmentsRef = useRef<Array<Group | null>>(
    Array.from({ length: segmentCount }, () => null),
  );

  useFrame((_, delta) => {
    const state = useGameStore.getState();
    if (!isGameplayActive(state)) {
      return;
    }

    const dz = state.speed * clampGameDelta(delta);

    for (let index = 0; index < segmentCount; index += 1) {
      const segment = segmentsRef.current[index];
      if (!segment) {
        continue;
      }

      segment.position.z += dz;
      if (segment.position.z > recycleZ) {
        segment.position.z -= segmentCount * segmentLength;
      }
    }
  });

  return (
    <group>
      {Array.from({ length: segmentCount }, (_, index) => (
        <group
          key={index}
          ref={(node) => {
            segmentsRef.current[index] = node;
          }}
          position={[0, 0, initialSegmentZ(index)]}
        >
          <RiverBankMesh side={-1} />
          <RiverBankMesh side={1} />
        </group>
      ))}

      <Suspense fallback={null}>
        <RiverWater />
      </Suspense>

      <Suspense fallback={null}>
        <PooledScenery />
        <ObstacleSpawner />
      </Suspense>

      <FinishLine />
    </group>
  );
}
