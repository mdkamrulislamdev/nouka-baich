"use client";

import { Suspense, useMemo } from "react";
import { Box3, Group, Vector3 } from "three";

import { RIVERBANK_MODEL, WORLD_SCROLL } from "@/components/canvas/sceneConfig";
import { RiverBank } from "@/components/canvas/world/RiverBank";
import {
  cloneGltfScene,
  enableGltfShadows,
  useGltfModel,
} from "@/lib/gltf";

function fitBankSegment(source: Group, side: -1 | 1): Group {
  const segment = cloneGltfScene(source);
  enableGltfShadows(segment, 0.55);

  segment.updateMatrixWorld(true);
  const box = new Box3().setFromObject(segment);
  const size = box.getSize(new Vector3());
  const scale = RIVERBANK_MODEL.targetWidth / Math.max(size.x, 0.001);
  segment.scale.setScalar(scale);
  segment.updateMatrixWorld(true);

  const fitted = new Box3().setFromObject(segment);
  const center = fitted.getCenter(new Vector3());
  segment.position.x -= center.x;
  segment.position.y -= fitted.min.y;
  segment.position.z -= center.z;

  const riverEdge = WORLD_SCROLL.riverWidth / 2;
  segment.position.x += side * (riverEdge + RIVERBANK_MODEL.outwardOffset);

  return segment;
}

function GltfRiverBankSegment({ side }: { side: -1 | 1 }) {
  const { scene } = useGltfModel(RIVERBANK_MODEL.path);
  const bank = useMemo(() => fitBankSegment(scene, side), [scene, side]);
  return <primitive object={bank} />;
}

type RiverBankMeshProps = {
  side: -1 | 1;
};

export function RiverBankMesh({ side }: RiverBankMeshProps) {
  if (!RIVERBANK_MODEL.enabled) {
    return <RiverBank side={side} />;
  }

  return (
    <Suspense fallback={<RiverBank side={side} />}>
      <GltfRiverBankSegment side={side} />
    </Suspense>
  );
}
