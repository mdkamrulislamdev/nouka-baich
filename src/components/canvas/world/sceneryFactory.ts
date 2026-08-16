import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshStandardMaterial,
  type BufferGeometry,
} from "three";

export type SceneryKind = "tree" | "palm" | "hut" | "grass";

export const TREE_LOCAL = {
  trunk: [0, 0.7, 0],
  crown: [0, 2.05, 0],
  top: [0, 3.15, 0],
  bush: [0.45, 0.32, 0.2],
} as const;

export const HUT_LOCAL = {
  wall: [0, 0.58, 0],
  roof: [0, 1.38, 0],
  door: [0, 0.36, 0.79],
  roofRotationY: Math.PI / 4,
} as const;

export type SceneryResources = {
  treeTrunk: BufferGeometry;
  treeCrown: BufferGeometry;
  treeTop: BufferGeometry;
  bush: BufferGeometry;
  hutWall: BufferGeometry;
  hutRoof: BufferGeometry;
  hutDoor: BufferGeometry;
  trunkMat: MeshStandardMaterial;
  crownMat: MeshStandardMaterial;
  topMat: MeshStandardMaterial;
  bushMat: MeshStandardMaterial;
  wallMat: MeshStandardMaterial;
  roofMat: MeshStandardMaterial;
  doorMat: MeshStandardMaterial;
};

export function createSceneryResources(): SceneryResources {
  return {
    treeTrunk: new CylinderGeometry(0.11, 0.18, 1.4, 5),
    treeCrown: new ConeGeometry(1.15, 2.15, 6),
    treeTop: new ConeGeometry(0.78, 1.45, 6),
    bush: new IcosahedronGeometry(0.42, 0),
    hutWall: new BoxGeometry(1.9, 1.15, 1.5),
    hutRoof: new ConeGeometry(1.55, 0.95, 4),
    hutDoor: new BoxGeometry(0.38, 0.72, 0.08),
    trunkMat: new MeshStandardMaterial({
      color: "#5c3a22",
      roughness: 0.88,
      metalness: 0.02,
    }),
    crownMat: new MeshStandardMaterial({
      color: "#2d6a33",
      roughness: 0.78,
      metalness: 0.03,
    }),
    topMat: new MeshStandardMaterial({
      color: "#3d8c42",
      roughness: 0.74,
      metalness: 0.03,
    }),
    bushMat: new MeshStandardMaterial({
      color: "#3a7a38",
      roughness: 0.82,
      metalness: 0.02,
    }),
    wallMat: new MeshStandardMaterial({
      color: "#c9b07a",
      roughness: 0.86,
      metalness: 0.04,
    }),
    roofMat: new MeshStandardMaterial({
      color: "#8a4e24",
      roughness: 0.9,
      metalness: 0.02,
    }),
    doorMat: new MeshStandardMaterial({
      color: "#3d2a18",
      roughness: 0.8,
      metalness: 0.05,
    }),
  };
}

export function disposeSceneryResources(resources: SceneryResources): void {
  resources.treeTrunk.dispose();
  resources.treeCrown.dispose();
  resources.treeTop.dispose();
  resources.bush.dispose();
  resources.hutWall.dispose();
  resources.hutRoof.dispose();
  resources.hutDoor.dispose();
  resources.trunkMat.dispose();
  resources.crownMat.dispose();
  resources.topMat.dispose();
  resources.bushMat.dispose();
  resources.wallMat.dispose();
  resources.roofMat.dispose();
  resources.doorMat.dispose();
}

function addMesh(
  group: Group,
  geometry: BufferGeometry,
  material: MeshStandardMaterial,
  x: number,
  y: number,
  z: number,
): void {
  const mesh = new Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
}

export function createTreeProp(resources: SceneryResources): Group {
  const group = new Group();
  addMesh(
    group,
    resources.treeTrunk,
    resources.trunkMat,
    TREE_LOCAL.trunk[0],
    TREE_LOCAL.trunk[1],
    TREE_LOCAL.trunk[2],
  );
  addMesh(
    group,
    resources.treeCrown,
    resources.crownMat,
    TREE_LOCAL.crown[0],
    TREE_LOCAL.crown[1],
    TREE_LOCAL.crown[2],
  );
  addMesh(
    group,
    resources.treeTop,
    resources.topMat,
    TREE_LOCAL.top[0],
    TREE_LOCAL.top[1],
    TREE_LOCAL.top[2],
  );
  addMesh(
    group,
    resources.bush,
    resources.bushMat,
    TREE_LOCAL.bush[0],
    TREE_LOCAL.bush[1],
    TREE_LOCAL.bush[2],
  );
  return group;
}

export function createHutProp(resources: SceneryResources): Group {
  const group = new Group();
  addMesh(
    group,
    resources.hutWall,
    resources.wallMat,
    HUT_LOCAL.wall[0],
    HUT_LOCAL.wall[1],
    HUT_LOCAL.wall[2],
  );

  const roof = new Mesh(resources.hutRoof, resources.roofMat);
  roof.position.set(HUT_LOCAL.roof[0], HUT_LOCAL.roof[1], HUT_LOCAL.roof[2]);
  roof.rotation.y = HUT_LOCAL.roofRotationY;
  roof.castShadow = true;
  roof.receiveShadow = true;
  group.add(roof);

  addMesh(
    group,
    resources.hutDoor,
    resources.doorMat,
    HUT_LOCAL.door[0],
    HUT_LOCAL.door[1],
    HUT_LOCAL.door[2],
  );
  return group;
}
