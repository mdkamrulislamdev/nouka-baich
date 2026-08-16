"use client";

import { useFrame } from "@react-three/fiber";

import { SCORE } from "@/components/canvas/sceneConfig";
import { useGameStore } from "@/store/useGameStore";

export function ScoreEngine() {
  useFrame((_, delta) => {
    const { status, speed, distance, score, setDistance, setScore } =
      useGameStore.getState();
    if (status !== "PLAYING") {
      return;
    }

    const dt = Math.min(delta, 0.05);
    const nextDistance = distance + speed * dt;
    const multiplier = speed / SCORE.referenceSpeed;
    const nextScore = Math.floor(nextDistance * multiplier);

    if (Math.abs(nextDistance - distance) > 0.0001) {
      setDistance(nextDistance);
    }
    if (nextScore !== score) {
      setScore(nextScore);
    }
  });

  return null;
}
