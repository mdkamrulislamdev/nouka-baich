"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { type PerspectiveCamera as ThreePerspectiveCamera } from "three";

import { CAMERA } from "@/components/canvas/sceneConfig";
import { sampleCrashOffset } from "@/lib/crashFeedback";
import { clampGameDelta } from "@/lib/gameplay";
import { useGameStore } from "@/store/useGameStore";

function dampToward(
  current: number,
  target: number,
  damping: number,
  dt: number,
): number {
  return current + (target - current) * (1 - Math.exp(-damping * dt));
}

export function ChaseCamera() {
  const cameraRef = useRef<ThreePerspectiveCamera>(null);
  const followXRef = useRef(0);

  useFrame((_, delta) => {
    const camera = cameraRef.current;
    if (!camera) {
      return;
    }

    const dt = clampGameDelta(delta);
    const { laneOffset, status } = useGameStore.getState();
    const targetX = status === "MENU" ? 0 : laneOffset;
    followXRef.current = dampToward(
      followXRef.current,
      targetX,
      CAMERA.follow,
      dt,
    );

    const shake = sampleCrashOffset(dt);
    const x = followXRef.current + shake.x;
    camera.position.set(
      x,
      CAMERA.position[1] + shake.y,
      CAMERA.position[2] + shake.z,
    );
    camera.up.set(0, 1, 0);
    camera.lookAt(x, CAMERA.lookAt[1], CAMERA.lookAt[2]);
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      fov={CAMERA.fov}
      near={CAMERA.near}
      far={CAMERA.far}
      position={CAMERA.position}
    />
  );
}
