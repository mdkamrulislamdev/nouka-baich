"use client";

import {
  Bloom,
  DepthOfField,
  EffectComposer,
  Vignette,
} from "@react-three/postprocessing";
import { useMemo } from "react";
import { Vector3 } from "three";

import { CAMERA } from "@/components/canvas/sceneConfig";

type ScenePostProcessingProps = {
  enabled: boolean;
};

export function ScenePostProcessing({ enabled }: ScenePostProcessingProps) {
  const focusTarget = useMemo(
    () => new Vector3(CAMERA.lookAt[0], CAMERA.lookAt[1], CAMERA.lookAt[2]),
    [],
  );

  if (!enabled) {
    return null;
  }

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <DepthOfField
        target={focusTarget}
        focusRange={7.5}
        focalLength={0.012}
        bokehScale={1.1}
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
