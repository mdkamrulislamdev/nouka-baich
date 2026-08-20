export const BOAT_SPAWN: [number, number, number] = [0, 0, 0];

export const BOAT_MODEL = {
  path:
    process.env.NEXT_PUBLIC_BOAT_MODEL_PATH ??
    "/models/venus_a_shetland_fourareen/scene.gltf",
  targetLength: 4.4,
  halfWidth: 0.68,
  /**
   * Fraction of hull height sunk below the water plane.
   * Keep low — water is opaque, so too much hides the textured deck.
   */
  waterlineRatio: 0.18,
  /** Used by procedural placeholder / gunwale composites. */
  embedY: -0.08,
} as const;

export const LONGBOAT_RIG = {
  thwartZ: [0.95, 0.05, -0.9] as const,
  seatY: 0.42,
  seatWidth: 0.95,
  keelY: 0.12,
} as const;

export const OARS = {
  length: 1.15,
  shaftRadius: 0.02,
  bladeWidth: 0.11,
  bladeLength: 0.28,
  pivotX: 0.52,
  pivotY: 0.48,
  stroke: 0.5,
  lift: 0.18,
  restTilt: 0.28,
  baseRate: 1.05,
  speedRate: 0.11,
  stagger: 0.4,
} as const;

export const WAKE = {
  count: 160,
  y: 0.05,
  sternZ: 1.85,
  emitPerSecond: 36,
  life: 0.85,
  splashSpread: 0.55,
} as const;

export const BOAT_BOUNDS = {
  width: BOAT_MODEL.halfWidth * 1.35,
  height: 0.95,
  length: BOAT_MODEL.targetLength * 0.8,
  centerY: 0.4,
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
  targetWidth: 2.2,
  embedY: -0.35,
} as const;

export const RIVERBANK_MODEL = {
  /** Set to true after adding public/models/riverbank/scene.gltf */
  enabled: false,
  path: "/models/riverbank/scene.gltf",
  targetWidth: WORLD_SCROLL.bankWidth + 2.4,
  outwardOffset: 0.35,
} as const;

export const LOG_OBSTACLE = {
  length: 3.2,
  radius: 0.24,
  y: 0.02,
} as const;

export const DINGHY_OBSTACLE = {
  length: 2.8,
  beam: 1.15,
  y: -0.06,
  minSpeed: 3.2,
  maxSpeed: 5.4,
} as const;

export const SCENERY = {
  treeCount: 24,
  hutCount: 8,
  grassCount: 128,
  palmCount: 12,
} as const;

export const SCENERY_MODELS = {
  tree: {
    path: "/models/tree_animate/scene.gltf",
    targetHeight: 4.8,
  },
  hut: {
    path: "/models/low_poly_fishermans_hut/scene.gltf",
    targetHeight: 1.9,
  },
  grass: {
    path: "/models/grass/scene.gltf",
    targetHeight: 0.68,
  },
  rower: {
    path: "/models/a_man_sitting/scene.gltf",
    targetHeight: 0.9,
  },
  cull: {
    nearZ: -180,
    farZ: 36,
  },
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
  bgmPath: "/audio/folk-loop.wav",
  sfx: {
    row: "/audio/sfx-row.wav",
    splash: "/audio/sfx-splash.wav",
    crash: "/audio/sfx-crash.wav",
    nearMiss: "/audio/sfx-near-miss.wav",
  },
} as const;

export const SCORE = {
  referenceSpeed: 12,
  nearMissBonus: 35,
  nearMissComboWindowMs: 4000,
  nearMissComboMax: 5,
} as const;

export type GameMode = "endless" | "sprint";

export const SPRINT = {
  targetDistance: 1200,
} as const;

export const PROGRESSION = {
  metersPerLevel: 500,
  baseSpeed: 11,
  speedPerLevel: 1.8,
  minInterval: 12,
  intervalDecay: 0.88,
  speedDamping: 1.35,
} as const;

export function getLevelForDistance(distance: number): number {
  return 1 + Math.floor(Math.max(0, distance) / PROGRESSION.metersPerLevel);
}

export function getTargetSpeed(level: number): number {
  return PROGRESSION.baseSpeed + Math.max(0, level - 1) * PROGRESSION.speedPerLevel;
}

export function getSpawnInterval(level: number): number {
  if (level <= 1) {
    /**
     * Phase 11 (Level 1 density rebalance)
     * `ObstacleSpawner` spawns rock/log only about ~50% of the time
     * (see `pickSpawnKind` thresholds). So the *effective* rock/log gap
     * is roughly `2 × interval`.
     *
     * Tune interval so rock/log spacing feels much tighter immediately:
     * ~25m target rock/log gap => ~12.5m base interval.
     */
    return 12.5;
  }
  return Math.max(
    PROGRESSION.minInterval,
    OBSTACLE_SPAWN.interval * PROGRESSION.intervalDecay ** Math.max(0, level - 1),
  );
}

export const OBSTACLE_SPAWN = {
  interval: 34,
  spawnZ: -96,
  recycleZ: 22,
  poolSize: 6,
  rockPoolSize: 8,
  logPoolSize: 8,
  dinghyPoolSize: 6,
  y: -0.2,
  laneScale: 0.78,
  rockLaneScale: 0.48,
  dinghyLaneScale: 0.64,
} as const;
