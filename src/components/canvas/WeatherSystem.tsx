"use client";

import { RainStreaks } from "@/components/canvas/fx/RainStreaks";
import { LightningSystem } from "@/components/canvas/fx/LightningSystem";
import { isGameplayActive } from "@/lib/gameplay";
import { useGameStore } from "@/store/useGameStore";

/** Maps race level to rain/lightning intensity (0 = clear skies). */
function strengthForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level === 2) return 0.08;
  if (level === 3) return 0.35;
  return 1;
}

/**
 * Weather is driven by gameplay level and quality settings.
 * Subscribes to Zustand so pause / level / adaptive-low updates apply immediately.
 */
export function WeatherSystem() {
  const status = useGameStore((state) => state.status);
  const level = useGameStore((state) => state.level);
  const graphicsQuality = useGameStore((state) => state.graphicsQuality);
  const adaptiveLow = useGameStore((state) => state.adaptiveLow);

  const playing = isGameplayActive({ status });
  const highFx = graphicsQuality === "high" && !adaptiveLow;
  const enabled = playing && highFx;
  const strength = enabled ? strengthForLevel(level) : 0;

  return (
    <>
      <RainStreaks strength={strength} />
      <LightningSystem strength={strength} enabled={enabled} />
    </>
  );
}
