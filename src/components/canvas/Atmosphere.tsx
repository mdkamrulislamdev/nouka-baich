"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import {
  BackSide,
  Color,
  FogExp2,
  HemisphereLight,
  ShaderMaterial,
} from "three";

import { getAtmosphere } from "@/components/canvas/sceneConfig";
import { useGameStore } from "@/store/useGameStore";

const INITIAL = getAtmosphere(1);

const SKY_VERTEX = /* glsl */ `
  varying vec3 vWorldPos;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPos = world.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SKY_FRAGMENT = /* glsl */ `
  uniform vec3 uZenith;
  uniform vec3 uHorizon;
  uniform float uFogDensity;
  varying vec3 vWorldPos;

  void main() {
    float height = clamp(vWorldPos.y / 90.0, 0.0, 1.0);
    float t = pow(clamp(height, 0.0, 1.0), 0.85);

    float dist = length(vWorldPos.xz);
    float haze = 1.0 - exp(-uFogDensity * dist * 0.045);

    vec3 color = mix(uHorizon, uZenith, t);
    color = mix(color, uHorizon, haze * 0.55);
    gl_FragColor = vec4(color, 1.0);
  }
`;

function dampColor(current: Color, target: Color, dt: number, damping: number): void {
  current.lerp(target, 1 - Math.exp(-damping * dt));
}

type GradientSkyProps = {
  hemisphereRef: RefObject<HemisphereLight | null>;
};

export function GradientSky({ hemisphereRef }: GradientSkyProps) {
  const materialRef = useRef<ShaderMaterial>(null);
  const fogRef = useRef<FogExp2>(null);
  const backgroundRef = useRef<Color>(null);
  const currentHorizon = useRef(new Color(INITIAL.horizon));
  const currentZenith = useRef(new Color(INITIAL.zenith));
  const currentAmbient = useRef(new Color(INITIAL.ambient));
  const currentGround = useRef(new Color(INITIAL.ground));
  const targetHorizon = useRef(new Color());
  const targetZenith = useRef(new Color());
  const targetAmbient = useRef(new Color());
  const targetGround = useRef(new Color());
  const densityRef = useRef(INITIAL.fogDensity);

  const uniforms = useMemo(
    () => ({
      uZenith: { value: new Color(INITIAL.zenith) },
      uHorizon: { value: new Color(INITIAL.horizon) },
      uFogDensity: { value: INITIAL.fogDensity },
    }),
    [],
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const palette = getAtmosphere(useGameStore.getState().level);
    targetHorizon.current.set(palette.horizon);
    targetZenith.current.set(palette.zenith);
    targetAmbient.current.set(palette.ambient);
    targetGround.current.set(palette.ground);

    dampColor(currentHorizon.current, targetHorizon.current, dt, 1.6);
    dampColor(currentZenith.current, targetZenith.current, dt, 1.6);
    dampColor(currentAmbient.current, targetAmbient.current, dt, 1.6);
    dampColor(currentGround.current, targetGround.current, dt, 1.6);
    densityRef.current +=
      (palette.fogDensity - densityRef.current) * (1 - Math.exp(-1.6 * dt));

    const material = materialRef.current;
    if (material) {
      const zenithUniform = material.uniforms.uZenith.value;
      const horizonUniform = material.uniforms.uHorizon.value;
      const fogDensityUniform = material.uniforms.uFogDensity.value;
      if (zenithUniform instanceof Color) {
        zenithUniform.copy(currentZenith.current);
      }
      if (horizonUniform instanceof Color) {
        horizonUniform.copy(currentHorizon.current);
      }
      if (typeof fogDensityUniform === "number") {
        material.uniforms.uFogDensity.value = densityRef.current;
      }
    }

    const fog = fogRef.current;
    if (fog) {
      fog.color.copy(currentHorizon.current);
      fog.density = densityRef.current;
    }

    backgroundRef.current?.copy(currentHorizon.current);

    const hemisphere = hemisphereRef.current;
    if (hemisphere) {
      hemisphere.color.copy(currentAmbient.current);
      hemisphere.groundColor.copy(currentGround.current);
    }
  });

  return (
    <>
      <color ref={backgroundRef} attach="background" args={[INITIAL.horizon]} />
      <fogExp2 ref={fogRef} attach="fog" args={[INITIAL.horizon, INITIAL.fogDensity]} />
      <mesh renderOrder={-1} frustumCulled={false}>
        <sphereGeometry args={[200, 32, 16]} />
        <shaderMaterial
          ref={materialRef}
          side={BackSide}
          depthWrite={false}
          fog={false}
          toneMapped={false}
          uniforms={uniforms}
          vertexShader={SKY_VERTEX}
          fragmentShader={SKY_FRAGMENT}
        />
      </mesh>
    </>
  );
}
