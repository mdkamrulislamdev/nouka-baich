"use client";

import { useGLTF } from "@react-three/drei";
import {
  Mesh,
  MeshStandardMaterial,
  type Group,
  type Object3D,
} from "three";

import {
  BOAT_MODEL,
  PALM_MODEL,
  ROCK_MODEL,
} from "@/components/canvas/sceneConfig";

export const GLTF_ASSET_PATHS = [
  BOAT_MODEL.path,
  PALM_MODEL.path,
  ROCK_MODEL.path,
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

export function enableGltfShadows(
  object: Object3D,
  envMapIntensity = 1,
): void {
  object.traverse((child) => {
    if (!(child instanceof Mesh)) {
      return;
    }

    child.castShadow = true;
    child.receiveShadow = true;

    if (child.material instanceof MeshStandardMaterial) {
      child.material.envMapIntensity = envMapIntensity;
    }
  });
}

export function cloneGltfScene(source: Group): Group {
  return source.clone(true);
}

preloadGameGltfAssets();
