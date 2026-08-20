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
    <mesh
      geometry={geometry}
      position={[side * riverEdge, 0, 0]}
      receiveShadow
      castShadow
    >
      <meshStandardMaterial
        attach="material-0"
        color="#5c4030"
        roughness={0.94}
        metalness={0.02}
        envMapIntensity={0.35}
      />
      <meshStandardMaterial
        attach="material-1"
        color="#b8956a"
        roughness={0.9}
        metalness={0.02}
        envMapIntensity={0.4}
      />
      <meshStandardMaterial
        attach="material-2"
        color="#4f7a3c"
        roughness={0.92}
        metalness={0.02}
        envMapIntensity={0.45}
      />
    </mesh>
  );
}
