"use client";

import { Bloom, EffectComposer } from "@react-three/postprocessing";

export function ScenePostProcessing() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.45}
        luminanceThreshold={0.72}
        luminanceSmoothing={0.35}
        mipmapBlur
      />
    </EffectComposer>
  );
}
