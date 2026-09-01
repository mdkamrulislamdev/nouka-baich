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
 * Black trouser legs matching the seated NPC outfit. Always visible at rest;
 * swing out over the gunwale when that side kicks.
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
    group.rotation.z = side * (-0.18 + punch * 1.55);
    group.rotation.x = punch * 0.2;
  });

  return <primitive ref={groupRef} object={legs} />;
}
