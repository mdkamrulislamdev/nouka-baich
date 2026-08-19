"use client";

import {
  Bloom,
  DepthOfField,
  EffectComposer,
  Vignette,
} from "@react-three/postprocessing";

import { CAMERA } from "@/components/canvas/sceneConfig";

type ScenePostProcessingProps = {
  enabled: boolean;
};

export function ScenePostProcessing({ enabled }: ScenePostProcessingProps) {
  if (!enabled) {
    return null;
  }

  return (
    <EffectComposer multisampling={0}>
      <DepthOfField
        target={CAMERA.lookAt}
        focusDistance={0.02}
        focalLength={0.024}
        bokehScale={2.4}
        height={480}
      />
      <Bloom
        intensity={0.45}
        luminanceThreshold={0.72}
        luminanceSmoothing={0.35}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.22} darkness={0.55} />
    </EffectComposer>
  );
}
