import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GameStatus = "MENU" | "PLAYING" | "GAMEOVER";

export type GameState = {
  status: GameStatus;
  score: number;
  distance: number;
  speed: number;
  laneOffset: number;
  level: number;
  highScore: number;
  isNewHighScore: boolean;
};

export type GameActions = {
  setStatus: (status: GameStatus) => void;
  setScore: (score: number) => void;
  setDistance: (distance: number) => void;
  setSpeed: (speed: number) => void;
  setLaneOffset: (laneOffset: number) => void;
  setLevel: (level: number) => void;
  setHighScore: (highScore: number) => void;
  startGame: () => void;
  endGame: () => void;
  resetGame: () => void;
};

export type GameStore = GameState & GameActions;

const INITIAL_STATE: GameState = {
  status: "MENU",
  score: 0,
  distance: 0,
  speed: 12,
  laneOffset: 0,
  level: 1,
  highScore: 0,
  isNewHighScore: false,
};

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set) => ({
    ...INITIAL_STATE,
    setStatus: (status) => set({ status }),
    setScore: (score) => set({ score }),
    setDistance: (distance) => set({ distance }),
    setSpeed: (speed) => set({ speed }),
    setLaneOffset: (laneOffset) => set({ laneOffset }),
    setLevel: (level) => set({ level }),
    setHighScore: (highScore) => set({ highScore }),
    startGame: () =>
      set((state) => ({
        ...INITIAL_STATE,
        highScore: state.highScore,
        isNewHighScore: false,
        status: "PLAYING",
      })),
    endGame: () =>
      set((state) => ({
        status: "GAMEOVER",
        isNewHighScore: state.score > state.highScore,
        highScore: Math.max(state.highScore, state.score),
      })),
    resetGame: () => set(INITIAL_STATE),
  })),
);

export function getGameState(): GameState {
  const {
    status,
    score,
    distance,
    speed,
    laneOffset,
    level,
    highScore,
    isNewHighScore,
  } = useGameStore.getState();
  return {
    status,
    score,
    distance,
    speed,
    laneOffset,
    level,
    highScore,
    isNewHighScore,
  };
}
