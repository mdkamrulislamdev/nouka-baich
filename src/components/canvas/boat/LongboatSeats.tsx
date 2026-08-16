"use client";

import { LONGBOAT_RIG } from "@/components/canvas/sceneConfig";

function WoodMaterial({
  color,
  roughness,
}: {
  color: string;
  roughness: number;
}) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={0.04}
      envMapIntensity={0.55}
    />
  );
}

export function LongboatSeats() {
  return (
    <group>
      {LONGBOAT_RIG.thwartZ.map((z) => (
        <group key={z} position={[0, LONGBOAT_RIG.seatY, z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[LONGBOAT_RIG.seatWidth, 0.07, 0.14]} />
            <WoodMaterial color="#a0673a" roughness={0.55} />
          </mesh>
          <mesh position={[-0.28, 0.12, 0]} castShadow>
            <boxGeometry args={[0.2, 0.16, 0.09]} />
            <WoodMaterial color="#6b3e22" roughness={0.7} />
          </mesh>
          <mesh position={[0.28, 0.12, 0]} castShadow>
            <boxGeometry args={[0.2, 0.16, 0.09]} />
            <WoodMaterial color="#6b3e22" roughness={0.7} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0.62, -2.05]} rotation={[0.38, 0, 0]} castShadow>
        <boxGeometry args={[0.07, 0.48, 0.08]} />
        <WoodMaterial color="#3d2414" roughness={0.6} />
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
