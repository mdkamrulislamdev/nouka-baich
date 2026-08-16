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

import { PALM_MODEL } from "@/components/canvas/sceneConfig";

function enableShadows(object: Object3D) {
  object.traverse((child) => {
    if (!(child instanceof Mesh)) {
      return;
    }

    child.castShadow = true;
    child.receiveShadow = true;

    if (child.material instanceof MeshStandardMaterial) {
      child.material.envMapIntensity = 0.85;
    }
  });
}

function preparePalm(source: Group): Group {
  const wrapper = new Group();
  const palm = source.clone(true);
  wrapper.add(palm);
  enableShadows(wrapper);

  wrapper.updateMatrixWorld(true);
  const box = new Box3().setFromObject(wrapper);
  const size = box.getSize(new Vector3());
  palm.scale.setScalar(PALM_MODEL.targetHeight / Math.max(size.y, 0.001));

  wrapper.updateMatrixWorld(true);
  const fitted = new Box3().setFromObject(wrapper);
  const center = fitted.getCenter(new Vector3());
  palm.position.x -= center.x;
  palm.position.y -= fitted.min.y;
  palm.position.z -= center.z;

  return wrapper;
}

type PalmPropProps = {
  scale?: number;
};

export function PalmProp({ scale = 1 }: PalmPropProps) {
  const { scene } = useGLTF(PALM_MODEL.path);
  const palm = useMemo(() => preparePalm(scene), [scene]);

  return <primitive object={palm} scale={scale} />;
}

useGLTF.preload(PALM_MODEL.path);
