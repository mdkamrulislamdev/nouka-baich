"use client";

import { Environment } from "@react-three/drei";
import { Suspense, useRef } from "react";
import { type HemisphereLight } from "three";

import { GradientSky } from "@/components/canvas/Atmosphere";
import { SUN_POSITION, getAtmosphere } from "@/components/canvas/sceneConfig";

const INITIAL = getAtmosphere(1);

export function SceneLighting() {
  const hemisphereRef = useRef<HemisphereLight>(null);

  return (
    <>
      <ambientLight color={INITIAL.ambient} intensity={0.38} />
      <hemisphereLight
        ref={hemisphereRef}
        color={INITIAL.ambient}
        groundColor={INITIAL.ground}
        intensity={0.28}
      />
      <directionalLight
        color={INITIAL.sunColor}
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

      <GradientSky hemisphereRef={hemisphereRef} />

      <Suspense fallback={null}>
        <Environment preset="sunset" environmentIntensity={0.7} />
      </Suspense>
    </>
  );
}
