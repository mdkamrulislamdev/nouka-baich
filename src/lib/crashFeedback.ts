const offset = { x: 0, y: 0 };

let intensity = 0;
let elapsed = 0;
let crashRoll = 0;
let crashYaw = 0;

export function triggerCrashShake(side = 1): void {
  intensity = 1;
  elapsed = 0;
  crashRoll = Math.sign(side || 1) * 0.46;
  crashYaw = -Math.sign(side || 1) * 0.2;
}

export function resetCrashShake(): void {
  intensity = 0;
  elapsed = 0;
  crashRoll = 0;
  crashYaw = 0;
  offset.x = 0;
  offset.y = 0;
}

export function sampleCrashOffset(dt: number): { x: number; y: number } {
  if (intensity <= 0.001) {
    intensity = 0;
    offset.x = 0;
    offset.y = 0;
    return offset;
  }

  elapsed += dt;
  intensity *= Math.exp(-3.6 * dt);
  const magnitude = intensity * 0.42;
  offset.x = Math.sin(elapsed * 52.4) * magnitude;
  offset.y = Math.cos(elapsed * 41.7) * magnitude * 0.55;
  return offset;
}

export function getCrashPose(): { roll: number; yaw: number } {
  return { roll: crashRoll, yaw: crashYaw };
}
