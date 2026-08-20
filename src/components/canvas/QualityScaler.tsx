"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

import { isRunActive } from "@/lib/gameplay";
import { useGameStore } from "@/store/useGameStore";

const SAMPLE_SECONDS = 1.5;
const DOWNGRADE_FPS = 26;
/** Ignore load hitch at the start of a run. */
const WARMUP_SECONDS = 6;

/**
 * One-way adaptive downgrade only.
 * Recovering mid-run remounted EffectComposer and froze steering for ~8s —
 * never flip quality back up until the player returns to the menu.
 */
export function QualityScaler() {
  const framesRef = useRef(0);
  const elapsedRef = useRef(0);
  const runElapsedRef = useRef(0);

  useFrame((_, delta) => {
    const state = useGameStore.getState();
    const { status, graphicsQuality, adaptiveLow, setAdaptiveLow } = state;

    if (status === "MENU") {
      framesRef.current = 0;
      elapsedRef.current = 0;
      runElapsedRef.current = 0;
      return;
    }

    if (!isRunActive(state) || graphicsQuality !== "high" || adaptiveLow) {
      return;
    }

    runElapsedRef.current += delta;
    framesRef.current += 1;
    elapsedRef.current += delta;

    if (runElapsedRef.current < WARMUP_SECONDS) {
      return;
    }

    if (elapsedRef.current < SAMPLE_SECONDS) {
      return;
    }

    const fps = framesRef.current / elapsedRef.current;
    framesRef.current = 0;
    elapsedRef.current = 0;

    if (fps < DOWNGRADE_FPS) {
      setAdaptiveLow(true);
    }
  });

  return null;
}
