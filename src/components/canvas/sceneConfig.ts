export const BOAT_SPAWN: [number, number, number] = [0, 0.02, 0];

export const CAMERA = {
  fov: 46,
  near: 0.1,
  far: 220,
  position: [3.6, 5.8, 11.2] as [number, number, number],
  lookAt: [0, 0.55, -1.8] as [number, number, number],
};

export const SUN_POSITION: [number, number, number] = [28, 32, 12];

export const FOG = {
  color: "#6d5c4a",
  density: 0.012,
} as const;
