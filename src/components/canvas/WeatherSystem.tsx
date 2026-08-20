"use client";

import { RainStreaks } from "@/components/canvas/fx/RainStreaks";
import { LightningSystem } from "@/components/canvas/fx/LightningSystem";
import { useGameStore } from "@/store/useGameStore";

import { isGameplayActive } from "@/lib/gameplay";

export function WeatherSystem() {
  const state = useGameStore.getState();
  const statusOk = isGameplayActive(state);

  // Phase 9: bring the dynamic weather engine online.
  // Phase 10: wire the engine to level progression:
  // - Level 1: Sunny Morning (no rain)
  // - Level 2: Golden Sunset (very light mist)
  // - Level 3: Overcast Breeze (drizzle)
  // - Level 4+: Heavy Monsoon Rain & Thunder
  const level = state.level;
  const strengthByLevel = (() => {
    if (level <= 1) return 0;
    if (level === 2) return 0.08;
    if (level === 3) return 0.35;
    return 1;
  })();

  const strength = statusOk ? strengthByLevel : 0;

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

