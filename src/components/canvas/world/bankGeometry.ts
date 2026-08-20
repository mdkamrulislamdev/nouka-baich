import { BufferGeometry, Float32BufferAttribute } from "three";

import { WORLD_SCROLL } from "@/components/canvas/sceneConfig";
import { seededRandom } from "@/lib/mathUtils";

type BankLayer = "mud" | "sand" | "grass";

type ProfilePoint = {
  outward: number;
  y: number;
  layer: BankLayer;
};

/** Cross-section from water edge (0) to inland extent, with shoreline trim layers. */
const BANK_PROFILE: ProfilePoint[] = [
  { outward: 0, y: -0.24, layer: "mud" },
  { outward: 0, y: 0.06, layer: "mud" },
  { outward: 0.42, y: 0.14, layer: "mud" },
  { outward: 0.92, y: 0.24, layer: "sand" },
  { outward: 1.55, y: 0.36, layer: "sand" },
  { outward: 2.45, y: 0.5, layer: "grass" },
  { outward: 4.2, y: 0.66, layer: "grass" },
  { outward: WORLD_SCROLL.bankExtent, y: 0.78, layer: "grass" },
  { outward: WORLD_SCROLL.bankExtent, y: -0.36, layer: "grass" },
];

const LAYER_INDEX: Record<BankLayer, number> = {
  mud: 0,
  sand: 1,
  grass: 2,
};

const SLICE_COUNT = 32;

function smoothNoise(t: number, seed: number): number {
  const cell = Math.floor(t);
  const frac = t - cell;
  const smooth = frac * frac * (3 - 2 * frac);
  const a = seededRandom(cell + seed);
  const b = seededRandom(cell + 1 + seed);
  return a * (1 - smooth) + b * smooth;
}

function sampleBankNoise(
  z: number,
  outward: number,
  side: -1 | 1,
): { outwardDelta: number; heightDelta: number } {
  const t = z * 0.11 + side * 13.7;
  const jag =
    (smoothNoise(t, side * 29) - 0.5) * 0.52 +
    (smoothNoise(t * 2.7 + 4.1, side * 41) - 0.5) * 0.22;
  const ripple =
    (smoothNoise(t * 1.6 + outward * 0.35, side * 53) - 0.5) * 0.14 +
    (smoothNoise(t * 3.9, side * 67) - 0.5) * 0.06;

  const edgeWeight = Math.exp(-outward * 1.85);
  return {
    outwardDelta: jag * (0.18 + edgeWeight * 0.82),
    heightDelta: ripple * (0.35 + edgeWeight * 0.65),
  };
}

function pushTriangle(
  indices: number[],
  a: number,
  b: number,
  c: number,
): void {
  indices.push(a, b, c);
}

function pushQuad(
  indices: number[],
  a: number,
  b: number,
  c: number,
  d: number,
  side: -1 | 1,
): void {
  if (side === 1) {
    pushTriangle(indices, a, c, b);
    pushTriangle(indices, b, c, d);
    return;
  }
  pushTriangle(indices, a, b, c);
  pushTriangle(indices, b, d, c);
}

function appendGroupRange(
  groups: Array<{ start: number; count: number; materialIndex: number }>,
  layer: BankLayer,
  start: number,
  count: number,
): void {
  if (count <= 0) {
    return;
  }
  const materialIndex = LAYER_INDEX[layer];
  const last = groups[groups.length - 1];
  if (last && last.materialIndex === materialIndex) {
    last.count += count;
    return;
  }
  groups.push({ start, count, materialIndex });
}

export function createBankGeometry(
  length: number,
  side: -1 | 1,
): BufferGeometry {
  const halfLength = length / 2;
  const pointsPerSlice = BANK_PROFILE.length;
  const positions: number[] = [];
  const indices: number[] = [];
  const groups: Array<{
    start: number;
    count: number;
    materialIndex: number;
  }> = [];

  for (let slice = 0; slice <= SLICE_COUNT; slice += 1) {
    const z =
      -halfLength + (slice / SLICE_COUNT) * length;

    for (const point of BANK_PROFILE) {
      const noise = sampleBankNoise(z, point.outward, side);
      const outward = Math.max(0, point.outward + noise.outwardDelta);
      const y = point.y + noise.heightDelta;
      positions.push(side * outward, y, z);
    }
  }

  for (let slice = 0; slice < SLICE_COUNT; slice += 1) {
    const sliceBase = slice * pointsPerSlice;
    const nextSliceBase = (slice + 1) * pointsPerSlice;

    for (let pointIndex = 0; pointIndex < pointsPerSlice - 1; pointIndex += 1) {
      const a = sliceBase + pointIndex;
      const b = a + 1;
      const c = nextSliceBase + pointIndex;
      const d = c + 1;
      const layer = BANK_PROFILE[pointIndex]?.layer ?? "grass";
      const indexStart = indices.length;

      pushQuad(indices, a, b, c, d, side);
      appendGroupRange(groups, layer, indexStart, 6);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);

  for (const group of groups) {
    geometry.addGroup(group.start, group.count, group.materialIndex);
  }

  geometry.computeVertexNormals();
  return geometry;
}
