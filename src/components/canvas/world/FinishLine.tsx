"use client";

import { SPRINT, WORLD_SCROLL } from "@/components/canvas/sceneConfig";
import { useGameStore } from "@/store/useGameStore";

const GATE_HEIGHT = 4.2;
const POST_RADIUS = 0.12;
const APPROACH_METERS = 220;

export function FinishLine() {
  const gameMode = useGameStore((state) => state.gameMode);
  const status = useGameStore((state) => state.status);
  const distance = useGameStore((state) => state.distance);

  const remaining = SPRINT.targetDistance - distance;

  if (
    gameMode !== "sprint" ||
    (status !== "PLAYING" && status !== "PAUSED") ||
    remaining > APPROACH_METERS ||
    remaining < 0
  ) {
    return null;
  }

  const finishZ = -Math.max(12, remaining * 0.55);
  const halfRiver = WORLD_SCROLL.riverWidth / 2 + 0.6;

  return (
    <group position={[0, 0, finishZ]}>
      <mesh position={[-halfRiver, GATE_HEIGHT / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[POST_RADIUS, POST_RADIUS, GATE_HEIGHT, 8]} />
        <meshStandardMaterial color="#9b1c1c" roughness={0.65} metalness={0.05} />
      </mesh>
      <mesh position={[halfRiver, GATE_HEIGHT / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[POST_RADIUS, POST_RADIUS, GATE_HEIGHT, 8]} />
        <meshStandardMaterial color="#9b1c1c" roughness={0.65} metalness={0.05} />
      </mesh>
      <mesh position={[0, GATE_HEIGHT - 0.35, 0]} castShadow>
        <boxGeometry args={[halfRiver * 2 + 0.4, 0.22, 0.22]} />
        <meshStandardMaterial color="#e4c36a" roughness={0.35} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[halfRiver * 2, 1.2]} />
        <meshStandardMaterial
          color="#1f6b3a"
          transparent
          opacity={0.55}
          roughness={0.9}
        />
      </mesh>
    </group>
  );
}
