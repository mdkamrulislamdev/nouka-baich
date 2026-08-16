"use client";

import { useFrame } from "@react-three/fiber";

import {
  clearLastCollision,
  queryObstacleCollision,
} from "@/lib/collision";
import { useGameStore } from "@/store/useGameStore";

export function CollisionSystem() {
  useFrame(() => {
    const { status, laneOffset } = useGameStore.getState();
    if (status !== "PLAYING") {
      clearLastCollision();
      return;
    }

    queryObstacleCollision(laneOffset);
  });

  return null;
}
