export function seededRandom(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

export function pickRiverLaneX(seed: number, attempt: number, limit: number): number {
  const span = Math.max(0.4, limit);
  const roll = seededRandom(seed * 7.13 + attempt * 3.91);
  if (roll < 0.34) {
    return -span * (0.12 + seededRandom(seed * 11.7 + attempt) * 0.88);
  }
  if (roll < 0.68) {
    return span * (0.12 + seededRandom(seed * 11.7 + attempt) * 0.88);
  }
  return (seededRandom(seed * 19.3 + attempt) * 2 - 1) * span * 0.42;
}

export function pickBankLaneX(
  seed: number,
  laneLimit: number,
  side: -1 | 1,
  band: "lip" | "shoulder" = "lip",
): number {
  const span = Math.max(0.8, laneLimit);
  const t =
    band === "lip"
      ? 0.93 + seededRandom(seed * 8.41) * 0.09
      : 0.74 + seededRandom(seed * 5.17) * 0.12;
  return side * span * t;
}

export function recycleZPosition(currentZ: number, worldLength: number): number {
  return currentZ - worldLength;
}
