"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  DodecahedronGeometry,
  IcosahedronGeometry,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
} from "three";

import {
  ROCK_CHIP_COUNT,
  ROCK_STONE_COUNT,
  getRockBreakChips,
  tickRockBreakFx,
} from "@/lib/rockBreakFx";
import { clampGameDelta, isGameplayActive } from "@/lib/gameplay";
import { useGameStore } from "@/store/useGameStore";

export function RockBreakBurst() {
  const meshRefs = useRef<Array<Mesh | null>>(
    Array.from({ length: ROCK_CHIP_COUNT }, () => null),
  );
  const stoneGeoA = useMemo(() => new DodecahedronGeometry(0.16, 0), []);
  const stoneGeoB = useMemo(() => new IcosahedronGeometry(0.14, 0), []);
  const dustGeo = useMemo(() => new SphereGeometry(0.12, 6, 5), []);
  const stoneMatA = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#8a7a68",
        roughness: 0.94,
        metalness: 0.05,
      }),
    [],
  );
  const stoneMatB = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#5c5348",
        roughness: 0.96,
        metalness: 0.04,
      }),
    [],
  );
  const dustMat = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#c4b7a4",
        roughness: 1,
        metalness: 0,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      }),
    [],
  );

  useFrame((_, delta) => {
    const state = useGameStore.getState();
    if (!isGameplayActive(state) && state.status !== "GAMEOVER") {
      return;
    }
    tickRockBreakFx(clampGameDelta(delta));
    const chips = getRockBreakChips();
    for (let index = 0; index < ROCK_CHIP_COUNT; index += 1) {
      const mesh = meshRefs.current[index];
      const chip = chips[index];
      if (!mesh) {
        continue;
      }
      mesh.visible = chip.active;
      if (!chip.active) {
        continue;
      }
      mesh.position.set(chip.x, chip.y, chip.z);
      mesh.rotation.set(chip.rx, chip.ry, chip.rz);
      mesh.scale.setScalar(chip.size);
    }
  });

  return (
    <group>
      {Array.from({ length: ROCK_CHIP_COUNT }, (_, index) => {
        const dust = index >= ROCK_STONE_COUNT;
        const geometry = dust
          ? dustGeo
          : index % 2 === 0
            ? stoneGeoA
            : stoneGeoB;
        const material = dust
          ? dustMat
          : index % 2 === 0
            ? stoneMatA
            : stoneMatB;
        return (
          <mesh
            key={index}
            ref={(node) => {
              meshRefs.current[index] = node;
            }}
            geometry={geometry}
            material={material}
            visible={false}
            castShadow={!dust}
          />
        );
      })}
    </group>
  );
}
