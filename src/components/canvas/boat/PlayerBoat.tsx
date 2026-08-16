"use client";

import { useMemo } from "react";
import { Box3, Group, Vector3 } from "three";

import { BOAT_MODEL } from "@/components/canvas/sceneConfig";
import {
  cloneGltfScene,
  enableGltfShadows,
  useGltfModel,
} from "@/lib/gltf";

function prepareBoatScene(source: Group): Group {
  const wrapper = new Group();
  const boat = cloneGltfScene(source);
  wrapper.add(boat);
  enableGltfShadows(wrapper, 1.1);

  wrapper.updateMatrixWorld(true);
  let box = new Box3().setFromObject(wrapper);
  let size = box.getSize(new Vector3());

  if (size.x > size.z) {
    boat.rotation.y = Math.PI / 2;
    wrapper.updateMatrixWorld(true);
    box = new Box3().setFromObject(wrapper);
    size = box.getSize(new Vector3());
  }

  const scale = BOAT_MODEL.targetLength / Math.max(size.z, 0.001);
  boat.scale.setScalar(scale);
  wrapper.updateMatrixWorld(true);
  box = new Box3().setFromObject(wrapper);

  const center = box.getCenter(new Vector3());
  boat.position.x -= center.x;
  boat.position.y -= box.min.y;
  boat.position.z -= center.z;

  return wrapper;
}

export function PlayerBoat() {
  const { scene } = useGltfModel(BOAT_MODEL.path);
  const boat = useMemo(() => prepareBoatScene(scene), [scene]);

  return <primitive object={boat} />;
}
