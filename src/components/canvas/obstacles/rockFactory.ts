import { Box3, Group, Vector3 } from "three";

import { ROCK_MODEL } from "@/components/canvas/sceneConfig";
import { cloneGltfScene, enableGltfShadows } from "@/lib/gltf";

const fitBox = new Box3();
const fitSize = new Vector3();
const fitCenter = new Vector3();

export function prepareRock(source: Group): Group {
  const wrapper = new Group();
  const rock = cloneGltfScene(source);
  wrapper.add(rock);
  enableGltfShadows(wrapper, 0.75);

  wrapper.updateMatrixWorld(true);
  fitBox.setFromObject(wrapper);
  fitBox.getSize(fitSize);

  const width = Math.max(fitSize.x, fitSize.z, 0.001);
  rock.scale.setScalar(ROCK_MODEL.targetWidth / width);

  wrapper.updateMatrixWorld(true);
  fitBox.setFromObject(wrapper);
  fitBox.getCenter(fitCenter);
  rock.position.x -= fitCenter.x;
  rock.position.y -= fitBox.min.y;
  rock.position.z -= fitCenter.z;

  wrapper.visible = false;
  return wrapper;
}
