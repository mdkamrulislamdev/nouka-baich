import { FEVER, FESTIVAL, JUICE } from "@/components/canvas/sceneConfig";

export type JuiceState = {
  feverHeat: number;
  lastActionAt: number;
  drafting: boolean;
  draftHeat: number;
  strokeHot: boolean;
  rivalGap: number;
  rivalNameBn: string;
  rivalNameEn: string;
  heatTimeLeft: number;
  surgeSpeed: number;
  runElapsed: number;
  introIndex: number;
  packTimer: number;
  goUntil: number;
  prevLane: number;
  heatSeeded: boolean;
  npcKickWarn: boolean;
};

const juice: JuiceState = {
  feverHeat: 0,
  lastActionAt: 0,
  drafting: false,
  draftHeat: 0,
  strokeHot: false,
  rivalGap: 0,
  rivalNameBn: "সোনার তরী",
  rivalNameEn: "Sonar Tori",
  heatTimeLeft: FESTIVAL.duration,
  surgeSpeed: 0,
  runElapsed: 0,
  introIndex: 0,
  packTimer: 0,
  goUntil: 0,
  prevLane: 0,
  heatSeeded: false,
  npcKickWarn: false,
};

let fovPunch = 0;

export function getJuice(): JuiceState {
  return juice;
}

export function resetActionJuice(heatDuration = FESTIVAL.duration): void {
  juice.feverHeat = 0;
  juice.lastActionAt = 0;
  juice.drafting = false;
  juice.draftHeat = 0;
  juice.strokeHot = false;
  juice.rivalGap = 0;
  juice.rivalNameBn = "সোনার তরী";
  juice.rivalNameEn = "Sonar Tori";
  juice.heatTimeLeft = heatDuration;
  juice.surgeSpeed = 0;
  juice.runElapsed = 0;
  juice.introIndex = 0;
  juice.packTimer = 0;
  juice.goUntil = 1.15;
  juice.prevLane = 0;
  juice.heatSeeded = false;
  juice.npcKickWarn = false;
  fovPunch = 0;
}

export function punchFov(amount: number): void {
  fovPunch = Math.max(fovPunch, amount);
}

export function sampleFovPunch(dt: number): number {
  fovPunch *= Math.exp(-8.4 * dt);
  if (fovPunch < 0.04) {
    fovPunch = 0;
  }
  return fovPunch;
}

export function addSurge(amount: number): void {
  juice.surgeSpeed = Math.max(juice.surgeSpeed, amount);
}

export function tickSurge(dt: number): number {
  juice.surgeSpeed *= Math.exp(-3.1 * dt);
  if (juice.surgeSpeed < 0.04) {
    juice.surgeSpeed = 0;
  }
  return juice.surgeSpeed;
}

export function markFeverAction(): void {
  juice.feverHeat = 1;
  juice.lastActionAt =
    typeof performance === "undefined" ? Date.now() : performance.now();
}

export function tickFeverHeat(
  dt: number,
  combo: number,
): { combo: number; dropped: boolean } {
  if (combo <= 1) {
    juice.feverHeat = Math.max(0, juice.feverHeat - dt * 0.25);
    return { combo: 1, dropped: false };
  }

  const now = typeof performance === "undefined" ? Date.now() : performance.now();
  const idle = (now - juice.lastActionAt) / 1000;
  if (idle < FEVER.idleSec) {
    return { combo, dropped: false };
  }

  juice.feverHeat -= dt / FEVER.drainSec;
  if (juice.feverHeat > 0) {
    return { combo, dropped: false };
  }

  const next = Math.max(1, combo - 1);
  juice.feverHeat = next > 1 ? FEVER.recoverHeat : 0;
  return { combo: next, dropped: next !== combo };
}

export function getSpeedFov(speed: number, drafting: boolean): number {
  return Math.max(0, speed - 11) * JUICE.speedFov + (drafting ? JUICE.draftFov : 0);
}
