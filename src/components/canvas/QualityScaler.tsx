"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

import { useGameStore } from "@/store/useGameStore";

export function QualityScaler() {
  const framesRef = useRef(0);
  const elapsedRef = useRef(0);

  useFrame((_, delta) => {
    const { status, graphicsQuality, adaptiveLow, setAdaptiveLow } =
      useGameStore.getState();
    if (status !== "PLAYING" || graphicsQuality !== "high" || adaptiveLow) {
      framesRef.current = 0;
      elapsedRef.current = 0;
      return;
    }

    framesRef.current += 1;
    elapsedRef.current += Math.min(delta, 0.05);

    if (elapsedRef.current < 1) {
      return;
    }

    const fps = framesRef.current / elapsedRef.current;
    framesRef.current = 0;
    elapsedRef.current = 0;

    if (fps < 30) {
      setAdaptiveLow(true);
    }
  });

  return null;
}
