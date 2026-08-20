"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { type Group } from "three";

import { LONGBOAT_RIG, OARS } from "@/components/canvas/sceneConfig";
import { updateRowingClock } from "@/lib/rowingClock";
import { useGameStore } from "@/store/useGameStore";

const SIDES = [-1, 1] as const;
const OAR_COUNT = LONGBOAT_RIG.thwartZ.length * SIDES.length;

function OarMesh({ side }: { side: -1 | 1 }) {
  const shaftLength = OARS.length - OARS.bladeLength * 0.35;
  const out = side * (shaftLength * 0.5);

  return (
    <group>
      <mesh
        position={[out, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry
          args={[OARS.shaftRadius, OARS.shaftRadius * 0.85, shaftLength, 6]}
        />
        <meshStandardMaterial
          color="#5c3a1e"
          roughness={0.78}
          metalness={0.04}
        />
      </mesh>
      <mesh
        position={[side * (OARS.length - OARS.bladeLength * 0.45), -0.02, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <boxGeometry args={[OARS.bladeWidth, OARS.bladeLength, 0.03]} />
        <meshStandardMaterial
          color="#3d2412"
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>
    </group>
  );
}

export function OarRig() {
  const pivotsRef = useRef<Array<Group | null>>(
    Array.from({ length: OAR_COUNT }, () => null),
  );
  const phaseRef = useRef(0);

  useFrame((_, delta) => {
    const { status, speed } = useGameStore.getState();
    const dt = Math.min(delta, 0.05);
    phaseRef.current = updateRowingClock(dt, status, speed);

    for (let seat = 0; seat < LONGBOAT_RIG.thwartZ.length; seat += 1) {
      // Backward pull (Z < 0) should dip the blade into the water.
      // Forward return lifts the blade back clear.
      const zPhase = Math.sin(phaseRef.current + seat * OARS.stagger); // [-1..1]
      const backward = Math.max(0, -zPhase); // 1 when zPhase is -1
      const dip = Math.pow(backward, 0.65); // smooth curve for "elliptical" feel

      for (let sideIndex = 0; sideIndex < SIDES.length; sideIndex += 1) {
        const side = SIDES[sideIndex];
        const pivot = pivotsRef.current[seat * SIDES.length + sideIndex];
        if (!pivot) {
          continue;
        }

        if (status === "MENU") {
          pivot.rotation.y = 0;
          pivot.rotation.z = side * OARS.restTilt;
          continue;
        }

        pivot.rotation.y = side * zPhase * OARS.stroke;
        // Dipping into water occurs on backward pull; lift clear on return.
        pivot.rotation.z = side * (OARS.restTilt - dip * OARS.lift);
      }
    }
  });

  return (
    <group>
      {LONGBOAT_RIG.thwartZ.map((z, seat) =>
        SIDES.map((side, sideIndex) => (
          <group
            key={`${z}-${side}`}
            ref={(node) => {
              pivotsRef.current[seat * SIDES.length + sideIndex] = node;
            }}
            position={[side * OARS.pivotX, OARS.pivotY, z]}
            rotation={[0, 0, side * OARS.restTilt]}
          >
            <OarMesh side={side} />
          </group>
        )),
      )}
    </group>
  );
}
