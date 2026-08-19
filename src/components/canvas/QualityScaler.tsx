"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

import { isRunActive } from "@/lib/gameplay";
import { useGameStore } from "@/store/useGameStore";

const SAMPLE_SECONDS = 1;
const DOWNGRADE_FPS = 30;
const RECOVER_FPS = 50;
const RECOVER_SAMPLES = 5;

export function QualityScaler() {
  const framesRef = useRef(0);
  const elapsedRef = useRef(0);
  const healthySamplesRef = useRef(0);

  useFrame((_, delta) => {
    const state = useGameStore.getState();
    const { graphicsQuality, adaptiveLow, setAdaptiveLow } = state;

    if (!isRunActive(state) || graphicsQuality !== "high") {
      framesRef.current = 0;
      elapsedRef.current = 0;
      healthySamplesRef.current = 0;
      return;
    }

    framesRef.current += 1;
    elapsedRef.current += delta;

    if (elapsedRef.current < SAMPLE_SECONDS) {
      return;
    }

    const fps = framesRef.current / elapsedRef.current;
    framesRef.current = 0;
    elapsedRef.current = 0;

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
