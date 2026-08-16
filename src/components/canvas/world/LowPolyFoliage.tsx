"use client";

type LowPolyTreeProps = {
  scale?: number;
};

export function LowPolyTree({ scale = 1 }: LowPolyTreeProps) {
  return (
    <group scale={scale}>
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.11, 0.18, 1.4, 5]} />
        <meshStandardMaterial color="#5c3a22" roughness={0.88} metalness={0.02} />
      </mesh>
      <mesh position={[0, 2.05, 0]} castShadow>
        <coneGeometry args={[1.15, 2.15, 6]} />
        <meshStandardMaterial color="#2d6a33" roughness={0.78} metalness={0.03} />
      </mesh>
      <mesh position={[0, 3.15, 0]} castShadow>
        <coneGeometry args={[0.78, 1.45, 6]} />
        <meshStandardMaterial color="#3d8c42" roughness={0.74} metalness={0.03} />
      </mesh>
    </group>
  );
}

export function LowPolyBush({ scale = 1 }: LowPolyTreeProps) {
  return (
    <group scale={scale}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <icosahedronGeometry args={[0.48, 0]} />
        <meshStandardMaterial color="#3a7a38" roughness={0.82} metalness={0.02} />
      </mesh>
      <mesh position={[0.28, 0.28, 0.12]} castShadow>
        <icosahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial color="#2f6230" roughness={0.84} metalness={0.02} />
      </mesh>
    </group>
  );
}
