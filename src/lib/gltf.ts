"use client";

import { useGLTF } from "@react-three/drei";
import {
  DoubleSide,
  Mesh,
  MeshStandardMaterial,
  type Group,
  type Material,
  type Object3D,
} from "three";
import { clone as cloneSkinned } from "three/addons/utils/SkeletonUtils.js";

import {
  BOAT_MODEL,
  PALM_MODEL,
  ROCK_MODEL,
  SCENERY_MODELS,
} from "@/components/canvas/sceneConfig";

export const GLTF_ASSET_PATHS = [
  BOAT_MODEL.path,
  PALM_MODEL.path,
  ROCK_MODEL.path,
  SCENERY_MODELS.tree.path,
  SCENERY_MODELS.hut.path,
  SCENERY_MODELS.grass.path,
  SCENERY_MODELS.rower.path,
] as const;

export function useGltfModel(path: string) {
  return useGLTF(path);
}

export function preloadGltf(path: string): void {
  useGLTF.preload(path);
}

export function preloadGameGltfAssets(): void {
  for (const path of GLTF_ASSET_PATHS) {
    preloadGltf(path);
  }
}

function sanitizeMaterial(
  material: Material,
  envMapIntensity: number,
): void {
  material.visible = true;
  material.side = DoubleSide;
  material.transparent = false;
  material.opacity = 1;
  material.depthWrite = true;

  if (material instanceof MeshStandardMaterial) {
    material.envMapIntensity = envMapIntensity;
    material.metalness = Math.min(material.metalness, 0.12);
    material.roughness = Math.max(material.roughness, 0.35);
    // Preserve textured albedo; only tint untextured meshes.
    if (material.map) {
      material.color.set("#ffffff");
    } else {
      material.color.set("#6b3f22");
    }
    material.needsUpdate = true;
  }
}

export function enableGltfShadows(
  object: Object3D,
  envMapIntensity = 1,
): void {
  object.traverse((child) => {
    if (!(child instanceof Mesh)) {
      return;
    }

    child.visible = true;
    child.castShadow = true;
    child.receiveShadow = true;
    child.frustumCulled = false;

    if (Array.isArray(child.material)) {
      child.material.forEach((material) => {
        sanitizeMaterial(material, envMapIntensity);
      });
    } else if (child.material) {
      sanitizeMaterial(child.material, envMapIntensity);
    }
  });
}

export function cloneGltfScene(source: Group): Group {
  return cloneSkinned(source) as Group;
}

preloadGameGltfAssets();
