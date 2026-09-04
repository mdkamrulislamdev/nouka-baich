"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { type Group, type MeshStandardMaterial } from "three";

import { LONGBOAT_RIG, KICK, OARS } from "@/components/canvas/sceneConfig";
import { getKickPose, getOarStrike } from "@/lib/kickCombat";
import { updateRowingClock } from "@/lib/rowingClock";
import { useGameStore } from "@/store/useGameStore";

const SIDES = [-1, 1] as const;
const OAR_COUNT = LONGBOAT_RIG.thwartZ.length * SIDES.length;

function OarMesh({ side }: { side: -1 | 1 }) {
  const shaftLength = OARS.length - OARS.bladeLength * 0.35;
  const out = side * (shaftLength * 0.5);
  const handleMid = -side * (OARS.handleLength * 0.5);
  const knob = -side * OARS.handleLength;

  return (
    <group>
      <mesh position={[handleMid, 0.01, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry
          args={[OARS.handleRadius, OARS.handleRadius * 0.9, OARS.handleLength, 8]}
        />
        <meshStandardMaterial
          color="#6b3e1c"
          roughness={0.62}
          metalness={0.06}
        />
      </mesh>
      <mesh position={[knob, 0.01, 0]} castShadow>
        <sphereGeometry args={[OARS.handleRadius * 1.35, 8, 6]} />
        <meshStandardMaterial
          color="#3d2412"
          roughness={0.55}
          metalness={0.08}
        />
      </mesh>
      <mesh
        position={[out, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry
          args={[OARS.shaftRadius, OARS.shaftRadius * 0.82, shaftLength, 6]}
        />
        <meshStandardMaterial
          color="#5c3a1e"
          roughness={0.78}
          metalness={0.04}
        />
      </mesh>
      <mesh
        position={[side * (OARS.length - OARS.bladeLength * 0.45), -0.03, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <boxGeometry args={[OARS.bladeWidth, OARS.bladeLength, 0.04]} />
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
  const flashRef = useRef<Array<MeshStandardMaterial | null>>(
    Array.from({ length: OAR_COUNT }, () => null),
  );
  const phaseRef = useRef(0);

  useFrame((_, delta) => {
    const { status, speed } = useGameStore.getState();
    const dt = Math.min(delta, 0.05);
    phaseRef.current = updateRowingClock(dt, status, speed);
    const kick = getKickPose();

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

        const strike = getOarStrike(side);
        const flash = flashRef.current[index];
        if (flash) {
          flash.opacity = 0.15 + strike * 0.85;
          flash.emissiveIntensity = strike * 2.4;
          flash.visible = strike > 0.04;
        }

        if (status === "MENU") {
          pivot.rotation.y = 0;
          pivot.rotation.z = side * OARS.restTilt;
          continue;
        }

        pivot.rotation.y =
          side * zPhase * OARS.stroke + side * dip * 0.38 + side * strike * 0.95;
        pivot.rotation.z =
          side * (OARS.restTilt - dip * OARS.lift) + side * strike * 0.28;

        if (kick.strength > 0.01 && side === kick.side) {
          pivot.rotation.y += side * kick.strength * KICK.oarSweep;
          pivot.rotation.z += side * kick.strength * 0.35;
        }
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
            <mesh
              position={[side * (OARS.length - OARS.bladeLength * 0.2), 0.02, 0]}
            >
              <sphereGeometry args={[0.055, 8, 6]} />
              <meshStandardMaterial
                ref={(node) => {
                  flashRef.current[seat * SIDES.length + sideIndex] = node;
                }}
                color="#fff3c0"
                emissive="#ffe08a"
                emissiveIntensity={0}
                transparent
                opacity={0}
                roughness={0.35}
                metalness={0.1}
                visible={false}
              />
            </mesh>
          </group>
        )),
      )}
    </group>
  );
}
