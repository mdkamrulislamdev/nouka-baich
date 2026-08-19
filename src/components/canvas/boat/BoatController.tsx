"use client";

import { useFrame } from "@react-three/fiber";
import { type ReactNode, useRef } from "react";
import { type Group } from "three";

import { BOAT_SPAWN, STEER, getLaneLimit } from "@/components/canvas/sceneConfig";
import { useSteeringAxis } from "@/hooks/useSteeringAxis";
import { clamp } from "@/lib/clamp";
import { getCrashPose } from "@/lib/crashFeedback";
import { isGameplayActive } from "@/lib/gameplay";
import { useGameStore } from "@/store/useGameStore";

type BoatControllerProps = {
  children: ReactNode;
};

function dampToward(
  current: number,
  target: number,
  damping: number,
  dt: number,
): number {
  return current + (target - current) * (1 - Math.exp(-damping * dt));
}

export function BoatController({ children }: BoatControllerProps) {
  const groupRef = useRef<Group>(null);
  const getSteerAxis = useSteeringAxis();

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }

    const state = useGameStore.getState();
    const { status, laneOffset, setLaneOffset } = state;

    if (status === "MENU") {
      group.position.set(...BOAT_SPAWN);
      group.rotation.set(0, 0, 0);
      return;
    }

    if (status === "GAMEOVER") {
      const crash = getCrashPose();
      const settle = Math.min(delta, 0.05);
      group.rotation.z = dampToward(group.rotation.z, crash.roll, 8, settle);
      group.rotation.y = dampToward(group.rotation.y, crash.yaw, 8, settle);
      return;
    }

    if (status === "PAUSED") {
      group.position.set(laneOffset, BOAT_SPAWN[1], BOAT_SPAWN[2]);
      return;
    }

    if (!isGameplayActive(state)) {
      return;
    }

    const dt = Math.min(delta, 0.05);
    const axis = getSteerAxis();
    const laneLimit = getLaneLimit();
    const target = clamp(axis * laneLimit, -laneLimit, laneLimit);
    const nextOffset = clamp(
      dampToward(laneOffset, target, STEER.damping, dt),
      -laneLimit,
      laneLimit,
    );

    if (Math.abs(nextOffset - laneOffset) > 0.0001) {
      setLaneOffset(nextOffset);
    }

    group.position.set(nextOffset, BOAT_SPAWN[1], BOAT_SPAWN[2]);
    group.rotation.y = dampToward(
      group.rotation.y,
      -axis * STEER.yawMax,
      STEER.tiltDamping,
      dt,
    );
    group.rotation.z = dampToward(
      group.rotation.z,
      -axis * STEER.rollMax,
      STEER.tiltDamping,
      dt,
    );
  });

  return (
    <group ref={groupRef} position={BOAT_SPAWN}>
      {children}
    </group>
  );
}
