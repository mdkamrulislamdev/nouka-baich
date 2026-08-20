import { Box3, Group, Vector3 } from "three";

import { PALM_MODEL } from "@/components/canvas/sceneConfig";
import { cloneGltfScene, enableGltfShadows } from "@/lib/gltf";
import { patchFoliageAlphaMaterials } from "@/lib/foliageMaterial";

export function preparePalm(source: Group): Group {
  const wrapper = new Group();
  const palm = cloneGltfScene(source);
  wrapper.add(palm);
  enableGltfShadows(wrapper, 0.85);
  patchFoliageAlphaMaterials(wrapper);

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
