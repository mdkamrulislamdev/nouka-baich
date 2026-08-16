export const BOAT_SPAWN: [number, number, number] = [0, 0.06, 0];

export const BOAT_MODEL = {
  path: "/models/venus_a_shetland_fourareen/scene.gltf",
  targetLength: 7.2,
} as const;

export const CAMERA = {
  fov: 40,
  near: 0.1,
  far: 260,
  position: [5.4, 4.6, 13.2] as [number, number, number],
  lookAt: [0, 0.7, -1.6] as [number, number, number],
};

export const SUN_POSITION: [number, number, number] = [28, 32, 12];

export const FOG = {
  color: "#6d5c4a",
  density: 0.01,
} as const;

export const WORLD_SCROLL = {
  segmentLength: 42,
  segmentCount: 5,
  recycleZ: 30,
  riverWidth: 16,
} as const;

export const STEER = {
  maxOffset: 6,
  damping: 8,
  dragPixelsForFullSteer: 140,
} as const;
