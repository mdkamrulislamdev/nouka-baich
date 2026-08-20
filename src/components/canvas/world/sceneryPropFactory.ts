import {
  Box3,
  DoubleSide,
  Group,
  Mesh,
  MeshStandardMaterial,
  Vector3,
  type Material,
} from "three";

import { SCENERY_MODELS } from "@/components/canvas/sceneConfig";
import { patchFoliageAlphaMaterials } from "@/lib/foliageMaterial";
import { cloneGltfScene, enableGltfShadows } from "@/lib/gltf";

const fitBox = new Box3();
const fitSize = new Vector3();
const fitCenter = new Vector3();

function meshMaterials(mesh: Mesh): Material[] {
  if (Array.isArray(mesh.material)) {
    return mesh.material.filter(Boolean) as Material[];
  }
  return mesh.material ? [mesh.material] : [];
}

function materialName(material: Material): string {
  return material.name ?? "";
}

function removeMeshes(root: Group, meshes: Mesh[]): void {
  for (const mesh of meshes) {
    mesh.parent?.remove(mesh);
  }
}

/** Sketchfab tree export includes a giant Object_0 bark bake — that is the brown blob. */
function pruneTreeMeshes(root: Group): void {
  const remove: Mesh[] = [];
  root.traverse((node) => {
    if (!(node instanceof Mesh)) {
      return;
    }

    if (node.name === "Object_0") {
      remove.push(node);
      return;
    }

    const allowed = meshMaterials(node).some((material) =>
      /bark|leaf|branch/i.test(materialName(material)),
    );
    if (!allowed) {
      remove.push(node);
      return;
    }

    fitBox.setFromObject(node);
    fitBox.getSize(fitSize);
    if (Math.max(fitSize.x, fitSize.y, fitSize.z) > 40) {
      remove.push(node);
    }
  });
  removeMeshes(root, remove);
}

/** Grass export has a 2-vertex line primitive (Object_0) — keep only the real tuft mesh. */
function pruneGrassMeshes(root: Group): void {
  const remove: Mesh[] = [];
  root.traverse((node) => {
    if (!(node instanceof Mesh)) {
      return;
    }
    const position = node.geometry?.attributes?.position;
    const vertCount =
      position && typeof position.count === "number" ? position.count : 0;
    if (vertCount < 8 || node.name === "Object_0") {
      remove.push(node);
    }
  });
  removeMeshes(root, remove);
}

function patchGrassMaterials(root: Group): void {
  root.traverse((node) => {
    if (!(node instanceof Mesh)) {
      return;
    }
    for (const material of meshMaterials(node)) {
      if (!(material instanceof MeshStandardMaterial)) {
        continue;
      }
      material.side = DoubleSide;
      material.transparent = false;
      material.depthWrite = true;
      material.alphaTest = 0.42;
      material.opacity = 1;
      if (material.map) {
        material.color.set("#ffffff");
      }
      material.needsUpdate = true;
    }
  });
}

function fitPropToGround(
  wrapper: Group,
  targetHeight: number,
  maxFootprint?: number,
): void {
  const prop = wrapper.children[0] as Group | undefined;
  if (!prop) {
    return;
  }

  prop.updateMatrixWorld(true);
  fitBox.setFromObject(wrapper);
  fitBox.getSize(fitSize);

  let scale = targetHeight / Math.max(fitSize.y, 0.001);
  const footprint = Math.max(fitSize.x, fitSize.z) * scale;
  if (maxFootprint && footprint > maxFootprint) {
    scale = maxFootprint / Math.max(fitSize.x, fitSize.z, 0.001);
  }

  prop.scale.setScalar(scale);
  prop.updateMatrixWorld(true);
  fitBox.setFromObject(wrapper);
  fitBox.getCenter(fitCenter);
  prop.position.x -= fitCenter.x;
  prop.position.y -= fitBox.min.y;
  prop.position.z -= fitCenter.z;
}

function prepareProp(
  source: Group,
  targetHeight: number,
  envIntensity: number,
  options?: {
    maxFootprint?: number;
    beforeFit?: (root: Group) => void;
    afterMaterials?: (root: Group) => void;
  },
): Group {
  const wrapper = new Group();
  const prop = cloneGltfScene(source);
  wrapper.add(prop);

  options?.beforeFit?.(prop);

  enableGltfShadows(wrapper, envIntensity);
  patchFoliageAlphaMaterials(wrapper);
  options?.afterMaterials?.(wrapper);

  fitPropToGround(wrapper, targetHeight, options?.maxFootprint);
  return wrapper;
}

export function prepareTree(source: Group): Group {
  return prepareProp(source, SCENERY_MODELS.tree.targetHeight, 0.82, {
    maxFootprint: SCENERY_MODELS.tree.maxFootprint,
    beforeFit: pruneTreeMeshes,
  });
}

export function prepareHut(source: Group): Group {
  return prepareProp(source, SCENERY_MODELS.hut.targetHeight, 0.78, {
    maxFootprint: SCENERY_MODELS.hut.maxFootprint,
  });
}

export function prepareGrass(source: Group): Group {
  return prepareProp(source, SCENERY_MODELS.grass.targetHeight, 0.72, {
    maxFootprint: SCENERY_MODELS.grass.maxFootprint,
    beforeFit: pruneGrassMeshes,
    afterMaterials: patchGrassMaterials,
  });
}
