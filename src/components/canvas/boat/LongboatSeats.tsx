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
      envMapIntensity={0.7}
    />
  );
}

export function LongboatSeats() {
  return (
    <group>
      <mesh position={[0, LONGBOAT_RIG.keelY, 0.05]} receiveShadow>
        <boxGeometry args={[0.62, 0.05, 5.4]} />
        <WoodMaterial color="#4a2a14" roughness={0.78} />
      </mesh>

      {LONGBOAT_RIG.thwartZ.map((z) => (
        <group key={z} position={[0, LONGBOAT_RIG.seatY, z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[LONGBOAT_RIG.seatWidth, 0.09, 0.2]} />
            <WoodMaterial color="#a0673a" roughness={0.55} />
          </mesh>
          <mesh position={[-0.38, 0.16, 0]} castShadow>
            <boxGeometry args={[0.28, 0.22, 0.12]} />
            <WoodMaterial color="#6b3e22" roughness={0.7} />
          </mesh>
          <mesh position={[0.38, 0.16, 0]} castShadow>
            <boxGeometry args={[0.28, 0.22, 0.12]} />
            <WoodMaterial color="#6b3e22" roughness={0.7} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0.55, 2.55]} castShadow receiveShadow>
        <boxGeometry args={[0.85, 0.12, 0.55]} />
        <WoodMaterial color="#7a4a28" roughness={0.62} />
      </mesh>

      <mesh position={[0, 0.92, -3.25]} rotation={[0.42, 0, 0]} castShadow>
        <boxGeometry args={[0.1, 0.7, 0.12]} />
        <WoodMaterial color="#3d2414" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.28, -3.48]} castShadow>
        <sphereGeometry args={[0.09, 10, 8]} />
        <meshStandardMaterial
          color="#c41e1e"
          roughness={0.35}
          metalness={0.15}
          envMapIntensity={0.9}
        />
      </mesh>
    </group>
  );
}
