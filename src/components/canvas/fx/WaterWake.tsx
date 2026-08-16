"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
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
    gl_PointSize = aSize * (220.0 / max(0.8, -mvPosition.z));
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
    if (dist > 0.48) {
      discard;
    }
    float edge = 1.0 - smoothstep(0.18, 0.48, dist);
    vec3 color = mix(uDeep, uFoam, vLife);
    gl_FragColor = vec4(color, vLife * edge * 0.85);
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
        blending: AdditiveBlending,
        uniforms: {
          uFoam: { value: new Color("#eef8fb") },
          uDeep: { value: new Color("#3a8a96") },
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
    const { status, speed, laneOffset } = useGameStore.getState();
    const positionAttr = geometry.getAttribute("position");
    const lifeAttr = geometry.getAttribute("aLife");
    const sizeAttr = geometry.getAttribute("aSize");

    if (status === "PLAYING") {
      const emitRate = WAKE.emitPerSecond * (0.55 + speed / 18);
      emitAccRef.current += emitRate * dt;
      while (emitAccRef.current >= 1) {
        emitAccRef.current -= 1;
        const index = cursorRef.current;
        cursorRef.current = (index + 1) % WAKE.count;
        const splash = Math.random() > 0.62;
        const side = Math.random() > 0.5 ? 1 : -1;
        const i3 = index * 3;
        positions[i3] =
          laneOffset +
          (splash
            ? side * (0.55 + Math.random() * WAKE.splashSpread)
            : (Math.random() - 0.5) * 0.55);
        positions[i3 + 1] = WAKE.y + Math.random() * 0.08;
        positions[i3 + 2] = WAKE.sternZ + Math.random() * 0.7;
        velocities[i3] = (Math.random() - 0.5) * 0.7;
        velocities[i3 + 1] = splash ? 0.55 + Math.random() * 0.7 : 0.05;
        velocities[i3 + 2] = 1.6 + Math.random() * 2.4;
        lives[index] = 1;
        sizes[index] = splash ? 14 + Math.random() * 10 : 7 + Math.random() * 6;
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
      velocities[i3 + 1] -= 1.8 * dt;
      if (positions[i3 + 1] < WAKE.y) {
        positions[i3 + 1] = WAKE.y;
        velocities[i3 + 1] *= -0.18;
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
    />
  );
}
