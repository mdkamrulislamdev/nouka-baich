import { BufferGeometry, Float32BufferAttribute } from "three";

type BankProfilePoint = [number, number];

const BANK_PROFILE: BankProfilePoint[] = [
  [0, -0.28],
  [0, 0.03],
  [1.15, 0.42],
  [2.4, 0.62],
  [7.2, 0.78],
  [7.2, -0.4],
];

export function createBankGeometry(
  length: number,
  side: -1 | 1,
): BufferGeometry {
  const halfLength = length / 2;
  const stations = [-halfLength, halfLength] as const;
  const positions: number[] = [];
  const indices: number[] = [];
  const pointsPerSlice = BANK_PROFILE.length;

  for (const z of stations) {
    for (const [outward, y] of BANK_PROFILE) {
      positions.push(side * outward, y, z);
    }
  }

  for (let pointIndex = 0; pointIndex < pointsPerSlice - 1; pointIndex += 1) {
    const a = pointIndex;
    const b = a + 1;
    const c = pointsPerSlice + pointIndex;
    const d = c + 1;

    if (side === 1) {
      indices.push(a, c, b, b, c, d);
    } else {
      indices.push(a, b, c, b, d, c);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
