import {
  Box3,
  Color,
  Group,
  Mesh,
  MeshStandardMaterial,
  Vector3,
  type Material,
} from "three";

import {
  BOAT_MODEL,
  DINGHY_OBSTACLE,
  RACING_BOAT_OBSTACLE,
} from "@/components/canvas/sceneConfig";
import { cloneGltfScene, enableGltfShadows } from "@/lib/gltf";

const fitBox = new Box3();
const fitSize = new Vector3();
const fitCenter = new Vector3();

export const DINGHY_EXTENTS = {
  halfX: DINGHY_OBSTACLE.beam * 0.52,
  halfY: 0.55,
  halfZ: DINGHY_OBSTACLE.length * 0.52,
} as const;

export const RACING_BOAT_EXTENTS = {
  halfX: RACING_BOAT_OBSTACLE.beam * 0.52,
  halfY: 0.55,
  halfZ: RACING_BOAT_OBSTACLE.length * 0.52,
} as const;

function tintBoatMaterials(root: Group, tintHex: string): void {
  const tint = new Color(tintHex);
  root.traverse((child) => {
    if (!(child instanceof Mesh)) {
      return;
    }

    const apply = (material: Material): Material => {
      if (!(material instanceof MeshStandardMaterial)) {
        return material;
      }
      const next = material.clone();
      if (next.map) {
        next.color.copy(tint);
      } else {
        next.color.copy(tint);
      }
      next.metalness = Math.min(next.metalness, 0.1);
      next.roughness = Math.max(next.roughness, 0.45);
      next.needsUpdate = true;
      return next;
    };

    if (Array.isArray(child.material)) {
      child.material = child.material.map(apply);
    } else if (child.material) {
      child.material = apply(child.material);
    }
  });
}

function prepareNpcBoat(source: Group, targetLength: number, tintHex: string): Group {
  const wrapper = new Group();
  const boat = cloneGltfScene(source);
  wrapper.add(boat);
  enableGltfShadows(wrapper, 0.85);
  tintBoatMaterials(boat, tintHex);

  boat.updateMatrixWorld(true);
  fitBox.setFromObject(boat);
  fitBox.getSize(fitSize);

  if (fitSize.x > fitSize.z) {
    boat.rotation.y = Math.PI / 2;
    boat.updateMatrixWorld(true);
    fitBox.setFromObject(boat);
    fitBox.getSize(fitSize);
  }

  const length = Math.max(fitSize.z, 0.001);
  boat.scale.setScalar(targetLength / length);

  boat.updateMatrixWorld(true);
  fitBox.setFromObject(boat);
  fitBox.getCenter(fitCenter);
  fitBox.getSize(fitSize);

  const submerged = fitSize.y * BOAT_MODEL.waterlineRatio;
  boat.position.set(
    -fitCenter.x,
    -fitBox.min.y - submerged + BOAT_MODEL.waterlineLift * 0.7,
    -fitCenter.z,
  );

  wrapper.visible = false;
  return wrapper;
}

export function createDinghyObstacle(source: Group): Group {
  return prepareNpcBoat(source, DINGHY_OBSTACLE.length, DINGHY_OBSTACLE.tint);
}

export function createRacingBoatObstacle(source: Group): Group {
  return prepareNpcBoat(
    source,
    RACING_BOAT_OBSTACLE.length,
    RACING_BOAT_OBSTACLE.tint,
  );
}
