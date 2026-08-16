"use client";

import { useFrame } from "@react-three/fiber";
import { type ReactNode, useRef } from "react";
import { type Group } from "three";

import { BOAT_SPAWN, STEER } from "@/components/canvas/sceneConfig";
import { useSteeringAxis } from "@/hooks/useSteeringAxis";
import { useGameStore } from "@/store/useGameStore";

type BoatControllerProps = {
  children: ReactNode;
};

export function BoatController({ children }: BoatControllerProps) {
  const groupRef = useRef<Group>(null);
  const getSteerAxis = useSteeringAxis();

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }

    const { status, laneOffset, setLaneOffset } = useGameStore.getState();
    if (status !== "PLAYING") {
      group.position.set(...BOAT_SPAWN);
      return;
    }

    const dt = Math.min(delta, 0.05);
    const target = getSteerAxis() * STEER.maxOffset;
    const nextOffset =
      laneOffset + (target - laneOffset) * (1 - Math.exp(-STEER.damping * dt));

    if (Math.abs(nextOffset - laneOffset) > 0.0001) {
      setLaneOffset(nextOffset);
    }

    group.position.set(nextOffset, BOAT_SPAWN[1], BOAT_SPAWN[2]);
  });

  return (
    <group ref={groupRef} position={BOAT_SPAWN}>
      {children}
    </group>
  );
}
