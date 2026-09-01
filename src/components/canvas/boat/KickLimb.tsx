"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { type Group } from "three";

import { createColoredKickLeg } from "@/components/canvas/boat/rowerFactory";
import { detachObject } from "@/lib/dispose";
import { getKickPose } from "@/lib/kickCombat";
import { isGameplayActive } from "@/lib/gameplay";
import { useGameStore } from "@/store/useGameStore";

type RowerKickLegProps = {
  side: -1 | 1;
};

/**
 * Black trouser legs matching the seated NPC outfit.
 * Rotation.z is `side * outward` so both gunwales kick away from the hull.
 */
export function RowerKickLeg({ side }: RowerKickLegProps) {
  const legs = useMemo(() => createColoredKickLeg(side), [side]);
  const groupRef = useRef<Group>(null);

  useEffect(() => {
    return () => {
      detachObject(legs);
    };
  }, [legs]);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) {
      return;
    }

    const state = useGameStore.getState();
    const kick = getKickPose();
    const punch =
      isGameplayActive(state) && kick.side === side ? kick.strength : 0;
    const outward = 0.22 + punch * 1.48;
    const nextZ = side * outward;
    if (
      Math.abs(group.rotation.z - nextZ) < 0.0008 &&
      Math.abs(group.rotation.x - punch * 0.18) < 0.0008
    ) {
      return;
    }
    group.rotation.z = nextZ;
    group.rotation.x = punch * 0.18;
  });

  return <primitive ref={groupRef} object={legs} />;
}
