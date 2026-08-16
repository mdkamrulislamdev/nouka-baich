import {
  Box3,
  Group,
  Mesh,
  MeshStandardMaterial,
  Vector3,
  type Object3D,
} from "three";

import { ROCK_MODEL } from "@/components/canvas/sceneConfig";

const fitBox = new Box3();
const fitSize = new Vector3();
const fitCenter = new Vector3();

function enableRockShadows(object: Object3D): void {
  object.traverse((child) => {
    if (!(child instanceof Mesh)) {
      return;
    }

    child.castShadow = true;
    child.receiveShadow = true;

    if (child.material instanceof MeshStandardMaterial) {
      child.material.envMapIntensity = 0.75;
    }
  });
}

export function prepareRock(source: Group): Group {
  const wrapper = new Group();
  const rock = source.clone(true);
  wrapper.add(rock);
  enableRockShadows(wrapper);

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
