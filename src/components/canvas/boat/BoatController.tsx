"use client";

import { useFrame } from "@react-three/fiber";
import { type ReactNode, useRef } from "react";
import { type Group } from "three";

import { BOAT_SPAWN, STEER, getLaneLimit } from "@/components/canvas/sceneConfig";
import { useKeyboardSteering } from "@/hooks/useKeyboardSteering";
import { usePointerSteering } from "@/hooks/usePointerSteering";
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
  const getKeyboardAxis = useKeyboardSteering();
  const pointer = usePointerSteering();

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
    const laneLimit = getLaneLimit();
    let nextOffset = laneOffset;

    if (pointer.isActive()) {
      const axis = pointer.getAxis();
      const target = clamp(axis * laneLimit, -laneLimit, laneLimit);
      nextOffset = clamp(
        dampToward(laneOffset, target, STEER.damping, dt),
        -laneLimit,
        laneLimit,
      );
    } else {
      const axis = getKeyboardAxis();
      nextOffset = clamp(
        laneOffset + axis * STEER.keyboardSpeed * dt,
        -laneLimit,
        laneLimit,
      );
    }

    if (Math.abs(nextOffset - laneOffset) > 0.0001) {
      setLaneOffset(nextOffset);
    }

    const steerVisual = pointer.isActive()
      ? pointer.getAxis()
      : getKeyboardAxis();

    group.position.set(nextOffset, BOAT_SPAWN[1], BOAT_SPAWN[2]);
    group.rotation.y = dampToward(
      group.rotation.y,
      -steerVisual * STEER.yawMax,
      STEER.tiltDamping,
      dt,
    );
    group.rotation.z = dampToward(
      group.rotation.z,
      -steerVisual * STEER.rollMax,
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
