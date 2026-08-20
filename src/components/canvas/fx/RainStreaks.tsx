"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Points,
  ShaderMaterial,
  Vector3,
} from "three";

type RainStreaksProps = {
  strength: number; // 0..1
};

const COUNT = 900;

const VERTEX = /* glsl */ `
  attribute float aSize;
  varying float vFade;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float dist = max(1.0, -mvPosition.z);
    gl_PointSize = aSize * (120.0 / dist);
    gl_Position = projectionMatrix * mvPosition;

    // Fade streaks slightly as they get closer to the camera.
    vFade = clamp(dist / 60.0, 0.0, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uAlpha;
  varying float vFade;

  void main() {
    vec2 centered = gl_PointCoord - vec2(0.5);
    float x = abs(centered.x);
    float y = centered.y;

    // Make a narrow vertical streak out of a point sprite.
    float streak = smoothstep(0.22, 0.0, x) * smoothstep(0.5, 0.0, abs(y));
    float alpha = streak * uAlpha * vFade;

    if (alpha < 0.02) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

const positions = new Float32Array(COUNT * 3);
const sizes = new Float32Array(COUNT);

export function RainStreaks({ strength }: RainStreaksProps) {
  const pointsRef = useRef<Points>(null);
  const uniformsRef = useRef<{
    uColor: { value: Color };
    uAlpha: { value: number };
  } | null>(null);

  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(positions, 3));
    geo.setAttribute("aSize", new BufferAttribute(sizes, 1));
    return geo;
  }, []);

  const material = useMemo(() => {
    return new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: true,
      uniforms: {
        uColor: { value: new Color("#a7ddff") },
        uAlpha: { value: 0.55 },
      },
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      toneMapped: false,
    });
  }, []);

  useEffect(() => {
    // Avoid eslint `react-hooks/immutability` complaints by mutating through a ref.
    uniformsRef.current = material.uniforms as unknown as {
      uColor: { value: Color };
      uAlpha: { value: number };
    };
  }, [material]);

  useEffect(() => {
    const xRange = 18;
    const zRange = 85;
    const yMin = 0.0;
    const yMax = 16.0;

    const tmp = new Vector3();
    for (let i = 0; i < COUNT; i += 1) {
      const i3 = i * 3;
      tmp.x = (Math.random() - 0.5) * xRange;
      tmp.y = yMin + Math.random() * (yMax - yMin);
      tmp.z = (Math.random() - 0.5) * zRange - 6;
      positions[i3] = tmp.x;
      positions[i3 + 1] = tmp.y;
      positions[i3 + 2] = tmp.z;

      sizes[i] = 0.55 + Math.random() * 0.85;
    }

    const posAttr = geometry.getAttribute("position");
    posAttr.needsUpdate = true;
  }, [geometry]);

  useFrame((_, delta) => {
    const points = pointsRef.current;
    if (!points) {
      return;
    }

    if (!uniformsRef.current) {
      return;
    }
    uniformsRef.current.uAlpha.value = 0.15 + strength * 0.55;

    if (strength <= 0.001) {
      return;
    }

    const dt = Math.min(delta, 0.05);
    const speed = 5.5 + strength * 14.0;
    const yMin = 0.0;
    const yMax = 16.0;

    for (let i = 0; i < COUNT; i += 1) {
      const i3 = i * 3;
      positions[i3 + 1] -= speed * dt;
      if (positions[i3 + 1] < yMin) {
        positions[i3 + 1] = yMax;
      }
    }

    const posAttr = geometry.getAttribute("position");
    posAttr.needsUpdate = true;
  });

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

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

