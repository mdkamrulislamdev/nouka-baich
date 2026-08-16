"use client";

export function BoatGunwales() {
  return (
    <group>
      <mesh position={[-0.7, 0.28, 0.05]} rotation={[0, 0, 0.08]} castShadow>
        <boxGeometry args={[0.08, 0.1, 6.4]} />
        <meshStandardMaterial
          color="#8a4f28"
          roughness={0.5}
          metalness={0.05}
          envMapIntensity={0.9}
        />
      </mesh>
      <mesh position={[0.7, 0.28, 0.05]} rotation={[0, 0, -0.08]} castShadow>
        <boxGeometry args={[0.08, 0.1, 6.4]} />
        <meshStandardMaterial
          color="#8a4f28"
          roughness={0.5}
          metalness={0.05}
          envMapIntensity={0.9}
        />
      </mesh>
      <mesh position={[-0.7, 0.34, 0.05]} rotation={[0, 0, 0.08]}>
        <boxGeometry args={[0.09, 0.035, 6.35]} />
        <meshStandardMaterial
          color="#c45c2a"
          roughness={0.45}
          metalness={0.08}
          envMapIntensity={1}
        />
      </mesh>
      <mesh position={[0.7, 0.34, 0.05]} rotation={[0, 0, -0.08]}>
        <boxGeometry args={[0.09, 0.035, 6.35]} />
        <meshStandardMaterial
          color="#c45c2a"
          roughness={0.45}
          metalness={0.08}
          envMapIntensity={1}
        />
      </mesh>
    </group>
  );
}
