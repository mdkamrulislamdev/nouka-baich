import { STROKE } from "@/components/canvas/sceneConfig";
import { getRowingPhase } from "@/lib/rowingClock";

export function getCatchAmount(): number {
  return Math.max(0, -Math.sin(getRowingPhase()));
}

export function isStrokeWindow(): boolean {
  return getCatchAmount() >= STROKE.catchMin;
}
