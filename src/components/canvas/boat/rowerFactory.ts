import { Box3, Group, Mesh, Vector3, type Material } from "three";

import { SCENERY_MODELS } from "@/components/canvas/sceneConfig";
import { cloneGltfScene, enableGltfShadows } from "@/lib/gltf";

const fitBox = new Box3();
const fitSize = new Vector3();
const fitCenter = new Vector3();

function cloneOwnedMaterials(root: Group): void {
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

export function createSeatedRower(
  source: Group,
  targetHeight: number = SCENERY_MODELS.rower.targetHeight,
): Group {
  const wrapper = new Group();
  const rower = cloneGltfScene(source);
  cloneOwnedMaterials(rower);
  wrapper.add(rower);
  enableGltfShadows(wrapper, 0.62);

  wrapper.updateMatrixWorld(true);
  fitBox.setFromObject(wrapper);
  fitBox.getSize(fitSize);
  const scale = targetHeight / Math.max(fitSize.y, 0.001);
  rower.scale.setScalar(scale);

  wrapper.updateMatrixWorld(true);
  fitBox.setFromObject(wrapper);
  fitBox.getCenter(fitCenter);
  rower.position.x -= fitCenter.x;
  rower.position.y -= fitBox.min.y;
  rower.position.z -= fitCenter.z;

  return wrapper;
}

export type CrewSeat = {
  x: number;
  y: number;
  z: number;
  side: -1 | 1;
};

export function addBoatCrew(
  parent: Group,
  rowerSource: Group,
  seats: readonly CrewSeat[],
  targetHeight: number,
): void {
  for (let index = 0; index < seats.length; index += 1) {
    const seat = seats[index];
    const holder = new Group();
    holder.position.set(seat.x, seat.y, seat.z);

    const rower = createSeatedRower(rowerSource, targetHeight);
    rower.rotation.y = Math.PI;
    rower.traverse((child) => {
      child.frustumCulled = true;
    });
    holder.add(rower);
    parent.add(holder);
  }
}

/** Two thwarts, two rowers each — enough to read as a crew without 6 GLTFs. */
export function racingCrewSeats(length: number, beam: number): CrewSeat[] {
  const zs = [length * 0.18, -length * 0.16];
  const seats: CrewSeat[] = [];
  for (let index = 0; index < zs.length; index += 1) {
    const z = zs[index];
    ([-1, 1] as const).forEach((side) => {
      seats.push({
        x: side * beam * 0.3,
        y: 0.46,
        z,
        side,
      });
    });
  }
  return seats;
}

export function dinghyCrewSeats(length: number, beam: number): CrewSeat[] {
  return [
    { x: -beam * 0.28, y: 0.44, z: length * 0.12, side: -1 },
    { x: beam * 0.28, y: 0.44, z: -length * 0.08, side: 1 },
  ];
}
