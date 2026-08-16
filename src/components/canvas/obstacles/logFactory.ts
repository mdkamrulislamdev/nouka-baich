import {
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  type BufferGeometry,
} from "three";

import { LOG_OBSTACLE } from "@/components/canvas/sceneConfig";

export type LogResources = {
  body: BufferGeometry;
  cap: BufferGeometry;
  barkMat: MeshStandardMaterial;
  capMat: MeshStandardMaterial;
};

export const LOG_EXTENTS = {
  halfX: LOG_OBSTACLE.length * 0.5,
  halfY: LOG_OBSTACLE.radius,
  halfZ: LOG_OBSTACLE.radius,
} as const;

export function createLogResources(): LogResources {
  return {
    body: new CylinderGeometry(
      LOG_OBSTACLE.radius,
      LOG_OBSTACLE.radius * 0.92,
      LOG_OBSTACLE.length,
      8,
    ),
    cap: new CylinderGeometry(
      LOG_OBSTACLE.radius * 1.02,
      LOG_OBSTACLE.radius * 1.02,
      0.12,
      8,
    ),
    barkMat: new MeshStandardMaterial({
      color: "#6b3e22",
      roughness: 0.92,
      metalness: 0.04,
      envMapIntensity: 0.45,
    }),
    capMat: new MeshStandardMaterial({
      color: "#3d2414",
      roughness: 0.86,
      metalness: 0.03,
    }),
  };
}

export function disposeLogResources(resources: LogResources): void {
  resources.body.dispose();
  resources.cap.dispose();
  resources.barkMat.dispose();
  resources.capMat.dispose();
}

function addPart(
  group: Group,
  geometry: BufferGeometry,
  material: MeshStandardMaterial,
  x: number,
): void {
  const mesh = new Mesh(geometry, material);
  mesh.rotation.z = Math.PI / 2;
  mesh.position.x = x;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
}

export function createLogObstacle(resources: LogResources): Group {
  const group = new Group();
  addPart(group, resources.body, resources.barkMat, 0);
  addPart(group, resources.cap, resources.capMat, LOG_OBSTACLE.length * 0.48);
  addPart(group, resources.cap, resources.capMat, -LOG_OBSTACLE.length * 0.48);
  group.visible = false;
  return group;
}
