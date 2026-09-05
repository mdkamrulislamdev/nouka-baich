"use client";

import { useThree } from "@react-three/fiber";
import {
  Bloom,
  DepthOfField,
  EffectComposer,
  Vignette,
} from "@react-three/postprocessing";

import { CAMERA } from "@/components/canvas/sceneConfig";
import { useGameStore } from "@/store/useGameStore";

/**
 * Mount once for the user's High graphics setting.
 * Adaptive-low only dims effects — never unmounts (unmount froze the boat ~8s).
 */
export function ScenePostProcessing() {
  const gl = useThree((state) => state.gl);
  const graphicsQuality = useGameStore((state) => state.graphicsQuality);
  const adaptiveLow = useGameStore((state) => state.adaptiveLow);

  if (graphicsQuality !== "high") {
    return null;
  }

  // Lost GPU context: getContextAttributes() is null and EffectComposer throws.
  if (!gl.getContextAttributes()) {
    return null;
  }

  const bloomIntensity = adaptiveLow ? 0.12 : 0.45;
  const dofScale = adaptiveLow ? 0.35 : 1.1;

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <DepthOfField
        target={CAMERA.focus}
        focusRange={7.5}
        focalLength={0.012}
        bokehScale={dofScale}
      />
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={0.72}
        luminanceSmoothing={0.35}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.22} darkness={adaptiveLow ? 0.35 : 0.55} />
    </EffectComposer>
  );
}
