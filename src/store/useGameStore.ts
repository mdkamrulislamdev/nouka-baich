import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GameStatus = "MENU" | "PLAYING" | "GAMEOVER";

export type GameState = {
  status: GameStatus;
  score: number;
  speed: number;
  laneOffset: number;
  level: number;
};

export type GameActions = {
  setStatus: (status: GameStatus) => void;
  setScore: (score: number) => void;
  setSpeed: (speed: number) => void;
  setLaneOffset: (laneOffset: number) => void;
  setLevel: (level: number) => void;
  startGame: () => void;
  endGame: () => void;
  resetGame: () => void;
};

export type GameStore = GameState & GameActions;

const INITIAL_STATE: GameState = {
  status: "MENU",
  score: 0,
  speed: 12,
  laneOffset: 0,
  level: 1,
};

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set) => ({
    ...INITIAL_STATE,
    setStatus: (status) => set({ status }),
    setScore: (score) => set({ score }),
    setSpeed: (speed) => set({ speed }),
    setLaneOffset: (laneOffset) => set({ laneOffset }),
    setLevel: (level) => set({ level }),
    startGame: () =>
      set({
        ...INITIAL_STATE,
        status: "PLAYING",
      }),
    endGame: () => set({ status: "GAMEOVER" }),
    resetGame: () => set(INITIAL_STATE),
  })),
);

export function getGameState(): GameState {
  const { status, score, speed, laneOffset, level } = useGameStore.getState();
  return { status, score, speed, laneOffset, level };
}
