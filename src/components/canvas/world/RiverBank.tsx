"use client";

import { useEffect, useMemo } from "react";

import { LowPolyBush, LowPolyTree } from "@/components/canvas/world/LowPolyFoliage";
import { PalmProp } from "@/components/canvas/world/PalmProp";
import { createBankGeometry } from "@/components/canvas/world/bankGeometry";
import { WORLD_SCROLL } from "@/components/canvas/sceneConfig";

type FoliageKind = "tree" | "palm" | "bush";

type FoliageSlot = {
  z: number;
  outward: number;
  kind: FoliageKind;
  scale: number;
  yaw: number;
};

const FOLIAGE_SLOTS: FoliageSlot[] = [
  { z: -16.5, outward: 2.1, kind: "tree", scale: 1.05, yaw: 0.4 },
  { z: -11.2, outward: 4.4, kind: "palm", scale: 0.92, yaw: -0.6 },
  { z: -6.4, outward: 2.8, kind: "bush", scale: 1.15, yaw: 0.2 },
  { z: -1.1, outward: 3.6, kind: "tree", scale: 0.82, yaw: 1.1 },
  { z: 4.8, outward: 2.3, kind: "palm", scale: 1.08, yaw: 0.5 },
  { z: 9.6, outward: 4.8, kind: "bush", scale: 0.95, yaw: -0.3 },
  { z: 14.8, outward: 3.1, kind: "tree", scale: 1.12, yaw: -0.9 },
  { z: 18.4, outward: 5.2, kind: "palm", scale: 0.78, yaw: 0.8 },
];

type RiverBankProps = {
  side: -1 | 1;
  segmentIndex: number;
};

function slotJitter(slot: FoliageSlot, segmentIndex: number): FoliageSlot {
  const wave = Math.sin(segmentIndex * 1.7 + slot.z * 0.13);
  return {
    ...slot,
    z: slot.z + wave * 2.2,
    outward: slot.outward + wave * 0.45,
    yaw: slot.yaw + segmentIndex * 0.35,
  };
}

export function RiverBank({ side, segmentIndex }: RiverBankProps) {
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
  const slots = FOLIAGE_SLOTS.map((slot) => slotJitter(slot, segmentIndex));

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
      <mesh
        position={[side * (riverEdge + 0.35), 0.08, 0]}
        receiveShadow
      >
        <boxGeometry args={[0.7, 0.12, WORLD_SCROLL.segmentLength]} />
        <meshStandardMaterial
          color="#6b4a28"
          roughness={0.86}
          metalness={0.03}
        />
      </mesh>
      {slots.map((slot) => {
        const x = side * (riverEdge + slot.outward);
        const key = `${side}-${slot.kind}-${slot.z.toFixed(2)}`;

        return (
          <group
            key={key}
            position={[x, 0.72, slot.z]}
            rotation={[0, slot.yaw, 0]}
          >
            {slot.kind === "palm" ? (
              <PalmProp scale={slot.scale} />
            ) : null}
            {slot.kind === "tree" ? (
              <LowPolyTree scale={slot.scale} />
            ) : null}
            {slot.kind === "bush" ? (
              <LowPolyBush scale={slot.scale} />
            ) : null}
          </group>
        );
      })}
    </group>
  );
}
