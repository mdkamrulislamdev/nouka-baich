"use client";

import { useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  PlaneGeometry,
  RepeatWrapping,
  ShaderMaterial,
  Texture,
  TextureLoader,
  Vector3,
} from "three";
import { Water } from "three-stdlib";

import {
  SUN_POSITION,
  WATER,
  WORLD_SCROLL,
} from "@/components/canvas/sceneConfig";
import { disposeWater } from "@/lib/dispose";
import { isGameplayActive } from "@/lib/gameplay";
import { useGameStore } from "@/store/useGameStore";

const WATER_LENGTH =
  WORLD_SCROLL.segmentLength * WORLD_SCROLL.segmentCount;
const WATER_Z = -WATER_LENGTH * 0.28;
const MIN_WATER_SIZE = 0.001;
const MAX_SIMULATION_DELTA = 0.05;
const MIN_SIMULATION_DELTA = 1e-4;

function clampSimulationDelta(delta: number): number {
  return Math.max(MIN_SIMULATION_DELTA, Math.min(delta, MAX_SIMULATION_DELTA));
}

const FOAM_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FOAM_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uFlip;
  varying vec2 vUv;

  void main() {
    float y = max(vUv.y, 0.0001);
    float x = mix(vUv.x, 1.0 - vUv.x, uFlip);
    float band = smoothstep(0.0, 0.18, x) * smoothstep(0.62, 0.12, x);
    float foamA = sin(y * 32.0 - uTime * 7.5) * 0.5 + 0.5;
    float foamB = sin(y * 13.0 + uTime * 5.0) * 0.5 + 0.5;
    float alpha = band * (0.18 + 0.62 * foamA * foamB);
    gl_FragColor = vec4(0.93, 0.97, 1.0, alpha);
  }
`;

function FoamStrip({ x, flip }: { x: number; flip: number }) {
  const materialRef = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFlip: { value: flip },
    }),
    [flip],
  );

  useFrame((_, delta) => {
    const material = materialRef.current;
    if (!material) {
      return;
    }

    const state = useGameStore.getState();
    const flow = isGameplayActive(state) ? state.speed : 4;
    const dt = clampSimulationDelta(delta);
    material.uniforms.uTime.value += dt * (2.8 + flow * 0.22);
  });

  return (
    <mesh
      position={[x, 0.045, WATER_Z]}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={2}
    >
      <planeGeometry args={[0.95, WATER_LENGTH]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        toneMapped={false}
        uniforms={uniforms}
        vertexShader={FOAM_VERTEX}
        fragmentShader={FOAM_FRAGMENT}
      />
    </mesh>
  );
}

function createRiverWater(sourceNormals: Texture): Water {
  const normals = sourceNormals.clone();
  normals.wrapS = RepeatWrapping;
  normals.wrapT = RepeatWrapping;
  normals.repeat.set(3, 8);
  normals.anisotropy = 8;
  normals.needsUpdate = true;

  const geometry = new PlaneGeometry(WORLD_SCROLL.riverWidth, WATER_LENGTH);
  const sunDirection = new Vector3(...SUN_POSITION).normalize();
  const mesh = new Water(geometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: normals,
    sunDirection,
    sunColor: WATER.sunColor,
    waterColor: WATER.color,
    distortionScale: WATER.distortionScale,
    fog: true,
    alpha: 1,
  });

  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(0, 0, WATER_Z);
  mesh.material.uniforms.size.value = WATER.size;

  return mesh;
}

export function RiverWater() {
  const sourceNormals = useLoader(TextureLoader, WATER.normalsPath);
  const water = useMemo(
    () => createRiverWater(sourceNormals),
    [sourceNormals],
  );
  const waterRef = useRef<Water | null>(null);

  useEffect(() => {
    waterRef.current = water;

    return () => {
      waterRef.current = null;
      disposeWater(water);
    };
  }, [water]);

  useFrame((_, delta) => {
    const mesh = waterRef.current;
    if (!mesh) {
      return;
    }

    const state = useGameStore.getState();
    const flow = isGameplayActive(state) ? state.speed : 4;
    mesh.material.uniforms.time.value += delta * (0.45 + flow * 0.06);

    const waterNormals = mesh.material.uniforms.normalSampler.value;
    if (waterNormals instanceof Texture) {
      waterNormals.offset.y += delta * (0.018 + flow * 0.007);
    }
  });

  const foamX = WORLD_SCROLL.riverWidth / 2 - 0.38;

  return (
    <group>
      <primitive object={water} />
      <FoamStrip x={-foamX} flip={0} />
      <FoamStrip x={foamX} flip={1} />
    </group>
  );
}
