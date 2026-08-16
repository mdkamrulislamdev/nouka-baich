"use client";

export function GltfFallback() {
  return (
    <mesh position={[0, 0.4, 0]} castShadow>
      <boxGeometry args={[0.8, 0.35, 2.2]} />
      <meshStandardMaterial color="#6b4424" roughness={0.9} metalness={0.04} />
    </mesh>
  );
}
