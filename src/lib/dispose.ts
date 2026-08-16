import {
  Material,
  Mesh,
  Object3D,
  Texture,
  type ShaderMaterial,
} from "three";
import type { Water } from "three-stdlib";

const MATERIAL_MAP_KEYS = [
  "map",
  "lightMap",
  "aoMap",
  "emissiveMap",
  "bumpMap",
  "normalMap",
  "displacementMap",
  "roughnessMap",
  "metalnessMap",
  "alphaMap",
  "envMap",
  "specularMap",
] as const;

export function disposeTexture(value: unknown): void {
  if (value instanceof Texture) {
    value.dispose();
  }
}

export function disposeMaterial(material: Material): void {
  const maps = material as Material & Record<string, unknown>;
  for (const key of MATERIAL_MAP_KEYS) {
    disposeTexture(maps[key]);
  }

  if ("uniforms" in material) {
    const uniforms = (material as ShaderMaterial).uniforms;
    if (uniforms) {
      for (const uniform of Object.values(uniforms)) {
        disposeTexture(uniform?.value);
      }
    }
  }

  material.dispose();
}

export function detachObject(object: Object3D): void {
  object.removeFromParent();
}

/**
 * Dispose geometries and materials owned by this graph.
 * Do not call on GLTF clones — those share GPU resources with `useGLTF`.
 */
export function disposeOwnedObject(object: Object3D): void {
  object.traverse((child) => {
    if (!(child instanceof Mesh)) {
      return;
    }

    child.geometry?.dispose();
    const material = child.material;
    if (Array.isArray(material)) {
      material.forEach(disposeMaterial);
    } else if (material) {
      disposeMaterial(material);
    }
  });
  detachObject(object);
}

export function disposeWater(water: Water): void {
  water.onBeforeRender = () => undefined;
  water.onAfterRender = () => undefined;
  water.geometry.dispose();
  const material = water.material;
  if (Array.isArray(material)) {
    material.forEach(disposeMaterial);
  } else {
    disposeMaterial(material);
  }
}
