"use client";

import { EffectComposer } from "@react-three/postprocessing";

export function ScenePostProcessing() {
  return <EffectComposer multisampling={0} />;
}
