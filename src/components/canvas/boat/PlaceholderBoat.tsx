"use client";

import { BOAT_MODEL } from "@/components/canvas/sceneConfig";
import { BoatGunwales } from "@/components/canvas/boat/BoatGunwales";
import { BoatHull } from "@/components/canvas/boat/BoatHull";
import { BoatInterior } from "@/components/canvas/boat/BoatInterior";

const HULL_NATIVE_LENGTH = 7.4;

/** Suspense fallback while assets load — same silhouette as the player boat. */
export function PlaceholderBoat() {
  const hullScale = BOAT_MODEL.targetLength / HULL_NATIVE_LENGTH;

  return (
    <group position={[0, BOAT_MODEL.embedY, 0]} scale={hullScale}>
      <BoatHull />
      <BoatGunwales />
      <BoatInterior />
    </group>
  );
}
