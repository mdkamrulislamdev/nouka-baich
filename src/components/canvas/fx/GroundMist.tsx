"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, ShaderMaterial } from "three";

import { WORLD_SCROLL } from "@/components/canvas/sceneConfig";
import { isGameplayActive } from "@/lib/gameplay";
import { useGameStore } from "@/store/useGameStore";

const WATER_LENGTH =
  WORLD_SCROLL.segmentLength * WORLD_SCROLL.segmentCount;
const MIST_Z = -WATER_LENGTH * 0.28;

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vec2 uv = vUv * vec2(6.0, 1.8);
    float n = noise(uv + vec2(uTime * 0.08, uTime * 0.03));
    float n2 = noise(uv * 1.7 - vec2(uTime * 0.05, 0.0));
    float mist = smoothstep(0.15, 0.85, n * 0.55 + n2 * 0.45);
    float edge = smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.55, vUv.y);
    float alpha = mist * edge * 0.22;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

export function GroundMist() {
  const materialRef = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: [0.82, 0.88, 0.92] as [number, number, number] },
    }),
    [],
  );

  useFrame((_, delta) => {
    const material = materialRef.current;
    if (!material) {
      return;
    }

    const state = useGameStore.getState();
    const flow = isGameplayActive(state) ? state.speed : 2.5;
    material.uniforms.uTime.value += Math.min(delta, 0.05) * (0.35 + flow * 0.04);
  });

  return (
    <mesh
      position={[0, 0.55, MIST_Z]}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={1}
    >
      <planeGeometry args={[WORLD_SCROLL.riverWidth * 1.35, WATER_LENGTH]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
        uniforms={uniforms}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
      />
    </mesh>
  );
}
