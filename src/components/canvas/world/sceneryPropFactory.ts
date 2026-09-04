import {
  Box3,
  Group,
  Vector3,
} from "three";

import { SCENERY_MODELS } from "@/components/canvas/sceneConfig";
import { patchFoliageAlphaMaterials } from "@/lib/foliageMaterial";
import { cloneGltfScene, enableGltfShadows } from "@/lib/gltf";

const fitBox = new Box3();
const fitSize = new Vector3();
const fitCenter = new Vector3();

function fitPropToGround(
  wrapper: Group,
  targetHeight: number,
  maxFootprint?: number,
): void {
  const prop = wrapper.children[0] as Group | undefined;
  if (!prop) {
    return;
  }

  prop.updateMatrixWorld(true);
  fitBox.setFromObject(wrapper);
  fitBox.getSize(fitSize);

  let scale = targetHeight / Math.max(fitSize.y, 0.001);
  const footprint = Math.max(fitSize.x, fitSize.z) * scale;
  if (maxFootprint && footprint > maxFootprint) {
    scale = maxFootprint / Math.max(fitSize.x, fitSize.z, 0.001);
  }

  prop.scale.setScalar(scale);
  prop.updateMatrixWorld(true);
  fitBox.setFromObject(wrapper);
  fitBox.getCenter(fitCenter);
  prop.position.x -= fitCenter.x;
  prop.position.y -= fitBox.min.y;
  prop.position.z -= fitCenter.z;
}

export function prepareHut(source: Group): Group {
  const wrapper = new Group();
  const prop = cloneGltfScene(source);
  wrapper.add(prop);
  enableGltfShadows(wrapper, 0.78);
  patchFoliageAlphaMaterials(wrapper);
  fitPropToGround(
    wrapper,
    SCENERY_MODELS.hut.targetHeight,
    SCENERY_MODELS.hut.maxFootprint,
  );
  return wrapper;
}
