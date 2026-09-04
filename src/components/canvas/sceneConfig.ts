export const BOAT_SPAWN: [number, number, number] = [0, 0, 0];

const DEFAULT_BOAT_PATH = "/models/venus_a_shetland_fourareen/scene.gltf";

/**
 * Only same-origin `/models/...` paths are accepted for the boat override.
 * Blocks accidental remote GLTF injection via env misconfiguration.
 */
function resolveBoatModelPath(): string {
  const candidate = process.env.NEXT_PUBLIC_BOAT_MODEL_PATH?.trim();
  if (!candidate) {
    return DEFAULT_BOAT_PATH;
  }
  if (
    candidate.startsWith("/models/") &&
    !candidate.includes("..") &&
    (candidate.endsWith(".gltf") || candidate.endsWith(".glb"))
  ) {
    return candidate;
  }
  return DEFAULT_BOAT_PATH;
}

export const BOAT_MODEL = {
  path: resolveBoatModelPath(),
  targetLength: 4.4,
  halfWidth: 0.68,
  /**
   * Fraction of hull height sunk below the water plane.
   * Keep low — water is opaque, so too much hides the textured deck.
   */
  waterlineRatio: 0.1,
  /** Extra lift so gunwales sit clearly above the waterline. */
  waterlineLift: 0.22,
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
  length: 1.05,
  shaftRadius: 0.016,
  bladeWidth: 0.08,
  bladeLength: 0.2,
  pivotX: 0.5,
  pivotY: 0.48,
  handleLength: 0.2,
  handleRadius: 0.018,
  stroke: 0.4,
  lift: 0.15,
  restTilt: 0.24,
  baseRate: 1.05,
  speedRate: 0.11,
  stagger: 0.4,
} as const;

export const WAKE = {
  count: 120,
  y: 0.05,
  sternZ: 1.85,
  emitPerSecond: 24,
  life: 0.75,
  splashSpread: 0.38,
} as const;

export const BOAT_BOUNDS = {
  width: BOAT_MODEL.halfWidth * 2.08,
  height: 0.95,
  length: BOAT_MODEL.targetLength * 0.94,
  centerY: 0.4,
} as const;

export const CAMERA = {
  fov: 52,
  near: 0.1,
  far: 260,
  /** Straight third-person chase: behind the boat, looking down-river (−Z). */
  position: [0, 3.15, 10.2] as [number, number, number],
  lookAt: [0, 1.05, -18] as [number, number, number],
  /** Depth-of-field stays on the hull, not the distant look target. */
  focus: [0, 0.88, -1.2] as [number, number, number],
  follow: 7.2,
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
    zenith: "#4a7eb8",
    horizon: "#d4b896",
    fogDensity: 0.0065,
    sunColor: "#ffd09a",
    ambient: "#ffd2a8",
    ground: "#3a2718",
  },
  {
    zenith: "#5aadcf",
    horizon: "#c8e4c0",
    fogDensity: 0.0055,
    sunColor: "#fff1c8",
    ambient: "#e7f3ff",
    ground: "#3d4a28",
  },
  {
    zenith: "#6a7d88",
    horizon: "#9aab9a",
    fogDensity: 0.01,
    sunColor: "#d8d0c0",
    ambient: "#c5d0c8",
    ground: "#2c2a24",
  },
  {
    zenith: "#3a3068",
    horizon: "#c46b8a",
    fogDensity: 0.008,
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
  targetWidth: 1.35,
  embedY: -0.28,
} as const;

export const RIVERBANK_MODEL = {
  /** Set to true after adding public/models/riverbank/scene.gltf */
  enabled: false,
  path: "/models/riverbank/scene.gltf",
  targetWidth: WORLD_SCROLL.bankWidth + 2.4,
  outwardOffset: 0.35,
} as const;

export const LOG_OBSTACLE = {
  length: 2.35,
  radius: 0.17,
  y: 0.02,
} as const;

export const DINGHY_OBSTACLE = {
  length: 3.2,
  beam: 1.05,
  y: 0.06,
  minSpeed: 3.2,
  maxSpeed: 5.4,
  tint: "#2f6f6a",
} as const;

export const RACING_BOAT_OBSTACLE = {
  length: 3.8,
  beam: 1.05,
  y: 0.06,
  /** Chance a racing boat is oncoming instead of same-direction. */
  oncomingChance: 0.4,
  oncomingMinSpeed: -6.2,
  oncomingMaxSpeed: -3.8,
  sameDirMinSpeed: 6.1,
  sameDirMaxSpeed: 9.3,
  sameDirSpawnZ: -32,
  /**
   * Fallback band used when a caller still reads min/max as oncoming.
   * Prefer the sameDir / oncoming pairs above.
   */
  minSpeed: -6.2,
  maxSpeed: 9.3,
  tint: "#23458f",
} as const;

export const SCENERY = {
  /** Broken tree/grass GLTFs disabled — palms + huts only for now. */
  treeCount: 0,
  hutCount: 10,
  grassCount: 0,
  palmNearCount: 28,
  palmMidCount: 22,
  palmBackCount: 14,
  /** Total palms = 64 (was 116 — lighter for production FPS). */
  palmCount: 64,
} as const;

export const SCENERY_MODELS = {
  tree: {
    path: "/models/tree_animate/scene.gltf",
    targetHeight: 5.8,
    maxFootprint: 3.8,
    meshPatterns: ["Bark", "Leaf", "Branch"] as const,
  },
  hut: {
    path: "/models/low_poly_fishermans_hut/scene.gltf",
    targetHeight: 2.4,
    maxFootprint: 3.6,
  },
  grass: {
    path: "/models/grass/scene.gltf",
    targetHeight: 1.35,
    maxFootprint: 1.4,
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
  damping: 5.5,
  dragPixelsForFullSteer: 140,
  /** Lateral drift speed when holding arrow keys (world units / sec). */
  keyboardSpeed: 2.6,
  yawMax: 0.14,
  rollMax: 0.18,
  tiltDamping: 8,
} as const;

export const AUDIO = {
  musicVolume: 0.34,
  sfxVolume: 0.72,
  windVolume: 0.22,
  waterVolume: 0.14,
  bgmPath: "/audio/folk-loop.wav",
  windPath: "/audio/sfx-wind.wav",
  waterPath: "/audio/sfx-water.wav",
  sfx: {
    row: "/audio/sfx-row.wav",
    splash: "/audio/sfx-splash.wav",
    crash: "/audio/sfx-crash.wav",
    nearMiss: "/audio/sfx-near-miss.wav",
    kick: "/audio/sfx-kick.wav",
    bump: "/audio/sfx-bump.wav",
  },
} as const;

export const SCORE = {
  referenceSpeed: 12,
  nearMissBonus: 35,
  nearMissComboWindowMs: 4000,
  nearMissComboMax: 5,
  sinkRacingBonus: 160,
  sinkDinghyBonus: 90,
  sinkComboWindowMs: 3500,
  sinkComboMax: 4,
  bumpBonus: 48,
} as const;

/** Road Rash-style oar smash: button or Space/K, then a short-range hit check. */
export const KICK = {
  rangeX: 0.7,
  minGap: 0.1,
  rangeZ: 1.55,
  duration: 0.5,
  cooldownMs: 720,
  sinkDuration: 3.8,
  sinkDepth: 2.6,
  knockPop: 1.2,
  knockSpeed: 5.4,
  knockBack: 1.8,
  hullRoll: 0.12,
  oarSweep: 0.55,
} as const;

/** Oar-handle hits during the power stroke. */
export const OAR_HIT = {
  dipMin: 0.22,
  reachX: 0.7,
  rangeZ: 1.5,
  popX: 1.05,
  impulseX: 4.8,
  impulseZ: 2.1,
  speedMul: 0.48,
} as const;

/** Knockback when an oar connects. Hull contact is fatal. */
export const BUMP = {
  duration: 0.95,
  popX: 1.55,
  impulseX: 7.4,
  impulseZ: 3.2,
  speedMul: 0.3,
  knockDecay: 3.6,
} as const;

export type GameMode = "endless" | "sprint";
export type Difficulty = "easy" | "medium" | "hard";

export const DIFFICULTY_PRESETS: Record<
  Difficulty,
  {
    labelBn: string;
    labelEn: string;
    speedMul: number;
    spawnMul: number;
    skipMarkers: boolean;
  }
> = {
  easy: {
    labelBn: "সহজ",
    labelEn: "Easy",
    speedMul: 0.78,
    spawnMul: 1.55,
    skipMarkers: true,
  },
  medium: {
    labelBn: "মাধ্যম",
    labelEn: "Medium",
    speedMul: 1,
    spawnMul: 1,
    skipMarkers: false,
  },
  hard: {
    labelBn: "কঠিন",
    labelEn: "Hard",
    speedMul: 1.16,
    spawnMul: 0.72,
    skipMarkers: false,
  },
};

export const SPRINT = {
  targetDistance: 480,
} as const;

export const PROGRESSION = {
  metersPerLevel: 220,
  baseSpeed: 11,
  speedPerLevel: 1.8,
  minInterval: 12,
  intervalDecay: 0.88,
  speedDamping: 1.35,
} as const;

export function getLevelForDistance(distance: number): number {
  return 1 + Math.floor(Math.max(0, distance) / PROGRESSION.metersPerLevel);
}

export function getTargetSpeed(
  level: number,
  difficulty: Difficulty = "medium",
): number {
  const t = Math.max(0, level - 1);
  const preset = DIFFICULTY_PRESETS[difficulty];
  return PROGRESSION.baseSpeed * 1.12 ** t * preset.speedMul;
}

export function getSpawnInterval(
  level: number,
  difficulty: Difficulty = "medium",
): number {
  const preset = DIFFICULTY_PRESETS[difficulty];
  if (level <= 1) {
    return 12.5 * preset.spawnMul;
  }
  return (
    Math.max(
      PROGRESSION.minInterval,
      OBSTACLE_SPAWN.interval *
        PROGRESSION.intervalDecay ** Math.max(0, level - 1),
    ) * preset.spawnMul
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
  racingPoolSize: 6,
  y: -0.2,
  laneScale: 0.96,
  rockLaneScale: 0.96,
  dinghyLaneScale: 0.94,
  racingLaneScale: 0.94,
} as const;
