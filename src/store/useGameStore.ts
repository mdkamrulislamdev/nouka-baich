import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import { FEVER, FESTIVAL, PICKUPS, SCORE, type Difficulty, type GameMode } from "@/components/canvas/sceneConfig";
import { markFeverAction } from "@/lib/actionJuice";
import { skillBonus } from "@/lib/festivalScore";
import { draftPlayerName } from "@/lib/leaderboard";
import { PICKUP_LABELS } from "@/lib/pickupLabels";
import { grantDrag, grantHaste, grantRam } from "@/lib/powerUps";

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
  festivalBest: number;
  playerName: string;
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
  sinkFlash: number;
  sinkBonus: number;
  sinkCombo: number;
  lastSinkAt: number;
  bumpFlash: number;
  kickInRangeLeft: boolean;
  kickInRangeRight: boolean;
  kickReady: boolean;
  logBreakCharges: number;
  rockBreakCharges: number;
  feverCombo: number;
  scorePopFlash: number;
  scorePopAmount: number;
  scorePopLabel: string;
  slingshotFlash: number;
  overtakeFlash: number;
  strokeFlash: number;
  podiumPlace: number;
  heatTimeLeft: number;
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
  setPlayerName: (playerName: string) => void;
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
  triggerSink: (kind: "racing" | "dinghy") => void;
  triggerBump: () => void;
  triggerOvertake: () => void;
  triggerSlingshot: () => void;
  triggerPerfectStroke: () => void;
  collectBreaker: () => void;
  collectCrusher: () => void;
  collectBonus: () => void;
  collectHaste: () => void;
  collectDrag: () => void;
  collectRam: () => void;
  consumeLogBreak: () => boolean;
  consumeRockBreak: () => boolean;
  triggerDodge: () => void;
  dropFeverCombo: (combo: number) => void;
  setHeatTimeLeft: (heatTimeLeft: number) => void;
  setKickHud: (
    kickInRangeLeft: boolean,
    kickInRangeRight: boolean,
    kickReady: boolean,
  ) => void;
  startGame: (gameMode?: GameMode) => void;
  endGame: () => void;
  finishRace: (podiumPlace?: number) => void;
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
  festivalBest: 0,
  playerName: "Rower",
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
  sinkFlash: 0,
  sinkBonus: 0,
  sinkCombo: 0,
  lastSinkAt: 0,
  bumpFlash: 0,
  kickInRangeLeft: false,
  kickInRangeRight: false,
  kickReady: true,
  logBreakCharges: 0,
  rockBreakCharges: 0,
  feverCombo: 1,
  scorePopFlash: 0,
  scorePopAmount: 0,
  scorePopLabel: "",
  slingshotFlash: 0,
  overtakeFlash: 0,
  strokeFlash: 0,
  podiumPlace: 0,
  heatTimeLeft: FESTIVAL.duration,
  assetsReady: false,
  assetProgress: 0,
};

function nextFever(combo: number): number {
  return Math.min(FEVER.max, combo + 1);
}

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
    setPlayerName: (playerName) => set({ playerName: draftPlayerName(playerName) }),
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
        const feverCombo = nextFever(state.feverCombo);
        const bonus = skillBonus(SCORE.nearMissBonus, feverCombo, state.gameMode);
        markFeverAction();
        return {
          feverCombo,
          nearMissCombo: feverCombo,
          lastNearMissAt: Date.now(),
          closeCallBonus: bonus,
          score: state.score + bonus,
          closeCallFlash: state.closeCallFlash + 1,
          scorePopFlash: state.scorePopFlash + 1,
          scorePopAmount: bonus,
          scorePopLabel: "CLOSE CALL",
        };
      }),
    triggerSink: (kind) =>
      set((state) => {
        const feverCombo = nextFever(state.feverCombo);
        const base =
          kind === "racing" ? SCORE.sinkRacingBonus : SCORE.sinkDinghyBonus;
        const bonus = skillBonus(base, feverCombo, state.gameMode);
        markFeverAction();
        return {
          feverCombo,
          sinkCombo: feverCombo,
          lastSinkAt: Date.now(),
          sinkBonus: bonus,
          score: state.score + bonus,
          sinkFlash: state.sinkFlash + 1,
          scorePopFlash: state.scorePopFlash + 1,
          scorePopAmount: bonus,
          scorePopLabel: kind === "racing" ? "SHOVE" : "BUMP",
        };
      }),
    triggerBump: () =>
      set((state) => ({
        bumpFlash: state.bumpFlash + 1,
        score: state.score + skillBonus(SCORE.bumpBonus, 1, state.gameMode),
      })),
    triggerOvertake: () =>
      set((state) => {
        const feverCombo = nextFever(state.feverCombo);
        const bonus = skillBonus(SCORE.overtakeBonus, feverCombo, state.gameMode);
        markFeverAction();
        return {
          feverCombo,
          score: state.score + bonus,
          overtakeFlash: state.overtakeFlash + 1,
          scorePopFlash: state.scorePopFlash + 1,
          scorePopAmount: bonus,
          scorePopLabel: "OVERTAKE",
        };
      }),
    triggerSlingshot: () =>
      set((state) => {
        const feverCombo = nextFever(state.feverCombo);
        const bonus = skillBonus(SCORE.slingshotBonus, feverCombo, state.gameMode);
        markFeverAction();
        return {
          feverCombo,
          score: state.score + bonus,
          slingshotFlash: state.slingshotFlash + 1,
          scorePopFlash: state.scorePopFlash + 1,
          scorePopAmount: bonus,
          scorePopLabel: "SLINGSHOT",
        };
      }),
    triggerPerfectStroke: () =>
      set((state) => {
        const feverCombo = nextFever(state.feverCombo);
        const bonus = skillBonus(SCORE.strokeBonus, feverCombo, state.gameMode);
        markFeverAction();
        return {
          feverCombo,
          score: state.score + bonus,
          strokeFlash: state.strokeFlash + 1,
          scorePopFlash: state.scorePopFlash + 1,
          scorePopAmount: bonus,
          scorePopLabel: "PERFECT",
        };
      }),
    collectBreaker: () =>
      set((state) => {
        markFeverAction();
        return {
          logBreakCharges: Math.min(
            PICKUPS.breakerCap,
            state.logBreakCharges + PICKUPS.breakerCharges,
          ),
          scorePopFlash: state.scorePopFlash + 1,
          scorePopAmount: 0,
          scorePopLabel: PICKUP_LABELS.breaker,
        };
      }),
    collectCrusher: () =>
      set((state) => {
        markFeverAction();
        return {
          rockBreakCharges: Math.min(
            PICKUPS.crusherCap,
            state.rockBreakCharges + PICKUPS.crusherCharges,
          ),
          scorePopFlash: state.scorePopFlash + 1,
          scorePopAmount: 0,
          scorePopLabel: PICKUP_LABELS.crusher,
        };
      }),
    collectBonus: () =>
      set((state) => {
        const feverCombo = nextFever(state.feverCombo);
        const bonus = skillBonus(SCORE.bonusPickup, feverCombo, state.gameMode);
        markFeverAction();
        return {
          feverCombo,
          score: state.score + bonus,
          scorePopFlash: state.scorePopFlash + 1,
          scorePopAmount: bonus,
          scorePopLabel: PICKUP_LABELS.bonus,
        };
      }),
    collectHaste: () => {
      grantHaste();
      markFeverAction();
      set((state) => ({
        scorePopFlash: state.scorePopFlash + 1,
        scorePopAmount: 0,
        scorePopLabel: PICKUP_LABELS.haste,
      }));
    },
    collectDrag: () => {
      grantDrag();
      markFeverAction();
      set((state) => ({
        scorePopFlash: state.scorePopFlash + 1,
        scorePopAmount: 0,
        scorePopLabel: PICKUP_LABELS.drag,
      }));
    },
    collectRam: () => {
      grantRam();
      markFeverAction();
      set((state) => ({
        scorePopFlash: state.scorePopFlash + 1,
        scorePopAmount: 0,
        scorePopLabel: PICKUP_LABELS.ram,
      }));
    },
    consumeLogBreak: () => {
      const state = useGameStore.getState();
      if (state.logBreakCharges <= 0) {
        return false;
      }
      const feverCombo = nextFever(state.feverCombo);
      const bonus = skillBonus(SCORE.logSmashBonus, feverCombo, state.gameMode);
      markFeverAction();
      set({
        logBreakCharges: state.logBreakCharges - 1,
        feverCombo,
        score: state.score + bonus,
        scorePopFlash: state.scorePopFlash + 1,
        scorePopAmount: bonus,
        scorePopLabel: "LOG SMASH",
      });
      return true;
    },
    consumeRockBreak: () => {
      const state = useGameStore.getState();
      if (state.rockBreakCharges <= 0) {
        return false;
      }
      const feverCombo = nextFever(state.feverCombo);
      const bonus = skillBonus(SCORE.rockSmashBonus, feverCombo, state.gameMode);
      markFeverAction();
      set({
        rockBreakCharges: state.rockBreakCharges - 1,
        feverCombo,
        score: state.score + bonus,
        scorePopFlash: state.scorePopFlash + 1,
        scorePopAmount: bonus,
        scorePopLabel: "ROCK SMASH",
      });
      return true;
    },
    triggerDodge: () =>
      set((state) => {
        const feverCombo = nextFever(state.feverCombo);
        const bonus = skillBonus(SCORE.dodgeBonus, feverCombo, state.gameMode);
        markFeverAction();
        return {
          feverCombo,
          score: state.score + bonus,
          scorePopFlash: state.scorePopFlash + 1,
          scorePopAmount: bonus,
          scorePopLabel: "DODGED",
        };
      }),
    dropFeverCombo: (combo) =>
      set((state) => {
        const next = Math.max(1, Math.min(FEVER.max, combo));
        if (next === state.feverCombo) {
          return state;
        }
        return { feverCombo: next };
      }),
    setHeatTimeLeft: (heatTimeLeft) =>
      set((state) => {
        const next = Math.max(0, heatTimeLeft);
        if (Math.abs(next - state.heatTimeLeft) < 0.04) {
          return state;
        }
        return { heatTimeLeft: next };
      }),
    setKickHud: (kickInRangeLeft, kickInRangeRight, kickReady) =>
      set((state) => {
        if (
          state.kickInRangeLeft === kickInRangeLeft &&
          state.kickInRangeRight === kickInRangeRight &&
          state.kickReady === kickReady
        ) {
          return state;
        }
        return { kickInRangeLeft, kickInRangeRight, kickReady };
      }),
    startGame: (gameMode = "endless") =>
      set((state) => ({
        ...INITIAL_STATE,
        highScore: state.highScore,
        festivalBest: state.festivalBest,
        playerName: state.playerName,
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
        heatTimeLeft: gameMode === "festival" ? FESTIVAL.duration : 0,
        runOutcome: "playing",
        status: "PLAYING",
      })),
    endGame: () =>
      set((state) => {
        const finalScore = Math.floor(state.score);
        const festivalBest =
          state.gameMode === "festival"
            ? Math.max(state.festivalBest, finalScore)
            : state.festivalBest;
        const isNewBest =
          state.gameMode === "festival"
            ? finalScore > state.festivalBest
            : finalScore > state.highScore;
        return {
          status: "GAMEOVER",
          runOutcome: "crash",
          score: finalScore,
          podiumPlace: state.gameMode === "festival" ? 4 : 0,
          isNewHighScore: isNewBest,
          highScore: Math.max(state.highScore, finalScore),
          festivalBest,
        };
      }),
    finishRace: (podiumPlace = 0) =>
      set((state) => {
        const place = podiumPlace || state.podiumPlace;
        const surviveBonus =
          state.gameMode === "festival" ? FESTIVAL.surviveBonus : 0;
        const finalScore = Math.floor(state.score + surviveBonus);
        const festivalBest =
          state.gameMode === "festival"
            ? Math.max(state.festivalBest, finalScore)
            : state.festivalBest;
        const isNewBest =
          state.gameMode === "festival"
            ? finalScore > state.festivalBest
            : finalScore > state.highScore;
        return {
          status: "GAMEOVER",
          runOutcome: "finish",
          podiumPlace: place,
          score: finalScore,
          isNewHighScore: isNewBest,
          highScore: Math.max(state.highScore, finalScore),
          festivalBest,
        };
      }),
    resetGame: () =>
      set((state) => ({
        ...INITIAL_STATE,
        highScore: state.highScore,
        festivalBest: state.festivalBest,
        playerName: state.playerName,
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
