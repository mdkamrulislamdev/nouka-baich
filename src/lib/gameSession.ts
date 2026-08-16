import { resetCrashShake } from "@/lib/crashFeedback";
import { deactivateAllObstacles } from "@/lib/obstacleWorld";
import { useGameStore } from "@/store/useGameStore";

export function beginRun(): void {
  deactivateAllObstacles();
  resetCrashShake();
  useGameStore.getState().startGame();
}
