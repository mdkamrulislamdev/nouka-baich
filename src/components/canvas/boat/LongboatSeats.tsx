"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { type Group } from "three";

import { createSeatedRower } from "@/components/canvas/boat/rowerFactory";
import { LONGBOAT_RIG, OARS, SCENERY_MODELS } from "@/components/canvas/sceneConfig";
import { detachObject } from "@/lib/dispose";
import { useGltfModel } from "@/lib/gltf";
import { getKickPose } from "@/lib/kickCombat";
import { getRowingPhase } from "@/lib/rowingClock";
import { isGameplayActive } from "@/lib/gameplay";
import { useGameStore } from "@/store/useGameStore";

type RowerProps = {
  seatIndex: number;
  seatZ: number;
  side: -1 | 1;
  source: Group;
};

function Rower({ seatIndex, seatZ, side, source }: RowerProps) {
  const rower = useMemo(() => createSeatedRower(source), [source]);
  const rowerRef = useRef<Group>(null);

  useEffect(() => {
    return () => {
      detachObject(rower);
    };
  }, [rower]);

  useFrame(() => {
    const root = rowerRef.current;
    if (!root) {
      return;
    }

    const state = useGameStore.getState();
    if (!isGameplayActive(state)) {
      root.rotation.x = 0;
      root.rotation.y = 0;
      root.rotation.z = 0;
      return;
    }

    const t = getRowingPhase() + seatIndex * OARS.stagger;
    const zPhase = Math.sin(t);
    const backward = Math.max(0, -zPhase);
    const dip = Math.pow(backward, 0.65);
    const kick = getKickPose();
    const kicking = kick.active && kick.side === side ? kick.strength : 0;
    root.rotation.x = -dip * 0.22 - kicking * 0.12;
    root.rotation.z = side * kicking * 0.55;
    root.rotation.y = kicking * side * 0.08;
  });

  return (
    <group position={[side * 0.32, LONGBOAT_RIG.seatY + 0.01, seatZ]}>
      <group rotation={[0, Math.PI, 0]} ref={rowerRef}>
        <primitive object={rower} />
      </group>
    </group>
  );
}

export function LongboatSeats() {
  const { scene: rowerScene } = useGltfModel(SCENERY_MODELS.rower.path);

  return (
    <group>
      {LONGBOAT_RIG.thwartZ.map((z) => (
        <group key={z} position={[0, LONGBOAT_RIG.seatY, z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[LONGBOAT_RIG.seatWidth, 0.07, 0.14]} />
            <meshStandardMaterial
              color="#8f5a33"
              roughness={0.62}
              metalness={0.05}
              envMapIntensity={0.55}
            />
          </mesh>
        </group>
      ))}

      {LONGBOAT_RIG.thwartZ.flatMap((z, seatIndex) =>
        ([-1, 1] as const).map((side) => (
          <Rower
            key={`${z}-${side}`}
            seatIndex={seatIndex}
            seatZ={z}
            side={side}
            source={rowerScene}
          />
        )),
      )}

      <mesh position={[0, 0.62, -2.05]} rotation={[0.38, 0, 0]} castShadow>
        <boxGeometry args={[0.07, 0.48, 0.08]} />
        <meshStandardMaterial
          color="#3d2414"
          roughness={0.6}
          metalness={0.04}
          envMapIntensity={0.55}
        />
      </mesh>
      <mesh position={[0, 0.88, -2.2]} castShadow>
        <sphereGeometry args={[0.07, 10, 8]} />
        <meshStandardMaterial
          color="#c41e1e"
          roughness={0.35}
          metalness={0.15}
          envMapIntensity={0.7}
        />
      </mesh>
    </group>
  );
}
