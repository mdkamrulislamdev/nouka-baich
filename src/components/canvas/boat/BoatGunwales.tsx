"use client";

export function BoatGunwales() {
  return (
    <group>
      <mesh position={[-0.9, 0.4, -0.12]} rotation={[0, 0, 0.06]} castShadow>
        <boxGeometry args={[0.1, 0.12, 6.7]} />
        <meshStandardMaterial
          color="#8a4f28"
          roughness={0.5}
          metalness={0.05}
          envMapIntensity={0.9}
        />
      </mesh>
      <mesh position={[0.9, 0.4, -0.12]} rotation={[0, 0, -0.06]} castShadow>
        <boxGeometry args={[0.1, 0.12, 6.7]} />
        <meshStandardMaterial
          color="#8a4f28"
          roughness={0.5}
          metalness={0.05}
          envMapIntensity={0.9}
        />
      </mesh>
      <mesh position={[-0.9, 0.47, -0.12]} rotation={[0, 0, 0.06]}>
        <boxGeometry args={[0.11, 0.04, 6.65]} />
        <meshStandardMaterial
          color="#c45c2a"
          roughness={0.45}
          metalness={0.08}
          envMapIntensity={1}
        />
      </mesh>
      <mesh position={[0.9, 0.47, -0.12]} rotation={[0, 0, -0.06]}>
        <boxGeometry args={[0.11, 0.04, 6.65]} />
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
