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

import { LONGBOAT_RIG, OARS } from "@/components/canvas/sceneConfig";
import { isGameplayActive } from "@/lib/gameplay";
import { getRowingPhase } from "@/lib/rowingClock";
import { useGameStore } from "@/store/useGameStore";

const { thwartZ } = LONGBOAT_RIG;
const SEAT_COUNT = thwartZ.length;
const SIDES = [-1, 1] as const;
const OAR_COUNT = SEAT_COUNT * SIDES.length;

const COUNT = 240;
const LIFE = 0.42;

const VERTEX = /* glsl */ `
  attribute float aLife;
  attribute float aSize;
  varying float vLife;

  void main() {
    vLife = aLife;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (130.0 / max(1.0, -mvPosition.z));
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uBright;
  uniform vec3 uDark;
  varying float vLife;

  void main() {
    vec2 centered = gl_PointCoord - vec2(0.5);
    float dist = length(centered);
    if (dist > 0.5) discard;

    float soft = 1.0 - smoothstep(0.18, 0.5, dist);
    float fade = smoothstep(0.0, 0.2, vLife) * smoothstep(0.0, 0.7, vLife);

    vec3 color = mix(uDark, uBright, pow(vLife, 0.5));
    float alpha = soft * fade * 0.6;
    if (alpha < 0.02) discard;

    gl_FragColor = vec4(color, alpha);
  }
`;

const positions = new Float32Array(COUNT * 3);
const lives = new Float32Array(COUNT);
const sizes = new Float32Array(COUNT);
const velocities = new Float32Array(COUNT * 3);

export function OarSplashes() {
  const pointsRef = useRef<Points>(null);
  const cursorRef = useRef(0);
  const lastContactRef = useRef<boolean[]>(Array.from({ length: OAR_COUNT }, () => false));

  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(positions, 3));
    geo.setAttribute("aLife", new BufferAttribute(lives, 1));
    geo.setAttribute("aSize", new BufferAttribute(sizes, 1));
    return geo;
  }, []);

  const material = useMemo(() => {
    const mat = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: NormalBlending,
      toneMapped: true,
      uniforms: {
        uBright: { value: new Color("#eaf6ff") },
        uDark: { value: new Color("#6fb2d0") },
      },
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
    });
    return mat;
  }, []);

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
    const state = useGameStore.getState();

    const qualityOk =
      state.graphicsQuality === "high" && !state.adaptiveLow && isGameplayActive(state);

    const positionAttr = geometry.getAttribute("position");
    const lifeAttr = geometry.getAttribute("aLife");
    const sizeAttr = geometry.getAttribute("aSize");

    if (!qualityOk) {
      lives.fill(0);
      positionAttr.needsUpdate = true;
      lifeAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;
      for (let i = 0; i < lastContactRef.current.length; i += 1) {
        lastContactRef.current[i] = false;
      }
      return;
    }

    const { laneOffset } = state;
    const phase = getRowingPhase();

    const bladeX =
      OARS.pivotX + (OARS.length - OARS.bladeLength * 0.45); // pivot + blade center offset
    const baseY = 0.04;

    // Emit on "contact" edges (dip threshold crossing).
    for (let seatIndex = 0; seatIndex < SEAT_COUNT; seatIndex += 1) {
      const zPhase = Math.sin(phase + seatIndex * OARS.stagger);
      const backward = Math.max(0, -zPhase);
      const dip = Math.pow(backward, 0.65);

      for (let sideIndex = 0; sideIndex < SIDES.length; sideIndex += 1) {
        const side = SIDES[sideIndex];
        const oarIndex = seatIndex * SIDES.length + sideIndex;
        const contact = dip > 0.22;
        const last = lastContactRef.current[oarIndex];

        if (contact && !last) {
          // Burst: emit 3-5 particles per contact edge.
          const burst = 3 + Math.floor(Math.random() * 3);
          for (let emit = 0; emit < burst; emit += 1) {
            const index = cursorRef.current;
            cursorRef.current = (index + 1) % COUNT;
            const i3 = index * 3;

            const spread = 0.08 + Math.random() * 0.12;
            positions[i3] = laneOffset + side * (bladeX + (Math.random() - 0.5) * spread);
            positions[i3 + 1] = baseY - dip * 0.03 + Math.random() * 0.01;
            positions[i3 + 2] = thwartZ[seatIndex] + (Math.random() - 0.5) * 0.08;

            velocities[i3] = side * (0.20 + Math.random() * 0.22);
            velocities[i3 + 1] = 0.17 + Math.random() * 0.22 + dip * 0.06;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.10;

            lives[index] = 1;
            sizes[index] = 6 + Math.random() * 7;
          }
        }

        lastContactRef.current[oarIndex] = contact;
      }
    }

    // Physics update (semi-realistic spray with gravity + short bounce).
    const decay = dt / LIFE;
    for (let index = 0; index < COUNT; index += 1) {
      if (lives[index] <= 0) {
        continue;
      }
      const i3 = index * 3;

      positions[i3] += velocities[i3] * dt;
      positions[i3 + 1] += velocities[i3 + 1] * dt;
      positions[i3 + 2] += velocities[i3 + 2] * dt;

      velocities[i3 + 1] -= 2.9 * dt;

      if (positions[i3 + 1] < 0) {
        positions[i3 + 1] = 0;
        velocities[i3 + 1] *= -0.12;
        velocities[i3] *= 0.94;
        velocities[i3 + 2] *= 0.94;
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
      renderOrder={3}
    />
  );
}

