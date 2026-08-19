import type { GameState } from "@/store/useGameStore";

export function isRunActive(
  state: Pick<GameState, "status">,
): boolean {
  return state.status === "PLAYING" || state.status === "PAUSED";
}

export function isGameplayActive(
  state: Pick<GameState, "status">,
): boolean {
  return state.status === "PLAYING";
}
