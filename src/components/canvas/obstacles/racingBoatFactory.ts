import {
  BoxGeometry,
  ConeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  type BufferGeometry,
} from "three";

import { RACING_BOAT_OBSTACLE } from "@/components/canvas/sceneConfig";

export type RacingBoatResources = {
  hull: BufferGeometry;
  cabin: BufferGeometry;
  roof: BufferGeometry;
  bow: BufferGeometry;
  mast: BufferGeometry;
  hullMat: MeshStandardMaterial;
  cabinMat: MeshStandardMaterial;
  roofMat: MeshStandardMaterial;
  trimMat: MeshStandardMaterial;
};

export const RACING_BOAT_EXTENTS = {
  halfX: RACING_BOAT_OBSTACLE.beam * 0.52,
  halfY: 0.75,
  halfZ: RACING_BOAT_OBSTACLE.length * 0.52,
} as const;

export function createRacingBoatResources(): RacingBoatResources {
  return {
    hull: new BoxGeometry(
      RACING_BOAT_OBSTACLE.beam,
      0.36,
      RACING_BOAT_OBSTACLE.length * 0.78,
    ),
    bow: new ConeGeometry(RACING_BOAT_OBSTACLE.beam * 0.42, 1.0, 5),
    cabin: new BoxGeometry(0.92, 0.48, 1.05),
    roof: new BoxGeometry(1.05, 0.08, 1.12),
    mast: new BoxGeometry(0.08, 0.95, 0.08),
    hullMat: new MeshStandardMaterial({
      color: "#23458f",
      roughness: 0.58,
      metalness: 0.1,
      envMapIntensity: 0.7,
    }),
    cabinMat: new MeshStandardMaterial({
      color: "#f0622a",
      roughness: 0.72,
      metalness: 0.06,
    }),
    roofMat: new MeshStandardMaterial({
      color: "#ffe8b5",
      roughness: 0.7,
      metalness: 0.04,
    }),
    trimMat: new MeshStandardMaterial({
      color: "#1c2a3a",
      roughness: 0.82,
      metalness: 0.05,
    }),
  };
}

export function disposeRacingBoatResources(
  resources: RacingBoatResources,
): void {
  resources.hull.dispose();
  resources.bow.dispose();
  resources.cabin.dispose();
  resources.roof.dispose();
  resources.mast.dispose();
  resources.hullMat.dispose();
  resources.cabinMat.dispose();
  resources.roofMat.dispose();
  resources.trimMat.dispose();
}

function addMesh(
  group: Group,
  geometry: BufferGeometry,
  material: MeshStandardMaterial,
  x: number,
  y: number,
  z: number,
  rotY = 0,
  rotX = 0,
): void {
  const mesh = new Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.rotation.set(rotX, rotY, 0);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
}

export function createRacingBoatObstacle(
  resources: RacingBoatResources,
): Group {
  const group = new Group();

  addMesh(group, resources.hull, resources.hullMat, 0, 0.08, 0.15);
  addMesh(
    group,
    resources.bow,
    resources.trimMat,
    0,
    0.1,
    -RACING_BOAT_OBSTACLE.length * 0.38,
    Math.PI / 2,
    0,
  );
  addMesh(group, resources.cabin, resources.cabinMat, 0, 0.48, 0.35);
  addMesh(group, resources.roof, resources.roofMat, 0, 0.76, 0.35);
  addMesh(group, resources.mast, resources.trimMat, 0.28, 0.7, 0.55);

  group.visible = false;
  return group;
}

