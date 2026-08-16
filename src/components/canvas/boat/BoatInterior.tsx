"use client";

const THWART_Z = [2.15, 1.15, 0.15, -0.85, -1.85] as const;

export function BoatInterior() {
  return (
    <group>
      <mesh position={[0, 0.13, 0.1]} receiveShadow>
        <boxGeometry args={[0.62, 0.04, 5.4]} />
        <meshStandardMaterial
          color="#5a3218"
          roughness={0.7}
          metalness={0.03}
          envMapIntensity={0.6}
        />
      </mesh>

      {THWART_Z.map((z) => (
        <mesh key={z} position={[0, 0.28, z]} castShadow receiveShadow>
          <boxGeometry args={[1.12, 0.07, 0.16]} />
          <meshStandardMaterial
            color="#a0673a"
            roughness={0.55}
            metalness={0.04}
            envMapIntensity={0.8}
          />
        </mesh>
      ))}

      <mesh position={[0, 0.58, -3.42]} rotation={[0.42, 0, 0]} castShadow>
        <boxGeometry args={[0.1, 0.72, 0.12]} />
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
