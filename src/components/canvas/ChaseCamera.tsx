"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { type PerspectiveCamera as ThreePerspectiveCamera } from "three";

import { CAMERA } from "@/components/canvas/sceneConfig";

function aimChaseCamera(camera: ThreePerspectiveCamera) {
  camera.lookAt(...CAMERA.lookAt);
}

export function ChaseCamera() {
  return (
    <PerspectiveCamera
      makeDefault
      fov={CAMERA.fov}
      near={CAMERA.near}
      far={CAMERA.far}
      position={CAMERA.position}
      onUpdate={aimChaseCamera}
    />
  );
}
