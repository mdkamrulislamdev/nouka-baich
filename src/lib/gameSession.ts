import { audio } from "@/lib/audio";
import { resetCrashShake } from "@/lib/crashFeedback";
import { deactivateAllObstacles } from "@/lib/obstacleWorld";
import { requestLandscapeLock } from "@/lib/orientation";
import { useGameStore } from "@/store/useGameStore";
import type { GameMode } from "@/components/canvas/sceneConfig";

function beginRunWithMode(gameMode: GameMode): void {
  audio.unlock();
  void requestLandscapeLock();
  deactivateAllObstacles();
  resetCrashShake();
  useGameStore.getState().startGame(gameMode);
}

export function beginRun(): void {
  beginRunWithMode("endless");
}

export function beginSprintRun(): void {
  beginRunWithMode("sprint");
}

export function returnToMenu(): void {
  deactivateAllObstacles();
  resetCrashShake();
  useGameStore.getState().resetGame();
}
