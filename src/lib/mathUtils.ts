export function seededRandom(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

export function recycleZPosition(currentZ: number, worldLength: number): number {
  return currentZ - worldLength;
}
