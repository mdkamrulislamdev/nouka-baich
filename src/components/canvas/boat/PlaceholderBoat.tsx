"use client";

import { BoatGunwales } from "@/components/canvas/boat/BoatGunwales";
import { BoatHull } from "@/components/canvas/boat/BoatHull";
import { BoatInterior } from "@/components/canvas/boat/BoatInterior";
import { BOAT_SPAWN } from "@/components/canvas/sceneConfig";

export function PlaceholderBoat() {
  return (
    <group position={BOAT_SPAWN}>
      <BoatHull />
      <BoatGunwales />
      <BoatInterior />
    </group>
  );
}
