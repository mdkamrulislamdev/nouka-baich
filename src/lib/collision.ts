import { Box3, Vector3 } from "three";

import { BOAT_BOUNDS } from "@/components/canvas/sceneConfig";
import {
  forEachActiveObstacle,
  type ObstacleRecord,
} from "@/lib/obstacleWorld";

const playerBox = new Box3();
const obstacleBox = new Box3();
const playerCenter = new Vector3();
const playerSize = new Vector3(
  BOAT_BOUNDS.width,
  BOAT_BOUNDS.height,
  BOAT_BOUNDS.length,
);
const obstacleCenter = new Vector3();
const obstacleSize = new Vector3();

let lastHit: ObstacleRecord | null = null;

export function getPlayerBox(): Box3 {
  return playerBox;
}

export function getLastCollision(): ObstacleRecord | null {
  return lastHit;
}

export function clearLastCollision(): void {
  lastHit = null;
}

function writeObstacleBox(obstacle: ObstacleRecord): Box3 {
  obstacleCenter.set(obstacle.x, obstacle.y + obstacle.halfY, obstacle.z);
  obstacleSize.set(obstacle.halfX * 2, obstacle.halfY * 2, obstacle.halfZ * 2);
  return obstacleBox.setFromCenterAndSize(obstacleCenter, obstacleSize);
}

export function updatePlayerBox(laneOffset: number): Box3 {
  playerCenter.set(laneOffset, BOAT_BOUNDS.centerY, 0);
  return playerBox.setFromCenterAndSize(playerCenter, playerSize);
}

export function queryObstacleCollision(
  laneOffset: number,
): ObstacleRecord | null {
  updatePlayerBox(laneOffset);
  lastHit = null;

  const playerHalfZ = BOAT_BOUNDS.length * 0.5;
  const playerHalfX = BOAT_BOUNDS.width * 0.5;

  forEachActiveObstacle((obstacle) => {
    if (lastHit) {
      return;
    }

    if (Math.abs(obstacle.z) > playerHalfZ + obstacle.halfZ) {
      return;
    }
    if (Math.abs(obstacle.x - laneOffset) > playerHalfX + obstacle.halfX) {
      return;
    }

    if (playerBox.intersectsBox(writeObstacleBox(obstacle))) {
      lastHit = obstacle;
    }
  });

  return lastHit;
}
