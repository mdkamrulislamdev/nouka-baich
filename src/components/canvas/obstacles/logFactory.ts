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
  cutMat: MeshStandardMaterial;
};

const HALF_LENGTH = LOG_OBSTACLE.length * 0.5;

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
      HALF_LENGTH,
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
    cutMat: new MeshStandardMaterial({
      color: "#c9a36a",
      roughness: 0.72,
      metalness: 0.02,
      envMapIntensity: 0.35,
    }),
  };
}

export function disposeLogResources(resources: LogResources): void {
  resources.body.dispose();
  resources.cap.dispose();
  resources.barkMat.dispose();
  resources.capMat.dispose();
  resources.cutMat.dispose();
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

function makeHalf(resources: LogResources, side: -1 | 1): Group {
  const half = new Group();
  half.name = side < 0 ? "logHalfL" : "logHalfR";
  addPart(half, resources.body, resources.barkMat, 0);
  addPart(half, resources.cap, resources.capMat, side * HALF_LENGTH * 0.48);
  addPart(half, resources.cap, resources.cutMat, -side * HALF_LENGTH * 0.48);
  half.position.x = side * HALF_LENGTH * 0.5;
  return half;
}

export function createLogObstacle(resources: LogResources): Group {
  const group = new Group();
  group.add(makeHalf(resources, -1), makeHalf(resources, 1));
  group.position.y = -LOG_OBSTACLE.radius * 0.35;
  group.visible = false;
  return group;
}

export function resetLogHalves(root: Group): void {
  const left = root.getObjectByName("logHalfL");
  const right = root.getObjectByName("logHalfR");
  if (left) {
    left.position.set(-HALF_LENGTH * 0.5, 0, 0);
    left.rotation.set(0, 0, 0);
    left.visible = true;
  }
  if (right) {
    right.position.set(HALF_LENGTH * 0.5, 0, 0);
    right.rotation.set(0, 0, 0);
    right.visible = true;
  }
}

/** Splits the log across its middle and flings both halves apart. */
export function splitLogHalves(root: Group, t: number, hitSide: -1 | 1): void {
  const ease = t * t * (3 - 2 * t);
  const split = 0.06 + ease * 2.55;
  const lift = ease * 1.28;
  const left = root.getObjectByName("logHalfL");
  const right = root.getObjectByName("logHalfR");
  const extraL = hitSide < 0 ? 0.55 : 0;
  const extraR = hitSide > 0 ? 0.55 : 0;
  if (left) {
    left.position.set(-HALF_LENGTH * 0.5 - split - extraL * ease, lift, ease * 0.5);
    left.rotation.set(ease * 1.2, ease * 0.65, -ease * 2.4);
  }
  if (right) {
    right.position.set(HALF_LENGTH * 0.5 + split + extraR * ease, lift * 0.9, -ease * 0.42);
    right.rotation.set(-ease * 1.05, -ease * 0.8, ease * 2.25);
  }
}
