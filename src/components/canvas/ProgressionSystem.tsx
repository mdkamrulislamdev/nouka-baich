"use client";

import { useFrame } from "@react-three/fiber";

import {
  PROGRESSION,
  getLevelForDistance,
  getTargetSpeed,
} from "@/components/canvas/sceneConfig";
import { useGameStore } from "@/store/useGameStore";

export function ProgressionSystem() {
  useFrame((_, delta) => {
    const { status, distance, level, speed, setLevel, setSpeed } =
      useGameStore.getState();
    if (status !== "PLAYING") {
      return;
    }

    const nextLevel = getLevelForDistance(distance);
    if (nextLevel !== level) {
      setLevel(nextLevel);
    }

    const dt = Math.min(delta, 0.05);
    const target = getTargetSpeed(nextLevel);
    const nextSpeed =
      speed + (target - speed) * (1 - Math.exp(-PROGRESSION.speedDamping * dt));

    if (Math.abs(nextSpeed - speed) > 0.01) {
      setSpeed(nextSpeed);
    }
  });

  return null;
}
