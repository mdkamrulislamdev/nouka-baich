import { audio } from "@/lib/audio";
import { resetCrashShake } from "@/lib/crashFeedback";
import { deactivateAllObstacles } from "@/lib/obstacleWorld";
import { requestLandscapeLock } from "@/lib/orientation";
import { useGameStore } from "@/store/useGameStore";

export function beginRun(): void {
  audio.unlock();
  void requestLandscapeLock();
  deactivateAllObstacles();
  resetCrashShake();
  useGameStore.getState().startGame();
}

export function returnToMenu(): void {
  deactivateAllObstacles();
  resetCrashShake();
  useGameStore.getState().resetGame();
}
