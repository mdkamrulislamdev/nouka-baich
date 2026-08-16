"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useLayoutEffect, useRef } from "react";
import { PerspectiveCamera as ThreePerspectiveCamera, Vector3 } from "three";

import { CAMERA } from "@/components/canvas/sceneConfig";

export function ChaseCamera() {
  const cameraRef = useRef<ThreePerspectiveCamera>(null);
  const lookAt = useRef(new Vector3(...CAMERA.lookAt));

  useLayoutEffect(() => {
    const camera = cameraRef.current;
    if (!camera) {
      return;
    }

    camera.lookAt(lookAt.current);
    camera.updateProjectionMatrix();
  }, []);

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
