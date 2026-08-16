"use client";

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
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        color="#6b3f22"
        roughness={0.62}
        metalness={0.04}
        envMapIntensity={0.85}
      />
    </mesh>
  );
}
