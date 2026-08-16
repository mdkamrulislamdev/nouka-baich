"use client";

import { useFrame } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import { type Group } from "three";

import { RiverWater } from "@/components/canvas/world/RiverWater";
import { WORLD_SCROLL } from "@/components/canvas/sceneConfig";
import { useGameStore } from "@/store/useGameStore";

const { segmentCount, segmentLength, recycleZ, riverWidth, bankWidth } =
  WORLD_SCROLL;

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
      </Suspense>
      {Array.from({ length: segmentCount }, (_, index) => (
        <group
          key={index}
          ref={(node) => {
            segmentsRef.current[index] = node;
          }}
          position={[0, 0, initialSegmentZ(index)]}
        >
          <mesh position={[-riverWidth / 2, 0.04, 0]} receiveShadow>
            <boxGeometry args={[bankWidth, 0.08, segmentLength]} />
            <meshStandardMaterial
              color="#3d2a18"
              roughness={0.78}
              metalness={0.02}
            />
          </mesh>
          <mesh position={[riverWidth / 2, 0.04, 0]} receiveShadow>
            <boxGeometry args={[bankWidth, 0.08, segmentLength]} />
            <meshStandardMaterial
              color="#3d2a18"
              roughness={0.78}
              metalness={0.02}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
