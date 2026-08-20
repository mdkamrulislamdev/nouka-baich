import {
  ClampToEdgeWrapping,
  LinearFilter,
  Mesh,
  MeshStandardMaterial,
  type Material,
  type Object3D,
  type Texture,
} from "three";

export const FOLIAGE_ALPHA_TEST = 0.5;

const FOLIAGE_NAME_PATTERN = /leave|leaf|foliage|palm|frond/i;

function patchTextureSampling(texture: Texture): void {
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
}

function isFoliageMaterial(
  material: Material,
  meshName: string,
): material is MeshStandardMaterial {
  if (!(material instanceof MeshStandardMaterial)) {
    return false;
  }

  if (material.name === "lambert1") {
    return true;
  }

  if (FOLIAGE_NAME_PATTERN.test(meshName)) {
    return true;
  }

  return material.map !== null && material.opacity < 1;
}

function patchFoliageMaterial(material: MeshStandardMaterial): void {
  if (material.map) {
    patchTextureSampling(material.map);
  }
  if (material.alphaMap) {
    patchTextureSampling(material.alphaMap);
  }

  material.transparent = false;
  material.depthWrite = true;
  material.alphaTest = FOLIAGE_ALPHA_TEST;
  material.opacity = 1;
  material.needsUpdate = true;
}

export function patchFoliageAlphaMaterials(root: Object3D): void {
  root.traverse((child) => {
    if (!(child instanceof Mesh)) {
      return;
    }

    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    for (const material of materials) {
      if (!isFoliageMaterial(material, child.name)) {
        continue;
      }
      patchFoliageMaterial(material);
    }
  });
}
