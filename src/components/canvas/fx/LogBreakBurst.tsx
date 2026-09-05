"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BoxGeometry, Mesh, MeshStandardMaterial } from "three";

import { getLogBreakChips, tickLogBreakFx } from "@/lib/logBreakFx";
import { clampGameDelta, isGameplayActive } from "@/lib/gameplay";
import { useGameStore } from "@/store/useGameStore";

const CHIP_COUNT = 14;

export function LogBreakBurst() {
  const meshRefs = useRef<Array<Mesh | null>>(Array.from({ length: CHIP_COUNT }, () => null));
  const geometry = useMemo(() => new BoxGeometry(0.18, 0.07, 0.11), []);
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#6b3e22",
        roughness: 0.9,
        metalness: 0.04,
      }),
    [],
  );

  useFrame((_, delta) => {
    const state = useGameStore.getState();
    if (!isGameplayActive(state) && state.status !== "GAMEOVER") {
      return;
    }
    tickLogBreakFx(clampGameDelta(delta));
    const chips = getLogBreakChips();
    for (let index = 0; index < CHIP_COUNT; index += 1) {
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
    }
  });

  return (
    <group>
      {Array.from({ length: CHIP_COUNT }, (_, index) => (
        <mesh
          key={index}
          ref={(node) => {
            meshRefs.current[index] = node;
          }}
          geometry={geometry}
          material={material}
          visible={false}
          castShadow
        />
      ))}
    </group>
  );
}
