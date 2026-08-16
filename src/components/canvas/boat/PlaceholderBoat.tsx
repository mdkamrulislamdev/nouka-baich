"use client";

import { BoatGunwales } from "@/components/canvas/boat/BoatGunwales";
import { BoatHull } from "@/components/canvas/boat/BoatHull";
import { BoatInterior } from "@/components/canvas/boat/BoatInterior";

export function PlaceholderBoat() {
  return (
    <group>
      <BoatHull />
      <BoatGunwales />
      <BoatInterior />
    </group>
  );
}
