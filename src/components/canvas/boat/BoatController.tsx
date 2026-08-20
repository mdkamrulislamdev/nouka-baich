"use client";

import { useFrame } from "@react-three/fiber";
import { type ReactNode, useRef } from "react";
import { type Group } from "three";

import { BOAT_SPAWN, STEER, getLaneLimit } from "@/components/canvas/sceneConfig";
import { useKeyboardSteering } from "@/hooks/useKeyboardSteering";
import { usePointerSteering } from "@/hooks/usePointerSteering";
import { clamp } from "@/lib/clamp";
import { getCrashPose } from "@/lib/crashFeedback";
import { clampGameDelta, isGameplayActive } from "@/lib/gameplay";
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
  /** Frame-local lane copy — avoids reading a stale store value mid-frame. */
  const laneRef = useRef(0);
  const prevStatusRef = useRef<string>("MENU");

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }

    const state = useGameStore.getState();
    const { status, setLaneOffset } = state;

    if (prevStatusRef.current !== status) {
      if (status === "PLAYING" || status === "MENU") {
        laneRef.current = state.laneOffset;
      }
      prevStatusRef.current = status;
    }

    if (status === "MENU") {
      laneRef.current = 0;
      group.position.set(...BOAT_SPAWN);
      group.rotation.set(0, 0, 0);
      return;
    }

    if (status === "GAMEOVER") {
      const crash = getCrashPose();
      const settle = clampGameDelta(delta);
      group.rotation.z = dampToward(group.rotation.z, crash.roll, 8, settle);
      group.rotation.y = dampToward(group.rotation.y, crash.yaw, 8, settle);
      return;
    }

    if (status === "PAUSED") {
      group.position.set(laneRef.current, BOAT_SPAWN[1], BOAT_SPAWN[2]);
      return;
    }

    if (!isGameplayActive(state)) {
      return;
    }

    // Keep local lane in sync if something external resets it (new run).
    if (Math.abs(state.laneOffset - laneRef.current) > 2) {
      laneRef.current = state.laneOffset;
    }

    const dt = clampGameDelta(delta);
    const laneLimit = getLaneLimit();
    const keyboardAxis = getKeyboardAxis();
    const pointerActive = pointer.isActive();

    // Keyboard always wins when pressed — prevents a stuck click/touch from
    // locking the boat while the river keeps scrolling.
    let steerAxis = 0;
    if (Math.abs(keyboardAxis) > 0.001) {
      steerAxis = keyboardAxis;
      laneRef.current = clamp(
        laneRef.current + keyboardAxis * STEER.keyboardSpeed * dt,
        -laneLimit,
        laneLimit,
      );
    } else if (pointerActive) {
      steerAxis = pointer.getAxis();
      const target = clamp(steerAxis * laneLimit, -laneLimit, laneLimit);
      laneRef.current = clamp(
        dampToward(laneRef.current, target, STEER.damping, dt),
        -laneLimit,
        laneLimit,
      );
    }

    if (Math.abs(laneRef.current - state.laneOffset) > 0.0001) {
      setLaneOffset(laneRef.current);
    }

    group.position.set(laneRef.current, BOAT_SPAWN[1], BOAT_SPAWN[2]);
    group.rotation.y = dampToward(
      group.rotation.y,
      -steerAxis * STEER.yawMax,
      STEER.tiltDamping,
      dt,
    );
    group.rotation.z = dampToward(
      group.rotation.z,
      -steerAxis * STEER.rollMax,
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
