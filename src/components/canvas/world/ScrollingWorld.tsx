"use client";

import { useFrame } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import { type Group } from "three";

import { RiverBank } from "@/components/canvas/world/RiverBank";
import { RiverWater } from "@/components/canvas/world/RiverWater";
import { WORLD_SCROLL } from "@/components/canvas/sceneConfig";
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
    const { status, speed } = useGameStore.getState();
    if (status !== "PLAYING") {
      return;
    }

    const dz = speed * Math.min(delta, 0.05);

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
      <Suspense fallback={null}>
        <RiverWater />
        {Array.from({ length: segmentCount }, (_, index) => (
          <group
            key={index}
            ref={(node) => {
              segmentsRef.current[index] = node;
            }}
            position={[0, 0, initialSegmentZ(index)]}
          >
            <RiverBank side={-1} segmentIndex={index} />
            <RiverBank side={1} segmentIndex={index} />
          </group>
        ))}
      </Suspense>
    </group>
  );
}
