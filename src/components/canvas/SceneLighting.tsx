"use client";

import { Environment, Sky } from "@react-three/drei";
import { Suspense } from "react";

import { FOG, SUN_POSITION } from "@/components/canvas/sceneConfig";

export function SceneLighting() {
  return (
    <>
      <fogExp2 attach="fog" args={[FOG.color, FOG.density]} />

      <ambientLight color="#ffd2a8" intensity={0.42} />
      <hemisphereLight
        color="#ffe6c8"
        groundColor="#3a2718"
        intensity={0.32}
      />
      <directionalLight
        color="#ffd09a"
        intensity={2.35}
        position={SUN_POSITION}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.04}
        shadow-camera-near={1}
        shadow-camera-far={140}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={40}
        shadow-camera-bottom={-16}
      />

      <Sky
        sunPosition={SUN_POSITION}
        turbidity={6.5}
        rayleigh={1.15}
        mieCoefficient={0.0045}
        mieDirectionalG={0.82}
      />

      <Suspense fallback={null}>
        <Environment preset="sunset" environmentIntensity={0.55} />
      </Suspense>
    </>
  );
}
