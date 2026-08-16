"use client";

const THWART_Z = [2.2, 1.15, 0.1, -0.95, -2.0] as const;

export function BoatInterior() {
  return (
    <group>
      <mesh position={[0, 0.16, 0.05]} receiveShadow>
        <boxGeometry args={[0.72, 0.05, 5.6]} />
        <meshStandardMaterial
          color="#5a3218"
          roughness={0.7}
          metalness={0.03}
          envMapIntensity={0.6}
        />
      </mesh>

      {THWART_Z.map((z) => (
        <mesh key={z} position={[0, 0.34, z]} castShadow receiveShadow>
          <boxGeometry args={[1.55, 0.08, 0.18]} />
          <meshStandardMaterial
            color="#a0673a"
            roughness={0.55}
            metalness={0.04}
            envMapIntensity={0.8}
          />
        </mesh>
      ))}

      <mesh position={[0, 0.72, -3.55]} rotation={[0.38, 0, 0]} castShadow>
        <boxGeometry args={[0.12, 0.85, 0.14]} />
        <meshStandardMaterial
          color="#4e2b14"
          roughness={0.58}
          metalness={0.05}
          envMapIntensity={0.75}
        />
      </mesh>
    </group>
  );
}
