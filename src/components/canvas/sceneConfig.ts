export const BOAT_SPAWN: [number, number, number] = [0, 0, 0];

export const CAMERA = {
  fov: 48,
  near: 0.1,
  far: 220,
  position: [4.2, 7.8, 13.5] as [number, number, number],
  lookAt: [0, 0.7, -5] as [number, number, number],
};

export const SUN_POSITION: [number, number, number] = [42, 36, 18];

export const FOG = {
  color: "#d7b48a",
  density: 0.016,
} as const;
