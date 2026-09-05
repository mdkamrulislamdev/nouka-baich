import { POWERS } from "@/components/canvas/sceneConfig";

export type PowerClock = {
  hasteLeft: number;
  dragLeft: number;
  ramLeft: number;
};

const clock: PowerClock = {
  hasteLeft: 0,
  dragLeft: 0,
  ramLeft: 0,
};

export function getPowers(): PowerClock {
  return clock;
}

export function resetPowers(): void {
  clock.hasteLeft = 0;
  clock.dragLeft = 0;
  clock.ramLeft = 0;
}

export function grantHaste(): void {
  clock.hasteLeft = POWERS.hasteSec;
  clock.dragLeft = 0;
}

export function grantDrag(): void {
  clock.dragLeft = POWERS.dragSec;
  clock.hasteLeft = 0;
}

export function grantRam(): void {
  clock.ramLeft = POWERS.ramSec;
  clock.dragLeft = 0;
}

export function tickPowers(dt: number): void {
  if (clock.hasteLeft > 0) {
    clock.hasteLeft = Math.max(0, clock.hasteLeft - dt);
  }
  if (clock.dragLeft > 0) {
    clock.dragLeft = Math.max(0, clock.dragLeft - dt);
  }
  if (clock.ramLeft > 0) {
    clock.ramLeft = Math.max(0, clock.ramLeft - dt);
  }
}

export function getSpeedPowerMul(): number {
  if (clock.ramLeft > 0) {
    return POWERS.ramMul;
  }
  if (clock.hasteLeft > 0) {
    return POWERS.hasteMul;
  }
  if (clock.dragLeft > 0) {
    return POWERS.dragMul;
  }
  return 1;
}

export function isRamActive(): boolean {
  return clock.ramLeft > 0;
}
