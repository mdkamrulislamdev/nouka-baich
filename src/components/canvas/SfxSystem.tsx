"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

import { audio } from "@/lib/audio";
import { queryNearMiss } from "@/lib/collision";
import { triggerNearMissShake } from "@/lib/crashFeedback";
import { getRowingPhase } from "@/lib/rowingClock";
import { isGameplayActive } from "@/lib/gameplay";
import { useGameStore } from "@/store/useGameStore";

const heardNearMiss = new Set<number>();

export function SfxSystem() {
  const lastStrokeRef = useRef(0);
  const lastSplashRef = useRef(0);

  useFrame(() => {
    const state = useGameStore.getState();
    if (!isGameplayActive(state)) {
      heardNearMiss.clear();
      lastStrokeRef.current = 0;
      lastSplashRef.current = 0;
      return;
    }

    const { laneOffset } = state;

    const phase = getRowingPhase();
    const stroke = Math.sin(phase);
    const lift = Math.cos(phase);

    if (lastStrokeRef.current <= 0 && stroke > 0) {
      audio.playSfx("row", { rate: 0.92 + Math.random() * 0.18, volume: 0.38 });
    }
    if (lastSplashRef.current > 0 && lift < 0) {
      audio.playSfx("splash", {
        rate: 0.9 + Math.random() * 0.22,
        volume: 0.28,
      });
    }
    lastStrokeRef.current = stroke;
    lastSplashRef.current = lift;

    const near = queryNearMiss(laneOffset);
    if (near && !heardNearMiss.has(near.id)) {
      heardNearMiss.add(near.id);
      audio.playSfx("nearMiss", { volume: 0.45 });
      triggerNearMissShake(laneOffset - near.x);
      useGameStore.getState().triggerCloseCall();
    }
  });

  return null;
}
