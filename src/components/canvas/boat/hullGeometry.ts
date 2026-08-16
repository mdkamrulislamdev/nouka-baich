import { BufferGeometry, Float32BufferAttribute } from "three";

export type HullStation = {
  z: number;
  beam: number;
  deckY: number;
  keelY: number;
};

const HULL_STATIONS: HullStation[] = [
  { z: 3.45, beam: 0.05, deckY: 0.4, keelY: 0.1 },
  { z: 3.05, beam: 0.24, deckY: 0.3, keelY: 0.04 },
  { z: 2.2, beam: 0.5, deckY: 0.25, keelY: 0.0 },
  { z: 1.0, beam: 0.68, deckY: 0.23, keelY: 0.0 },
  { z: 0.0, beam: 0.74, deckY: 0.22, keelY: 0.0 },
  { z: -1.15, beam: 0.64, deckY: 0.24, keelY: 0.0 },
  { z: -2.15, beam: 0.42, deckY: 0.3, keelY: 0.02 },
  { z: -2.95, beam: 0.2, deckY: 0.48, keelY: 0.08 },
  { z: -3.5, beam: 0.04, deckY: 0.88, keelY: 0.22 },
];

function crossSection(station: HullStation): [number, number][] {
  const { beam, deckY, keelY } = station;
  const chineY = keelY + (deckY - keelY) * 0.34;
  const chineX = beam * 0.8;

  return [
    [-beam, deckY],
    [-chineX, chineY],
    [-beam * 0.18, keelY],
    [0, keelY - 0.025],
    [beam * 0.18, keelY],
    [chineX, chineY],
    [beam, deckY],
  ];
}

export function createLongboatHullGeometry(): BufferGeometry {
  const slices = HULL_STATIONS.map(crossSection);
  const pointsPerSlice = slices[0].length;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let stationIndex = 0; stationIndex < slices.length; stationIndex += 1) {
    const slice = slices[stationIndex];
    const z = HULL_STATIONS[stationIndex].z;

    for (const [x, y] of slice) {
      positions.push(x, y, z);
    }
  }

  for (let stationIndex = 0; stationIndex < slices.length - 1; stationIndex += 1) {
    for (let pointIndex = 0; pointIndex < pointsPerSlice - 1; pointIndex += 1) {
      const a = stationIndex * pointsPerSlice + pointIndex;
      const b = a + 1;
      const c = (stationIndex + 1) * pointsPerSlice + pointIndex;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}
