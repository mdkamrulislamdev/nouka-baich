import { OARS } from "@/components/canvas/sceneConfig";

let phase = 0;

export function resetRowingClock(): void {
  phase = 0;
}

export function updateRowingClock(
  dt: number,
  status: "MENU" | "PLAYING" | "GAMEOVER",
  speed: number,
): number {
  if (status === "MENU") {
    phase = 0;
    return phase;
  }
  if (status === "PLAYING") {
    phase += dt * (OARS.baseRate + speed * OARS.speedRate);
  }
  return phase;
}

export function getRowingPhase(): number {
  return phase;
}
