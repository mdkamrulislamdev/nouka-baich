"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Box3, Group, Vector3 } from "three";

import { LONGBOAT_RIG, OARS, SCENERY_MODELS } from "@/components/canvas/sceneConfig";
import { detachObject } from "@/lib/dispose";
import { cloneGltfScene, enableGltfShadows, useGltfModel } from "@/lib/gltf";
import { getRowingPhase } from "@/lib/rowingClock";
import { isGameplayActive } from "@/lib/gameplay";
import { useGameStore } from "@/store/useGameStore";

const fitBox = new Box3();
const fitSize = new Vector3();
const fitCenter = new Vector3();

type RowerProps = {
  seatIndex: number;
  seatZ: number;
  side: -1 | 1;
  source: Group;
};

function prepareRower(source: Group): Group {
  const wrapper = new Group();
  const rower = cloneGltfScene(source);
  wrapper.add(rower);
  enableGltfShadows(wrapper, 0.62);

  wrapper.updateMatrixWorld(true);
  fitBox.setFromObject(wrapper);
  fitBox.getSize(fitSize);
  const scale = SCENERY_MODELS.rower.targetHeight / Math.max(fitSize.y, 0.001);
  rower.scale.setScalar(scale);

  wrapper.updateMatrixWorld(true);
  fitBox.setFromObject(wrapper);
  fitBox.getCenter(fitCenter);
  rower.position.x -= fitCenter.x;
  rower.position.y -= fitBox.min.y;
  rower.position.z -= fitCenter.z;

  return wrapper;
}

function Rower({ seatIndex, seatZ, side, source }: RowerProps) {
  const rower = useMemo(() => prepareRower(source), [source]);
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
      return;
    }

    // Match `OarRig` so rower lean/torso follows the oar dip curve.
    const t = getRowingPhase() + seatIndex * OARS.stagger;
    const zPhase = Math.sin(t); // [-1..1]
    const backward = Math.max(0, -zPhase);
    const dip = Math.pow(backward, 0.65);
    root.rotation.x = dip * 0.38 * side;
  });

  return (
    <group
      position={[side * 0.3, LONGBOAT_RIG.seatY + 0.01, seatZ]}
      rotation={[0, side === -1 ? Math.PI / 2 : -Math.PI / 2, 0]}
      ref={rowerRef}
    >
      <primitive object={rower} />
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
