"use client";

import { useProgress } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { WebGLRenderer } from "three";

import { useGameStore } from "@/store/useGameStore";

const SETTLE_FRAMES = 10;
const READY_TIMEOUT_MS = 28000;

function compileScene(
  gl: WebGLRenderer,
  scene: Parameters<WebGLRenderer["compile"]>[0],
  camera: Parameters<WebGLRenderer["compile"]>[1],
): void {
  try {
    gl.compile(scene, camera);
  } catch {
    // Compile is best-effort; Play still waits for load progress.
  }
}

/**
 * Locks Play until GLTF/HDR finish and shaders have compiled on the menu,
 * so the first racing frame is sharp and hitch-free.
 */
export function AssetWarmup() {
  const { progress, active } = useProgress();
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const setAssetProgress = useGameStore((state) => state.setAssetProgress);
  const setAssetsReady = useGameStore((state) => state.setAssetsReady);
  const readyOnceRef = useRef(false);
  const compiledRef = useRef(false);
  const settleFramesRef = useRef(0);

  useEffect(() => {
    if (readyOnceRef.current) {
      return;
    }
    setAssetProgress(Math.min(99, Math.round(progress)));
  }, [progress, setAssetProgress]);

  useFrame(() => {
    if (readyOnceRef.current) {
      return;
    }

    const loaded = !active && progress >= 100;
    if (!loaded) {
      compiledRef.current = false;
      settleFramesRef.current = 0;
      return;
    }

    if (!compiledRef.current) {
      compileScene(gl, scene, camera);
      compiledRef.current = true;
      settleFramesRef.current = 0;
      return;
    }

    settleFramesRef.current += 1;
    if (settleFramesRef.current < SETTLE_FRAMES) {
      return;
    }

    readyOnceRef.current = true;
    setAssetProgress(100);
    setAssetsReady(true);
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (readyOnceRef.current) {
        return;
      }
      compileScene(gl, scene, camera);
      readyOnceRef.current = true;
      setAssetProgress(100);
      setAssetsReady(true);
    }, READY_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [camera, gl, scene, setAssetProgress, setAssetsReady]);

  return null;
}
