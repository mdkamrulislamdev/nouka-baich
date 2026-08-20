"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

import { isRunActive } from "@/lib/gameplay";
import { useGameStore } from "@/store/useGameStore";

const SAMPLE_SECONDS = 1.25;
const DOWNGRADE_FPS = 28;
const RECOVER_FPS = 52;
const RECOVER_SAMPLES = 8;
/** Ignore the first seconds of a run — load hitch must not flip quality. */
const WARMUP_SECONDS = 4;

export function QualityScaler() {
  const framesRef = useRef(0);
  const elapsedRef = useRef(0);
  const healthySamplesRef = useRef(0);
  const runElapsedRef = useRef(0);

  useFrame((_, delta) => {
    const state = useGameStore.getState();
    const { graphicsQuality, adaptiveLow, setAdaptiveLow } = state;

    if (!isRunActive(state) || graphicsQuality !== "high") {
      framesRef.current = 0;
      elapsedRef.current = 0;
      healthySamplesRef.current = 0;
      runElapsedRef.current = 0;
      return;
    }

    runElapsedRef.current += delta;
    framesRef.current += 1;
    elapsedRef.current += delta;

    if (elapsedRef.current < SAMPLE_SECONDS) {
      return;
    }

    const fps = framesRef.current / elapsedRef.current;
    framesRef.current = 0;
    elapsedRef.current = 0;

    if (runElapsedRef.current < WARMUP_SECONDS) {
      return;
    }

    if (!adaptiveLow) {
      if (fps < DOWNGRADE_FPS) {
        setAdaptiveLow(true);
        healthySamplesRef.current = 0;
      }
      return;
    }

    if (fps > RECOVER_FPS) {
      healthySamplesRef.current += 1;
      if (healthySamplesRef.current >= RECOVER_SAMPLES) {
        setAdaptiveLow(false);
        healthySamplesRef.current = 0;
      }
    } else {
      healthySamplesRef.current = 0;
    }
  });

  return null;
}
