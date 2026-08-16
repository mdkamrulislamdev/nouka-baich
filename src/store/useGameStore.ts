import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GameStatus = "MENU" | "PLAYING" | "GAMEOVER";
export type GraphicsQuality = "high" | "low";

export type GameState = {
  status: GameStatus;
  score: number;
  distance: number;
  speed: number;
  laneOffset: number;
  level: number;
  highScore: number;
  isNewHighScore: boolean;
  musicMuted: boolean;
  sfxMuted: boolean;
  graphicsQuality: GraphicsQuality;
  settingsOpen: boolean;
  adaptiveLow: boolean;
};

export type GameActions = {
  setStatus: (status: GameStatus) => void;
  setScore: (score: number) => void;
  setDistance: (distance: number) => void;
  setSpeed: (speed: number) => void;
  setLaneOffset: (laneOffset: number) => void;
  setLevel: (level: number) => void;
  setHighScore: (highScore: number) => void;
  setMusicMuted: (musicMuted: boolean) => void;
  setSfxMuted: (sfxMuted: boolean) => void;
  setGraphicsQuality: (graphicsQuality: GraphicsQuality) => void;
  setSettingsOpen: (settingsOpen: boolean) => void;
  setAdaptiveLow: (adaptiveLow: boolean) => void;
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
  musicMuted: false,
  sfxMuted: false,
  graphicsQuality: "high",
  settingsOpen: false,
  adaptiveLow: false,
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
    setMusicMuted: (musicMuted) => set({ musicMuted }),
    setSfxMuted: (sfxMuted) => set({ sfxMuted }),
    setGraphicsQuality: (graphicsQuality) => set({ graphicsQuality }),
    setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
    setAdaptiveLow: (adaptiveLow) => set({ adaptiveLow }),
    startGame: () =>
      set((state) => ({
        ...INITIAL_STATE,
        highScore: state.highScore,
        musicMuted: state.musicMuted,
        sfxMuted: state.sfxMuted,
        graphicsQuality: state.graphicsQuality,
        adaptiveLow: state.adaptiveLow,
        isNewHighScore: false,
        settingsOpen: false,
        status: "PLAYING",
      })),
    endGame: () =>
      set((state) => ({
        status: "GAMEOVER",
        isNewHighScore: state.score > state.highScore,
        highScore: Math.max(state.highScore, state.score),
      })),
    resetGame: () =>
      set((state) => ({
        ...INITIAL_STATE,
        highScore: state.highScore,
        musicMuted: state.musicMuted,
        sfxMuted: state.sfxMuted,
        graphicsQuality: state.graphicsQuality,
      })),
  })),
);
