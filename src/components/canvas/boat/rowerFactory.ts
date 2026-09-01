import {
  Box3,
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Vector3,
} from "three";

import { SCENERY_MODELS } from "@/components/canvas/sceneConfig";
import { cloneGltfScene, enableGltfShadows } from "@/lib/gltf";

const fitBox = new Box3();
const fitSize = new Vector3();
const fitCenter = new Vector3();

const thighGeo = new CylinderGeometry(0.05, 0.064, 0.34, 8);
const shinGeo = new CylinderGeometry(0.042, 0.052, 0.32, 8);
const footGeo = new BoxGeometry(0.1, 0.055, 0.16);

/** Match the seated NPC: black trousers and black dress shoes. */
const TROUSER = "#141414";
const SHOE = "#0b0b0b";

function makeMat(hex: string, roughness: number): MeshStandardMaterial {
  return new MeshStandardMaterial({
    color: hex,
    roughness,
    metalness: 0.05,
    envMapIntensity: 0.4,
  });
}

/**
 * Kicking legs in the same black as the seated NPC trousers.
 * Parent this in boat-aligned space (not the ±90° rower yaw) so a Z-roll
 * swings the foot out over the gunwale.
 */
export function createColoredKickLeg(side: -1 | 1): Group {
  const root = new Group();
  root.position.set(side * 0.1, 0.3, 0.04);

  const thigh = new Mesh(thighGeo, makeMat(TROUSER, 0.82));
  thigh.position.set(side * 0.02, -0.15, 0);
  thigh.castShadow = true;
  root.add(thigh);

  const shin = new Mesh(shinGeo, makeMat(TROUSER, 0.82));
  shin.position.set(side * 0.05, -0.38, 0.03);
  shin.rotation.x = 0.22;
  shin.castShadow = true;
  root.add(shin);

  const foot = new Mesh(footGeo, makeMat(SHOE, 0.55));
  foot.position.set(side * 0.06, -0.54, 0.11);
  foot.rotation.x = 0.82;
  foot.castShadow = true;
  root.add(foot);

  return root;
}

export function createSeatedRower(
  source: Group,
  targetHeight: number = SCENERY_MODELS.rower.targetHeight,
): Group {
  const wrapper = new Group();
  const rower = cloneGltfScene(source);
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
    rower.rotation.y = seat.side === -1 ? Math.PI / 2 : -Math.PI / 2;
    holder.add(rower);

    const legs = createColoredKickLeg(seat.side);
    legs.rotation.z = seat.side * -0.18;
    holder.add(legs);

    parent.add(holder);
  }
}

/** Three thwarts, two rowers each — matches the player longboat crew. */
export function racingCrewSeats(length: number, beam: number): CrewSeat[] {
  const zs = [length * 0.22, 0.04, -length * 0.2];
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
