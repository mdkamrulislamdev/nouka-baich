let remaining = 0;

export function triggerHitStop(seconds: number): void {
  remaining = Math.max(remaining, seconds);
}

export function resetHitStop(): void {
  remaining = 0;
}

export function tickHitStop(dt: number): void {
  if (remaining <= 0) {
    return;
  }
  remaining -= dt;
  if (remaining < 0) {
    remaining = 0;
  }
}

export function isHitStopped(): boolean {
  return remaining > 0;
}
