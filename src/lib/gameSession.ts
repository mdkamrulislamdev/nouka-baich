import { audio } from "@/lib/audio";
import { resetCrashShake } from "@/lib/crashFeedback";
import { deactivateAllObstacles } from "@/lib/obstacleWorld";
import { useGameStore } from "@/store/useGameStore";

export function beginRun(): void {
  audio.unlock();
  deactivateAllObstacles();
  resetCrashShake();
  useGameStore.getState().startGame();
}
