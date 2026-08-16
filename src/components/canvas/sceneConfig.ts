export const BOAT_SPAWN: [number, number, number] = [0, 0.02, 0];

export const CAMERA = {
  fov: 42,
  near: 0.1,
  far: 220,
  position: [2.4, 3.6, 8.4] as [number, number, number],
  lookAt: [0, 0.45, -1.4] as [number, number, number],
};

export const SUN_POSITION: [number, number, number] = [28, 32, 12];

export const FOG = {
  color: "#6d5c4a",
  density: 0.012,
} as const;
