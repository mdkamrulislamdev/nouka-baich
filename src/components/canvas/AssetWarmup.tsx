"use client";

import { useProgress } from "@react-three/drei";
import { useEffect, useRef } from "react";

import { useGameStore } from "@/store/useGameStore";

/**
 * Tracks Drei/GLTF loading while the menu is visible so Play can start
 * without a cold compile hitch. Mounted inside the Canvas Suspense tree.
 */
export function AssetWarmup() {
  const { progress, active } = useProgress();
  const setAssetProgress = useGameStore((state) => state.setAssetProgress);
  const setAssetsReady = useGameStore((state) => state.setAssetsReady);
  const readyOnceRef = useRef(false);

  useEffect(() => {
    const pct = Math.round(progress);
    setAssetProgress(pct);

    if (!active && progress >= 100 && !readyOnceRef.current) {
      readyOnceRef.current = true;
      setAssetsReady(true);
    }
  }, [active, progress, setAssetProgress, setAssetsReady]);

  // Fallback: mark ready even if a GLTF stalls / fails so menu is usable.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!readyOnceRef.current) {
        readyOnceRef.current = true;
        setAssetsReady(true);
      }
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [setAssetsReady]);

  return null;
}
