"use client";

import { Environment, Sky } from "@react-three/drei";
import { Suspense } from "react";

import { FOG, SUN_POSITION } from "@/components/canvas/sceneConfig";

export function SceneLighting() {
  return (
    <>
      <color attach="background" args={["#243044"]} />
      <fogExp2 attach="fog" args={[FOG.color, FOG.density]} />

      <ambientLight color="#ffd2a8" intensity={0.38} />
      <hemisphereLight
        color="#f0d4b0"
        groundColor="#2c2118"
        intensity={0.28}
      />
      <directionalLight
        color="#ffd09a"
        intensity={1.85}
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
        turbidity={2.4}
        rayleigh={0.55}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />

      <Suspense fallback={null}>
        <Environment preset="sunset" environmentIntensity={0.7} />
      </Suspense>
    </>
  );
}
