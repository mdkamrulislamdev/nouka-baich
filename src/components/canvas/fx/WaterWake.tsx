"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  NormalBlending,
  Points,
  ShaderMaterial,
} from "three";

import { WAKE } from "@/components/canvas/sceneConfig";
import { useGameStore } from "@/store/useGameStore";

const VERTEX = /* glsl */ `
  attribute float aLife;
  attribute float aSize;
  varying float vLife;

  void main() {
    vLife = aLife;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (140.0 / max(1.0, -mvPosition.z));
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uFoam;
  uniform vec3 uDeep;
  varying float vLife;

  void main() {
    vec2 centered = gl_PointCoord - vec2(0.5);
    float dist = length(centered);
    if (dist > 0.5) {
      discard;
    }
    float soft = 1.0 - smoothstep(0.15, 0.5, dist);
    float fade = smoothstep(0.0, 0.2, vLife) * smoothstep(0.0, 0.45, vLife);
    vec3 color = mix(uDeep, uFoam, pow(vLife, 0.65));
    float alpha = soft * fade * 0.55;
    if (alpha < 0.02) {
      discard;
    }
    gl_FragColor = vec4(color, alpha);
  }
`;

const positions = new Float32Array(WAKE.count * 3);
const lives = new Float32Array(WAKE.count);
const sizes = new Float32Array(WAKE.count);
const velocities = new Float32Array(WAKE.count * 3);

export function WaterWake() {
  const pointsRef = useRef<Points>(null);
  const cursorRef = useRef(0);
  const emitAccRef = useRef(0);

  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(positions, 3));
    geo.setAttribute("aLife", new BufferAttribute(lives, 1));
    geo.setAttribute("aSize", new BufferAttribute(sizes, 1));
    return geo;
  }, []);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: true,
        blending: NormalBlending,
        toneMapped: true,
        uniforms: {
          uFoam: { value: new Color("#c5e4ea") },
          uDeep: { value: new Color("#2f6d78") },
        },
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
      }),
    [],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((_, delta) => {
    const points = pointsRef.current;
    if (!points) {
      return;
    }

    const dt = Math.min(delta, 0.05);
    const { status, speed, laneOffset, graphicsQuality, adaptiveLow } =
      useGameStore.getState();
    const positionAttr = geometry.getAttribute("position");
    const lifeAttr = geometry.getAttribute("aLife");
    const sizeAttr = geometry.getAttribute("aSize");

    if (status === "PLAYING") {
      const qualityScale =
        graphicsQuality === "high" && !adaptiveLow ? 1 : 0.35;
      const emitRate = WAKE.emitPerSecond * (0.45 + speed / 22) * qualityScale;
      emitAccRef.current += emitRate * dt;
      while (emitAccRef.current >= 1) {
        emitAccRef.current -= 1;
        const index = cursorRef.current;
        cursorRef.current = (index + 1) % WAKE.count;
        const splash = Math.random() > 0.7;
        const side = Math.random() > 0.5 ? 1 : -1;
        const i3 = index * 3;
        positions[i3] =
          laneOffset +
          (splash
            ? side * (0.35 + Math.random() * WAKE.splashSpread)
            : (Math.random() - 0.5) * 0.4);
        positions[i3 + 1] = WAKE.y + Math.random() * 0.05;
        positions[i3 + 2] = WAKE.sternZ + Math.random() * 0.55;
        velocities[i3] = (Math.random() - 0.5) * 0.55;
        velocities[i3 + 1] = splash ? 0.35 + Math.random() * 0.45 : 0.04;
        velocities[i3 + 2] = 1.1 + Math.random() * 1.8;
        lives[index] = 1;
        sizes[index] = splash ? 6 + Math.random() * 5 : 3.5 + Math.random() * 3;
      }
    } else if (status === "MENU") {
      lives.fill(0);
      emitAccRef.current = 0;
    }

    const decay = dt / WAKE.life;
    for (let index = 0; index < WAKE.count; index += 1) {
      if (lives[index] <= 0) {
        continue;
      }
      const i3 = index * 3;
      positions[i3] += velocities[i3] * dt;
      positions[i3 + 1] += velocities[i3 + 1] * dt;
      positions[i3 + 2] += velocities[i3 + 2] * dt;
      velocities[i3 + 1] -= 2.4 * dt;
      if (positions[i3 + 1] < WAKE.y) {
        positions[i3 + 1] = WAKE.y;
        velocities[i3 + 1] *= -0.12;
        velocities[i3] *= 0.92;
        velocities[i3 + 2] *= 0.92;
      }
      lives[index] = Math.max(0, lives[index] - decay);
    }

    positionAttr.needsUpdate = true;
    lifeAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;
  });

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      frustumCulled={false}
      renderOrder={2}
    />
  );
}
