let vx = 0;
let roll = 0;

export function shovePlayer(dir: -1 | 1, impulse: number, rollAmt = 0.2): void {
  vx += dir * impulse;
  roll = -dir * rollAmt;
}

export function resetPlayerImpulse(): void {
  vx = 0;
  roll = 0;
}

export function tickPlayerImpulse(dt: number): { vx: number; roll: number } {
  vx *= Math.exp(-5.8 * dt);
  roll *= Math.exp(-7.4 * dt);
  if (Math.abs(vx) < 0.04) {
    vx = 0;
  }
  if (Math.abs(roll) < 0.008) {
    roll = 0;
  }
  return { vx, roll };
}
