"use client";

import { useFrame } from "@react-three/fiber";

import { SCORE } from "@/components/canvas/sceneConfig";
import { isGameplayActive } from "@/lib/gameplay";
import { useGameStore } from "@/store/useGameStore";

export function ScoreEngine() {
  useFrame((_, delta) => {
    const state = useGameStore.getState();
    if (!isGameplayActive(state)) {
      return;
    }

    const { speed, distance, score, setDistance, setScore } = state;

    const dt = Math.min(delta, 0.05);
    const deltaDistance = speed * dt;
    const multiplier = speed / SCORE.referenceSpeed;
    const nextDistance = distance + deltaDistance;
    const nextScore = score + deltaDistance * multiplier;

    if (Math.abs(nextDistance - distance) > 0.0001) {
      setDistance(nextDistance);
    }
    if (Math.abs(nextScore - score) > 0.0001) {
      setScore(nextScore);
    }
  });

  return null;
}
