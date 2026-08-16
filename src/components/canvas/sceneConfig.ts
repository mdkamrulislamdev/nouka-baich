export const BOAT_SPAWN: [number, number, number] = [0, 0.06, 0];

export const BOAT_MODEL = {
  path: "/models/venus_a_shetland_fourareen/scene.gltf",
  targetLength: 7.2,
  halfWidth: 1.2,
} as const;

export const LONGBOAT_RIG = {
  thwartZ: [2.05, 1.05, 0.05, -0.95, -1.95] as const,
  seatY: 0.4,
  seatWidth: 1.42,
  keelY: 0.18,
} as const;

export const OARS = {
  length: 2.2,
  shaftRadius: 0.032,
  bladeWidth: 0.2,
  bladeLength: 0.52,
  pivotX: 0.82,
  pivotY: 0.54,
  stroke: 0.7,
  lift: 0.2,
  restTilt: 0.16,
  baseRate: 1.05,
  speedRate: 0.11,
  stagger: 0.36,
} as const;

export const WAKE = {
  count: 220,
  y: 0.07,
  sternZ: 2.55,
  emitPerSecond: 48,
  life: 1.15,
  splashSpread: 1.05,
} as const;

export const BOAT_BOUNDS = {
  width: BOAT_MODEL.halfWidth * 1.55,
  height: 1.15,
  length: BOAT_MODEL.targetLength * 0.5,
  centerY: 0.62,
} as const;

export const CAMERA = {
  fov: 40,
  near: 0.1,
  far: 260,
  position: [5.4, 4.6, 13.2] as [number, number, number],
  lookAt: [0, 0.7, -1.6] as [number, number, number],
};

export const SUN_POSITION: [number, number, number] = [28, 32, 12];

export type AtmospherePalette = {
  zenith: string;
  horizon: string;
  fogDensity: number;
  sunColor: string;
  ambient: string;
  ground: string;
};

export const LEVEL_ATMOSPHERES: AtmospherePalette[] = [
  {
    zenith: "#3a6ea8",
    horizon: "#e0a36a",
    fogDensity: 0.01,
    sunColor: "#ffd09a",
    ambient: "#ffd2a8",
    ground: "#3a2718",
  },
  {
    zenith: "#4ea3d4",
    horizon: "#c8e4c0",
    fogDensity: 0.007,
    sunColor: "#fff1c8",
    ambient: "#e7f3ff",
    ground: "#3d4a28",
  },
  {
    zenith: "#5b6d78",
    horizon: "#8aa090",
    fogDensity: 0.016,
    sunColor: "#d8d0c0",
    ambient: "#c5d0c8",
    ground: "#2c2a24",
  },
  {
    zenith: "#2a2458",
    horizon: "#c46b8a",
    fogDensity: 0.012,
    sunColor: "#ffb08a",
    ambient: "#e0b8d0",
    ground: "#2a1820",
  },
];

export function getAtmosphere(level: number): AtmospherePalette {
  const index = Math.max(0, level - 1) % LEVEL_ATMOSPHERES.length;
  return LEVEL_ATMOSPHERES[index];
}

export const WORLD_SCROLL = {
  segmentLength: 42,
  segmentCount: 5,
  recycleZ: 30,
  riverWidth: 16,
  bankWidth: 0.55,
  bankExtent: 7.2,
} as const;

export const PALM_MODEL = {
  path: "/models/palm_tree/scene.gltf",
  targetHeight: 5.2,
} as const;

export const ROCK_MODEL = {
  path: "/models/stylized_rocks/scene.gltf",
  targetWidth: 2.7,
  embedY: -0.16,
} as const;

export const LOG_OBSTACLE = {
  length: 3.9,
  radius: 0.26,
  y: 0.22,
} as const;

export const DINGHY_OBSTACLE = {
  length: 3.2,
  beam: 1.35,
  y: 0.08,
  minSpeed: 3.2,
  maxSpeed: 5.4,
} as const;

export const SCENERY = {
  treeCount: 24,
  hutCount: 8,
  grassCount: 128,
  palmCount: 12,
} as const;

export function getLaneLimit(): number {
  const riverHalf = WORLD_SCROLL.riverWidth / 2;
  const bankInset = WORLD_SCROLL.bankWidth / 2;
  return Math.max(0, riverHalf - bankInset - BOAT_MODEL.halfWidth);
}

export const WATER = {
  color: "#0e3a42",
  sunColor: "#ffd09a",
  distortionScale: 2.6,
  size: 0.55,
  normalsPath: "/textures/waternormals.jpg",
} as const;

export const STEER = {
  damping: 8,
  dragPixelsForFullSteer: 140,
  yawMax: 0.18,
  rollMax: 0.22,
  tiltDamping: 10,
} as const;

export const AUDIO = {
  musicVolume: 0.4,
  sfxVolume: 0.72,
} as const;

export const SCORE = {
  referenceSpeed: 12,
} as const;

export const PROGRESSION = {
  metersPerLevel: 500,
  baseSpeed: 12,
  speedPerLevel: 2.2,
  minInterval: 7.5,
  intervalDecay: 0.9,
  speedDamping: 1.35,
} as const;

export function getLevelForDistance(distance: number): number {
  return 1 + Math.floor(Math.max(0, distance) / PROGRESSION.metersPerLevel);
}

export function getTargetSpeed(level: number): number {
  return PROGRESSION.baseSpeed + Math.max(0, level - 1) * PROGRESSION.speedPerLevel;
}

export function getSpawnInterval(level: number): number {
  return Math.max(
    PROGRESSION.minInterval,
    OBSTACLE_SPAWN.interval * PROGRESSION.intervalDecay ** Math.max(0, level - 1),
  );
}

export const OBSTACLE_SPAWN = {
  interval: 16,
  spawnZ: -96,
  recycleZ: 22,
  poolSize: 6,
  rockPoolSize: 8,
  logPoolSize: 8,
  dinghyPoolSize: 6,
  y: 0.1,
  laneScale: 0.86,
  rockLaneScale: 0.52,
  dinghyLaneScale: 0.7,
} as const;
