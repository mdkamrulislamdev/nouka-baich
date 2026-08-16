"use client";

import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import {
  Box3,
  Group,
  Mesh,
  MeshStandardMaterial,
  Vector3,
  type Object3D,
} from "three";

import { BOAT_MODEL, BOAT_SPAWN } from "@/components/canvas/sceneConfig";

function enableBoatShadows(object: Object3D) {
  object.traverse((child) => {
    if (!(child instanceof Mesh)) {
      return;
    }

    child.castShadow = true;
    child.receiveShadow = true;

    if (child.material instanceof MeshStandardMaterial) {
      child.material.envMapIntensity = 1.1;
    }
  });
}

function prepareBoatScene(source: Group): Group {
  const wrapper = new Group();
  const boat = source.clone(true);
  wrapper.add(boat);
  enableBoatShadows(wrapper);

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
  const { scene } = useGLTF(BOAT_MODEL.path);
  const boat = useMemo(() => prepareBoatScene(scene), [scene]);

  return <primitive object={boat} position={BOAT_SPAWN} />;
}

useGLTF.preload(BOAT_MODEL.path);
