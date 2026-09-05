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
  length: 1.22,
  shaftRadius: 0.015,
  bladeWidth: 0.07,
  bladeLength: 0.16,
  /** Outer hand of the seated 0.9 m rower. */
  pivotX: 0.5,
  pivotY: 0.86,
  handleLength: 0.18,
  handleRadius: 0.016,
  stroke: 0.12,
  lift: 0.18,
  restTilt: 1.18,
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
  /** Hull only — oars are visual and must not count as a ram. */
  width: BOAT_MODEL.halfWidth * 1.55,
  height: 0.95,
  length: BOAT_MODEL.targetLength * 0.94,
  centerY: 0.4,
} as const;

/** Fatal rams use a tighter box than the visual hull / kick range. */
export const COLLISION = {
  hullScaleX: 0.52,
  hullScaleZ: 0.55,
  obstacleScaleX: 0.7,
  obstacleScaleZ: 0.68,
} as const;

export const CAMERA = {
  fov: 52,
  near: 0.1,
  far: 260,
  /** Straight third-person chase: behind the boat, looking down-river (−Z). */
  position: [0, 3.15, 10.2] as [number, number, number],
  lookAt: [0, 1.05, -18] as [number, number, number],
  /** Look-at target down-river; post-processing no longer uses a DoF focus. */
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
    fogDensity: 0.0036,
    sunColor: "#ffd09a",
    ambient: "#ffd2a8",
    ground: "#3a2718",
  },
  {
    zenith: "#5aadcf",
    horizon: "#c8e4c0",
    fogDensity: 0.0032,
    sunColor: "#fff1c8",
    ambient: "#e7f3ff",
    ground: "#3d4a28",
  },
  {
    zenith: "#6a7d88",
    horizon: "#9aab9a",
    fogDensity: 0.0054,
    sunColor: "#d8d0c0",
    ambient: "#c5d0c8",
    ground: "#2c2a24",
  },
  {
    zenith: "#3a3068",
    horizon: "#c46b8a",
    fogDensity: 0.0048,
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
  oncomingChance: 0.08,
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
  hutCount: 10,
  palmNearCount: 28,
  palmMidCount: 22,
  palmBackCount: 14,
} as const;

export const SCENERY_MODELS = {
  hut: {
    path: "/models/low_poly_fishermans_hut/scene.gltf",
    targetHeight: 2.4,
    maxFootprint: 3.6,
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
  nearMissBonus: 60,
  nearMissComboWindowMs: 4000,
  nearMissComboMax: 8,
  sinkRacingBonus: 200,
  sinkDinghyBonus: 125,
  sinkComboWindowMs: 3500,
  sinkComboMax: 8,
  bumpBonus: 60,
  overtakeBonus: 320,
  slingshotBonus: 180,
  strokeBonus: 75,
  bonusPickup: 100,
  logSmashBonus: 240,
  dodgeBonus: 120,
} as const;

export const FEVER = {
  max: 8,
  idleSec: 1.65,
  drainSec: 1.15,
  recoverHeat: 0.5,
} as const;

export const RIVAL = {
  paceMinZ: -22,
  paceMaxZ: -10,
  paceCatch: 1.65,
  flankZ: -9.5,
  flankGap: 2.35,
  packCheckSec: 1.15,
  packAfter: 5,
} as const;

export const DRAFT = {
  minZ: -3.55,
  maxZ: -1.12,
  maxGapX: 0.7,
  speedMul: 0.2,
  readySec: 0.55,
  slingshotBoost: 5.4,
  slingshotSec: 0.8,
  exitSteer: 0.07,
} as const;

export const STROKE = {
  catchMin: 0.7,
  boost: 0.72,
} as const;

export const NPC_KICK = {
  rangeX: 0.95,
  rangeZ: 1.75,
  windup: 0.42,
  cooldown: 1.2,
  impulse: 5.4,
  pop: 0.55,
  dodgeGap: 0.88,
} as const;

export const JUICE = {
  hitStopSec: 0.012,
  fovPunchShove: 1.4,
  fovPunchOvertake: 1.8,
  fovPunchSlingshot: 1.6,
  fovPunchStroke: 0.7,
  speedFov: 0.16,
  draftFov: 1.1,
} as const;

export const INTRO = {
  holdSpawnUntil: 7.2,
  graceSec: 3.2,
  beats: [
    {
      at: 0.55,
      kind: "racing" as const,
      role: "pace" as const,
      z: -18,
      xOff: 2.35,
      speedDelta: -1.4,
      heatIndex: 0,
    },
    {
      at: 2.4,
      kind: "rock" as const,
      role: "none" as const,
      z: -26,
      xOff: -2.7,
      speedDelta: 0,
      heatIndex: -1,
    },
    {
      at: 7.2,
      kind: "racing" as const,
      role: "flank" as const,
      z: -10,
      xOff: 2.4,
      speedDelta: -0.55,
      heatIndex: -1,
    },
  ],
} as const;

export const RIVAL_NAMES = [
  { bn: "সোনার তরী", en: "Sonar Tori" },
  { bn: "মেঘনা", en: "Meghna" },
  { bn: "পদ্মা", en: "Padma" },
] as const;

/** Foot kick: Q / E / Space, then a short-range hit check. */
export const KICK = {
  /** Wider than the small visible foot so nearby boats still get shoved. */
  rangeX: 0.95,
  minGap: 0.06,
  rangeZ: 1.7,
  duration: 0.58,
  cooldownMs: 620,
  sinkDuration: 3.8,
  sinkDepth: 2.6,
  knockPop: 1.2,
  knockSpeed: 5.4,
  knockBack: 1.8,
  hullRoll: 0.2,
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

export type GameMode = "endless" | "sprint" | "festival";
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

export const FESTIVAL = {
  duration: 90,
  boatCount: 3,
  starts: [
    { z: -20, xOff: -2.45, speedDelta: -0.35, heatIndex: 0 },
    { z: -30, xOff: 2.5, speedDelta: -0.9, heatIndex: 1 },
    { z: -42, xOff: -2.2, speedDelta: 0.25, heatIndex: 2 },
  ],
} as const;

export const PROGRESSION = {
  metersPerLevel: 220,
  baseSpeed: 11,
  speedPerLevel: 1.8,
  minInterval: 7.2,
  intervalDecay: 0.86,
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
  distance = 0,
): number {
  const preset = DIFFICULTY_PRESETS[difficulty];
  if (distance < 55) {
    return 18 * preset.spawnMul;
  }
  if (level <= 1) {
    return 11 * preset.spawnMul;
  }
  return (
    Math.max(
      PROGRESSION.minInterval,
      OBSTACLE_SPAWN.interval *
        PROGRESSION.intervalDecay ** Math.max(0, level - 1),
    ) * preset.spawnMul
  );
}

export const POWERS = {
  hasteSec: 5.5,
  hasteMul: 1.38,
  dragSec: 4.5,
  dragMul: 0.64,
  ramSec: 6,
  ramMul: 1.72,
  /** Only smash what is beside / just ahead of the hull, then fling it aside. */
  ramAhead: 3.2,
  ramWidth: 2.15,
} as const;

export const PICKUPS = {
  interval: 30,
  firstAt: 2.1,
  spawnZ: -88,
  earlySpawnZ: -40,
  ramSpawnZ: -138,
  recycleZ: 16,
  y: 2.35,
  poolSize: 10,
  breakerCharges: 1,
  breakerCap: 2,
  collectRadius: 0.95,
  bonusSpread: 2.05,
  clearX: 2.4,
  clearZ: 10,
  weights: {
    bonus: 0.24,
    breaker: 0.24,
    haste: 0.22,
    drag: 0.22,
    ram: 0.03,
  },
} as const;

export const OBSTACLE_SPAWN = {
  interval: 34,
  spawnZ: -96,
  recycleZ: 22,
  poolSize: 6,
  rockPoolSize: 8,
  logPoolSize: 8,
  dinghyPoolSize: 8,
  racingPoolSize: 10,
  y: -0.2,
  laneScale: 0.96,
  rockLaneScale: 0.96,
  dinghyLaneScale: 0.94,
  racingLaneScale: 0.94,
} as const;
