import {
  BoxGeometry,
  ConeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  type BufferGeometry,
} from "three";

import { DINGHY_OBSTACLE } from "@/components/canvas/sceneConfig";

export type DinghyResources = {
  hull: BufferGeometry;
  bow: BufferGeometry;
  cabin: BufferGeometry;
  roof: BufferGeometry;
  mast: BufferGeometry;
  hullMat: MeshStandardMaterial;
  cabinMat: MeshStandardMaterial;
  roofMat: MeshStandardMaterial;
  trimMat: MeshStandardMaterial;
};

export const DINGHY_EXTENTS = {
  halfX: DINGHY_OBSTACLE.beam * 0.52,
  halfY: 0.7,
  halfZ: DINGHY_OBSTACLE.length * 0.52,
} as const;

export function createDinghyResources(): DinghyResources {
  return {
    hull: new BoxGeometry(DINGHY_OBSTACLE.beam, 0.38, DINGHY_OBSTACLE.length * 0.78),
    bow: new ConeGeometry(DINGHY_OBSTACLE.beam * 0.48, 1.05, 4),
    cabin: new BoxGeometry(0.92, 0.52, 1.05),
    roof: new BoxGeometry(1.05, 0.08, 1.18),
    mast: new BoxGeometry(0.07, 0.95, 0.07),
    hullMat: new MeshStandardMaterial({
      color: "#2f6f6a",
      roughness: 0.62,
      metalness: 0.08,
      envMapIntensity: 0.7,
    }),
    cabinMat: new MeshStandardMaterial({
      color: "#c45a32",
      roughness: 0.74,
      metalness: 0.06,
    }),
    roofMat: new MeshStandardMaterial({
      color: "#efe0c4",
      roughness: 0.7,
      metalness: 0.04,
    }),
    trimMat: new MeshStandardMaterial({
      color: "#3a2a1c",
      roughness: 0.82,
      metalness: 0.05,
    }),
  };
}

export function disposeDinghyResources(resources: DinghyResources): void {
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

export function createDinghyObstacle(resources: DinghyResources): Group {
  const group = new Group();
  addMesh(group, resources.hull, resources.hullMat, 0, 0.22, 0.15);
  addMesh(
    group,
    resources.bow,
    resources.hullMat,
    0,
    0.22,
    -DINGHY_OBSTACLE.length * 0.38,
    Math.PI / 4,
    Math.PI / 2,
  );
  addMesh(group, resources.cabin, resources.cabinMat, 0, 0.62, 0.35);
  addMesh(group, resources.roof, resources.roofMat, 0, 0.9, 0.35);
  addMesh(group, resources.mast, resources.trimMat, 0.28, 0.85, 0.55);
  group.visible = false;
  return group;
}
