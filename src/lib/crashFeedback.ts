const offset = { x: 0, y: 0, z: 0 };

type ShakeMode = "none" | "crash" | "nearMiss";

let intensity = 0;
let elapsed = 0;
let crashRoll = 0;
let crashYaw = 0;
let mode: ShakeMode = "none";

export function triggerCrashShake(side = 1): void {
  mode = "crash";
  intensity = 0.42;
  elapsed = 0;
  crashRoll = Math.sign(side || 1) * 0.18;
  crashYaw = -Math.sign(side || 1) * 0.08;
}

export function triggerNearMissShake(side = 1): void {
  if (mode === "crash") {
    return;
  }

  mode = "nearMiss";
  intensity = 0.14;
  elapsed = 0;
  crashRoll = Math.sign(side || 1) * 0.03;
  crashYaw = 0;
}

export function resetCrashShake(): void {
  intensity = 0;
  elapsed = 0;
  crashRoll = 0;
  crashYaw = 0;
  mode = "none";
  offset.x = 0;
  offset.y = 0;
  offset.z = 0;
}

export function sampleCrashOffset(dt: number): {
  x: number;
  y: number;
  z: number;
} {
  if (intensity <= 0.001) {
    intensity = 0;
    mode = "none";
    offset.x = 0;
    offset.y = 0;
    offset.z = 0;
    return offset;
  }

  elapsed += dt;
  const decay = mode === "crash" ? 5.4 : 8.5;
  intensity *= Math.exp(-decay * dt);
  const magnitude = intensity * (mode === "crash" ? 0.12 : 0.045);
  offset.x = Math.sin(elapsed * 18.5) * magnitude;
  offset.y = Math.cos(elapsed * 14.2) * magnitude * 0.35;
  offset.z = Math.sin(elapsed * 11.6) * magnitude * 0.18;
  return offset;
}

export function getCrashPose(): { roll: number; yaw: number } {
  return { roll: crashRoll, yaw: crashYaw };
}
