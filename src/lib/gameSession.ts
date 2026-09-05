import { audio } from "@/lib/audio";
import { resetActionJuice } from "@/lib/actionJuice";
import { resetPowers } from "@/lib/powerUps";
import { resetCrashShake } from "@/lib/crashFeedback";
import { resetHitStop } from "@/lib/hitStop";
import { resetKickCombat } from "@/lib/kickCombat";
import { resetLogBreakFx } from "@/lib/logBreakFx";
import { resetPlayerImpulse } from "@/lib/playerImpulse";
import { clearDirectedSpawns, deactivateAllObstacles } from "@/lib/obstacleWorld";
import { requestLandscapeLock } from "@/lib/orientation";
import { useGameStore } from "@/store/useGameStore";
import { FESTIVAL, type GameMode } from "@/components/canvas/sceneConfig";

function beginRunWithMode(gameMode: GameMode): void {
  audio.unlock();
  void requestLandscapeLock();
  deactivateAllObstacles();
  clearDirectedSpawns();
  resetCrashShake();
  resetKickCombat();
  resetHitStop();
  resetPlayerImpulse();
  resetLogBreakFx();
  resetActionJuice(FESTIVAL.duration);
  resetPowers();
  useGameStore.getState().startGame(gameMode);
}

export function beginRun(): void {
  beginRunWithMode("endless");
}

export function beginSprintRun(): void {
  beginRunWithMode("sprint");
}

export function beginFestivalRun(): void {
  beginRunWithMode("festival");
}

export function replayRun(): void {
  const mode = useGameStore.getState().gameMode;
  beginRunWithMode(mode);
}

export function returnToMenu(): void {
  deactivateAllObstacles();
  clearDirectedSpawns();
  resetCrashShake();
  resetKickCombat();
  resetHitStop();
  resetPlayerImpulse();
  resetLogBreakFx();
  resetActionJuice();
  resetPowers();
  useGameStore.getState().resetGame();
}
