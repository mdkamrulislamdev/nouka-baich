import { BufferGeometry, Float32BufferAttribute } from "three";

export type HullStation = {
  z: number;
  beam: number;
  deckY: number;
  keelY: number;
};

export const HULL_STATIONS: HullStation[] = [
  { z: 3.55, beam: 0.08, deckY: 0.55, keelY: 0.16 },
  { z: 3.15, beam: 0.32, deckY: 0.42, keelY: 0.06 },
  { z: 2.35, beam: 0.62, deckY: 0.38, keelY: 0.0 },
  { z: 1.1, beam: 0.86, deckY: 0.36, keelY: 0.0 },
  { z: 0.0, beam: 0.94, deckY: 0.36, keelY: 0.0 },
  { z: -1.2, beam: 0.82, deckY: 0.38, keelY: 0.0 },
  { z: -2.35, beam: 0.5, deckY: 0.46, keelY: 0.05 },
  { z: -3.2, beam: 0.2, deckY: 0.68, keelY: 0.14 },
  { z: -3.85, beam: 0.035, deckY: 1.12, keelY: 0.32 },
];

function crossSection(station: HullStation): [number, number][] {
  const { beam, deckY, keelY } = station;
  const sideY = keelY + (deckY - keelY) * 0.48;
  const chineY = keelY + 0.05;

  return [
    [-beam, deckY],
    [-beam * 0.97, sideY],
    [-beam * 0.62, chineY],
    [0, keelY],
    [beam * 0.62, chineY],
    [beam * 0.97, sideY],
    [beam, deckY],
  ];
}

function pushCap(
  indices: number[],
  centerIndex: number,
  baseIndex: number,
  pointCount: number,
  reverse: boolean,
) {
  for (let pointIndex = 0; pointIndex < pointCount - 1; pointIndex += 1) {
    const left = baseIndex + pointIndex;
    const right = baseIndex + pointIndex + 1;

    if (reverse) {
      indices.push(centerIndex, right, left);
    } else {
      indices.push(centerIndex, left, right);
    }
  }
}

export function createLongboatHullGeometry(): BufferGeometry {
  const slices = HULL_STATIONS.map(crossSection);
  const pointsPerSlice = slices[0].length;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let stationIndex = 0; stationIndex < slices.length; stationIndex += 1) {
    const z = HULL_STATIONS[stationIndex].z;

    for (const [x, y] of slices[stationIndex]) {
      positions.push(x, y, z);
    }
  }

  for (let stationIndex = 0; stationIndex < slices.length - 1; stationIndex += 1) {
    for (let pointIndex = 0; pointIndex < pointsPerSlice - 1; pointIndex += 1) {
      const a = stationIndex * pointsPerSlice + pointIndex;
      const b = a + 1;
      const c = (stationIndex + 1) * pointsPerSlice + pointIndex;
      const d = c + 1;
      indices.push(a, b, c, b, d, c);
    }
  }

  const stern = HULL_STATIONS[0];
  const bow = HULL_STATIONS[HULL_STATIONS.length - 1];
  const sternCenter = positions.length / 3;
  positions.push(0, (stern.keelY + stern.deckY) * 0.4, stern.z);
  const bowCenter = positions.length / 3;
  positions.push(0, (bow.keelY + bow.deckY) * 0.45, bow.z);

  pushCap(indices, sternCenter, 0, pointsPerSlice, true);
  pushCap(
    indices,
    bowCenter,
    (slices.length - 1) * pointsPerSlice,
    pointsPerSlice,
    false,
  );

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}
