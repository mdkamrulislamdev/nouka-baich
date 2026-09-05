"use client";

import { useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";

import { useGameStore } from "@/store/useGameStore";

/**
 * High-graphics pass only. Depth of field is omitted so the river stays
 * sharp from the first frame instead of opening soft-focused.
 */
export function ScenePostProcessing() {
  const gl = useThree((state) => state.gl);
  const graphicsQuality = useGameStore((state) => state.graphicsQuality);
  const adaptiveLow = useGameStore((state) => state.adaptiveLow);

  if (graphicsQuality !== "high") {
    return null;
  }

  if (!gl.getContextAttributes()) {
    return null;
  }

  const bloomIntensity = adaptiveLow ? 0.1 : 0.28;

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={0.78}
        luminanceSmoothing={0.28}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.28} darkness={adaptiveLow ? 0.28 : 0.42} />
    </EffectComposer>
  );
}
