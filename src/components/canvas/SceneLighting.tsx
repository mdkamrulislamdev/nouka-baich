"use client";

import { Environment } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import {
  AmbientLight,
  Color,
  DirectionalLight,
  type HemisphereLight,
} from "three";

import { GradientSky } from "@/components/canvas/Atmosphere";
import { GroundMist } from "@/components/canvas/fx/GroundMist";
import { SUN_POSITION, getAtmosphere } from "@/components/canvas/sceneConfig";
import { useGameStore } from "@/store/useGameStore";

const INITIAL = getAtmosphere(1);

function dampColor(
  current: Color,
  target: Color,
  dt: number,
  damping: number,
): void {
  current.lerp(target, 1 - Math.exp(-damping * dt));
}

export function SceneLighting() {
  const hemisphereRef = useRef<HemisphereLight>(null);
  const ambientRef = useRef<AmbientLight>(null);
  const sunRef = useRef<DirectionalLight>(null);
  const currentAmbient = useRef(new Color(INITIAL.ambient));
  const currentSun = useRef(new Color(INITIAL.sunColor));
  const targetAmbient = useRef(new Color());
  const targetSun = useRef(new Color());
  const graphicsQuality = useGameStore((state) => state.graphicsQuality);
  const adaptiveLow = useGameStore((state) => state.adaptiveLow);
  const highFx = graphicsQuality === "high" && !adaptiveLow;

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const palette = getAtmosphere(useGameStore.getState().level);
    targetAmbient.current.set(palette.ambient);
    targetSun.current.set(palette.sunColor);

    dampColor(currentAmbient.current, targetAmbient.current, dt, 1.6);
    dampColor(currentSun.current, targetSun.current, dt, 1.6);

    ambientRef.current?.color.copy(currentAmbient.current);
    sunRef.current?.color.copy(currentSun.current);
  });

  return (
    <>
      <ambientLight ref={ambientRef} color={INITIAL.ambient} intensity={0.38} />
      <hemisphereLight
        ref={hemisphereRef}
        color={INITIAL.ambient}
        groundColor={INITIAL.ground}
        intensity={0.28}
      />
      <directionalLight
        ref={sunRef}
        color={INITIAL.sunColor}
        intensity={highFx ? 1.85 : 1.35}
        position={SUN_POSITION}
        castShadow={highFx}
        shadow-mapSize={highFx ? [2048, 2048] : [512, 512]}
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

      {highFx ? <GroundMist /> : null}

      <Suspense fallback={null}>
        <Environment preset="sunset" environmentIntensity={0.7} />
      </Suspense>
    </>
  );
}
