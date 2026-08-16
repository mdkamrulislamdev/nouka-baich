"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { type PerspectiveCamera as ThreePerspectiveCamera } from "three";

import { CAMERA } from "@/components/canvas/sceneConfig";
import { sampleCrashOffset } from "@/lib/crashFeedback";
import { useGameStore } from "@/store/useGameStore";

export function ChaseCamera() {
  const cameraRef = useRef<ThreePerspectiveCamera>(null);

  useFrame((_, delta) => {
    const camera = cameraRef.current;
    if (!camera) {
      return;
    }

    const { laneOffset } = useGameStore.getState();
    const shake = sampleCrashOffset(Math.min(delta, 0.05));
    camera.position.set(
      CAMERA.position[0] + laneOffset + shake.x,
      CAMERA.position[1] + shake.y,
      CAMERA.position[2],
    );
    camera.lookAt(laneOffset, CAMERA.lookAt[1], CAMERA.lookAt[2]);
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
