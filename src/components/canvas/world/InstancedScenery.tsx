"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  Box3,
  BufferGeometry,
  Color,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Vector3,
  type Group,
  type Material,
} from "three";

import { SCENERY, SCENERY_MODELS, WORLD_SCROLL } from "@/components/canvas/sceneConfig";
import { patchFoliageAlphaMaterials } from "@/lib/foliageMaterial";
import { isGameplayActive } from "@/lib/gameplay";
import { cloneGltfScene, enableGltfShadows, useGltfModel } from "@/lib/gltf";
import { recycleZPosition, seededRandom } from "@/lib/mathUtils";
import { useGameStore } from "@/store/useGameStore";

const { segmentCount, segmentLength, recycleZ, riverWidth } = WORLD_SCROLL;
const WORLD_LENGTH = segmentCount * segmentLength;
const RIVER_EDGE = riverWidth / 2;

const dummy = new Object3D();
const IDENTITY = new Matrix4();

type ScenerySlot = {
  x: number;
  y: number;
  z: number;
  rotY: number;
  scale: number;
  pitch: number;
};

function placeOnBank(
  slot: ScenerySlot,
  seed: number,
  minOut: number,
  span: number,
  y: number,
  scaleMin: number,
  scaleSpan: number,
  z: number,
): void {
  const side: -1 | 1 = seededRandom(seed * 3.1) < 0.5 ? -1 : 1;
  const outward = minOut + seededRandom(seed * 5.7) * span;
  slot.x = side * (RIVER_EDGE + outward);
  slot.y = y;
  slot.z = z;
  slot.rotY = seededRandom(seed * 9.1) * Math.PI * 2;
  slot.scale = scaleMin + seededRandom(seed * 4.4) * scaleSpan;
  slot.pitch = (seededRandom(seed * 7.3) - 0.5) * 0.12;
}

function placeGrassOnBank(slot: ScenerySlot, seed: number, z: number): void {
  placeOnBank(slot, seed, 0.35, 4.8, 0.02, 0.75, 0.55, z);
  slot.pitch = (seededRandom(seed * 2.7) - 0.5) * 0.2;
}

function createSlots(
  count: number,
  startSeed: number,
  minOut: number,
  span: number,
  y: number,
  scaleMin: number,
  scaleSpan: number,
): ScenerySlot[] {
  const slots: ScenerySlot[] = [];
  for (let index = 0; index < count; index += 1) {
    const slot: ScenerySlot = {
      x: 0,
      y: 0,
      z: 0,
      rotY: 0,
      scale: 1,
      pitch: 0,
    };
    const z =
      recycleZ - 8 - (index / Math.max(count - 1, 1)) * (WORLD_LENGTH - 16);
    placeOnBank(slot, startSeed + index, minOut, span, y, scaleMin, scaleSpan, z);
    slots.push(slot);
  }
  return slots;
}

function writePart(
  mesh: InstancedMesh,
  index: number,
  slot: ScenerySlot,
): void {
  dummy.position.set(slot.x, slot.y, slot.z);
  dummy.rotation.set(slot.pitch, slot.rotY, 0);
  dummy.scale.setScalar(slot.scale);
  dummy.updateMatrix();
  mesh.setMatrixAt(index, dummy.matrix);
}

function commitInstances(mesh: InstancedMesh | null): void {
  if (!mesh) {
    return;
  }
  mesh.instanceMatrix.needsUpdate = true;
}

function scrollSlots(
  slots: ScenerySlot[],
  dz: number,
  startSeed: number,
  place: (slot: ScenerySlot, seed: number, z: number) => void,
): void {
  for (let index = 0; index < slots.length; index += 1) {
    const slot = slots[index];
    slot.z += dz;
    if (slot.z > recycleZ) {
      const nextZ = recycleZPosition(slot.z, WORLD_LENGTH);
      place(slot, startSeed + index + Math.floor(nextZ), nextZ);
    }
  }
}

type PreparedPart = {
  geometry: BufferGeometry;
  material: MeshStandardMaterial;
  localMatrix: Matrix4;
};

const box = new Box3();
const size = new Vector3();
const center = new Vector3();

function gatherMeshes(source: Group): Mesh[] {
  const meshes: Mesh[] = [];
  source.traverse((node) => {
    if (node instanceof Mesh && node.geometry) {
      meshes.push(node);
    }
  });
  return meshes;
}

function getTriangleCount(mesh: Mesh): number {
  const position = mesh.geometry?.attributes?.position;
  if (!position || typeof position.count !== "number") {
    return 0;
  }
  const indexCount = mesh.geometry.index?.count ?? position.count;
  return Math.floor(indexCount / 3);
}

function stripMorphData(root: Group): void {
  root.traverse((node) => {
    if (!(node instanceof Mesh) || !node.geometry) {
      return;
    }
    node.geometry.morphAttributes = {};
    node.geometry.morphTargetsRelative = false;
    node.morphTargetInfluences = [];
    node.morphTargetDictionary = {};
  });
}

function toStandardMaterial(material: Material | null | undefined): MeshStandardMaterial {
  if (material instanceof MeshStandardMaterial) {
    const next = material.clone();
    next.transparent = false;
    next.depthWrite = true;
    next.opacity = 1;
    next.needsUpdate = true;
    return next;
  }

  const color =
    material && "color" in material && material.color instanceof Color
      ? material.color.clone()
      : new Color("#5a7a3a");
  const map =
    material && "map" in material
      ? (material.map as MeshStandardMaterial["map"])
      : null;

  return new MeshStandardMaterial({
    color: map ? "#ffffff" : color,
    map: map ?? undefined,
    roughness: 0.82,
    metalness: 0.04,
    transparent: false,
    depthWrite: true,
    alphaTest:
      material && "alphaTest" in material && typeof material.alphaTest === "number"
        ? material.alphaTest
        : 0,
  });
}

function meshNameMatches(mesh: Mesh, patterns?: readonly string[]): boolean {
  if (!patterns?.length) {
    return true;
  }
  const haystack = `${mesh.name} ${mesh.parent?.name ?? ""}`;
  return patterns.some((pattern) => haystack.includes(pattern));
}

/**
 * Fit the entire GLTF as one prop (same scale for every mesh part), then
 * extract top meshes for InstancedMesh. Morph extents are stripped first so
 * Sketchfab animation bakes do not inflate the bounding box.
 */
function prepareInstancedParts(
  scene: Group,
  targetHeight: number,
  count: number,
  options?: {
    maxFootprint?: number;
    meshPatterns?: readonly string[];
  },
): PreparedPart[] {
  try {
    const cloned = cloneGltfScene(scene);
    stripMorphData(cloned);
    enableGltfShadows(cloned, 0.68);
    patchFoliageAlphaMaterials(cloned);
    cloned.updateMatrixWorld(true);

    box.setFromObject(cloned);
    if (box.isEmpty()) {
      return [];
    }
    box.getSize(size);

    let uniformScale = targetHeight / Math.max(size.y, 0.001);
    if (options?.maxFootprint) {
      const footprint = Math.max(size.x, size.z) * uniformScale;
      if (footprint > options.maxFootprint) {
        uniformScale =
          options.maxFootprint / Math.max(size.x, size.z, 0.001);
      }
    }

    box.getCenter(center);
    const groundY = box.min.y;
    const shiftX = -center.x;
    const shiftY = -groundY;
    const shiftZ = -center.z;

    const meshes = gatherMeshes(cloned)
      .filter((mesh) => getTriangleCount(mesh) > 12)
      .filter((mesh) => meshNameMatches(mesh, options?.meshPatterns))
      .sort((a, b) => getTriangleCount(b) - getTriangleCount(a))
      .slice(0, count);

    const parts: PreparedPart[] = [];
    for (const mesh of meshes) {
      const sourceMaterial = Array.isArray(mesh.material)
        ? mesh.material[0]
        : mesh.material;
      if (!mesh.geometry?.attributes?.position) {
        continue;
      }

      const geometry = mesh.geometry.clone();
      geometry.morphAttributes = {};
      geometry.morphTargetsRelative = false;
      geometry.applyMatrix4(mesh.matrixWorld);
      geometry.scale(uniformScale, uniformScale, uniformScale);
      geometry.translate(
        shiftX * uniformScale,
        shiftY * uniformScale,
        shiftZ * uniformScale,
      );

      parts.push({
        geometry,
        material: toStandardMaterial(sourceMaterial),
        localMatrix: IDENTITY,
      });
    }
    return parts;
  } catch (error) {
    console.warn("[InstancedScenery] failed to prepare parts", error);
    return [];
  }
}

export function InstancedScenery() {
  const treeRefs = useRef<Array<InstancedMesh | null>>([null, null, null]);
  const hutRefs = useRef<Array<InstancedMesh | null>>([null, null, null, null]);
  const grassRef = useRef<InstancedMesh>(null);

  const { scene: treeScene } = useGltfModel(SCENERY_MODELS.tree.path);
  const { scene: hutScene } = useGltfModel(SCENERY_MODELS.hut.path);
  const { scene: grassScene } = useGltfModel(SCENERY_MODELS.grass.path);

  const treeParts = useMemo(
    () =>
      prepareInstancedParts(treeScene, SCENERY_MODELS.tree.targetHeight, 3, {
        maxFootprint: SCENERY_MODELS.tree.maxFootprint,
        meshPatterns: SCENERY_MODELS.tree.meshPatterns,
      }),
    [treeScene],
  );
  const hutParts = useMemo(
    () =>
      prepareInstancedParts(hutScene, SCENERY_MODELS.hut.targetHeight, 4, {
        maxFootprint: SCENERY_MODELS.hut.maxFootprint,
      }),
    [hutScene],
  );
  const grassParts = useMemo(
    () =>
      prepareInstancedParts(grassScene, SCENERY_MODELS.grass.targetHeight, 1, {
        maxFootprint: SCENERY_MODELS.grass.maxFootprint,
      }),
    [grassScene],
  );

  // Dense near-bank placement so horizon is filled with props.
  const trees = useMemo(
    () => createSlots(SCENERY.treeCount, 0, 1.6, 4.2, 0.02, 0.85, 0.35),
    [],
  );
  const huts = useMemo(
    () => createSlots(SCENERY.hutCount, 200, 3.2, 3.4, 0.02, 0.9, 0.25),
    [],
  );
  const grassSlots = useMemo(
    () => createSlots(SCENERY.grassCount, 400, 0.35, 4.8, 0.02, 0.75, 0.55),
    [],
  );
  const instancesCommittedRef = useRef(false);

  useFrame((_, delta) => {
    const state = useGameStore.getState();
    if (isGameplayActive(state)) {
      instancesCommittedRef.current = false;
      const dz = state.speed * Math.min(delta, 0.05);
      scrollSlots(trees, dz, 0, (slot, seed, z) => {
        placeOnBank(slot, seed, 1.6, 4.2, 0.02, 0.85, 0.35, z);
      });
      scrollSlots(huts, dz, 200, (slot, seed, z) => {
        placeOnBank(slot, seed, 3.2, 3.4, 0.02, 0.9, 0.25, z);
      });
      scrollSlots(grassSlots, dz, 400, (slot, seed, z) => {
        placeGrassOnBank(slot, seed, z);
      });
    } else if (instancesCommittedRef.current) {
      return;
    }

    const nearZ = SCENERY_MODELS.cull.nearZ;
    const farZ = SCENERY_MODELS.cull.farZ;

    for (let partIndex = 0; partIndex < treeParts.length; partIndex += 1) {
      const mesh = treeRefs.current[partIndex];
      if (!mesh) {
        continue;
      }
      let visibleCount = 0;
      for (let index = 0; index < trees.length; index += 1) {
        const slot = trees[index];
        if (slot.z < nearZ || slot.z > farZ) {
          continue;
        }
        writePart(mesh, visibleCount, slot);
        visibleCount += 1;
      }
      mesh.count = visibleCount;
      commitInstances(mesh);
    }

    for (let partIndex = 0; partIndex < hutParts.length; partIndex += 1) {
      const mesh = hutRefs.current[partIndex];
      if (!mesh) {
        continue;
      }
      let visibleCount = 0;
      for (let index = 0; index < huts.length; index += 1) {
        const slot = huts[index];
        if (slot.z < nearZ || slot.z > farZ) {
          continue;
        }
        writePart(mesh, visibleCount, slot);
        visibleCount += 1;
      }
      mesh.count = visibleCount;
      commitInstances(mesh);
    }

    const grass = grassRef.current;
    if (grass && grassParts[0]) {
      let visibleCount = 0;
      for (let index = 0; index < grassSlots.length; index += 1) {
        const slot = grassSlots[index];
        if (slot.z < nearZ || slot.z > farZ) {
          continue;
        }
        writePart(grass, visibleCount, slot);
        visibleCount += 1;
      }
      grass.count = visibleCount;
      commitInstances(grass);
    }

    instancesCommittedRef.current = true;
  });

  return (
    <group>
      {treeParts.map((part, index) => (
        <instancedMesh
          key={`tree-part-${index}`}
          ref={(node) => {
            treeRefs.current[index] = node;
          }}
          args={[part.geometry, part.material, SCENERY.treeCount]}
          castShadow
          receiveShadow
          frustumCulled={false}
        />
      ))}
      {hutParts.map((part, index) => (
        <instancedMesh
          key={`hut-part-${index}`}
          ref={(node) => {
            hutRefs.current[index] = node;
          }}
          args={[part.geometry, part.material, SCENERY.hutCount]}
          castShadow
          receiveShadow
          frustumCulled={false}
        />
      ))}
      {grassParts[0] ? (
        <instancedMesh
          ref={grassRef}
          args={[
            grassParts[0].geometry,
            grassParts[0].material,
            SCENERY.grassCount,
          ]}
          castShadow
          receiveShadow
          frustumCulled={false}
        />
      ) : null}
    </group>
  );
}
