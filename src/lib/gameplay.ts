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

/** Stable delta for gameplay motion — avoids tab-switch spikes freezing visuals. */
export function clampGameDelta(delta: number): number {
  return Math.min(Math.max(delta, 0.001), 0.05);
}
