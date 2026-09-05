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
  const shaftLength = OARS.length - OARS.bladeLength * 0.28;
  const grip = side * (OARS.handleLength * 0.28);
  const shaftMid = side * (shaftLength * 0.5);
  const blade = side * (OARS.length - OARS.bladeLength * 0.42);

  return (
    <group>
      <mesh castShadow>
        <sphereGeometry args={[OARS.handleRadius * 1.45, 8, 6]} />
        <meshStandardMaterial
          color="#3d2412"
          roughness={0.55}
          metalness={0.08}
        />
      </mesh>
      <mesh
        position={[grip, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry
          args={[OARS.handleRadius, OARS.handleRadius * 0.92, OARS.handleLength, 8]}
        />
        <meshStandardMaterial
          color="#6b3e1c"
          roughness={0.62}
          metalness={0.06}
        />
      </mesh>
      <mesh
        position={[shaftMid, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry
          args={[OARS.shaftRadius, OARS.shaftRadius * 0.8, shaftLength, 6]}
        />
        <meshStandardMaterial
          color="#5c3a1e"
          roughness={0.78}
          metalness={0.04}
        />
      </mesh>
      <mesh
        position={[blade, -0.02, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <boxGeometry args={[OARS.bladeWidth, OARS.bladeLength, 0.045]} />
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
      const zPhase = Math.sin(phaseRef.current + seat * OARS.stagger);
      const backward = Math.max(0, -zPhase);
      const dip = Math.pow(backward, 0.65);

      for (let sideIndex = 0; sideIndex < SIDES.length; sideIndex += 1) {
        const side = SIDES[sideIndex];
        const index = seat * SIDES.length + sideIndex;
        const pivot = pivotsRef.current[index];
        if (!pivot) {
          continue;
        }

        if (status === "MENU") {
          pivot.rotation.y = 0;
          pivot.rotation.z = -side * OARS.restTilt;
          continue;
        }

        pivot.rotation.y = side * zPhase * OARS.stroke;
        pivot.rotation.z = -side * (OARS.restTilt + dip * OARS.lift);
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
            rotation={[0, 0, -side * OARS.restTilt]}
          >
            <OarMesh side={side} />
          </group>
        )),
      )}
    </group>
  );
}
