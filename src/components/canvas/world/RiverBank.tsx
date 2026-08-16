"use client";

import { useEffect, useMemo } from "react";

import { createBankGeometry } from "@/components/canvas/world/bankGeometry";
import { WORLD_SCROLL } from "@/components/canvas/sceneConfig";

type RiverBankProps = {
  side: -1 | 1;
};

export function RiverBank({ side }: RiverBankProps) {
  const geometry = useMemo(
    () => createBankGeometry(WORLD_SCROLL.segmentLength, side),
    [side],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  const riverEdge = WORLD_SCROLL.riverWidth / 2;

  return (
    <group>
      <mesh
        geometry={geometry}
        position={[side * riverEdge, 0, 0]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial
          color="#4f7a3c"
          roughness={0.92}
          metalness={0.02}
          envMapIntensity={0.45}
        />
      </mesh>
      <mesh position={[side * (riverEdge + 0.35), 0.08, 0]} receiveShadow>
        <boxGeometry args={[0.7, 0.12, WORLD_SCROLL.segmentLength]} />
        <meshStandardMaterial
          color="#6b4a28"
          roughness={0.86}
          metalness={0.03}
        />
      </mesh>
    </group>
  );
}
