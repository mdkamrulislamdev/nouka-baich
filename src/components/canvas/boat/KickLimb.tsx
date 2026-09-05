"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { type Group } from "three";

import { LONGBOAT_RIG } from "@/components/canvas/sceneConfig";
import { getKickPose, type KickSide } from "@/lib/kickCombat";

const SIDES = [-1, 1] as const;
const SEAT_COUNT = LONGBOAT_RIG.thwartZ.length;
const LEG_COUNT = SEAT_COUNT * SIDES.length;

const HIP_Y = LONGBOAT_RIG.seatY + 0.24;
const HIP_X = 0.62;
const THIGH_LEN = 0.26;
const SHIN_LEN = 0.2;

const LEG = "#141414";
const FOOT = "#111111";

function KickThighMesh() {
  return (
    <>
      <mesh position={[0, -THIGH_LEN * 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.032, THIGH_LEN * 0.62, 4, 8]} />
        <meshStandardMaterial color={LEG} roughness={0.78} metalness={0.04} />
      </mesh>
    </>
  );
}

function KickShinMesh({ side }: { side: KickSide }) {
  return (
    <>
      <mesh position={[0, -SHIN_LEN * 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.026, SHIN_LEN * 0.58, 4, 8]} />
        <meshStandardMaterial color={LEG} roughness={0.76} metalness={0.04} />
      </mesh>
      <mesh
        position={[side * 0.006, -SHIN_LEN - 0.012, 0.028]}
        rotation={[0.16, 0, 0]}
        castShadow
      >
        <boxGeometry args={[0.048, 0.022, 0.08]} />
        <meshStandardMaterial color={FOOT} roughness={0.82} metalness={0.03} />
      </mesh>
    </>
  );
}

export function KickLimb() {
  const hipRefs = useRef<Array<Group | null>>(
    Array.from({ length: LEG_COUNT }, () => null),
  );
  const thighRefs = useRef<Array<Group | null>>(
    Array.from({ length: LEG_COUNT }, () => null),
  );
  const shinRefs = useRef<Array<Group | null>>(
    Array.from({ length: LEG_COUNT }, () => null),
  );

  useFrame(() => {
    const kick = getKickPose();

    for (let seat = 0; seat < SEAT_COUNT; seat += 1) {
      for (let sideIndex = 0; sideIndex < SIDES.length; sideIndex += 1) {
        const index = seat * SIDES.length + sideIndex;
        const hip = hipRefs.current[index];
        const thigh = thighRefs.current[index];
        const shin = shinRefs.current[index];
        if (!hip || !thigh || !shin) {
          continue;
        }

        const side = SIDES[sideIndex];
        const lag = seat * 0.07;
        const raw =
          kick.active && kick.side === side
            ? Math.max(0, (kick.strength - lag) / (1 - lag * 0.45))
            : 0;
        const t = Math.min(1, raw);
        hip.visible = t > 0.04;

        const chamber = Math.min(1, t / 0.32);
        const extend = Math.max(0, (t - 0.22) / 0.78);
        const out = 0.55 + chamber * 0.42 + extend * 0.52;

        thigh.rotation.z = side * out;
        thigh.rotation.x = -0.05 + extend * 0.08;
        shin.rotation.z = side * (0.95 - extend * 0.9);
        shin.rotation.x = 0.08 - extend * 0.06;
      }
    }
  }, 2);

  return (
    <group>
      {LONGBOAT_RIG.thwartZ.map((z, seat) =>
        SIDES.map((side, sideIndex) => {
          const index = seat * SIDES.length + sideIndex;
          return (
            <group
              key={`${z}-${side}`}
              ref={(node) => {
                hipRefs.current[index] = node;
              }}
              position={[side * HIP_X, HIP_Y, z]}
              visible={false}
            >
              <group
                ref={(node) => {
                  thighRefs.current[index] = node;
                }}
                rotation={[0, 0, side * 0.55]}
              >
                <KickThighMesh />
                <group
                  ref={(node) => {
                    shinRefs.current[index] = node;
                  }}
                  position={[0, -THIGH_LEN, 0]}
                  rotation={[0, 0, side * 0.95]}
                >
                  <KickShinMesh side={side} />
                </group>
              </group>
            </group>
          );
        }),
      )}
    </group>
  );
}
