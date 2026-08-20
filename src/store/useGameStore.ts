import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import { SCORE, type Difficulty, type GameMode } from "@/components/canvas/sceneConfig";

export type GameStatus = "MENU" | "PLAYING" | "PAUSED" | "GAMEOVER";
export type GraphicsQuality = "high" | "low";
export type RunOutcome = "playing" | "crash" | "finish";

export type GameState = {
  status: GameStatus;
  gameMode: GameMode;
  difficulty: Difficulty;
  runOutcome: RunOutcome;
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
  closeCallFlash: number;
  closeCallBonus: number;
  nearMissCombo: number;
  lastNearMissAt: number;
  /** True once GLTF + WebGL scene have finished first warm load on the menu. */
  assetsReady: boolean;
  /** 0..100 progress while warming assets on the landing screen. */
  assetProgress: number;
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
  setDifficulty: (difficulty: Difficulty) => void;
  setSettingsOpen: (settingsOpen: boolean) => void;
  openSettings: () => void;
  closeSettings: () => void;
  setAdaptiveLow: (adaptiveLow: boolean) => void;
  setAssetProgress: (assetProgress: number) => void;
  setAssetsReady: (assetsReady: boolean) => void;
  triggerCloseCall: () => void;
  startGame: (gameMode?: GameMode) => void;
  endGame: () => void;
  finishRace: () => void;
  resetGame: () => void;
};

export type GameStore = GameState & GameActions;

const INITIAL_STATE: GameState = {
  status: "MENU",
  gameMode: "endless",
  difficulty: "medium",
  runOutcome: "playing",
  score: 0,
  distance: 0,
  speed: 11,
  laneOffset: 0,
  level: 1,
  highScore: 0,
  isNewHighScore: false,
  musicMuted: false,
  sfxMuted: false,
  graphicsQuality: "high",
  settingsOpen: false,
  adaptiveLow: false,
  closeCallFlash: 0,
  closeCallBonus: 0,
  nearMissCombo: 0,
  lastNearMissAt: 0,
  assetsReady: false,
  assetProgress: 0,
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
    setDifficulty: (difficulty) => set({ difficulty }),
    setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
    openSettings: () =>
      set((state) => {
        if (state.status === "PLAYING") {
          return { settingsOpen: true, status: "PAUSED" };
        }
        return { settingsOpen: true };
      }),
    closeSettings: () =>
      set((state) => {
        if (state.status === "PAUSED") {
          return { settingsOpen: false, status: "PLAYING" };
        }
        return { settingsOpen: false };
      }),
    setAdaptiveLow: (adaptiveLow) => set({ adaptiveLow }),
    setAssetProgress: (assetProgress) =>
      set({ assetProgress: Math.max(0, Math.min(100, assetProgress)) }),
    setAssetsReady: (assetsReady) =>
      set({ assetsReady, assetProgress: assetsReady ? 100 : 0 }),
    triggerCloseCall: () =>
      set((state) => {
        const now = Date.now();
        const withinCombo =
          state.lastNearMissAt > 0 &&
          now - state.lastNearMissAt < SCORE.nearMissComboWindowMs;
        const combo = withinCombo
          ? Math.min(state.nearMissCombo + 1, SCORE.nearMissComboMax)
          : 1;
        const bonus = SCORE.nearMissBonus * combo;
        return {
          nearMissCombo: combo,
          lastNearMissAt: now,
          closeCallBonus: bonus,
          score: state.score + bonus,
          closeCallFlash: state.closeCallFlash + 1,
        };
      }),
    startGame: (gameMode = "endless") =>
      set((state) => ({
        ...INITIAL_STATE,
        highScore: state.highScore,
        musicMuted: state.musicMuted,
        sfxMuted: state.sfxMuted,
        graphicsQuality: state.graphicsQuality,
        difficulty: state.difficulty,
        // Keep warmed assets across runs so Play stays instant.
        assetsReady: state.assetsReady,
        assetProgress: state.assetProgress,
        adaptiveLow: false,
        isNewHighScore: false,
        settingsOpen: false,
        gameMode,
        runOutcome: "playing",
        status: "PLAYING",
      })),
    endGame: () =>
      set((state) => {
        const finalScore = Math.floor(state.score);
        return {
          status: "GAMEOVER",
          runOutcome: "crash",
          score: finalScore,
          isNewHighScore: finalScore > state.highScore,
          highScore: Math.max(state.highScore, finalScore),
        };
      }),
    finishRace: () =>
      set((state) => {
        const finalScore = Math.floor(state.score);
        return {
          status: "GAMEOVER",
          runOutcome: "finish",
          score: finalScore,
          isNewHighScore: finalScore > state.highScore,
          highScore: Math.max(state.highScore, finalScore),
        };
      }),
    resetGame: () =>
      set((state) => ({
        ...INITIAL_STATE,
        highScore: state.highScore,
        musicMuted: state.musicMuted,
        sfxMuted: state.sfxMuted,
        graphicsQuality: state.graphicsQuality,
        difficulty: state.difficulty,
        assetsReady: state.assetsReady,
        assetProgress: state.assetProgress,
        adaptiveLow: false,
      })),
  })),
);
