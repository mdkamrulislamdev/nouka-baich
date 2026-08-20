"use client";

import { useEffect, useMemo } from "react";
import { Box3, Group, Mesh, Vector3, type Material } from "three";

import { BOAT_MODEL } from "@/components/canvas/sceneConfig";
import { LongboatSeats } from "@/components/canvas/boat/LongboatSeats";
import { OarRig } from "@/components/canvas/boat/OarRig";
import { detachObject } from "@/lib/dispose";
import {
  cloneGltfScene,
  enableGltfShadows,
  useGltfModel,
} from "@/lib/gltf";

const fitBox = new Box3();
const fitSize = new Vector3();
const fitCenter = new Vector3();

function cloneMeshMaterials(root: Group): void {
  root.traverse((child) => {
    if (!(child instanceof Mesh)) {
      return;
    }

    if (Array.isArray(child.material)) {
      child.material = child.material.map((material: Material) =>
        material.clone(),
      );
    } else if (child.material) {
      child.material = child.material.clone();
    }
  });
}

function prepareBoatScene(source: Group): Group {
  const wrapper = new Group();
  const boat = cloneGltfScene(source);
  cloneMeshMaterials(boat);
  wrapper.add(boat);
  enableGltfShadows(wrapper, 0.95);

  boat.updateMatrixWorld(true);
  fitBox.setFromObject(boat);
  fitBox.getSize(fitSize);

  // Sketchfab fourareen is authored longest along X — yaw so length runs on Z.
  if (fitSize.x > fitSize.z) {
    boat.rotation.y = Math.PI / 2;
    boat.updateMatrixWorld(true);
    fitBox.setFromObject(boat);
    fitBox.getSize(fitSize);
  }

  const length = Math.max(fitSize.z, 0.001);
  boat.scale.setScalar(BOAT_MODEL.targetLength / length);

  boat.updateMatrixWorld(true);
  fitBox.setFromObject(boat);
  fitBox.getCenter(fitCenter);
  fitBox.getSize(fitSize);

  // Center on XZ; keep roughly half the hull above the opaque water plane.
  const submerged = fitSize.y * BOAT_MODEL.waterlineRatio;
  boat.position.set(
    -fitCenter.x,
    -fitBox.min.y - submerged + BOAT_MODEL.waterlineLift,
    -fitCenter.z,
  );

  return wrapper;
}

export function PlayerBoat() {
  const { scene } = useGltfModel(BOAT_MODEL.path);
  const boat = useMemo(() => prepareBoatScene(scene), [scene]);

  useEffect(() => {
    return () => {
      detachObject(boat);
    };
  }, [boat]);

  return (
    <group>
      <primitive object={boat} />
      <LongboatSeats />
      <OarRig />
    </group>
  );
}
