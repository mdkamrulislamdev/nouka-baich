"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { type Group } from "three";

import { getKickPose, type KickSide } from "@/lib/kickCombat";

const THIGH_LEN = 0.2;
const SHIN_LEN = 0.15;

const PANT = "#1c1c22";
const SKIN = "#3a2a22";
const BOOT = "#0a0a0a";

function ShortKickLeg({ side }: { side: KickSide }) {
  const dir = side;
  const thighMid = dir * THIGH_LEN * 0.5;
  const knee = dir * THIGH_LEN;
  const shinMid = dir * (THIGH_LEN + SHIN_LEN * 0.48);
  const ankle = dir * (THIGH_LEN + SHIN_LEN);

  return (
    <group>
      <mesh castShadow>
        <sphereGeometry args={[0.045, 10, 8]} />
        <meshStandardMaterial color={PANT} roughness={0.62} metalness={0.06} />
      </mesh>
      <mesh
        position={[thighMid, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <capsuleGeometry args={[0.04, THIGH_LEN * 0.52, 5, 10]} />
        <meshStandardMaterial color={PANT} roughness={0.6} metalness={0.05} />
      </mesh>
      <mesh position={[knee, 0, 0]} castShadow>
        <sphereGeometry args={[0.038, 10, 8]} />
        <meshStandardMaterial color={PANT} roughness={0.58} metalness={0.05} />
      </mesh>
      <mesh
        position={[shinMid, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <capsuleGeometry args={[0.028, SHIN_LEN * 0.48, 5, 10]} />
        <meshStandardMaterial color={SKIN} roughness={0.64} metalness={0.04} />
      </mesh>
      <mesh position={[ankle, 0, 0.012]} castShadow>
        <sphereGeometry args={[0.03, 8, 6]} />
        <meshStandardMaterial color={BOOT} roughness={0.55} metalness={0.08} />
      </mesh>
      <mesh
        position={[ankle + dir * 0.01, -0.006, 0.04]}
        rotation={[0.18, 0, 0]}
        castShadow
      >
        <boxGeometry args={[0.048, 0.026, 0.088]} />
        <meshStandardMaterial color={BOOT} roughness={0.52} metalness={0.08} />
      </mesh>
    </group>
  );
}

/** Hip-mounted kick. Built along +X so it never drops through the hull. */
export function SeatKickLeg({
  side,
  seatIndex,
}: {
  side: KickSide;
  seatIndex: number;
}) {
  const hipRef = useRef<Group>(null);

  useFrame(() => {
    const hip = hipRef.current;
    if (!hip) {
      return;
    }

    const kick = getKickPose();
    const lag = seatIndex * 0.06;
    const raw =
      kick.active && kick.side === side
        ? Math.max(0, (kick.strength - lag) / (1 - lag * 0.4))
        : 0;
    const t = Math.min(1, raw);
    hip.visible = t > 0.05;

    const extend = t * t * (3 - 2 * t);
    hip.rotation.z = -side * 0.1 * (1 - extend);
    hip.rotation.x = 0;
  }, 2);

  return (
    <group
      ref={hipRef}
      position={[side * 0.16, 0.36, 0]}
      visible={false}
    >
      <ShortKickLeg side={side} />
    </group>
  );
}
