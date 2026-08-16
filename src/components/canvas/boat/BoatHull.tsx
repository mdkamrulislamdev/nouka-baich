"use client";

import { DoubleSide } from "three";
import { useEffect, useMemo } from "react";

import { createLongboatHullGeometry } from "@/components/canvas/boat/hullGeometry";

export function BoatHull() {
  const geometry = useMemo(() => createLongboatHullGeometry(), []);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  return (
    <mesh
      geometry={geometry}
      castShadow
      receiveShadow
      frustumCulled={false}
      renderOrder={1}
    >
      <meshStandardMaterial
        color="#8a5530"
        roughness={0.7}
        metalness={0.02}
        envMapIntensity={0.45}
        side={DoubleSide}
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
      />
    </mesh>
  );
}
