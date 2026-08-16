import {
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  type BufferGeometry,
} from "three";

export type MarkerResources = {
  pole: BufferGeometry;
  float: BufferGeometry;
  poleMat: MeshStandardMaterial;
  floatMat: MeshStandardMaterial;
};

export const MARKER_EXTENTS = {
  halfX: 0.42,
  halfY: 0.95,
  halfZ: 0.42,
} as const;

export function createMarkerResources(): MarkerResources {
  return {
    pole: new CylinderGeometry(0.07, 0.1, 1.65, 6),
    float: new SphereGeometry(0.28, 8, 6),
    poleMat: new MeshStandardMaterial({
      color: "#c45c2c",
      roughness: 0.72,
      metalness: 0.08,
    }),
    floatMat: new MeshStandardMaterial({
      color: "#e2b34a",
      roughness: 0.48,
      metalness: 0.12,
      envMapIntensity: 0.7,
    }),
  };
}

export function disposeMarkerResources(resources: MarkerResources): void {
  resources.pole.dispose();
  resources.float.dispose();
  resources.poleMat.dispose();
  resources.floatMat.dispose();
}

export function createMarkerObstacle(resources: MarkerResources): Group {
  const group = new Group();

  const floatMesh = new Mesh(resources.float, resources.floatMat);
  floatMesh.position.y = 0.12;
  floatMesh.castShadow = true;
  floatMesh.receiveShadow = true;
  group.add(floatMesh);

  const pole = new Mesh(resources.pole, resources.poleMat);
  pole.position.y = 0.72;
  pole.castShadow = true;
  pole.receiveShadow = true;
  group.add(pole);

  group.visible = false;
  return group;
}
