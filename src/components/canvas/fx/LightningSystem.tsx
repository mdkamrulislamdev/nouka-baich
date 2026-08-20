"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, DirectionalLight } from "three";

import { SUN_POSITION } from "@/components/canvas/sceneConfig";

type LightningSystemProps = {
  strength: number; // 0..1
  enabled: boolean;
};

const BASE_EXPOSURE = 0.78;

export function LightningSystem({
  strength,
  enabled,
}: LightningSystemProps) {
  const { gl } = useThree();
  const glRef = useRef(gl);
  const flashRef = useRef(0);
  const lightRef = useRef<DirectionalLight | null>(null);
  const nextBoltRef = useRef(0);

  const sunColor = useMemo(() => new Color("#ffffff"), []);

  useFrame(({ clock }, delta) => {
    if (!enabled || strength <= 0.001) {
      flashRef.current = 0;
      if (lightRef.current) {
        lightRef.current.intensity = 0;
      }
      glRef.current.toneMappingExposure = BASE_EXPOSURE;
      return;
    }

    const dt = Math.min(delta, 0.05);
    flashRef.current = Math.max(0, flashRef.current - dt * 4.8);

    const now = clock.getElapsedTime();
    if (now > nextBoltRef.current) {
      // Thunder probability scales with strength.
      const p = 0.015 + strength * 0.05;
      if (Math.random() < p) {
        flashRef.current = 1;
        nextBoltRef.current = now + 0.25 + Math.random() * 1.1 * (1 - strength);
      } else {
        nextBoltRef.current = now + 0.15 + Math.random() * 1.8;
      }
    }

    const flash = flashRef.current;
    const expBoost = 1 + flash * (0.85 + strength * 0.25);
    glRef.current.toneMappingExposure = BASE_EXPOSURE * expBoost;

    if (lightRef.current) {
      lightRef.current.intensity = flash * (10 + strength * 14);
      lightRef.current.color.copy(sunColor);
    }
  });

  return (
    <group>
      <directionalLight
        ref={(node) => {
          lightRef.current = node;
        }}
        position={SUN_POSITION}
        intensity={0}
        color="#ffffff"
        castShadow={false}
      />
    </group>
  );
}

