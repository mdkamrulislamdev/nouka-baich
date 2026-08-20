"use client";

import { useFrame } from "@react-three/fiber";

import {
  PROGRESSION,
  getLevelForDistance,
  getTargetSpeed,
} from "@/components/canvas/sceneConfig";
import { isGameplayActive } from "@/lib/gameplay";
import { useGameStore } from "@/store/useGameStore";

export function ProgressionSystem() {
  useFrame((_, delta) => {
    const state = useGameStore.getState();
    if (!isGameplayActive(state)) {
      return;
    }

    const { distance, level, speed, difficulty, setLevel, setSpeed } = state;

    const nextLevel = getLevelForDistance(distance);
    if (nextLevel !== level) {
      setLevel(nextLevel);
    }

    const dt = Math.min(delta, 0.05);
    const target = getTargetSpeed(nextLevel, difficulty);
    const nextSpeed =
      speed + (target - speed) * (1 - Math.exp(-PROGRESSION.speedDamping * dt));

    if (Math.abs(nextSpeed - speed) > 0.01) {
      setSpeed(nextSpeed);
    }
  });

  return null;
}
