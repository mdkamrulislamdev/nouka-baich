"use client";

import { RainStreaks } from "@/components/canvas/fx/RainStreaks";
import { LightningSystem } from "@/components/canvas/fx/LightningSystem";
import { useGameStore } from "@/store/useGameStore";

import { isGameplayActive } from "@/lib/gameplay";

export function WeatherSystem() {
  const state = useGameStore.getState();
  const statusOk = isGameplayActive(state);

  // Phase 9: bring the dynamic weather engine online.
  // Phase 10 will wire this to level progression (Level 4+ becomes heavy monsoon + thunder).
  const strength = statusOk ? 1 : 0;

  // Rain/flash are handled only on high graphics to keep performance stable.
  const highFx = state.graphicsQuality === "high" && !state.adaptiveLow;
  const enabled = statusOk && highFx;

  return (
    <>
      <RainStreaks strength={enabled ? strength : 0} />
      <LightningSystem strength={enabled ? strength : 0} enabled={enabled} />
    </>
  );
}

